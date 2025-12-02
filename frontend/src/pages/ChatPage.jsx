import React, { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, Hash, LogOut, Send, PlusCircle, X, 
  MessageSquare, Settings, Zap, Search, ArrowUpCircle, Trash2, Loader2, Menu 
} from 'lucide-react'; // Added 'Menu' to imports
import api from '../api';

// --- Visual Components ---
const TeachatMiniLogo = () => { 
  const [step, setStep] = useState(0);
  useEffect(() => {
    const cycle = async () => {
      while(true) {
        setStep(0); await new Promise(r => setTimeout(r, 4000));
        setStep(1); await new Promise(r => setTimeout(r, 4000));
      }
    };
    cycle();
  }, []);
  return (
    <div className="flex items-center text-xl font-black tracking-tight text-white select-none">
      <motion.span layout className="relative z-10">Tea</motion.span>
      <motion.span initial={{ opacity: 1, width: 'auto' }} animate={{ opacity: step === 0 ? 1 : 0, width: step === 0 ? 'auto' : 0, scale: step === 0 ? 1 : 0 }} transition={{ duration: 0.8, ease: "easeInOut" }} className="text-gray-500 overflow-hidden inline-block origin-bottom">m</motion.span>
      <motion.span animate={{ width: step === 0 ? '6px' : '0px' }} transition={{ duration: 0.8, ease: "easeInOut" }} className="inline-block"></motion.span>
      <motion.span layout className={`relative z-10 transition-colors duration-1000 ${step !== 0 ? 'text-indigo-400' : 'text-white'}`}>chat</motion.span>
      <motion.div animate={{ opacity: [0, 1, 0] }} transition={{ repeat: Infinity, duration: 1 }} className="w-1.5 h-5 bg-indigo-500 ml-1 rounded-full" />
    </div>
  );
};

