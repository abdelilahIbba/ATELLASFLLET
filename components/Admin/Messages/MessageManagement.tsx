import React, { useState, useMemo } from 'react';
import { 
  Search, 
  MessageSquare,
  ChevronRight
} from 'lucide-react';
import { Message } from '../../../types'; 

interface MessageManagementProps {
  messages: Message[];
  openModal: (type: string, item: any) => void;
}

const MessageManagement: React.FC<MessageManagementProps> = ({ 
  messages, 
  openModal 
}) => {
  const [messageSearch, setMessageSearch] = useState('');
  const [messageFilter, setMessageFilter] = useState('All');

  // Mapping for display text
  const filterLabels: { [key: string]: string } = {
    'All': 'Tous',
    'Unread': 'Non Lus',
    'Emergency': 'Urgence',
    'Support': 'Assistance'
  };

  const filteredMessages = useMemo(() => messages.filter(m => {
      // Basic search on sender or preview
      const matchesSearch = 
        (m.sender?.toLowerCase() || '').includes(messageSearch.toLowerCase()) || 
        (m.preview?.toLowerCase() || '').includes(messageSearch.toLowerCase());
      
      let matchesFilter = true;
      if (messageFilter === 'All') {
        matchesFilter = true;
      } else if (messageFilter === 'Unread') {
        matchesFilter = !!m.unread; // Ensure boolean
      } else {
        // Filter by message type
        matchesFilter = m.type === messageFilter;
      }
      
      return matchesSearch && matchesFilter;
  }), [messages, messageSearch, messageFilter]);

  // Helper to translate message type for display
  const getMessageTypeLabel = (type: string) => {
    switch(type) {
      case 'Emergency': return 'Urgence';
      case 'Inquiry': return 'Demande';
      case 'Support': return 'Assistance';
      default: return type;
    }
  };

  return (
    <div className="space-y-6">
        <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-brand-navy dark:text-white font-space">Boîte de Réception</h2>
            <div className="flex gap-2">
                {['All', 'Unread', 'Emergency', 'Support'].map((f) => (
                    <button 
                        key={f} 
                        onClick={() => setMessageFilter(f)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase transition-colors ${messageFilter === f ? 'bg-brand-blue text-white' : 'bg-slate-100 dark:bg-white/5 text-slate-500 hover:bg-slate-200 dark:hover:bg-white/10'}`}
                    >
                        {filterLabels[f] || f}
                    </button>
                ))}
            </div>
        </div>

        <div className="relative">
            <Search className="absolute left-4 top-3.5 w-4 h-4 text-slate-400" />
            <input 
                type="text" 
                placeholder="Rechercher des messages..." 
                className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl pl-12 pr-4 py-3 text-sm text-brand-navy dark:text-white focus:outline-none focus:border-brand-blue transition-colors"
                value={messageSearch}
                onChange={(e) => setMessageSearch(e.target.value)}
            />
        </div>

        <div className="bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl overflow-hidden shadow-sm">
            {filteredMessages.length > 0 ? (
                <div className="divide-y divide-slate-100 dark:divide-white/5">
                    {filteredMessages.map((msg, idx) => (
                        <div 
                            key={msg.id || idx} 
                            onClick={() => openModal('message', msg)}
                            className={`p-4 hover:bg-slate-50 dark:hover:bg-white/5 cursor-pointer transition-colors flex items-center gap-4 ${msg.unread ? 'bg-blue-50/50 dark:bg-blue-900/10' : ''}`}
                        >
                            <div className="relative">
                                <div className="w-12 h-12 rounded-full bg-slate-200 dark:bg-white/10 overflow-hidden flex items-center justify-center text-slate-500 font-bold text-lg">
                                    {(msg as any).avatar ? <img src={(msg as any).avatar} alt={msg.sender} className="w-full h-full object-cover" /> : (msg.sender || '?').charAt(0)}
                                </div>
                                {msg.unread && <div className="absolute -top-1 -right-1 w-4 h-4 bg-brand-red rounded-full border-2 border-white dark:border-[#0B1120]"></div>}
                            </div>
                            
                            <div className="flex-grow min-w-0">
                                <div className="flex justify-between items-center mb-1">
                                    <h4 className={`text-sm truncate ${msg.unread ? 'font-bold text-brand-navy dark:text-white' : 'font-medium text-slate-700 dark:text-slate-300'}`}>
                                        {msg.sender}
                                    </h4>
                                    <span className="text-xs text-slate-400 whitespace-nowrap">{msg.time}</span>
                                </div>
                                <p className={`text-sm truncate ${msg.unread ? 'text-slate-800 dark:text-slate-200' : 'text-slate-500'}`}>
                                    {msg.preview}
                                </p>
                            </div>

                            <div className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                                msg.type === 'Emergency' ? 'bg-red-100 text-red-600' :
                                msg.type === 'Inquiry' ? 'bg-blue-100 text-blue-600' :
                                'bg-slate-100 text-slate-600'
                            }`}>
                                {getMessageTypeLabel(msg.type)}
                            </div>
                            
                            <ChevronRight className="w-4 h-4 text-slate-400" />
                        </div>
                    ))}
                </div>
            ) : (
                <div className="p-12 text-center text-slate-500">
                    <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-20" />
                    <p>Aucun message trouvé.</p>
                </div>
            )}
        </div>
    </div>
  );
};

export default MessageManagement;
