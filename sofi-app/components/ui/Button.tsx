'use client';

import { ButtonHTMLAttributes } from 'react';
import { motion } from 'framer-motion';
import { colors, borderRadius, spacing } from '@/lib/design/theme';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'ghost';
    avatarTheme?: 'sofi' | 'sam' | 'neutral';
    fullWidth?: boolean;
}

export default function Button({
    children,
    variant = 'primary',
    avatarTheme = 'sofi',
    fullWidth = false,
    className = '',
    ...props
}: ButtonProps) {
    const theme = avatarTheme === 'sofi' ? colors.sofi : colors.sam;

    const variantStyles = {
        primary: {
            background: theme.gradient,
            color: 'white',
            boxShadow: `0 4px 16px ${theme.glow}`,
        },
        secondary: {
            background: 'rgba(255, 255, 255, 0.1)',
            color: 'white',
            border: `1px solid ${theme.primary}`,
        },
        ghost: {
            background: 'transparent',
            color: theme.primary,
        },
    };

    return (
        <motion.button
            className={`relative font-medium ${fullWidth ? 'w-full' : ''} ${className}`}
            style={{
                ...variantStyles[variant],
                padding: `${spacing.md} ${spacing.xl}`,
                borderRadius: borderRadius.full,
                cursor: 'pointer',
                border: variant === 'secondary' ? undefined : 'none',
            }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.98 }}
            transition={{ duration: 0.2 }}
            {...props}
        >
            {children}
        </motion.button>
    );
}
