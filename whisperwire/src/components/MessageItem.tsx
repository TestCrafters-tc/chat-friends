import React from 'react';
import { motion, useMotionValue, useTransform } from 'motion/react';
import { 
  CornerUpLeft, 
  Trash2, 
  Edit3, 
  Copy, 
  Smile, 
  Check, 
  CheckCheck 
} from 'lucide-react';
import { ChatMessage } from '../types';

interface MessageItemProps {
  msg: ChatMessage;
  isMe: boolean;
  showSenderName: boolean;
  replyingMsgSenderName?: string;
  myUid: string;
  isGroup: boolean;
  presencesCount: number;
  onReply: (msg: ChatMessage) => void;
  onStartEdit: (msg: ChatMessage) => void;
  onDelete: (msgId: string) => void;
  onReact: (msgId: string, emoji: string) => void;
  getParticipantNameColor: (uid: string) => string;
  getParticipantBubbleStyle: (uid: string) => string;
}

const COMMON_EMOJIS = ['❤️', '👍', '😂', '😮', '😢', '🎉'];

export default function MessageItem({
  msg,
  isMe,
  showSenderName,
  myUid,
  isGroup,
  presencesCount,
  onReply,
  onStartEdit,
  onDelete,
  onReact,
  getParticipantNameColor,
  getParticipantBubbleStyle
}: MessageItemProps) {
  const [showMenu, setShowMenu] = React.useState(false);
  const [menuPosition, setMenuPosition] = React.useState({ x: 0, y: 0 });
  const touchTimerRef = React.useRef<NodeJS.Timeout | null>(null);
  
  // Motion Values for Swipe-to-Reply
  const dragX = useMotionValue(0);
  // Arrow dynamically scales, opacity increases, and rotates slightly during user's drag gesture
  const arrowOpacity = useTransform(dragX, [0, 60], [0, 1]);
  const arrowScale = useTransform(dragX, [0, 60], [0.4, 1.1]);
  const bubbleTranslateX = useTransform(dragX, [0, 100], [0, 100]);

  // Formatted Timestamp
  const formattedTime = new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  // Right click Desktop context menu trigger
  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    setMenuPosition({ x: Math.min(e.clientX, window.innerWidth - 180), y: Math.min(e.clientY, window.innerHeight - 250) });
    setShowMenu(true);
  };

  // Mobile touch listeners for Long Press
  const handleTouchStart = (e: React.TouchEvent) => {
    if (touchTimerRef.current) clearTimeout(touchTimerRef.current);
    const touch = e.touches[0];
    const clientX = touch.clientX;
    const clientY = touch.clientY;

    touchTimerRef.current = setTimeout(() => {
      // Trigger long press menu
      setMenuPosition({ 
        x: Math.min(clientX, window.innerWidth - 180), 
        y: Math.min(clientY, window.innerHeight - 250) 
      });
      setShowMenu(true);
      // Try to trigger a tiny physical haptic vibration if supported
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        navigator.vibrate(40);
      }
    }, 600); // 600ms hold
  };

  const handleTouchEnd = () => {
    if (touchTimerRef.current) {
      clearTimeout(touchTimerRef.current);
    }
  };

  // Clipboard copies
  const handleCopy = () => {
    navigator.clipboard.writeText(msg.text).catch(() => {});
    setShowMenu(false);
  };

  // Drag ending callback for Swipe-to-Reply
  const handleDragEnd = () => {
    const currentDrag = dragX.get();
    if (currentDrag > 60) {
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        navigator.vibrate(30);
      }
      onReply(msg);
    }
  };

  // Double-tap shortcut to quick react "❤️"
  const lastTapRef = React.useRef<number>(0);
  const handleDoubleTap = () => {
    const now = Date.now();
    if (now - lastTapRef.current < 300) {
      onReact(msg.id || '', '❤️');
    }
    lastTapRef.current = now;
  };

  // Render modern read receipts
  const renderReadReceipts = () => {
    if (!isMe) return null;
    const seenBy = msg.seenBy || [];
    const isSeenByOthers = seenBy.filter(uid => uid !== myUid).length > 0;
    
    if (isSeenByOthers) {
      // Real-time Seen: Blue check check
      return <CheckCheck size={13} className="text-[#0a84ff]" title="Seen" />;
    } else if (presencesCount > 1) {
      // Delivered: Double grey checks
      return <CheckCheck size={13} className="text-white/40" title="Delivered" />;
    } else {
      // Sent: Single grey check
      return <Check size={13} className="text-white/30" title="Sent" />;
    }
  };

  // Render message body with nice markdown/link styling safely support emojis large size
  const isOnlyEmojis = (text: string) => {
    const emojiRegex = /^[\s\p{Emoji_Presentation}\p{Emoji_Modifier_Base}\p{Emoji_Modifier}\p{Emoji_Component}]+$/u;
    return emojiRegex.test(text.trim()) && text.trim().length <= 12;
  };

  const emojiOnlyMode = isOnlyEmojis(msg.text);

  return (
    <div id={`msg-${msg.id}`} className="relative w-full">
      {/* Dynamic Swiper Row wrapper with Framer Motion drag physics */}
      <motion.div
        drag="x"
        dragDirectionLock
        dragConstraints={{ left: 0, right: 100 }}
        dragElastic={{ left: 0, right: 0.6 }}
        dragMomentum={false}
        onDragEnd={handleDragEnd}
        style={{ x: bubbleTranslateX }}
        className="relative w-full flex flex-col"
      >
        {/* Curved reply arrow indicator appearing gradually inside dragging boundary */}
        <motion.div 
          style={{ opacity: arrowOpacity, scale: arrowScale }}
          className="absolute -left-10 top-1/2 -translate-y-1/2 flex items-center justify-center w-8 h-8 rounded-full bg-white/5 border border-white/10 pointer-events-none"
        >
          <CornerUpLeft size={14} className="text-[#0a84ff]" />
        </motion.div>

        {/* Message main structure content */}
        <div 
          className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} w-full relative`}
          onContextMenu={handleContextMenu}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          onClick={handleDoubleTap}
        >
          {/* Sender Identity display on first in grouped rows */}
          {showSenderName && !isMe && (
            <div className="flex items-center gap-1.5 mb-1 px-2 select-none">
              <span className="text-xs shrink-0">{msg.avatar || '👤'}</span>
              <span className={`text-[11px] font-bold ${getParticipantNameColor(msg.uid)}`}>
                {msg.username}
              </span>
            </div>
          )}

          {/* Quoted Message Quote Bubble Block if this message is replying to another */}
          <div className="relative max-w-[85%] sm:max-w-[75%] md:max-w-[70%]">
            {msg.replyTo && (
              <div 
                onClick={() => {
                  const targetElement = document.getElementById(`msg-${msg.replyTo?.id}`);
                  if (targetElement) {
                    targetElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    targetElement.classList.add('bg-white/10');
                    setTimeout(() => targetElement.classList.remove('bg-white/10'), 1500);
                  }
                }}
                className={`flex flex-col mb-1 p-2 rounded-t-xl rounded-b-md border-l-4 text-xs select-none cursor-pointer transition-all ${
                  isMe 
                    ? 'bg-black/30 border-[#0a84ff] text-white/70 hover:bg-black/40' 
                    : 'bg-[#1c1c1e] border-white/40 text-white/60 hover:bg-[#2c2c2e]'
                }`}
              >
                <div className="font-bold flex items-center gap-1">
                  <CornerUpLeft size={10} />
                  <span>{msg.replyTo.username}</span>
                </div>
                <p className="truncate mt-0.5 max-w-sm italic opacity-80">{msg.replyTo.text}</p>
              </div>
            )}

            {/* Main Message Bubble */}
            <div 
              className={`rounded-2xl px-4 py-2 text-sm shadow-sm transition-all focus:outline-none select-text ${
                isMe 
                  ? 'bg-[#0a84ff] text-white font-sans' 
                  : isGroup 
                    ? `border font-sans ${getParticipantBubbleStyle(msg.uid)} text-[#f5f5f7]`
                    : 'bg-[#262629] border border-white/5 text-[#f5f5f7] font-sans'
              } ${emojiOnlyMode ? 'bg-transparent border-none shadow-none !px-2 !py-0' : ''}`}
            >
              <p className={`leading-relaxed whitespace-pre-wrap break-all ${emojiOnlyMode ? 'text-4xl' : ''}`}>
                {msg.text}
              </p>

              {/* Timestamp, edits, receipts inline bar */}
              {!emojiOnlyMode && (
                <div className="flex items-center justify-end gap-1.5 mt-1 select-none">
                  {msg.edited && (
                    <span className={`text-[9px] italic ${isMe ? 'text-white/50' : 'text-white/30'}`}>(edited)</span>
                  )}
                  <span className={`text-[9px] font-mono tracking-wide ${isMe ? 'text-white/60' : 'text-[#8e8e93]'}`}>
                    {formattedTime}
                  </span>
                  {renderReadReceipts()}
                </div>
              )}
            </div>

            {/* Quick Render inline emojis if double tapped */}
            {msg.reactions && Object.keys(msg.reactions).length > 0 && (
              <div className={`flex flex-wrap gap-1 mt-1 shrink-0 ${isMe ? 'justify-end' : 'justify-start'}`}>
                {Object.entries(msg.reactions).map(([emoji, uids]) => (
                  <button
                    key={emoji}
                    onClick={() => onReact(msg.id || '', emoji)}
                    className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 transition-all text-xs text-white/80 active:scale-90"
                    title={`Reacted by: ${uids.length} user(s)`}
                  >
                    <span>{emoji}</span>
                    {uids.length > 1 && <span className="text-[9px] text-[#8e8e93] font-bold">{uids.length}</span>}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </motion.div>

      {/* Floating IOS Context Menu Action Drawer */}
      {showMenu && (
        <>
          <div 
            className="fixed inset-0 z-50 bg-black/10 backdrop-blur-2xs" 
            onClick={() => setShowMenu(false)}
            onContextMenu={(e) => { e.preventDefault(); setShowMenu(false); }}
          />
          <div 
            style={{ top: menuPosition.y, left: menuPosition.x }}
            className="fixed z-51 w-44 bg-[#1c1c1e] border border-white/10 rounded-2xl shadow-2xl p-1.5 flex flex-col text-sm focus:outline-none"
          >
            {/* Reaction bar picker inline */}
            <div className="flex items-center justify-between px-1.5 py-1 mb-1 border-b border-white/5 pb-1.5">
              {COMMON_EMOJIS.map(emoji => (
                <button
                  key={emoji}
                  onClick={() => {
                    onReact(msg.id || '', emoji);
                    setShowMenu(false);
                  }}
                  className="hover:scale-125 hover:bg-white/5 p-1 rounded-lg transition-transform active:scale-95 text-base"
                >
                  {emoji}
                </button>
              ))}
            </div>

            <button
              onClick={() => {
                onReply(msg);
                setShowMenu(false);
              }}
              className="flex items-center gap-2 px-3 py-2 rounded-xl text-left hover:bg-white/5 text-white/90 active:bg-white/10 transition-colors"
            >
              <CornerUpLeft size={14} className="text-[#0a84ff]" />
              <span>Reply</span>
            </button>

            {isMe && (
              <button
                onClick={() => {
                  onStartEdit(msg);
                  setShowMenu(false);
                }}
                className="flex items-center gap-2 px-3 py-2 rounded-xl text-left hover:bg-white/5 text-white/90 active:bg-white/10 transition-colors"
              >
                <Edit3 size={14} className="text-amber-500" />
                <span>Edit text</span>
              </button>
            )}

            <button
              onClick={handleCopy}
              className="flex items-center gap-2 px-3 py-2 rounded-xl text-left hover:bg-white/5 text-white/90 active:bg-white/10 transition-colors"
            >
              <Copy size={14} className="text-purple-400" />
              <span>Copy</span>
            </button>

            {isMe && (
              <button
                onClick={() => {
                  onDelete(msg.id || '');
                  setShowMenu(false);
                }}
                className="flex items-center gap-2 px-3 py-2 rounded-xl text-left hover:bg-red-500/15 text-red-400 active:bg-red-500/25 transition-colors"
              >
                <Trash2 size={14} className="text-red-400" />
                <span>Delete</span>
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
}
