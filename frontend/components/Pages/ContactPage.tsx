import React, { useState, useEffect, useRef } from 'react';
import Navbar from '../Layout/Navbar';
import Footer from '../Layout/Footer';
import { motion } from 'framer-motion';
import { Mail, Phone, MapPin, Send, MessageSquare, Globe, ArrowRight, CheckCircle2, Building2, Loader2, Clock, RefreshCw } from 'lucide-react';
import { LOCATIONS } from '../../constants';
import { UserInfo } from '../../types';
import { contactApi, clientThreadApi } from '../../services/api';

// â”€â”€â”€ helpers â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const subjectToType = (subject: string): 'Support' | 'Inquiry' | 'Emergency' => {
  const s = subject.toLowerCase();
  if (s.includes('urgence') || s.includes('emergency')) return 'Emergency';
  if (s.includes('support') || s.includes('assistance')) return 'Support';
  return 'Inquiry';
};

const relativeTime = (iso: string): string => {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "À l'instant";
  if (m < 60) return `Il y a ${m} min`;
  const h = Math.floor(m / 60);
  if (h < 24) return `Il y a ${h}h`;
  const d = Math.floor(h / 24);
  if (d < 7) return `Il y a ${d}j`;
  return new Date(iso).toLocaleDateString('fr-MA', { day: '2-digit', month: 'short', year: 'numeric' });
};

const TYPE_COLORS: Record<string, string> = {
  Emergency: 'bg-red-100 text-red-600',
  Inquiry:   'bg-blue-100 text-blue-600',
  Support:   'bg-slate-100 text-slate-600',
};
const TYPE_LABELS: Record<string, string> = {
  Emergency: 'Urgence',
  Inquiry:   'Demande',
  Support:   'Assistance',
};

// â”€â”€â”€ Thread message item â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
interface ThreadItem {
  id: string;
  subject: string;
  message: string;
  type: 'Support' | 'Inquiry' | 'Emergency';
  created_at: string;
  reply_text?: string;
  replied_at?: string;
}

// â”€â”€â”€ Component â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
interface ContactPageProps {
  isDark: boolean;
  toggleTheme: () => void;
  onLoginClick: () => void;
  onNavigate: (path: string) => void;
  onLogout?: () => void;
  currentUser?: UserInfo | null;
}

