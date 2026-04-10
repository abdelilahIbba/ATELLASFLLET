import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  Search,
  MessageSquare,
  Send,
  Trash2,
  AlertTriangle,
  RefreshCw,
  CheckCircle2,
  Clock,
  ChevronRight,
  Reply,
  X,
  Inbox,
  Loader2,
} from 'lucide-react';
import { Message } from '../../../types';

interface MessageManagementProps {
  messages: Message[];
  isLoading?: boolean;
  onReply: (id: string, text: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onToggleRead: (id: string) => Promise<void>;
  onRefresh: () => void;
  /** When set, auto-selects the thread belonging to this email address */
  initialEmail?: string;
}

// â”€â”€â”€ Helpers â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const TYPE_META = {
  Emergency: { label: 'Urgence',    bg: 'bg-red-100 dark:bg-red-900/30',    text: 'text-red-600 dark:text-red-400',    dot: 'bg-red-500' },
  Inquiry:   { label: 'Demande',    bg: 'bg-blue-100 dark:bg-blue-900/30',   text: 'text-blue-600 dark:text-blue-400',   dot: 'bg-blue-500' },
  Support:   { label: 'Assistance', bg: 'bg-slate-100 dark:bg-white/10',     text: 'text-slate-600 dark:text-slate-300', dot: 'bg-slate-400' },
} as const;

const relativeTime = (iso: string): string => {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "À l'instant";
  if (m < 60) return `Il y a ${m} min`;
  const h = Math.floor(m / 60);
  if (h < 24) return `Il y a ${h}h`;
  const d = Math.floor(h / 24);
  if (d < 7) return `Il y a ${d}j`;
  return new Date(iso).toLocaleDateString('fr-MA', { day: '2-digit', month: 'short' });
};

const FILTER_LABELS: Record<string, string> = {
  All: 'Tous', Unread: 'Non lus', Emergency: 'Urgence', Support: 'Assistance', Replied: 'Répondus',
};

// â”€â”€â”€ Types â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
interface ThreadGroup {
  email: string;
  sender: string;
  avatar?: string;
  messages: Message[];   // sorted by createdAt asc
  latest: Message;
  hasUnread: boolean;
}