export default function ChatPage({ user, onLogout }) {
  // --- State ---
  const [channels, setChannels] = useState([]);
  const [allUsers, setAllUsers] = useState([]); 
  const [activeChannel, setActiveChannel] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messageInput, setMessageInput] = useState('');
  const [socket, setSocket] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newChannelName, setNewChannelName] = useState('');
  
  // Bonus Features State
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [typingUsers, setTypingUsers] = useState(new Set()); 
  const [searchQuery, setSearchQuery] = useState(''); 
  const [showSearch, setShowSearch] = useState(false);
  
  // MOBILE RESPONSIVENESS STATE
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  const typingTimeoutRef = useRef(null); 

  // 1. INITIALIZE SOCKET
  useEffect(() => {
    const newSocket = io('https://teachat-backend.onrender.com',  {
      transports: ['websocket', 'polling'],
      query: { user_id: user.id } 
    });
    setSocket(newSocket);
    fetchChannels();
    fetchUsers(); 
    return () => newSocket.close();
  }, []);

  // 2. LISTEN FOR EVENTS
  useEffect(() => {
    if (!socket) return;

    // MESSAGE RECEIVED
    socket.on('new_message', (msg) => {
      if (activeChannel && String(msg.channel_id) === String(activeChannel.id)) {
        setMessages((prev) => {
          const exists = prev.some(m => m.id === msg.id || (m.tempId && m.content === msg.content));
          if (exists) return prev;
          return [msg, ...prev];
        });
        setOffset(prev => prev + 1);
      }
    });

    // PRESENCE
    socket.on('status_update', (update) => {
      setAllUsers(prevUsers => prevUsers.map(u => 
        u.id === update.user_id ? { ...u, is_online: update.is_online } : u
      ));
    });

    // TYPING INDICATORS
    socket.on('typing_start', (data) => {
      if (activeChannel && String(data.channel_id) === String(activeChannel.id)) {
        setTypingUsers(prev => new Set(prev).add(data.username));
      }
    });

    socket.on('typing_stop', (data) => {
      if (activeChannel && String(data.channel_id) === String(activeChannel.id)) {
        setTypingUsers(prev => {
          const newSet = new Set(prev);
          newSet.delete(data.username);
          return newSet;
        });
      }
    });

    // MESSAGE DELETED
    socket.on('message_deleted', (data) => {
      if (activeChannel && String(data.channel_id) === String(activeChannel.id)) {
        setMessages(prev => prev.filter(m => m.id !== data.id));
      }
    });

    return () => {
      socket.off('new_message');
      socket.off('status_update');
      socket.off('typing_start');
      socket.off('typing_stop');
      socket.off('message_deleted');
    };
  }, [socket, activeChannel]);

  // 3. CHANNEL LOGIC
  useEffect(() => {
    if (activeChannel && socket) {
      setMessages([]);
      setOffset(0);
      setHasMore(true);
      setTypingUsers(new Set()); 
      loadMessages(activeChannel.id, 0, true);
      socket.emit('join_channel', { channel_id: activeChannel.id });
      // Close mobile menu when channel is selected
      setIsMobileMenuOpen(false);
    }
  }, [activeChannel, socket]);

  // --- ACTIONS ---

  const handleInputChange = (e) => {
    setMessageInput(e.target.value);
    
    if (socket && activeChannel) {
      socket.emit('typing_start', { channel_id: activeChannel.id, username: user.username });
      
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => {
        socket.emit('typing_stop', { channel_id: activeChannel.id, username: user.username });
      }, 2000);
    }
  };

  const handleDeleteMessage = (msgId) => {
    if (window.confirm("Delete this message?")) {
      socket.emit('delete_message', { 
        message_id: msgId, 
        channel_id: activeChannel.id,
        user_id: user.id 
      });
    }
  };

  const loadMessages = async (channelId, currentOffset, isInitial = false) => {
    try {
      const limit = 20;
      const res = await api.get(`/messages/${channelId}?limit=${limit}&offset=${currentOffset}`);
      if (res.data.length < limit) setHasMore(false);
      if (isInitial) {
        setMessages(res.data);
        setOffset(limit);
      } else {
        setMessages(prev => [...prev, ...res.data]);
        setOffset(prev => prev + limit);
      }
    } catch (err) { console.error(err); }
  };

  const fetchChannels = async () => {
    try {
      const res = await api.get('/channels');
      setChannels(res.data);
      if (res.data.length > 0 && !activeChannel) setActiveChannel(res.data[0]);
    } catch (err) { console.error(err); }
  };

  const fetchUsers = async () => {
    try {
      const res = await api.get('/users');
      setAllUsers(res.data);
    } catch (err) { console.error(err); }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!messageInput.trim() || !activeChannel) return;

    const tempContent = messageInput;
    setMessageInput('');
    socket.emit('typing_stop', { channel_id: activeChannel.id, username: user.username });

    const tempMsg = {
      id: Date.now(), tempId: Date.now(), content: tempContent,
      sender: user.username, created_at: new Date().toISOString(),
      channel_id: String(activeChannel.id)
    };
    
    setMessages((prev) => [tempMsg, ...prev]);
    setOffset(prev => prev + 1);

    socket.emit('send_message', {
      content: tempContent, channel_id: activeChannel.id, user_id: user.id
    });
  };

  const handleCreateChannel = async () => {
    if (!newChannelName) return;
    try {
      await api.post('/channels', { name: newChannelName });
      setShowCreateModal(false); setNewChannelName(''); fetchChannels();
    } catch (err) { alert('Failed to create channel'); }
  };

  const displayedMessages = messages.filter(m => 
    m.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex h-screen bg-black text-slate-200 font-sans overflow-hidden selection:bg-indigo-500/30 relative">
      
      {/* MOBILE OVERLAY BACKDROP */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }} 
            onClick={() => setIsMobileMenuOpen(false)}
            className="fixed inset-0 bg-black/80 z-40 md:hidden backdrop-blur-sm"
          />
        )}
      </AnimatePresence>

      {/* SIDEBAR - Responsive Logic Added */}
      <motion.div 
        // We removed the 'initial={{ x: -100 }}' because it conflicts with CSS transform.
        // We use CSS classes for the toggle logic now.
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        className={`
          fixed inset-y-0 left-0 z-50 w-72 h-full
          bg-gray-900/90 border-r border-white/10 flex flex-col backdrop-blur-xl 
          transition-transform duration-300 ease-in-out
          md:relative md:translate-x-0
          ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        <div className="p-6 border-b border-white/5 bg-gradient-to-r from-gray-900 via-gray-900 to-indigo-900/20 flex justify-between items-center">
          <TeachatMiniLogo />
          {/* Close button for mobile */}
          <button onClick={() => setIsMobileMenuOpen(false)} className="md:hidden text-gray-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-8">
          <div>
            <div className="flex items-center justify-between mb-4 px-2">
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-2"><Hash className="w-3 h-3" /> Channels</span>
              <motion.button whileHover={{ scale: 1.1, rotate: 90 }} whileTap={{ scale: 0.9 }} onClick={() => setShowCreateModal(true)} className="text-indigo-400 hover:text-indigo-300 transition-colors"><PlusCircle className="w-5 h-5" /></motion.button>
            </div>
            <div className="space-y-1">
              {channels.map(channel => (
                <motion.div key={channel.id} onClick={() => setActiveChannel(channel)} whileHover={{ x: 4 }} className={`group cursor-pointer px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 flex items-center gap-3 ${activeChannel?.id === channel.id ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 shadow-[0_0_15px_-5px_rgba(79,70,229,0.3)]' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}>
                  <span className={`text-lg ${activeChannel?.id === channel.id ? 'text-indigo-400' : 'text-gray-600 group-hover:text-gray-400'}`}>#</span>{channel.name}
                </motion.div>
              ))}
            </div>
          </div>
          <div>
            <div className="flex items-center justify-between mb-4 px-2">
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-2"><Users className="w-3 h-3" /> Members</span>
              <span className="text-xs text-gray-700 bg-gray-800 px-2 py-0.5 rounded-full">{allUsers.length}</span>
            </div>
            <div className="space-y-2">
              {allUsers.map(u => (
                 <div key={u.id} className="flex items-center gap-3 px-3 py-1.5 rounded-lg group hover:bg-white/5 transition-colors cursor-default">
                   <div className="relative">
                     <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-gray-700 to-gray-600 flex items-center justify-center text-xs font-bold text-white shadow-inner">{u.username[0].toUpperCase()}</div>
                     <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-gray-900 ${u.is_online ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]' : 'bg-gray-500'}`} />
                   </div>
                   <div className="flex flex-col"><span className={`text-sm font-medium ${u.id === user.id ? 'text-indigo-300' : 'text-gray-300'}`}>{u.username} {u.id === user.id && <span className="text-xs opacity-50">(You)</span>}</span><span className="text-[10px] text-gray-600">{u.is_online ? 'Online' : 'Offline'}</span></div>
                 </div>
              ))}
            </div>
          </div>
        </div>
        <div className="p-4 bg-black/20 border-t border-white/5 backdrop-blur-md">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400"><Settings className="w-5 h-5" /></div>
              <div className="flex flex-col"><span className="text-sm font-bold text-white">{user.username}</span><span className="text-xs text-green-400 flex items-center gap-1"><Zap className="w-3 h-3" /> Active</span></div>
            </div>
            <button onClick={onLogout} className="p-2 text-gray-500 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-all" title="Logout"><LogOut className="w-5 h-5" /></button>
          </div>
        </div>
      </motion.div>

      {/* CHAT AREA */}
      <div className="flex-1 flex flex-col bg-black relative overflow-hidden w-full">
        <div className="absolute top-0 left-0 w-full h-full z-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-900/20 rounded-full blur-[100px]" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-900/10 rounded-full blur-[100px]" />
        </div>

        {/* Chat Header with HAMBURGER + SEARCH */}
        <div className="h-16 border-b border-white/10 bg-gray-900/30 backdrop-blur-md flex items-center justify-between px-4 md:px-6 z-10 sticky top-0">
          <div className="flex items-center gap-3 overflow-hidden">
             {/* Mobile Toggle Button */}
             <button 
               onClick={() => setIsMobileMenuOpen(true)} 
               className="md:hidden p-1 text-gray-400 hover:text-white transition-colors"
             >
               <Menu className="w-6 h-6" />
             </button>

             <Hash className="w-6 h-6 text-indigo-500 shrink-0" />
             <div className="flex flex-col overflow-hidden">
                <h3 className="text-lg font-bold text-white tracking-wide truncate">{activeChannel ? activeChannel.name : 'Select a channel'}</h3>
                {activeChannel && <span className="text-xs text-gray-500 hidden sm:block">Topic: General Chat</span>}
             </div>
          </div>
          <div className="flex items-center gap-4 text-gray-500 shrink-0">
             {showSearch ? (
               <motion.div initial={{ width: 0, opacity: 0 }} animate={{ width: 200, opacity: 1 }} className="relative">
                 <input autoFocus type="text" placeholder="Search..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="w-full bg-gray-800 text-white text-sm rounded-md px-3 py-1 outline-none border border-indigo-500/50" />
                 <X onClick={() => { setShowSearch(false); setSearchQuery(''); }} className="w-4 h-4 absolute right-2 top-1.5 cursor-pointer hover:text-white" />
               </motion.div>
             ) : (
               <Search onClick={() => setShowSearch(true)} className="w-5 h-5 cursor-pointer hover:text-white transition-colors" />
             )}
             <div className="w-px h-6 bg-white/10" />
             <MessageSquare className="w-5 h-5 cursor-pointer hover:text-white transition-colors" />
          </div>
        </div>

        {/* Messages List */}
        <div className="flex-1 overflow-y-auto px-4 py-6 flex flex-col-reverse gap-4 z-10 custom-scrollbar">
          {/* TYPING INDICATOR */}
          <AnimatePresence>
            {typingUsers.size > 0 && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} className="flex items-center gap-2 ml-10 text-xs text-indigo-400 font-medium">
                <Loader2 className="w-3 h-3 animate-spin" />
                {Array.from(typingUsers).join(', ')} is typing...
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence initial={false}>
            {displayedMessages.map((msg, index) => {
              const isMe = msg.sender === user.username;
              return (
                <motion.div 
                  key={msg.id || index} 
                  initial={{ opacity: 0, y: 20, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                  transition={{ duration: 0.3 }}
                  className={`flex items-end gap-3 max-w-[95%] md:max-w-[80%] group ${isMe ? 'self-end flex-row-reverse' : 'self-start'}`}
                >
                  <div className={`w-8 h-8 shrink-0 rounded-full flex items-center justify-center text-xs font-bold shadow-lg ${isMe ? 'bg-indigo-500 text-white' : 'bg-gray-800 text-gray-300'}`}>
                    {msg.sender ? msg.sender[0].toUpperCase() : '?'}
                  </div>
                  <div className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                    <div className="flex items-baseline gap-2 mb-1 opacity-70">
                      <span className="text-xs font-bold text-gray-300">{msg.sender}</span>
                      <span className="text-[10px] text-gray-500">{msg.created_at ? new Date(msg.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : '...'}</span>
                    </div>
                    <div className={`relative px-5 py-3 rounded-2xl text-sm leading-relaxed shadow-md backdrop-blur-sm ${isMe ? 'bg-indigo-600/80 text-white rounded-br-none border border-indigo-500/50' : 'bg-gray-800/80 text-gray-200 rounded-bl-none border border-white/5'}`}>
                      {msg.content}
                      
                      {/* DELETE BUTTON (Hover) */}
                      {isMe && (
                        <button 
                          onClick={() => handleDeleteMessage(msg.id)}
                          className="absolute -left-8 top-1/2 -translate-y-1/2 p-1.5 text-gray-500 hover:text-red-400 bg-gray-900/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                          title="Delete Message"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>

          {/* Load More Button */}
          {hasMore && messages.length > 0 && !searchQuery && (
            <div className="flex justify-center py-4">
              <button onClick={() => loadMessages(activeChannel.id, offset)} className="flex items-center gap-2 px-4 py-2 rounded-full bg-gray-800/50 hover:bg-gray-700/50 text-xs text-indigo-300 border border-indigo-500/20 transition-all hover:scale-105">
                <ArrowUpCircle className="w-4 h-4" /> Load Previous Messages
              </button>
            </div>
          )}

          {!activeChannel && <div className="flex flex-col items-center justify-center h-full text-gray-600 px-4 text-center"><MessageSquare className="w-16 h-16 mb-4 opacity-20" /><p>Select a channel to start chatting</p></div>}
        </div>

        {/* Input Area */}
        <div className="p-4 md:p-6 bg-black/40 border-t border-white/10 z-20 backdrop-blur-md">
          <form onSubmit={handleSendMessage} className="relative max-w-4xl mx-auto flex items-center gap-2 md:gap-4">
            <button type="button" className="text-gray-400 hover:text-white transition-colors"><PlusCircle className="w-6 h-6" /></button>
            <div className="relative flex-1">
              <input type="text" value={messageInput} onChange={handleInputChange} placeholder={`Message #${activeChannel?.name || '...'}`} disabled={!activeChannel} className="w-full bg-gray-900/80 text-white placeholder-gray-500 rounded-xl pl-4 pr-12 py-3 md:py-4 border border-white/10 focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 focus:outline-none transition-all shadow-inner text-sm md:text-base" />
              <button type="submit" disabled={!activeChannel || !messageInput.trim()} className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 md:p-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-500 disabled:opacity-50 disabled:bg-gray-700 transition-all transform active:scale-95"><Send className="w-4 h-4" /></button>
            </div>
          </form>
          <div className="text-center mt-2 hidden md:block"><span className="text-[10px] text-gray-600">Press Enter to send Ã¢â‚¬Â¢ Shift + Enter for new line</span></div>
        </div>
      </div>

      {/* CREATE CHANNEL MODAL */}
      <AnimatePresence>
        {showCreateModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }} className="bg-gray-900 border border-white/10 rounded-2xl p-8 w-full max-w-md shadow-2xl relative overflow-hidden">
              <div className="absolute -top-20 -right-20 w-40 h-40 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />
              <div className="flex justify-between items-center mb-6 relative z-10"><h3 className="text-2xl font-bold text-white">Create Channel</h3><button onClick={() => setShowCreateModal(false)} className="text-gray-400 hover:text-white"><X className="w-6 h-6" /></button></div>
              <div className="space-y-6 relative z-10">
                <div><label className="block text-sm font-medium text-gray-400 mb-2">Channel Name</label><div className="relative"><span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-bold">#</span><input type="text" placeholder="marketing-team" value={newChannelName} onChange={(e) => setNewChannelName(e.target.value)} className="w-full bg-black/50 border border-white/10 rounded-xl py-3 pl-8 pr-4 text-white focus:border-indigo-500 focus:outline-none transition-colors" autoFocus /></div></div>
                <div className="flex gap-3 justify-end pt-2"><button onClick={() => setShowCreateModal(false)} className="px-6 py-2.5 rounded-lg text-gray-300 hover:text-white hover:bg-white/5 transition-colors font-medium">Cancel</button><button onClick={handleCreateChannel} className="px-6 py-2.5 rounded-lg bg-indigo-600 text-white font-bold hover:bg-indigo-500 shadow-lg shadow-indigo-900/20 transition-all transform hover:scale-105 active:scale-95">Create Channel</button></div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      <style>{`.custom-scrollbar::-webkit-scrollbar { width: 6px; } .custom-scrollbar::-webkit-scrollbar-track { background: transparent; } .custom-scrollbar::-webkit-scrollbar-thumb { background-color: rgba(255, 255, 255, 0.1); border-radius: 20px; } .custom-scrollbar::-webkit-scrollbar-thumb:hover { background-color: rgba(255, 255, 255, 0.2); }`}</style>
    </div>
  );
}