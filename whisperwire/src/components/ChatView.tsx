import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ArrowLeft, 
  Copy, 
  Users, 
  Send, 
  X, 
  Lock,
  ArrowDown,
  CornerUpLeft,
  Edit3
} from 'lucide-react';
import { ChatMessage, UserPresence } from '../types';
import MessageItem from './MessageItem';

interface ChatViewProps {
  roomCode: string;
  roomName: string;
  messages: ChatMessage[];
  presences: UserPresence[];
  typingUsers: string[];
  myUid: string;
  myUsername: string;
  myAvatar: string;
  onLeave: () => void;
  onSendMessage: (text: string, replyTo?: ChatMessage['replyTo'] | null) => void;
  onEditMessage: (messageId: string, newText: string) => void;
  onDeleteMessage: (messageId: string) => void;
  onReactMessage: (messageId: string, emoji: string) => void;
  onTyping: () => void;
  onCopyCode: () => void;
}

export default function ChatView({
  roomCode,
  roomName,
  messages,
  presences,
  typingUsers,
  myUid,
  myUsername,
  myAvatar,
  onLeave,
  onSendMessage,
  onEditMessage,
  onDeleteMessage,
  onReactMessage,
  onTyping,
  onCopyCode,
}: ChatViewProps) {
  const [inputText, setInputText] = React.useState('');
  const [replyingTo, setReplyingTo] = React.useState<ChatMessage | null>(null);
  const [editingMsg, setEditingMsg] = React.useState<ChatMessage | null>(null);

  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = React.useState(false);
  const [showScrollDown, setShowScrollDown] = React.useState(false);
  
  const messagesEndRef = React.useRef<HTMLDivElement>(null);
  const chatContainerRef = React.useRef<HTMLDivElement>(null);
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);

  // Scroll to bottom timeline helper
  const scrollToBottom = (behavior: ScrollBehavior = 'smooth') => {
    messagesEndRef.current?.scrollIntoView({ behavior });
  };

  // Keep auto-scrolling to bottom on new messages
  React.useEffect(() => {
    // Only scroll if user is near bottom or messages changed
    const container = chatContainerRef.current;
    if (container) {
      const isNearBottom = container.scrollHeight - container.clientHeight - container.scrollTop < 250;
      if (isNearBottom) {
        scrollToBottom('smooth');
      }
    } else {
      scrollToBottom('smooth');
    }
  }, [messages]);

  // Initial immediate scroll
  React.useEffect(() => {
    const timer = setTimeout(() => {
      scrollToBottom('auto');
    }, 150);
    return () => clearTimeout(timer);
  }, []);

  // Monitor text change to expand input composer dynamically
  React.useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${Math.min(textarea.scrollHeight, 180)}px`;
    }
  }, [inputText]);

  // Handle message submission (either edit or new message/reply)
  const handleSubmitForm = () => {
    const cleanText = inputText.trim();
    if (!cleanText) return;

    if (editingMsg) {
      if (editingMsg.id) {
        onEditMessage(editingMsg.id, cleanText);
      }
      setEditingMsg(null);
    } else {
      onSendMessage(
        cleanText, 
        replyingTo ? { id: replyingTo.id || '', text: replyingTo.text, username: replyingTo.username } : null
      );
      setReplyingTo(null);
    }

    setInputText('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleFormSubmitEvent = (e: React.FormEvent) => {
    e.preventDefault();
    handleSubmitForm();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmitForm();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputText(e.target.value);
    onTyping();
  };

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const target = e.currentTarget;
    const isAtBottom = target.scrollHeight - target.clientHeight - target.scrollTop < 150;
    setShowScrollDown(!isAtBottom);
  };

  // Cancel edit mode
  const handleCancelEdit = () => {
    setEditingMsg(null);
    setInputText('');
  };

  // Load message to start editing
  const handleStartEdit = (msg: ChatMessage) => {
    setReplyingTo(null); // Cancel reply if any
    setEditingMsg(msg);
    setInputText(msg.text);
    setTimeout(() => {
      textareaRef.current?.focus();
    }, 80);
  };

  // Find first unread message to place the Unread ribbon divider
  const firstUnreadMsgId = React.useMemo(() => {
    const unread = messages.find(m => m.uid !== myUid && (!m.seenBy || !m.seenBy.includes(myUid)));
    return unread ? unread.id : null;
  }, [messages, myUid]);

  // Hashing color schemes for multi-user participant display
  const colors = [
    'text-[#ff453a]', // red
    'text-[#ff9f0a]', // orange
    'text-[#ffd60a]', // yellow
    'text-[#30d158]', // green
    'text-[#64d2ff]', // sky blue
    'text-[#bf5af2]', // purple
    'text-[#ff375f]'  // pink
  ];
  const getParticipantNameColor = (uid: string) => {
    let hash = 0;
    for (let i = 0; i < uid.length; i++) {
        hash = uid.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash) % colors.length;
    return colors[index];
  };

  const borderColors = [
    'border-[#ff453a]/25 bg-[#ff453a]/5 hover:bg-[#ff453a]/8',
    'border-[#ff9f0a]/25 bg-[#ff9f0a]/5 hover:bg-[#ff9f0a]/8',
    'border-[#ffd60a]/25 bg-[#ffd60a]/5 hover:bg-[#ffd60a]/8',
    'border-[#30d158]/25 bg-[#30d158]/5 hover:bg-[#30d158]/8',
    'border-[#64d2ff]/25 bg-[#64d2ff]/5 hover:bg-[#64d2ff]/8',
    'border-[#bf5af2]/25 bg-[#bf5af2]/5 hover:bg-[#bf5af2]/8',
    'border-[#ff375f]/25 bg-[#ff375f]/5 hover:bg-[#ff375f]/8'
  ];
  const getParticipantBubbleStyle = (uid: string) => {
    let hash = 0;
    for (let i = 0; i < uid.length; i++) {
        hash = uid.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash) % borderColors.length;
    return borderColors[index];
  };

  // Group consecutive messages helper
  const isGroupedWithPrevious = (msg: ChatMessage, index: number) => {
    if (index === 0) return false;
    const prev = messages[index - 1];
    if (prev.uid !== msg.uid) return false;
    
    const sameDay = new Date(prev.timestamp).toDateString() === new Date(msg.timestamp).toDateString();
    if (!sameDay) return false;

    // Is within 2 minutes (120000ms)
    return (msg.timestamp - prev.timestamp) < 120000;
  };

  const showDateDivider = (currentMsg: ChatMessage, prevMsg: ChatMessage | null) => {
    if (!prevMsg) return true;
    const currentDate = new Date(currentMsg.timestamp).toDateString();
    const prevDate = new Date(prevMsg.timestamp).toDateString();
    return currentDate !== prevDate;
  };

  const selfPresence = presences.find(p => p.uid === myUid);
  // Group status is active when >2 participants exist
  const isGroupMode = presences.length > 2;

  return (
    <div className="flex-1 flex h-full w-full overflow-hidden relative" id="chatView">
      
      {/* 1. Primary Chat Segment */}
      <div className="flex-1 flex flex-col h-full min-w-0 overflow-hidden relative">
        
        {/* Chat Header */}
        <header className="h-16 shrink-0 border-b border-white/10 bg-[#1c1c1e]/60 backdrop-blur-2xl px-4 flex items-center justify-between z-10 select-none">
          <div className="flex items-center gap-2.5 min-w-0">
            <button 
              onClick={onLeave}
              className="p-2 text-[#8e8e93] hover:text-white hover:bg-white/[0.04] active:scale-95 rounded-xl transition-all"
              id="leaveChatBtn"
              title="Leave Room"
            >
              <ArrowLeft size={18} />
            </button>
            <div className="leading-tight min-w-0">
              <h3 id="headerRoomTitle" className="font-bold text-white text-base truncate pr-1">
                {roomName}
              </h3>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#30d158] animate-pulse"></span>
                <span id="activeUserCount" className="text-[11px] text-[#8e8e93] font-medium">
                  {presences.length} {presences.length === 1 ? 'Person' : 'People'} Connected
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button 
              onClick={onCopyCode}
              className="px-3 py-1.5 rounded-full bg-white/[0.04] hover:bg-white/[0.08] active:scale-95 border border-white/5 text-[#0A84FF] font-mono text-xs font-bold hover:border-white/10 transition-all flex items-center gap-1.5 cursor-pointer shadow-sm select-all"
              id="headerCodeDisplay"
              title="Copy Room Code"
            >
              <span id="headerCodeText">{roomCode}</span>
              <Copy size={11} className="opacity-75" />
            </button>
            
            <button 
              onClick={() => setIsMobileSidebarOpen(true)}
              className="p-2 text-[#8e8e93] hover:text-white hover:bg-white/[0.04] active:scale-95 rounded-xl transition-all md:hidden relative"
              id="toggleParticipantsBtn"
              title="View Active Users"
            >
              <Users size={18} />
              {presences.length > 1 && (
                <span id="mobileBadge" className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#ff453a] rounded-full"></span>
              )}
            </button>
          </div>
        </header>

        {/* Message Container Scrolling Viewport */}
        <div 
          ref={chatContainerRef}
          onScroll={handleScroll}
          id="messageContainer" 
          className="flex-1 p-4 md:p-6 overflow-y-auto space-y-1 min-h-0 min-w-0 bg-[#020202]"
        >
          {/* Welcome Shield lock info card */}
          <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/5 max-w-sm mx-auto text-center my-6 space-y-3 shadow-lg backdrop-blur-md">
            <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-white/[0.03] border border-white/10 text-[#0A84FF] mb-1">
              <Lock size={18} />
            </span>
            <h4 className="font-semibold text-white text-sm">Liquid Glass Secure Channel</h4>
            <p className="text-xs text-[#8e8e93] leading-relaxed">
              WhisperWire messages are transmitted ephemeral across active listeners. Quote-swipes and right-click menus are active. Invite others using the room code <span className="font-bold text-[#0A84FF] font-mono select-all">{roomCode}</span>.
            </p>
          </div>
          
          {/* Timeline list mapping */}
          <div id="messagesList" className="w-full pb-4">
            {messages.length === 0 ? (
              <div className="text-center py-12 text-[#8e8e93] text-sm italic select-none">
                No messages yet. Send a secure whisper below.
              </div>
            ) : (
              messages.map((msg, index) => {
                const isMe = msg.uid === myUid;
                const prev = index > 0 ? messages[index - 1] : null;
                const grouped = isGroupedWithPrevious(msg, index);
                const hasDateDivider = showDateDivider(msg, prev);
                const isFirstUnread = msg.id === firstUnreadMsgId;

                return (
                  <div key={msg.id || index} className="w-full">
                    {/* Render Date Divider */}
                    {hasDateDivider && (
                      <div className="flex items-center justify-center py-4 select-none">
                        <span className="px-3.5 py-1 rounded-full bg-white/[0.03] border border-white/10 text-[10px] text-white/50 tracking-wider font-semibold uppercase">
                          {new Date(msg.timestamp).toLocaleDateString([], { weekday: 'long', month: 'short', day: 'numeric' })}
                        </span>
                      </div>
                    )}

                    {/* Render Unread message red ribbon indicator */}
                    {isFirstUnread && (
                      <div className="flex items-center justify-center my-4 select-none">
                        <div className="flex-1 h-px bg-[#ff453a]/25"></div>
                        <span className="px-3 py-1 rounded-full bg-[#ff453a]/10 border border-[#ff453a]/25 text-[9px] font-bold text-[#ff453a] uppercase tracking-widest mx-3">
                          Unread Messages
                        </span>
                        <div className="flex-1 h-px bg-[#ff453a]/25"></div>
                      </div>
                    )}

                    {/* Chat messaging bubble list row */}
                    <div className={`${grouped ? 'mt-0.5' : 'mt-3.5'}`}>
                      <MessageItem 
                        msg={msg}
                        isMe={isMe}
                        showSenderName={!grouped}
                        myUid={myUid}
                        isGroup={isGroupMode}
                        presencesCount={presences.length}
                        onReply={setReplyingTo}
                        onStartEdit={handleStartEdit}
                        onDelete={onDeleteMessage}
                        onReact={onReactMessage}
                        getParticipantNameColor={getParticipantNameColor}
                        getParticipantBubbleStyle={getParticipantBubbleStyle}
                      />
                    </div>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Floating Quick Jump button to scroll down */}
        <AnimatePresence>
          {showScrollDown && (
            <motion.button
              initial={{ opacity: 0, scale: 0.8, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: 15 }}
              onClick={() => scrollToBottom('smooth')}
              className="absolute right-6 bottom-24 z-30 cursor-pointer w-10 h-10 rounded-full bg-[#1c1c1e] hover:bg-[#2c2c2e] border border-white/10 text-white flex items-center justify-center shadow-2xl active:scale-95 transition-all text-xs"
              title="Jump to Latest"
            >
              <ArrowDown size={18} className="translate-y-0.5" />
            </motion.button>
          )}
        </AnimatePresence>

        {/* System Dynamic Typing space */}
        <div className="h-6 px-4 md:px-6 flex items-center justify-between text-[11px] text-[#8e8e93] bg-transparent border-t border-white/[0.02] select-none shrink-0 bg-[#020202]">
          <div id="typingIndicator" className="flex items-center gap-1.5 italic">
            {typingUsers.length > 0 && (
              <>
                <span className="flex gap-0.5 items-center mr-1">
                  <span className="w-1 h-1 bg-[#0A84FF] rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                  <span className="w-1 h-1 bg-[#0A84FF] rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                  <span className="w-1 h-1 bg-[#0A84FF] rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                </span>
                <span>
                  {typingUsers.length === 1 
                    ? `${typingUsers[0]} is typing...` 
                    : 'Multiple people are typing...'}
                </span>
              </>
            )}
          </div>
          <span className="hidden sm:inline-flex items-center gap-1 font-medium text-[10px] uppercase tracking-wider text-white/[0.2]">
            🔒 END-TO-END ENCRYPTED
          </span>
        </div>

        {/* Replying block header preview queue */}
        <AnimatePresence>
          {replyingTo && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="px-4 py-2 border-t border-white/10 bg-[#1c1c1e]/95 backdrop-blur-xl flex items-center justify-between select-none shrink-0"
            >
              <div className="flex items-center gap-2 border-l-2 border-[#0a84ff] pl-2 text-xs min-w-0">
                <CornerUpLeft size={13} className="text-[#0a84ff] shrink-0" />
                <div className="leading-normal truncate">
                  <p className="font-bold text-white/90">Replying to {replyingTo.username}</p>
                  <p className="text-white/60 truncate italic text-[11px] font-sans pr-1">{replyingTo.text}</p>
                </div>
              </div>
              <button 
                onClick={() => setReplyingTo(null)}
                className="p-1.5 rounded-full hover:bg-white/5 active:scale-90 text-white/60 hover:text-white"
              >
                <X size={14} />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Editing block header preview queue */}
        <AnimatePresence>
          {editingMsg && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="px-4 py-2 border-t border-amber-500/20 bg-amber-500/5 backdrop-blur-xl flex items-center justify-between select-none shrink-0"
            >
              <div className="flex items-center gap-2 border-l-2 border-amber-500 pl-2 text-xs min-w-0">
                <Edit3 size={13} className="text-amber-500 shrink-0" />
                <div className="leading-normal truncate">
                  <p className="font-bold text-amber-500">Editing Message</p>
                  <p className="text-white/60 truncate italic text-[11px] font-sans pr-1">{editingMsg.text}</p>
                </div>
              </div>
              <button 
                onClick={handleCancelEdit}
                className="p-1.5 rounded-full hover:bg-white/5 active:scale-90 text-white/60 hover:text-white"
              >
                <X size={14} />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Composer Multiline active message input row form */}
        <form 
          onSubmit={handleFormSubmitEvent} 
          className="p-3 bg-[#1c1c1e]/85 border-t border-white/10 backdrop-blur-xl flex gap-2 shrink-0 relative items-end"
          id="messageForm"
        >
          <textarea
            ref={textareaRef}
            id="messageInput"
            value={inputText}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder={editingMsg ? "Edit message..." : "iMessage"} 
            rows={1}
            required 
            autoComplete="off"
            className="flex-1 px-4 py-2.5 rounded-[22px] bg-white/[0.02] border border-white/10 text-white placeholder-white/20 text-sm focus:outline-none focus:border-[#0A84FF]/40 transition-all focus:bg-white/[0.04] backdrop-blur-md resize-none max-h-[180px] min-h-[38px] leading-snug overflow-y-auto"
          />
          <button 
            type="submit" 
            className="bg-[#0A84FF] hover:bg-[#0070e3] text-white w-9 h-9 rounded-full transition-all flex items-center justify-center shadow-md select-none pb-0.5 active:scale-90 shrink-0 cursor-pointer"
          >
            <Send size={15} />
          </button>
        </form>

      </div>

      {/* 2. Active Users Sidebar (Desktop View) */}
      <aside 
        id="participantsSidebar" 
        className="hidden md:flex flex-col w-72 lg:w-80 border-l border-white/10 bg-[#1c1c1e]/40 backdrop-blur-3xl shrink-0 h-full overflow-hidden select-none"
      >
        <div className="h-16 px-5 border-b border-white/10 flex items-center bg-white/[0.01]">
          <span className="text-xs font-bold tracking-widest text-[#8e8e93] uppercase">ACTIVE PARTICIPANTS</span>
        </div>

        {/* Participant list viewport */}
        <div id="participantsList" className="flex-1 overflow-y-auto p-4 space-y-2.5">
          {presences.map((u, i) => (
            <div 
              key={u.uid + '_' + i}
              className={`flex items-center justify-between p-2.5 rounded-xl transition-all border ${
                u.uid === myUid 
                  ? 'bg-[#0A84FF]/5 border-[#0A84FF]/20' 
                  : 'bg-white/5 border-white/10 hover:bg-white/10'
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <span className="text-xl shrink-0">{u.avatar || '👤'}</span>
                <span className={`text-xs font-semibold truncate ${u.uid === myUid ? 'text-[#0a84ff]' : 'text-white/90'}`}>
                  {u.username} {u.uid === myUid ? '(You)' : ''}
                </span>
              </div>
              <span className="w-1.5 h-1.5 rounded-full bg-[#30d158] shrink-0"></span>
            </div>
          ))}
        </div>

        {/* Footer Identity Display Card */}
        <div className="p-4 border-t border-white/10 bg-white/[0.01] flex items-center gap-3">
          <div id="selfAvatar" className="w-9 h-9 rounded-full bg-white/[0.03] border border-white/5 flex items-center justify-center text-lg shadow-inner">
            {selfPresence?.avatar || myAvatar || '👾'}
          </div>
          <div className="leading-normal overflow-hidden">
            <p id="selfName" className="text-xs font-bold text-white truncate">
              {myUsername} (You)
            </p>
            <span className="text-[10px] text-[#30d158] font-bold tracking-wide uppercase">CONNECTED</span>
          </div>
        </div>
      </aside>

      {/* 3. Mobile Dynamic Drawer Dropdown */}
      <AnimatePresence>
        {isMobileSidebarOpen && (
          <>
            {/* Backdrop opacity layer */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.6 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileSidebarOpen(false)}
              className="fixed inset-0 bg-black z-40 md:hidden"
            />

            {/* Slide-over cabinet body */}
            <motion.aside
              initial={{ x: '100%' }}
              animate={{ x: '0%' }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 26, stiffness: 220 }}
              className="fixed inset-y-0 right-0 z-50 w-full max-w-xs bg-[#1c1c1e]/98 border-l border-white/10 md:hidden flex flex-col shadow-2xl"
            >
              <div className="h-16 px-4 border-b border-white/10 flex items-center justify-between select-none bg-white/[0.01]">
                <span className="text-xs font-bold tracking-widest text-[#8e8e93] uppercase">ACTIVE USERS</span>
                <button 
                  onClick={() => setIsMobileSidebarOpen(false)}
                  className="p-1.5 text-[#8e8e93] hover:text-white"
                  id="closeParticipantsBtn"
                  title="Close Panel"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Drawer scrolling list content */}
              <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
                {presences.map((u, i) => (
                  <div 
                    key={u.uid + '_m_' + i}
                    className={`flex items-center justify-between p-2.5 rounded-xl border ${
                      u.uid === myUid 
                        ? 'bg-[#0A84FF]/5 border-[#0A84FF]/20 font-bold' 
                        : 'bg-white/5 border-white/10'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="text-xl shrink-0">{u.avatar || '👤'}</span>
                      <span className={`text-xs truncate ${u.uid === myUid ? 'text-[#0a84ff]' : 'text-white/90'}`}>
                        {u.username} {u.uid === myUid ? '(You)' : ''}
                      </span>
                    </div>
                    <span className="w-1.5 h-1.5 rounded-full bg-[#30d158] shrink-0"></span>
                  </div>
                ))}
              </div>

              {/* Current user drawer footer element */}
              <div className="p-4 border-t border-white/10 bg-white/[0.01] flex items-center gap-3 select-none">
                <div className="w-9 h-9 rounded-full bg-white/[0.03] border border-white/5 flex items-center justify-center text-lg">
                  {selfPresence?.avatar || myAvatar || '👾'}
                </div>
                <div className="leading-normal overflow-hidden">
                  <p className="text-xs font-bold text-white truncate">
                    {myUsername} (You)
                  </p>
                  <span className="text-[10px] text-[#30d158] font-bold tracking-wide uppercase">CONNECTED</span>
                </div>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

    </div>
  );
}
