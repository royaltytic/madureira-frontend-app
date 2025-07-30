import { ReactNode } from 'react';
import { twMerge } from 'tailwind-merge';

type ButtonProps = {
    variant: 'solid' | 'transparent';
    children: ReactNode;
    type: 'submit' | 'button';
    size?: 'small' | 'medium' | 'large';
    className?: string;
    onClick?: () => void;
};

export const Button = ({ children, variant, type, size = 'large', className, onClick }: ButtonProps) => {
    const baseStyles = 'rounded-lg font-bold shadow-2xl hover:opacity-90';
    const solidStyles = 'bg-[#21BC0B] text-white hover:bg-[#ccc]-700';
    const outlineStyles = 'bg-transparent text-black';

    const sizeStyles = {
        small: 'h-8 w-22 text-sm',
        medium: 'h-10 w-40 text-base',
        large: 'h-12 w-full text-base',
    };

    return (
        <button
            className={twMerge(
                baseStyles,
                sizeStyles[size], 
                variant === 'solid' ? solidStyles : outlineStyles,
                className
            )}
            type={type}
            onClick={onClick}
        >
            {children}
        </button>
    );
};

