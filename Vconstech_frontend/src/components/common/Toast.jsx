import React, { useEffect } from 'react';
import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react';

const Toast = ({ message, type = 'info', onClose, duration = 3000 }) => {
  useEffect(() => {
    if (duration) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  const types = {
    success: {
      icon: CheckCircle,
      bgColor: 'bg-green-50',
      borderColor: 'border-green-500',
      iconColor: 'text-green-500',
      textColor: 'text-green-800',
    },
    error: {
      icon: XCircle,
      bgColor: 'bg-red-50',
      borderColor: 'border-red-500',
      iconColor: 'text-red-500',
      textColor: 'text-red-800',
    },
    warning: {
      icon: AlertTriangle,
      bgColor: 'bg-yellow-50',
      borderColor: 'border-yellow-500',
      iconColor: 'text-yellow-500',
      textColor: 'text-yellow-800',
    },
    info: {
      icon: Info,
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-500',
      iconColor: 'text-blue-500',
      textColor: 'text-blue-800',
    },
  };

  const config = types[type] || types.info;
  const Icon = config.icon;

  return (
    <div className="fixed top-50 right-4 z-50 animate-slide-in">
      <div
        className={`${config.bgColor} ${config.borderColor} border-l-4 rounded-lg shadow-lg p-4 max-w-md flex items-start gap-3`}
      >
        <Icon className={`${config.iconColor} w-5 h-5 flex-shrink-0 mt-0.5`} />
        <p className={`${config.textColor} text-sm font-medium flex-1`}>
          {message}
        </p>
        <button
          onClick={onClose}
          className={`${config.iconColor} hover:opacity-70 transition-opacity`}
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default Toast;