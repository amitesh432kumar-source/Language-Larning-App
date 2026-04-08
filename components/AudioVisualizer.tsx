import { motion } from 'motion/react';

export function AudioVisualizer({ isActive, color = 'bg-blue-500' }: { isActive: boolean, color?: string }) {
  return (
    <div className="flex items-center justify-center gap-1 h-12">
      {[1, 2, 3, 4, 5].map((i) => (
        <motion.div
          key={i}
          className={`w-2 rounded-full ${color}`}
          animate={{
            height: isActive ? ['20%', '100%', '20%'] : '20%',
          }}
          transition={{
            duration: 0.8,
            repeat: Infinity,
            ease: "easeInOut",
            delay: i * 0.1,
          }}
        />
      ))}
    </div>
  );
}
