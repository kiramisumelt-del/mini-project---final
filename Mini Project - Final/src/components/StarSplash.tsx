import { useEffect, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';

const SPLASH_DURATION_MS = 1400;

export function StarSplash() {
  const [visible, setVisible] = useState(true);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    const timer = setTimeout(() => setVisible(false), reduceMotion ? 500 : SPLASH_DURATION_MS);
    return () => clearTimeout(timer);
  }, [reduceMotion]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="star-splash"
          role="status"
          aria-label="Loading Kira's To-Do-List"
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center gap-5 bg-[#FBF6F3]"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.35, ease: 'easeOut' }}
        >
          <div className="relative flex items-center justify-center">
            <motion.span
              aria-hidden="true"
              className="absolute h-40 w-40 rounded-full bg-[#F3DCE4]"
              initial={reduceMotion ? false : { scale: 0.4, opacity: 0.9 }}
              animate={{ scale: 1.6, opacity: 0 }}
              transition={{ delay: 0.25, duration: 0.8, ease: 'easeOut' }}
            />
            <motion.img
              src="/icon.svg"
              alt=""
              width={112}
              height={112}
              className="relative h-28 w-28 drop-shadow-[0_10px_20px_rgba(201,141,161,0.35)]"
              initial={reduceMotion ? false : { scale: 0, rotate: -25 }}
              animate={{ scale: [0, 1.18, 1], rotate: 0 }}
              transition={{ duration: 0.6, times: [0, 0.65, 1], ease: 'easeOut' }}
            />
          </div>
          <motion.p
            className="font-display text-base font-semibold text-[#8A5D6F]"
            initial={reduceMotion ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35, duration: 0.35 }}
          >
            {"Kira's To-Do-List"}
          </motion.p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
