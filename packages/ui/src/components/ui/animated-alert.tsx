import React, { useState, useEffect, ReactNode } from 'react';
import { AlertCircle, CheckCircle2, AlertTriangle, Info } from 'lucide-react';

interface AlertProps {
  children: ReactNode;
  className?: string;
}

export const Alert: React.FC<AlertProps> = ({ children, className }) => {
  return (
    <div className={`rounded-lg border p-4 ${className ?? ''}`}>
      {children}
    </div>
  );
};

export const AlertDescription: React.FC<AlertProps> = ({ children, className }) => {
  return (
    <p className={`text-sm ${className ?? ''}`}>
      {children}
    </p>
  );
};

const AlertTypes: any = {
  success: {
    icon: CheckCircle2,
    bgColor: 'bg-gradient-to-r from-green-900/90 to-green-800/90',
    textColor: 'text-green-100',
    borderColor: 'border-green-600/20',
    iconColor: 'text-green-400',
    shadowColor: 'shadow-green-900/40',
    glowColor: 'before:bg-green-400/20'
  },
  error: {
    icon: AlertCircle,
    bgColor: 'bg-gradient-to-r from-red-900/90 to-red-800/90 backdrop-blur-sm',
    textColor: 'text-red-100',
    borderColor: 'border-red-600/20',
    iconColor: 'text-red-400',
    shadowColor: 'shadow-red-900/40',
    glowColor: 'before:bg-red-400/20'
  },
  warning: {
    icon: AlertTriangle,
    bgColor: 'bg-gradient-to-r from-yellow-900/90 to-yellow-800/90 backdrop-blur-sm',
    textColor: 'text-yellow-100',
    borderColor: 'border-yellow-600/20',
    iconColor: 'text-yellow-400',
    shadowColor: 'shadow-yellow-900/40',
    glowColor: 'before:bg-yellow-400/20'
  },
  info: {
    icon: Info,
    bgColor: 'bg-gradient-to-r from-blue-900/90 to-blue-800/90 backdrop-blur-sm',
    textColor: 'text-blue-100',
    borderColor: 'border-blue-600/20',
    iconColor: 'text-blue-400',
    shadowColor: 'shadow-blue-900/40',
    glowColor: 'before:bg-blue-400/20'
  }
};

const AnimatedAlert = ({
  type = 'info',
  message = '',
  isVisible = false,
  autoHideDuration = 5000
}) => {
  const [isShowing, setIsShowing] = useState(false);
  const [shouldRender, setShouldRender] = useState(false);
  const alertStyle = AlertTypes[type] || AlertTypes.info;
  const Icon = alertStyle.icon;

  useEffect(() => {
    if (isVisible) {
      setShouldRender(true);
      setTimeout(() => setIsShowing(true), 100);
      if (autoHideDuration) {
        const hideTimer = setTimeout(() => {
          setIsShowing(false);
          setTimeout(() => setShouldRender(false), 500);
        }, autoHideDuration);
        return () => clearTimeout(hideTimer);
      }
    } else {
      setIsShowing(false);
      setTimeout(() => setShouldRender(false), 500);
    }
  }, [isVisible, autoHideDuration]);

  if (!shouldRender) return null;

  return (
    <div className="fixed inset-x-0 top-6 z-50 flex justify-center">
      <div
        className={`transform transition-all duration-500 ease-out
          ${isShowing
            ? 'translate-y-8 opacity-100 scale-100'
            : '-translate-y-8 opacity-0 scale-95'
          }`}
      >
        <Alert
          className={`relative w-80 border-2 rounded-xl overflow-hidden
            ${alertStyle.bgColor} ${alertStyle.borderColor} ${alertStyle.textColor}
            shadow-lg ${alertStyle.shadowColor} hover:shadow-xl
            transition-all duration-300 ease-in-out
            before:absolute before:inset-0 ${alertStyle.glowColor} before:blur-xl before:-translate-y-4
          `}
        >
          <div className="relative z-10">
            <div className="flex items-center gap-3 p-1">
              <div className={`p-1 rounded-full bg-black/20`}>
                <Icon className={`h-5 w-5 ${alertStyle.iconColor} animate-pulse`} />
              </div>
              <AlertDescription className="flex-1 text-sm font-medium">
                {message}
              </AlertDescription>
            </div>
          </div>
        </Alert>
      </div>
    </div>
  );
};

export default AnimatedAlert;
