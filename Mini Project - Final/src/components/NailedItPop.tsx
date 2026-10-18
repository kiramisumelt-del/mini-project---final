import { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles } from 'lucide-react';
import { CloverIcon } from './CloverIcon';

interface NailedItPopProps {
  show: boolean;
  onDismiss: () => void;
  taskTitle?: string;
  triggerKey?: number;
}

export function NailedItPop({
  show,
  onDismiss,
  triggerKey,
}: NailedItPopProps) {
  useEffect(() => {
    if (!show) return;

    const timer = setTimeout(() => {
      onDismiss();
    }, 2000);

    return () => clearTimeout(timer);
  }, [show, triggerKey, onDismiss]);

  return (
    <AnimatePresence mode="wait">
      {show && (
        <div className="fixed inset-0 z-50 pointer-events-none flex items-center justify-center select-none overflow-hidden">
          <motion.div
            key={triggerKey}
            initial={{ opacity: 0, scale: 0.6, y: 30, rotate: -4 }}
            animate={{
              opacity: [0, 1, 1, 0],
              scale: [0.6, 1.15, 1.05, 0.95],
              y: [30, -10, -50, -85],
              rotate: [-4, 3, -1, 1],
            }}
            transition={{
              duration: 1.9,
              times: [0, 0.2, 0.7, 1],
              ease: 'easeOut',
            }}
            className="relative flex flex-col items-center justify-center"
          >
            {/* Ambient soft glow backdrop */}
            <div className="absolute inset-0 -m-8 bg-gradient-to-r from-[#E7D1DA]/30 via-[#D9E4EC]/40 to-[#FBF9F2]/30 rounded-full blur-2xl -z-10" />

            {/* Floating Sparkles above and around */}
            <motion.div
              initial={{ opacity: 0, scale: 0, y: 10, x: -20 }}
              animate={{ opacity: [0, 1, 0], scale: [0, 1.2, 0.8], y: -30, x: -40 }}
              transition={{ duration: 1.6, delay: 0.1 }}
              className="absolute -top-6 -left-6 text-[#8A5D6F]"
            >
              <CloverIcon className="w-5 h-5 drop-shadow-xs" />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0, y: 10, x: 20 }}
              animate={{ opacity: [0, 1, 0], scale: [0, 1.3, 0.6], y: -40, x: 45 }}
              transition={{ duration: 1.7, delay: 0.15 }}
              className="absolute -top-8 -right-8 text-[#3B607A]"
            >
              <Sparkles className="w-6 h-6 drop-shadow-xs" />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: [0, 1, 0], scale: [0, 1, 0.5], y: -20, x: 30 }}
              transition={{ duration: 1.4, delay: 0.25 }}
              className="absolute -bottom-4 right-2 text-[#E7D1DA]"
            >
              <span className="text-xl font-bold">✦</span>
            </motion.div>

            {/* The Floating Word itself */}
            <div className="relative px-6 py-2 flex items-center gap-3">
              <span
                style={{
                  textShadow: '0 4px 18px rgba(46, 39, 65, 0.18), 0 1px 2px rgba(46, 39, 65, 0.12)',
                }}
                className="font-display font-black tracking-tight text-4xl sm:text-5xl md:text-6xl text-[#2E2741] lowercase whitespace-nowrap drop-shadow-md"
              >
                nailed it!
              </span>
              <motion.div
                animate={{ rotate: [0, 15, -15, 0], scale: [1, 1.25, 1.1, 1] }}
                transition={{ duration: 0.8, repeat: Infinity, repeatDelay: 0.5 }}
                className="text-[#8A5D6F] drop-shadow-sm"
              >
                <CloverIcon className="w-8 h-8 sm:w-10 sm:h-10" />
              </motion.div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
