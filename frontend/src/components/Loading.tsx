import { motion } from 'framer-motion';

export const Loading = () => {
  return (
    <div className="flex flex-col items-center justify-center gap-4">
      <motion.div
        className="w-12 h-12 border-4 border-gray-300 border-t-gray-900 rounded-full"
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
      />
      <p className="text-gray-600">Loading...</p>
    </div>
  );
};
