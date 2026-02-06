import { motion } from 'framer-motion';

interface ErrorMessageProps {
  message: string;
  onRetry?: () => void;
}

export const ErrorMessage = ({ message, onRetry }: ErrorMessageProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="card max-w-md w-full border-red-200 bg-red-50"
    >
      <div className="text-center">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Error</h3>
        <p className="text-gray-600 mb-4">{message}</p>
        {onRetry && (
          <button
            onClick={onRetry}
            className="btn-primary bg-gray-900 text-white hover:bg-gray-800"
          >
            Try Again
          </button>
        )}
      </div>
    </motion.div>
  );
};
