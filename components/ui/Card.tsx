import React from 'react';

// FIX: Update CardProps to extend HTMLAttributes and update the component to forward props.
// This allows passing standard div attributes like `draggable` and event handlers.
interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
}

export const Card: React.FC<CardProps> = ({ children, className, ...props }) => {
  return (
    <div className={`bg-white border border-chatwoot-border rounded-lg shadow-sm ${className}`} {...props}>
      {children}
    </div>
  );
};

interface CardHeaderProps {
    children: React.ReactNode;
    className?: string;
}

export const CardHeader: React.FC<CardHeaderProps> = ({ children, className }) => {
    return (
        <div className={`p-4 border-b border-chatwoot-border ${className}`}>
            {children}
        </div>
    );
};

interface CardContentProps {
    children: React.ReactNode;
    className?: string;
}

export const CardContent: React.FC<CardContentProps> = ({ children, className }) => {
    return (
        <div className={`p-4 ${className}`}>
            {children}
        </div>
    );
};

interface CardTitleProps {
    children: React.ReactNode;
    className?: string;
}

export const CardTitle: React.FC<CardTitleProps> = ({ children, className }) => {
    return (
        <h3 className={`text-base font-semibold text-brand-black ${className}`}>{children}</h3>
    );
};