// â”€â”€â”€ Main Component â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const MessageManagement: React.FC<MessageManagementProps> = ({
  messages,
  isLoading = false,
  onReply,
  onDelete,
  onToggleRead,
  onRefresh,
  initialEmail,
}) => {
  const [search, setSearch]               = useState('');
  const [filter, setFilter]               = useState('All');
  const [selectedEmail, setSelectedEmail] = useState<string | null>(null);
  const [replyText, setReplyText]         = useState('');
  const [isSending, setIsSending]         = useState(false);
  const [isDeleting, setIsDeleting]       = useState(false);
  const [sendDone, setSendDone]           = useState(false);
  const replyRef = useRef<HTMLTextAreaElement>(null);

  // â”€â”€ Build groups sorted by latest message desc
  const groups = useMemo<ThreadGroup[]>(() => {
    const q = search.toLowerCase();
    const filtered = messages.filter(m => {
      const matchSearch =
        m.sender.toLowerCase().includes(q) ||
        m.subject.toLowerCase().includes(q) ||
        m.preview.toLowerCase().includes(q) ||
        m.email.toLowerCase().includes(q);
      let matchFilter = true;
      if (filter === 'Unread')     matchFilter = m.unread;
      else if (filter === 'Emergency') matchFilter = m.type === 'Emergency';
      else if (filter === 'Support')   matchFilter = m.type === 'Support';
      else if (filter === 'Replied')   matchFilter = !!m.replyText;
      return matchSearch && matchFilter;
    });

    const map = new Map<string, Message[]>();
    for (const m of filtered) {
      const key = m.email.toLowerCase();
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(m);
    }
    return Array.from(map.entries())
      .map(([email, msgs]) => {
        const sorted = [...msgs].sort(
          (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );
        const latest   = sorted[sorted.length - 1];
        const hasUnread = msgs.some(m => m.unread);
        return { email, sender: latest.sender, avatar: latest.avatar, messages: sorted, latest, hasUnread };
      })
      .sort(
        (a, b) => new Date(b.latest.createdAt).getTime() - new Date(a.latest.createdAt).getTime()
      );
  }, [messages, search, filter]);

  const selectedGroup = groups.find(g => g.email === selectedEmail) ?? null;

  // Auto-select by email (from client profile) or first group
  useEffect(() => {
    if (initialEmail) {
      setSelectedEmail(initialEmail.toLowerCase());
      setSearch('');
      setFilter('All');
      return;
    }
    if (!selectedEmail && groups.length > 0) {
      const firstUnread = groups.find(g => g.hasUnread);
      setSelectedEmail(firstUnread?.email ?? groups[0].email);
    }
  }, [initialEmail, groups.length]);

  // When a thread is opened, mark all its unread messages as read
  useEffect(() => {
    if (!selectedGroup) return;
    selectedGroup.messages.filter(m => m.unread).forEach(m => onToggleRead(m.id));
  }, [selectedEmail]);

  // Reset reply area when selection changes
  useEffect(() => {
    setReplyText('');
    setSendDone(false);
  }, [selectedEmail]);

  const unreadCount    = messages.filter(m => m.unread).length;
  const emergencyCount = messages.filter(m => m.type === 'Emergency').length;

  // Reply to the last message in the thread that hasn't been replied yet (or the very last)
  const replyTargetId = useMemo(() => {
    if (!selectedGroup) return null;
    const unreplied = selectedGroup.messages.filter(m => !m.replyText);
    const target = unreplied.length > 0
      ? unreplied[unreplied.length - 1]
      : selectedGroup.messages[selectedGroup.messages.length - 1];
    return target?.id ?? null;
  }, [selectedGroup]);

  // â”€â”€ Actions
  const handleReply = async () => {
    if (!replyTargetId || !replyText.trim() || isSending) return;
    setIsSending(true);
    try {
      await onReply(replyTargetId, replyText.trim());
      setSendDone(true);
      setReplyText('');
    } finally {
      setIsSending(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (isDeleting) return;
    if (!confirm('Supprimer ce message définitivement ?')) return;
    setIsDeleting(true);
    try {
      await onDelete(id);
      // If the thread becomes empty after deletion, deselect
      const remaining = selectedGroup?.messages.filter(m => m.id !== id) ?? [];
      if (remaining.length === 0) setSelectedEmail(null);
    } finally {
      setIsDeleting(false);
    }
  };

  const avatarLetter = (name: string) => (name || '?').charAt(0).toUpperCase();

  return (
    <div className="flex flex-col gap-4">
      {/* â”€â”€ Header â”€â”€ */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <h2 className="text-2xl font-bold text-brand-navy dark:text-white font-space">Boîte de Réception</h2>
          {unreadCount > 0 && (
            <span className="px-2 py-0.5 bg-brand-red text-white text-xs font-bold rounded-full">{unreadCount}</span>
          )}
          {emergencyCount > 0 && (
            <span className="flex items-center gap-1 px-2 py-0.5 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-xs font-bold rounded-full">
              <AlertTriangle className="w-3 h-3" /> {emergencyCount} urgence{emergencyCount > 1 ? 's' : ''}
            </span>
          )}
        </div>
        <button
          onClick={onRefresh}
          disabled={isLoading}
          className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-300 rounded-xl hover:bg-slate-200 dark:hover:bg-white/10 transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} /> Actualiser
        </button>
      </div>

      {/* â”€â”€ Filter chips â”€â”€ */}
      <div className="flex flex-wrap gap-2">
        {Object.entries(FILTER_LABELS).map(([key, label]) => {
          const count =
            key === 'Unread'    ? messages.filter(m => m.unread).length :
            key === 'Emergency' ? messages.filter(m => m.type === 'Emergency').length :
            key === 'Support'   ? messages.filter(m => m.type === 'Support').length :
            key === 'Replied'   ? messages.filter(m => !!m.replyText).length : null;
          return (
            <button
              key={key}
              onClick={() => setFilter(key)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold uppercase transition-colors ${
                filter === key
                  ? 'bg-brand-blue text-white shadow'
                  : 'bg-slate-100 dark:bg-white/5 text-slate-500 hover:bg-slate-200 dark:hover:bg-white/10'
              }`}
            >
              {label}
              {count !== null && count > 0 && (
                <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${filter === key ? 'bg-white/20 text-white' : 'bg-brand-red text-white'}`}>
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* â”€â”€ Search bar â”€â”€ */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          type="text"
          placeholder="Rechercher par nom, email, sujet…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl pl-11 pr-10 py-3 text-sm text-brand-navy dark:text-white focus:outline-none focus:border-brand-blue transition-colors"
        />
        {search && (
          <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* â”€â”€ Split pane â”€â”€ */}
      <div className="grid grid-cols-1 lg:grid-cols-[340px_1fr] gap-4 min-h-[560px]">

        {/* â”€â”€ Left: grouped conversation list â”€â”€ */}
        <div className="bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl overflow-hidden shadow-sm flex flex-col">
          {isLoading ? (
            <div className="flex-1 flex flex-col items-center justify-center gap-3 text-slate-400 p-8">
              <Loader2 className="w-8 h-8 animate-spin" />
              <span className="text-sm">Chargement…</span>
            </div>
          ) : groups.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center gap-2 text-slate-400 p-8">
              <Inbox className="w-12 h-12 opacity-20" />
              <p className="text-sm font-medium">Aucun message trouvé</p>
            </div>
          ) : (
            <div className="overflow-y-auto flex-1 divide-y divide-slate-100 dark:divide-white/5">
              {groups.map(group => {
                const latestMeta = TYPE_META[group.latest.type] ?? TYPE_META.Inquiry;
                const isSelected = group.email === selectedEmail;
                const msgCount = group.messages.length;
                return (
                  <div
                    key={group.email}
                    onClick={() => setSelectedEmail(group.email)}
                    className={`relative p-4 cursor-pointer transition-colors flex items-start gap-3 ${
                      isSelected
                        ? 'bg-brand-blue/5 dark:bg-brand-blue/10 border-l-2 border-brand-blue'
                        : group.hasUnread
                          ? 'bg-blue-50/50 dark:bg-blue-900/10 hover:bg-slate-50 dark:hover:bg-white/5'
                          : 'hover:bg-slate-50 dark:hover:bg-white/5'
                    }`}
                  >
                    {/* Avatar */}
                    <div className="relative flex-shrink-0">
                      <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-white/10 flex items-center justify-center text-slate-600 dark:text-white font-bold text-sm overflow-hidden">
                        {group.avatar
                          ? <img src={group.avatar} alt={group.sender} className="w-full h-full object-cover" />
                          : avatarLetter(group.sender)}
                      </div>
                      {group.hasUnread && (
                        <span className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-brand-red rounded-full border-2 border-white dark:border-[#0B1120]" />
                      )}
                    </div>
                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 mb-0.5">
                        <span className={`text-sm truncate ${group.hasUnread ? 'font-bold text-brand-navy dark:text-white' : 'font-medium text-slate-700 dark:text-slate-300'}`}>
                          {group.sender}
                        </span>
                        <span className="text-[10px] text-slate-400 whitespace-nowrap flex-shrink-0">
                          {group.latest.createdAt ? relativeTime(group.latest.createdAt) : group.latest.time}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 truncate mb-1 font-medium">{group.latest.subject}</p>
                      <p className={`text-xs truncate ${group.hasUnread ? 'text-slate-700 dark:text-slate-200' : 'text-slate-400'}`}>
                        {group.latest.preview}
                      </p>
                      <div className="flex items-center gap-1.5 mt-1.5">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${latestMeta.bg} ${latestMeta.text}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${latestMeta.dot}`} />{latestMeta.label}
                        </span>
                        {msgCount > 1 && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 dark:bg-white/10 text-slate-500 dark:text-slate-400">
                            {msgCount} messages
                          </span>
                        )}
                        {group.messages.every(m => !!m.replyText) && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400">
                            <CheckCircle2 className="w-2.5 h-2.5" /> Répondu
                          </span>
                        )}
                      </div>
                    </div>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-300 flex-shrink-0 mt-1" />
                  </div>
                );
              })}
            </div>
          )}
          {!isLoading && (
            <div className="px-4 py-2 border-t border-slate-100 dark:border-white/5 text-xs text-slate-400 text-right">
              {groups.length} conversation{groups.length !== 1 ? 's' : ''}
            </div>
          )}
        </div>

        {/* â”€â”€ Right: thread detail â”€â”€ */}
        <div className="bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl overflow-hidden shadow-sm flex flex-col">
          {!selectedGroup ? (
            <div className="flex-1 flex flex-col items-center justify-center gap-3 text-slate-300 dark:text-slate-600 p-12">
              <MessageSquare className="w-16 h-16 opacity-30" />
              <p className="text-sm font-medium">Sélectionnez une conversation pour la lire</p>
            </div>
          ) : (
            <>
              {/* Thread header */}
              <div className="p-6 border-b border-slate-100 dark:border-white/10">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-full bg-slate-200 dark:bg-white/10 flex items-center justify-center text-slate-600 dark:text-white font-bold text-lg flex-shrink-0 overflow-hidden">
                      {selectedGroup.avatar
                        ? <img src={selectedGroup.avatar} alt={selectedGroup.sender} className="w-full h-full object-cover" />
                        : avatarLetter(selectedGroup.sender)}
                    </div>
                    <div>
                      <h3 className="font-bold text-brand-navy dark:text-white text-base">{selectedGroup.sender}</h3>
                      <a href={`mailto:${selectedGroup.email}`} className="text-sm text-brand-blue hover:underline">{selectedGroup.email}</a>
                      <div className="flex flex-wrap items-center gap-2 mt-2">
                        <span className="flex items-center gap-1 text-xs text-slate-400">
                          <MessageSquare className="w-3 h-3" />
                          {selectedGroup.messages.length} message{selectedGroup.messages.length !== 1 ? 's' : ''}
                        </span>
                        <span className="flex items-center gap-1 text-xs text-slate-400">
                          <Clock className="w-3 h-3" />
                          {new Date(selectedGroup.latest.createdAt).toLocaleString('fr-MA', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* All messages in thread (chronological) */}
              <div className="flex-1 overflow-y-auto p-6 space-y-8">
                {selectedGroup.messages.map((msg, idx) => {
                  const meta = TYPE_META[msg.type] ?? TYPE_META.Inquiry;
                  return (
                    <div key={msg.id} className="space-y-4">
                      {/* Subject divider for each message */}
                      <div className="flex items-center gap-3">
                        <div className={`h-px flex-1 ${idx === 0 ? 'bg-transparent' : 'bg-slate-100 dark:bg-white/5'}`} />
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${meta.bg} ${meta.text}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${meta.dot}`} />{meta.label}
                        </span>
                        <span className="text-[10px] text-slate-400 truncate max-w-[160px]">{msg.subject}</span>
                        <button
                          onClick={() => handleDelete(msg.id)}
                          disabled={isDeleting}
                          title="Supprimer ce message"
                          className="p-1 rounded-lg text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors disabled:opacity-40 flex-shrink-0"
                        >
                          {isDeleting ? <Loader2 className="w-3 h-3 animate-spin" /> : <Trash2 className="w-3 h-3" />}
                        </button>
                      </div>

                      {/* Client bubble */}
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-white/10 flex items-center justify-center text-slate-600 dark:text-white font-bold text-sm flex-shrink-0 overflow-hidden">
                          {msg.avatar ? <img src={msg.avatar} alt={msg.sender} className="w-full h-full object-cover" /> : avatarLetter(msg.sender)}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs font-bold text-slate-700 dark:text-slate-200">{msg.sender}</span>
                            <span className="text-[10px] text-slate-400">{relativeTime(msg.createdAt)}</span>
                          </div>
                          <div className="bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 rounded-2xl rounded-tl-none p-4">
                            <p className="text-sm text-slate-700 dark:text-slate-200 whitespace-pre-wrap leading-relaxed">
                              {msg.fullMessage || msg.preview}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Admin reply bubble (if any) */}
                      {msg.replyText && (
                        <div className="flex items-start gap-3 flex-row-reverse">
                          <div className="w-8 h-8 rounded-full bg-brand-blue flex items-center justify-center text-white font-bold text-sm flex-shrink-0">A</div>
                          <div className="flex-1 text-right">
                            <div className="flex items-center justify-end gap-2 mb-1">
                              <span className="text-[10px] text-slate-400">{msg.repliedAt ? relativeTime(msg.repliedAt) : ''}</span>
                              <span className="text-xs font-bold text-brand-blue">Admin</span>
                            </div>
                            <div className="bg-brand-blue/10 dark:bg-brand-blue/20 border border-brand-blue/20 rounded-2xl rounded-tr-none p-4 text-left">
                              <p className="text-sm text-slate-700 dark:text-slate-200 whitespace-pre-wrap leading-relaxed">{msg.replyText}</p>
                            </div>
                            <div className="flex items-center justify-end gap-1 mt-1.5 text-xs text-green-600 dark:text-green-400">
                              <CheckCircle2 className="w-3 h-3" /> Réponse envoyée
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}

                {sendDone && (
                  <div className="flex items-center gap-2 text-green-600 text-sm font-medium">
                    <CheckCircle2 className="w-4 h-4" /> Réponse envoyée avec succès
                  </div>
                )}
              </div>

              {/* Reply composer */}
              <div className="p-5 border-t border-slate-100 dark:border-white/10 bg-slate-50/50 dark:bg-white/[0.02]">
                <div className="flex items-center gap-2 mb-2">
                  <Reply className="w-3.5 h-3.5 text-slate-400" />
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Répondre à {selectedGroup.sender}</span>
                </div>
                <textarea
                  ref={replyRef}
                  value={replyText}
                  onChange={e => setReplyText(e.target.value)}
                  placeholder="Tapez votre réponse…"
                  rows={4}
                  onKeyDown={e => { if (e.ctrlKey && e.key === 'Enter') handleReply(); }}
                  className="w-full bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl p-3 text-sm text-brand-navy dark:text-white focus:outline-none focus:border-brand-blue resize-none transition-colors"
                />
                <div className="flex items-center justify-between mt-3">
                  <span className="text-xs text-slate-400">{replyText.length} / 5000 · Ctrl+Entrée pour envoyer</span>
                  <div className="flex gap-2">
                    {replyText && (
                      <button onClick={() => setReplyText('')} className="px-3 py-2 text-xs font-bold text-slate-500 hover:text-brand-navy dark:hover:text-white transition-colors">
                        Effacer
                      </button>
                    )}
                    <button
                      onClick={handleReply}
                      disabled={!replyText.trim() || isSending}
                      className="flex items-center gap-2 px-5 py-2 bg-brand-blue text-white rounded-xl text-xs font-bold uppercase hover:bg-opacity-90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSending ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Envoi…</> : <><Send className="w-3.5 h-3.5" /> Envoyer</>}
                    </button>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default MessageManagement;
