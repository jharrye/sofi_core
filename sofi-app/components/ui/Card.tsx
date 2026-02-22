'use client';

import { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { glassmorphism, borderRadius } from '@/lib/design/theme';

interface CardProps {
    children: ReactNode;
    variant?: 'light' | 'medium' | 'heavy';
    className?: string;
    hover?: boolean;
}

export default function Card({
    children,
    variant = 'medium',
    className = '',
    hover = false
}: CardProps) {
    const glass = glassmorphism[variant];

    return (
        <motion.div
            className={`relative overflow-hidden ${className}`}
            style={{
                background: glass.background,
                backdropFilter: glass.backdropFilter,
                border: glass.border,
                boxShadow: glass.boxShadow,
                borderRadius: borderRadius.lg,
            }}
            whileHover={hover ? { scale: 1.02 } : undefined}
            transition={{ duration: 0.2 }}
        >
            {children}
        </motion.div>
    );
}
