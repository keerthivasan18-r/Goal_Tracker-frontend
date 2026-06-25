import React from 'react';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  hoverable?: boolean;
  onClick?: () => void;
}

export const GlassCard: React.FC<GlassCardProps> = ({
  children,
  className = '',
  hoverable = false,
  onClick,
}) => {
  return (
    <div
      onClick={onClick}
      className={`glass-panel rounded-xl p-5 ${
        hoverable ? 'glass-panel-hover cursor-pointer' : ''
      } ${className}`}
    >
      {children}
    </div>
  );
};
