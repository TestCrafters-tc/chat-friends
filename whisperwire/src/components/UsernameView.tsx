import React from 'react';
import { motion } from 'motion/react';
import { User, ArrowRight } from 'lucide-react';

interface UsernameViewProps {
  username: string;
  setUsername: (name: string) => void;
  avatar: string;
  setAvatar: (avatar: string) => void;
  onSave: () => void;
}

const AVATARS = ["🐱", "🦊", "🦁", "🐨", "🐼", "🤖", "👾", "👽", "🤠", "🧛", "🧑‍🚀", "🧙"];

export default function UsernameView({
  username,
  setUsername,
  avatar,
  setAvatar,
  onSave,
}: UsernameViewProps) {
  const [localVal, setLocalVal] = React.useState(username);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (localVal.trim()) {
      setUsername(localVal.trim());
      onSave();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="flex-1 flex flex-col justify-center items-center px-4 md:px-6 w-full max-w-md mx-auto"
      id="usernameView"
    >
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white/[0.04] border border-white/10 mb-4 text-[#0A84FF] shadow-inner">
          <User size={32} />
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-white mb-2 font-sans">Identity Setup</h1>
        <p className="text-[#8e8e93] text-sm leading-relaxed">
          Choose a visual persona and custom display name to join the secure chat room.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="w-full space-y-6 liquid-glass-card p-6 rounded-3xl">
        <div>
          <label className="block text-xs font-semibold uppercase tracking-widest text-[#8e8e93] mb-3">
            Select Your Avatar
          </label>
          <div className="grid grid-cols-6 gap-2.5" id="avatarSelector">
            {AVATARS.map((emoji) => {
              const isSelected = emoji === avatar;
              return (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => setAvatar(emoji)}
                  className={`aspect-square text-2xl flex items-center justify-center rounded-2xl transition-all duration-200 outline-none select-none apple-active-scale ${
                    isSelected
                      ? 'bg-[#0A84FF]/20 border border-[#0A84FF] shadow-[0_0_12px_rgba(10,132,255,0.25)] scale-110'
                      : 'bg-white/[0.03] border border-white/5 hover:bg-white/[0.08]'
                  }`}
                >
                  {emoji}
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <label htmlFor="usernameInput" className="block text-xs font-semibold uppercase tracking-widest text-[#8e8e93] mb-3">
            Display Name
          </label>
          <input
            type="text"
            id="usernameInput"
            value={localVal}
            onChange={(e) => setLocalVal(e.target.value)}
            placeholder="Enter custom username..."
            maxLength={20}
            required
            className="w-full px-4 py-3.5 rounded-2xl bg-white/[0.03] border border-white/10 text-white placeholder-[#48484a] text-center font-semibold text-base focus:outline-none focus:border-[#0A84FF]/50 transition-all focus:bg-white/[0.06]"
          />
        </div>

        <button
          type="submit"
          className="w-full bg-[#0A84FF] hover:bg-[#0070e3] text-white font-semibold py-3.5 px-5 rounded-2xl transition-all shadow-lg shadow-[#0A84FF]/10 flex items-center justify-center gap-2 apple-active-scale"
        >
          <span>Continue to Hub</span>
          <ArrowRight size={18} />
        </button>
      </form>
    </motion.div>
  );
}