const ContactPage: React.FC<ContactPageProps> = ({ isDark, toggleTheme, onLoginClick, onNavigate, onLogout, currentUser }) => {

  // â”€â”€ Guest form state â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const [formState, setFormState] = useState({ name: '', email: '', subject: 'Demande de Réservation', message: '' });
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // â”€â”€ Authenticated thread state â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const [thread, setThread] = useState<ThreadItem[]>([]);
  const [threadLoading, setThreadLoading] = useState(false);
  const [threadError, setThreadError] = useState<string | null>(null);
  const [newSubject, setNewSubject] = useState('Demande de Réservation');
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);
  const threadBottomRef = useRef<HTMLDivElement>(null);
  const containerRef    = useRef<HTMLDivElement>(null);
  const textareaRef     = useRef<HTMLTextAreaElement>(null);

  // Load thread when user is logged in
  useEffect(() => {
    if (!currentUser) return;
    setThreadLoading(true);
    setThreadError(null);
    (clientThreadApi.getThread() as Promise<any>)
      .then((res: any) => {
        const items: ThreadItem[] = (res.data ?? []).map((c: any) => ({
          id:          String(c.id),
          subject:     c.subject,
          message:     c.message,
          type:        c.type ?? 'Inquiry',
          created_at:  c.created_at,
          reply_text:  c.reply_text ?? undefined,
          replied_at:  c.replied_at ?? undefined,
        }));
        setThread(items.reverse()); // oldest first for chat order
      })
      .catch(() => setThreadError("Impossible de charger votre historique. Veuillez réessayer."))
      .finally(() => setThreadLoading(false));
  }, [currentUser]);

  // Scroll to bottom whenever thread changes
  useEffect(() => {
    threadBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [thread]);

  // ── Pin layout to the visual viewport (fixes iOS keyboard shifting) ──────
  useEffect(() => {
    if (!currentUser) return;

    // Lock body scroll so the background page never shifts
    const prevOverflow = document.body.style.overflow;
    const prevPosition = document.body.style.position;
    document.body.style.overflow = 'hidden';
    document.body.style.position = 'fixed';
    document.body.style.width = '100%';

    const vv = (window as any).visualViewport as (VisualViewport | null);

    const applyViewport = () => {
      if (!containerRef.current) return;
      if (vv) {
        // Mirror the exact visual viewport rect so the container always
        // fills exactly what is visible — above the keyboard, below the status bar
        containerRef.current.style.top    = `${vv.offsetTop}px`;
        containerRef.current.style.left   = `${vv.offsetLeft}px`;
        containerRef.current.style.width  = `${vv.width}px`;
        containerRef.current.style.height = `${vv.height}px`;
        containerRef.current.style.bottom = 'auto';
        containerRef.current.style.right  = 'auto';
      } else {
        // Fallback for browsers without visualViewport API
        containerRef.current.style.top    = '0px';
        containerRef.current.style.left   = '0px';
        containerRef.current.style.width  = '100%';
        containerRef.current.style.height = '100%';
        containerRef.current.style.bottom = '0px';
        containerRef.current.style.right  = '0px';
      }
      // Keep messages scrolled to bottom when viewport resizes (keyboard open/close)
      requestAnimationFrame(() => {
        threadBottomRef.current?.scrollIntoView({ behavior: 'auto' });
      });
    };

    if (vv) {
      vv.addEventListener('resize', applyViewport);
      vv.addEventListener('scroll', applyViewport);
    }
    window.addEventListener('resize', applyViewport);
    applyViewport();

    return () => {
      document.body.style.overflow = prevOverflow;
      document.body.style.position = prevPosition;
      document.body.style.width = '';
      if (vv) {
        vv.removeEventListener('resize', applyViewport);
        vv.removeEventListener('scroll', applyViewport);
      }
      window.removeEventListener('resize', applyViewport);
    };
  }, [currentUser]);

  // â”€â”€ Guest submit â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const handleGuestSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError(null);
    try {
      await contactApi.submit({
        name:    formState.name,
        email:   formState.email,
        subject: formState.subject,
        message: formState.message,
        type:    subjectToType(formState.subject),
      });
      setIsSubmitted(true);
    } catch (err: any) {
      setSubmitError(err?.message ?? 'Une erreur est survenue. Veuillez réessayer.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // â”€â”€ Auth send â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const handleAuthSend = async (e: React.FormEvent) => {
    e.preventDefault();
    const msgText = newMessage.trim();
    if (!msgText) return;
    setSending(true);
    setSendError(null);

    // ── Optimistic insert so the message appears instantly ──
    const optimisticId = `opt-${Date.now()}`;
    const optimisticItem: ThreadItem = {
      id:         optimisticId,
      subject:    newSubject,
      message:    msgText,
      type:       subjectToType(newSubject),
      created_at: new Date().toISOString(),
    };
    setThread(prev => [...prev, optimisticItem]);
    setNewMessage('');
    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }

    try {
      const res: any = await clientThreadApi.send({
        subject: newSubject,
        message: msgText,
        type:    subjectToType(newSubject),
      });
      const c = res.contact ?? res?.data?.contact;
      if (c) {
        // Replace optimistic item with real server item
        setThread(prev => prev.map(item =>
          item.id === optimisticId
            ? { id: String(c.id), subject: c.subject, message: c.message, type: c.type ?? 'Inquiry', created_at: c.created_at }
            : item
        ));
      }
    } catch (err: any) {
      // Remove optimistic item and restore message text on failure
      setThread(prev => prev.filter(item => item.id !== optimisticId));
      setNewMessage(msgText);
      setSendError(err?.message ?? 'Envoi échoué. Veuillez réessayer.');
    } finally {
      setSending(false);
    }
  };

  const displayName = currentUser
    ? `${currentUser.firstName} ${currentUser.lastName}`.trim()
    : '';

  // â”€â”€ Render â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  // ── AUTHENTICATED: full-screen native-chat layout (mobile-first) ────────
  if (currentUser) {
    return (
      <div
        ref={containerRef}
        className={`flex flex-col ${isDark ? 'bg-[#0B1120]' : 'bg-slate-100'} transition-colors`}
        style={{
          position: 'fixed',
          top: 0, left: 0,
          width: '100%', height: '100%',
          // will be overridden by the visualViewport listener once mounted
          willChange: 'top, height',
        }}
      >
        {/* Top bar */}
        <div
          className={`shrink-0 flex items-center gap-3 px-4 border-b z-20 shadow-sm ${isDark ? 'bg-[#0f172a] border-white/10' : 'bg-white border-slate-200'}`}
          style={{ paddingTop: 'max(env(safe-area-inset-top,0px), 12px)', paddingBottom: '12px' }}
        >
          <button onClick={() => onNavigate('home')}
            className="w-9 h-9 flex items-center justify-center rounded-xl text-slate-400 hover:text-brand-blue hover:bg-brand-blue/10 transition-colors shrink-0"
            aria-label="Retour">
            <ArrowRight className="w-5 h-5 rotate-180" />
          </button>
          <div className="w-10 h-10 rounded-full bg-brand-blue flex items-center justify-center text-white font-bold text-sm shrink-0 shadow">A</div>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-sm text-brand-navy dark:text-white leading-tight truncate">Support Atellas</p>
            <p className="text-[11px] text-brand-teal font-medium">Canal Prioritaire</p>
          </div>
          <button
            onClick={() => {
              setThreadLoading(true);
              (clientThreadApi.getThread() as Promise<any>)
                .then((res: any) => {
                  const items: ThreadItem[] = (res.data ?? []).map((c: any) => ({
                    id: String(c.id), subject: c.subject, message: c.message,
                    type: c.type ?? 'Inquiry', created_at: c.created_at,
                    reply_text: c.reply_text ?? undefined, replied_at: c.replied_at ?? undefined,
                  }));
                  setThread(items.reverse());
                })
                .catch(() => setThreadError('Impossible de charger.'))
                .finally(() => setThreadLoading(false));
            }}
            className="w-9 h-9 flex items-center justify-center rounded-xl text-slate-400 hover:text-brand-blue hover:bg-brand-blue/10 transition-colors shrink-0"
          >
            <RefreshCw className={`w-4 h-4 ${threadLoading ? 'animate-spin text-brand-blue' : ''}`} />
          </button>
        </div>

        {/* Messages area */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4" style={{ WebkitOverflowScrolling: 'touch' }}>

          {threadLoading && (
            <div className="flex items-center justify-center py-12 text-slate-400">
              <Loader2 className="w-5 h-5 animate-spin mr-2 text-brand-blue" />
              <span className="text-sm">Chargement&hellip;</span>
            </div>
          )}

          {threadError && (
            <p className="text-sm text-red-600 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-500/30 rounded-2xl px-4 py-3 text-center">{threadError}</p>
          )}

          {!threadLoading && !threadError && thread.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20 text-center px-6">
              <div className="w-16 h-16 rounded-full bg-brand-blue/10 flex items-center justify-center mb-4">
                <MessageSquare className="w-8 h-8 text-brand-blue/40" />
              </div>
              <p className="font-bold text-sm text-slate-600 dark:text-slate-300 mb-1">Bienvenue, {currentUser.firstName}&nbsp;!</p>
              <p className="text-xs text-slate-400 max-w-[220px] leading-relaxed">
                Envoyez votre première demande ci-dessous. Notre équipe vous répondra rapidement.
              </p>
            </div>
          )}

          {!threadLoading && thread.map((item) => (
            <div key={item.id}>
              {/* Client bubble — right */}
              <div className="flex justify-end items-end gap-2 mb-0.5">
                <div className="max-w-[82%] sm:max-w-[70%]">
                  <div className="flex items-center justify-end gap-1.5 mb-1 px-1">
                    <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase ${TYPE_COLORS[item.type] ?? ''}`}>
                      {TYPE_LABELS[item.type] ?? item.type}
                    </span>
                    <span className="text-[10px] text-slate-400 flex items-center gap-0.5">
                      <Clock className="w-2.5 h-2.5" />{relativeTime(item.created_at)}
                    </span>
                  </div>
                  <div className="bg-brand-navy dark:bg-brand-blue text-white rounded-[20px] rounded-br-[4px] px-4 py-3 shadow-sm">
                    <p className="text-[10px] font-bold uppercase opacity-50 mb-1 tracking-wider">{item.subject}</p>
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">{item.message}</p>
                  </div>
                  <p className="text-[10px] text-slate-400 text-right mt-1 px-1">{displayName}</p>
                </div>
                <div className="w-7 h-7 rounded-full bg-brand-blue/80 text-white flex items-center justify-center text-xs font-bold shrink-0 shadow mb-5">
                  {displayName.charAt(0).toUpperCase()}
                </div>
              </div>

              {/* Admin reply — left */}
              {item.reply_text && (
                <div className="flex justify-start items-end gap-2 mt-2">
                  <div className="w-7 h-7 rounded-full bg-brand-teal flex items-center justify-center text-white text-xs font-bold shrink-0 shadow mb-5">A</div>
                  <div className="max-w-[82%] sm:max-w-[70%]">
                    <div className="flex items-center gap-1.5 mb-1 px-1">
                      <span className="text-[10px] font-bold text-brand-teal uppercase tracking-wider">Atellas</span>
                      {item.replied_at && (
                        <span className="text-[10px] text-slate-400 flex items-center gap-0.5">
                          <Clock className="w-2.5 h-2.5" />{relativeTime(item.replied_at)}
                        </span>
                      )}
                    </div>
                    <div className="bg-white dark:bg-white/10 text-brand-navy dark:text-slate-100 rounded-[20px] rounded-bl-[4px] px-4 py-3 shadow-sm border border-slate-100 dark:border-white/10">
                      <p className="text-sm leading-relaxed whitespace-pre-wrap">{item.reply_text}</p>
                    </div>
                    <p className="text-[10px] text-slate-400 mt-1 px-1 flex items-center gap-1">
                      <CheckCircle2 className="w-2.5 h-2.5 text-brand-teal" /> Répondu
                    </p>
                  </div>
                </div>
              )}
            </div>
          ))}
          <div ref={threadBottomRef} className="h-1" />
        </div>

        {/* Compose bar */}
        <div
          className={`shrink-0 border-t z-20 ${isDark ? 'bg-[#0f172a] border-white/10' : 'bg-white border-slate-200'}`}
          style={{ paddingBottom: 'max(env(safe-area-inset-bottom,0px), 12px)' }}
        >
          <form onSubmit={handleAuthSend} className="px-3 pt-3 space-y-2">
            <select
              value={newSubject}
              onChange={e => setNewSubject(e.target.value)}
              className={`w-full text-xs font-semibold rounded-xl px-3 py-2.5 border appearance-none cursor-pointer focus:outline-none focus:border-brand-blue transition-all ${isDark ? 'bg-white/5 border-white/10 text-white' : 'bg-slate-50 border-slate-200 text-brand-navy'}`}
            >
              <option>Demande de Réservation</option>
              <option>Comptes Entreprise</option>
              <option>Presse &amp; Média</option>
              <option>Support &amp; Assistance</option>
              <option>Urgence</option>
            </select>
            <div className="flex items-end gap-2">
              <textarea
                rows={1}
                required
                ref={textareaRef}
                value={newMessage}
                onChange={e => {
                  setNewMessage(e.target.value);
                  e.target.style.height = 'auto';
                  e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px';
                }}
                onFocus={() => {
                  // Allow time for keyboard to fully appear, then re-apply viewport
                  setTimeout(() => {
                    const vv = (window as any).visualViewport as (VisualViewport | null);
                    if (vv && containerRef.current) {
                      containerRef.current.style.top    = `${vv.offsetTop}px`;
                      containerRef.current.style.height = `${vv.height}px`;
                      containerRef.current.style.bottom = 'auto';
                    }
                    threadBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
                  }, 100);
                }}
                onKeyDown={e => { if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) handleAuthSend(e as any); }}
                placeholder="Écrivez votre message…"
                style={{ resize: 'none', minHeight: '44px', maxHeight: '120px', overflow: 'auto' }}
                className={`flex-1 text-sm rounded-2xl px-4 py-3 border focus:outline-none focus:border-brand-blue transition-all leading-relaxed ${isDark ? 'bg-white/5 border-white/10 text-white placeholder:text-slate-500' : 'bg-slate-50 border-slate-200 text-brand-navy placeholder:text-slate-400'}`}
              />
              <button
                type="submit"
                disabled={sending || !newMessage.trim()}
                style={{ minWidth: '44px', minHeight: '44px' }}
                className="shrink-0 w-11 h-11 flex items-center justify-center bg-brand-blue disabled:bg-slate-200 dark:disabled:bg-white/10 text-white disabled:text-slate-400 rounded-full shadow-md hover:bg-blue-600 active:scale-95 transition-all"
              >
                {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4 -translate-x-px" />}
              </button>
            </div>
            {sendError && <p className="text-xs text-red-500 px-1">{sendError}</p>}
          </form>
        </div>
      </div>
    );
  }

  // ── GUEST: original full-page layout ─────────────────────────────────────
  return (
    <div className={`min-h-screen flex flex-col ${isDark ? 'bg-brand-navy' : 'bg-brand-light'} transition-colors duration-700`}>
      <Navbar
        isDark={isDark}
        toggleTheme={toggleTheme}
        onLoginClick={onLoginClick}
        onNavigate={onNavigate}
        currentUser={currentUser}
        onLogout={onLogout}
      />

      <section className="pt-32 pb-24 px-6 relative mt-16 md:mt-20">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-brand-blue/5 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-brand-teal/5 rounded-full blur-[100px] pointer-events-none" />

        <div className="w-full lg:px-16 xl:px-20 2xl:px-28 mx-auto relative z-10">

          {/* Header */}
          <div className="text-center mb-16">
            <motion.span initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              className="text-brand-teal font-bold tracking-[0.2em] text-xs uppercase mb-4 block">
              {currentUser ? 'Votre Espace Personnel' : 'Connectivité Mondiale'}
            </motion.span>
            <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
              className="text-5xl md:text-6xl font-bold text-brand-navy dark:text-white font-space mb-6">
              {currentUser ? <>Messagerie <span className="text-brand-blue">Atellas</span></> : <>Contactez <span className="text-brand-blue">Atellas</span></>}
            </motion.h1>
            <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
              className="text-slate-500 dark:text-slate-400 max-w-2xl mx-auto text-lg leading-relaxed">
              {currentUser
                ? `Bonjour ${currentUser.firstName}. Retrouvez ici l'historique de vos échanges avec notre équipe et envoyez de nouveaux messages.`
                : "Notre équipe de conciergerie est disponible 24/7 pour vous aider avec vos réservations, demandes concernant la flotte et arrangements de voyage sur mesure."}
            </motion.p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20">

            {/* â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
                LEFT PANEL
                - Logged-in : chat thread
                - Guest     : contact form
                â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
            <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}
              className="bg-white dark:bg-[#0B1120] rounded-3xl shadow-2xl border border-slate-200 dark:border-white/5 relative overflow-hidden flex flex-col"
              style={{ minHeight: '560px' }}>

              {currentUser ? (
                /* â”€â”€ AUTHENTICATED THREAD VIEW â”€â”€ */
                <div className="flex flex-col h-full">

                  {/* Header bar */}
                  <div className="flex items-center justify-between gap-4 px-6 pt-6 pb-4 border-b border-slate-100 dark:border-white/5 shrink-0">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-brand-blue/10 flex items-center justify-center text-brand-blue">
                        <MessageSquare className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="text-base font-bold text-brand-navy dark:text-white">Messagerie Atellas</h3>
                        <p className="text-[11px] text-slate-500 uppercase tracking-wider">Canal de Support Prioritaire</p>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        setThreadLoading(true);
                        (clientThreadApi.getThread() as Promise<any>)
                          .then((res: any) => {
                            const items: ThreadItem[] = (res.data ?? []).map((c: any) => ({
                              id: String(c.id), subject: c.subject, message: c.message,
                              type: c.type ?? 'Inquiry', created_at: c.created_at,
                              reply_text: c.reply_text ?? undefined, replied_at: c.replied_at ?? undefined,
                            }));
                            setThread(items.reverse());
                          })
                          .catch(() => setThreadError("Impossible de charger."))
                          .finally(() => setThreadLoading(false));
                      }}
                      className="p-2 rounded-lg text-slate-400 hover:text-brand-blue hover:bg-brand-blue/10 transition-colors"
                      title="Rafraîchir"
                    >
                      <RefreshCw className={`w-4 h-4 ${threadLoading ? 'animate-spin' : ''}`} />
                    </button>
                  </div>

                  {/* Messages scroll area */}
                  <div className="flex-grow overflow-y-auto px-6 py-4 space-y-6 custom-scrollbar" style={{ maxHeight: '420px' }}>

                    {threadLoading && (
                      <div className="flex items-center justify-center py-16 text-slate-400">
                        <Loader2 className="w-5 h-5 animate-spin mr-2" />
                        <span className="text-sm">Chargement…</span>
                      </div>
                    )}

                    {threadError && (
                      <div className="text-sm text-red-600 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-500/30 rounded-xl px-4 py-3">
                        {threadError}
                      </div>
                    )}

                    {!threadLoading && !threadError && thread.length === 0 && (
                      <div className="flex flex-col items-center justify-center py-16 text-center text-slate-400">
                        <MessageSquare className="w-10 h-10 mb-3 opacity-30" />
                        <p className="text-sm font-medium">Aucun message pour l'instant.</p>
                        <p className="text-xs mt-1">Envoyez votre première demande ci-dessous.</p>
                      </div>
                    )}

                    {!threadLoading && thread.map((item) => (
                      <div key={item.id} className="space-y-3">

                        {/* Client bubble (right-aligned) */}
                        <div className="flex justify-end gap-3">
                          <div className="max-w-[85%]">
                            <div className="flex items-center justify-end gap-2 mb-1">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${TYPE_COLORS[item.type] ?? ''}`}>
                                {TYPE_LABELS[item.type] ?? item.type}
                              </span>
                              <span className="text-[10px] text-slate-400">
                                <Clock className="w-3 h-3 inline -mt-px mr-0.5" />
                                {relativeTime(item.created_at)}
                              </span>
                            </div>
                            <div className="bg-brand-navy dark:bg-brand-blue text-white rounded-2xl rounded-tr-sm px-4 py-3 text-sm leading-relaxed shadow-sm">
                              <p className="text-[10px] font-bold uppercase opacity-60 mb-1">{item.subject}</p>
                              {item.message}
                            </div>
                            <p className="text-[10px] text-slate-400 text-right mt-1">{displayName}</p>
                          </div>
                          <div className="w-8 h-8 rounded-full bg-brand-blue text-white flex items-center justify-center text-xs font-bold shrink-0 shadow mt-auto">
                            {displayName.charAt(0).toUpperCase()}
                          </div>
                        </div>

                        {/* Admin reply bubble (left-aligned) */}
                        {item.reply_text && (
                          <div className="flex justify-start gap-3">
                            <div className="w-8 h-8 rounded-full bg-brand-teal/20 text-brand-teal flex items-center justify-center text-xs font-bold shrink-0 shadow mt-auto">
                              A
                            </div>
                            <div className="max-w-[85%]">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-[10px] font-bold text-brand-teal uppercase">Atellas</span>
                                {item.replied_at && (
                                  <span className="text-[10px] text-slate-400">
                                    <Clock className="w-3 h-3 inline -mt-px mr-0.5" />
                                    {relativeTime(item.replied_at)}
                                  </span>
                                )}
                              </div>
                              <div className="bg-slate-100 dark:bg-white/10 text-brand-navy dark:text-slate-100 rounded-2xl rounded-tl-sm px-4 py-3 text-sm leading-relaxed shadow-sm">
                                {item.reply_text}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}

                    <div ref={threadBottomRef} />
                  </div>

                  {/* New message form */}
                  <form onSubmit={handleAuthSend} className="shrink-0 px-6 py-4 border-t border-slate-100 dark:border-white/5 space-y-3 bg-slate-50/50 dark:bg-white/[0.02]">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Type de Demande</label>
                      <select
                        value={newSubject}
                        onChange={e => setNewSubject(e.target.value)}
                        className="w-full bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2 text-sm text-brand-navy dark:text-white focus:outline-none focus:border-brand-blue transition-all appearance-none cursor-pointer"
                      >
                        <option>Demande de Réservation</option>
                        <option>Comptes Entreprise</option>
                        <option>Presse &amp; Média</option>
                        <option>Support &amp; Assistance</option>
                        <option>Urgence</option>
                      </select>
                    </div>
                    <div className="flex gap-2 items-end">
                      <textarea
                        rows={2}
                        required
                        value={newMessage}
                        onChange={e => setNewMessage(e.target.value)}
                        onKeyDown={e => { if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) handleAuthSend(e as any); }}
                        placeholder="Écrivez votre message… (Ctrl+Entrée pour envoyer)"
                        className="flex-grow bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2 text-sm text-brand-navy dark:text-white focus:outline-none focus:border-brand-blue transition-all resize-none"
                      />
                      <button
                        type="submit"
                        disabled={sending || !newMessage.trim()}
                        className="shrink-0 h-[58px] w-12 flex items-center justify-center bg-brand-navy dark:bg-brand-blue text-white rounded-xl hover:opacity-90 transition-all disabled:opacity-40 shadow"
                        title="Envoyer (Ctrl+Entrée)"
                      >
                        {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                      </button>
                    </div>
                    {sendError && (
                      <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{sendError}</p>
                    )}
                  </form>
                </div>

              ) : (
                /* â”€â”€ GUEST FORM â”€â”€ */
                <div className="p-8 md:p-12">
                  {isSubmitted ? (
                    <div className="h-full flex flex-col items-center justify-center text-center py-20">
                      <div className="w-20 h-20 bg-green-100 dark:bg-green-500/20 rounded-full flex items-center justify-center mb-6">
                        <CheckCircle2 className="w-10 h-10 text-green-600 dark:text-green-400" />
                      </div>
                      <h3 className="text-2xl font-bold text-brand-navy dark:text-white mb-2">Message Transmis</h3>
                      <p className="text-slate-500 dark:text-slate-400 max-w-xs mx-auto mb-8">
                        Notre équipe a bien reçu votre demande. Un concierge vous répondra par canal sécurisé dans les 15 minutes.
                      </p>
                      <button onClick={() => setIsSubmitted(false)}
                        className="text-sm font-bold text-brand-blue hover:text-brand-navy dark:hover:text-white transition-colors">
                        Envoyer un autre message
                      </button>
                    </div>
                  ) : (
                    <form onSubmit={handleGuestSubmit} className="relative z-10 space-y-6">
                      <div className="flex items-center gap-4 mb-8">
                        <div className="w-12 h-12 rounded-xl bg-brand-blue/10 flex items-center justify-center text-brand-blue">
                          <MessageSquare className="w-6 h-6" />
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-brand-navy dark:text-white font-space">Ligne Directe</h3>
                          <p className="text-xs text-slate-500 uppercase tracking-wider">Canal de Support Prioritaire</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="group">
                          <label className="block text-xs font-bold text-slate-500 uppercase mb-2 group-focus-within:text-brand-blue transition-colors">Nom</label>
                          <input type="text" required
                            className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-brand-navy dark:text-white focus:outline-none focus:border-brand-blue focus:ring-1 focus:ring-brand-blue transition-all"
                            placeholder="Alexander Pierce"
                            value={formState.name}
                            onChange={e => setFormState({ ...formState, name: e.target.value })} />
                        </div>
                        <div className="group">
                          <label className="block text-xs font-bold text-slate-500 uppercase mb-2 group-focus-within:text-brand-blue transition-colors">Adresse Email</label>
                          <input type="email" required
                            className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-brand-navy dark:text-white focus:outline-none focus:border-brand-blue focus:ring-1 focus:ring-brand-blue transition-all"
                            placeholder="alexander@example.com"
                            value={formState.email}
                            onChange={e => setFormState({ ...formState, email: e.target.value })} />
                        </div>
                      </div>

                      <div className="group">
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-2 group-focus-within:text-brand-blue transition-colors">Type de Demande</label>
                        <select
                          className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-brand-navy dark:text-white focus:outline-none focus:border-brand-blue focus:ring-1 focus:ring-brand-blue transition-all appearance-none cursor-pointer"
                          value={formState.subject}
                          onChange={e => setFormState({ ...formState, subject: e.target.value })}>
                          <option>Demande de Réservation</option>
                          <option>Comptes Entreprise</option>
                          <option>Presse &amp; Média</option>
                          <option>Support &amp; Assistance</option>
                        </select>
                      </div>

                      <div className="group">
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-2 group-focus-within:text-brand-blue transition-colors">Message</label>
                        <textarea rows={4} required
                          className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-brand-navy dark:text-white focus:outline-none focus:border-brand-blue focus:ring-1 focus:ring-brand-blue transition-all resize-none"
                          placeholder="Comment pouvons-nous vous aider aujourd'hui ?"
                          value={formState.message}
                          onChange={e => setFormState({ ...formState, message: e.target.value })} />
                      </div>

                      {submitError && (
                        <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3">{submitError}</p>
                      )}

                      <button type="submit" disabled={isSubmitting}
                        className="w-full py-4 bg-brand-navy dark:bg-white text-white dark:text-brand-navy rounded-xl font-bold text-sm uppercase tracking-wider hover:opacity-90 hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-2 shadow-lg group">
                        {isSubmitting ? 'Transmission…' : (
                          <>Envoyer Message <Send className="w-4 h-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" /></>
                        )}
                      </button>
                    </form>
                  )}

                  {/* Decorative */}
                  <div className="absolute top-0 right-0 w-32 h-32 bg-brand-blue/10 rounded-bl-[100px] pointer-events-none" />
                  <div className="absolute bottom-0 left-0 w-20 h-20 bg-brand-red/5 rounded-tr-[60px] pointer-events-none" />
                </div>
              )}
            </motion.div>

            {/* â”€â”€ Info Side â”€â”€ */}
            <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }}
              className="flex flex-col justify-center">
              <div className="mb-12">
                <h3 className="text-2xl font-bold text-brand-navy dark:text-white font-space mb-8 flex items-center gap-3">
                  <Globe className="w-6 h-6 text-brand-teal" /> Siège Mondial
                </h3>
                <div className="space-y-6">
                  <div className="flex items-start gap-4 p-4 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 hover:border-brand-blue/30 transition-colors group">
                    <div className="w-10 h-10 rounded-full bg-white dark:bg-white/10 flex items-center justify-center text-brand-navy dark:text-white shadow-sm group-hover:bg-brand-blue group-hover:text-white transition-colors">
                      <MapPin className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-bold text-brand-navy dark:text-white text-sm">Bureau Principal</p>
                      <p className="text-slate-500 text-sm mt-1">15 Hudson Yards, Level 88<br />New York, NY 10001, USA</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4 p-4 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 hover:border-brand-blue/30 transition-colors group">
                    <div className="w-10 h-10 rounded-full bg-white dark:bg-white/10 flex items-center justify-center text-brand-navy dark:text-white shadow-sm group-hover:bg-brand-blue group-hover:text-white transition-colors">
                      <Phone className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-bold text-brand-navy dark:text-white text-sm">Conciergerie</p>
                      <p className="text-slate-500 text-sm mt-1">+1 (888) AERO-FLY<br />Mon-Sun, 24 Hours</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4 p-4 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 hover:border-brand-blue/30 transition-colors group">
                    <div className="w-10 h-10 rounded-full bg-white dark:bg-white/10 flex items-center justify-center text-brand-navy dark:text-white shadow-sm group-hover:bg-brand-blue group-hover:text-white transition-colors">
                      <Mail className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-bold text-brand-navy dark:text-white text-sm">Support Email</p>
                      <p className="text-slate-500 text-sm mt-1">concierge@atellas.com<br />press@atellas.com</p>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-6">Hubs Régionaux</h4>
                <div className="grid grid-cols-2 gap-4">
                  {LOCATIONS.slice(1, 5).map((loc, idx) => (
                    <div key={idx} className="flex items-center gap-3">
                      <Building2 className="w-4 h-4 text-brand-teal opacity-70" />
                      <div>
                        <p className="font-bold text-brand-navy dark:text-white text-xs">{loc.city}</p>
                        <p className="text-[10px] text-slate-400 truncate max-w-[120px]">{loc.address}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-10 pt-8 border-t border-slate-200 dark:border-white/10">
                <button onClick={() => onNavigate('#locations')}
                  className="inline-flex items-center gap-2 text-brand-blue hover:text-brand-teal font-bold text-sm uppercase tracking-wider transition-colors">
                  Voir Toutes les Localisations sur la Carte <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </motion.div>

          </div>
        </div>
      </section>

      <Footer onNavigate={onNavigate} />
    </div>
  );
};

export default ContactPage;
