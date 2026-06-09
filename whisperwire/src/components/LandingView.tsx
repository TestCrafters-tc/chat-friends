import React from 'react';
import { motion } from 'motion/react';
import { Edit2, Sparkles, DoorOpen, ArrowRight, ShieldCheck } from 'lucide-react';

interface LandingViewProps {
  username: string;
  avatar: string;
  onChangeIdentity: () => void;
  onCreateRoom: (roomName: string) => void;
  onJoinRoom: (roomCode: string) => void;
  isLoading: boolean;
}

export default function LandingView({
  username,
  avatar,
  onChangeIdentity,
  onCreateRoom,
  onJoinRoom,
  isLoading,
}: LandingViewProps) {
  const [roomName, setRoomName] = React.useState('');
  const [joinCode, setJoinCode] = React.useState('');

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    onCreateRoom(roomName.trim() || 'Whisper Sync');
  };

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();
    if (joinCode.trim()) {
      onJoinRoom(joinCode.trim().toUpperCase());
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.98 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="flex-1 flex flex-col justify-center items-center px-4 md:px-6 w-full max-w-md mx-auto"
      id="landingView"
    >
      <div className="text-center mb-8">
        {/* User Persona Pill Accent */}
        <button
          onClick={onChangeIdentity}
          className="inline-flex items-center gap-2.5 bg-white/[0.04] hover:bg-white/[0.08] active:scale-95 border border-white/10 px-4 py-2 rounded-full text-xs font-semibold text-[#01c4ff] mb-6 transition-all duration-200 shadow-md group"
          id="currentUserPill"
        >
          <span id="userAvatarSpan" className="text-base select-none">{avatar}</span>
          <span id="userNameSpan" className="text-white truncate max-w-[120px]">{username}</span>
          <Edit2 size={11} className="text-[#8e8e93] group-hover:text-white transition-colors" />
        </button>

        <h1 className="text-4xl font-extrabold tracking-tight text-white mb-2 font-sans">
          WhisperWire
        </h1>
        <p className="text-[#8e8e93] text-sm leading-relaxed max-w-[340px] mx-auto">
          Ultra-secure, ephemeral rooms utilizing Liquid Glass visual layers.
        </p>
      </div>

      <div className="w-full space-y-6">
        {/* Create Secure Room Card */}
        <form onSubmit={handleCreate} className="p-6 rounded-3xl bg-[#1c1c1e]/60 border border-white/10 backdrop-blur-xl space-y-4 shadow-xl">
          <div className="flex items-center gap-2 text-white/90 font-semibold text-sm">
            <Sparkles size={16} className="text-[#0A84FF]" />
            <h2>Start a New Chat Room</h2>
          </div>
          <div className="relative">
            <input
              type="text"
              id="roomNameInput"
              value={roomName}
              onChange={(e) => setRoomName(e.target.value)}
              placeholder="Room Name (e.g., Marketing Sync)"
              maxLength={25}
              disabled={isLoading}
              className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.03] border border-white/10 text-sm text-white placeholder-white/20 focus:outline-none focus:border-[#0A84FF]/40 focus:bg-white/[0.06] transition-all"
            />
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-[#0a84ff] hover:bg-[#0070e3] text-white font-medium py-2.5 rounded-xl transition-all flex items-center justify-center gap-2 text-sm shadow-md cursor-pointer"
          >
            <span>{isLoading ? 'Creating...' : 'Generate Secure Room'}</span>
            <ShieldCheck size={16} className="text-white" />
          </button>
        </form>

        {/* Join Secure Room Card */}
        <form onSubmit={handleJoin} className="p-6 rounded-3xl bg-[#1c1c1e]/60 border border-white/10 backdrop-blur-xl space-y-4 shadow-xl" id="joinRoomForm">
          <div className="flex items-center gap-2 text-white/90 font-semibold text-sm">
            <DoorOpen size={16} className="text-[#30d158]" />
            <h2>Join Existing Room</h2>
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              id="joinCodeInput"
              value={joinCode}
              onChange={(e) => setJoinCode(e.target.value)}
              placeholder="Room Code (e.g., W-B9F2)"
              maxLength={12}
              required
              disabled={isLoading}
              className="flex-1 px-4 py-2.5 rounded-xl bg-white/[0.03] border border-white/10 text-white placeholder-white/20 focus:outline-none focus:border-[#30d158]/40 focus:bg-white/[0.06] transition-all tracking-wider font-semibold text-center text-sm uppercase"
            />
            <button
              type="submit"
              disabled={isLoading}
              className="bg-[#0A84FF] hover:bg-[#0070e3] px-5 rounded-xl transition-all flex items-center justify-center active:scale-95 shadow-md shadow-[#0A84FF]/20 cursor-pointer"
            >
              <ArrowRight size={16} className="text-white" />
            </button>
          </div>
        </form>
      </div>
    </motion.div>
  );
}
