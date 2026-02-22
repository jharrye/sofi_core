'use client';

import { motion } from 'framer-motion';
import { colors } from '@/lib/design/theme';

interface SamAvatarProps {
    size?: number;
    animate?: boolean;
}

export default function SamAvatar({ size = 120, animate = true }: SamAvatarProps) {
    return (
        <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
            {/* Glow effect */}
            <motion.div
                className="absolute inset-0 rounded-full"
                style={{
                    background: colors.sam.gradient,
                    filter: 'blur(30px)',
                    opacity: 0.3,
                }}
                animate={animate ? {
                    scale: [1, 1.15, 1],
                    opacity: [0.3, 0.45, 0.3],
                } : undefined}
                transition={{
                    duration: 3.5,
                    repeat: Infinity,
                    ease: 'easeInOut',
                }}
            />

            {/* Main avatar */}
            <motion.div
                className="relative flex items-center justify-center rounded-full"
                style={{
                    width: size,
                    height: size,
                    background: colors.sam.gradient,
                    boxShadow: `0 8px 32px ${colors.sam.glow}`,
                }}
                animate={animate ? {
                    y: [0, -6, 0],
                } : undefined}
                transition={{
                    duration: 2.5,
                    repeat: Infinity,
                    ease: 'easeInOut',
                }}
            >
                {/* Sam Icon - Structured diamond/shield shape */}
                <svg
                    width={size * 0.5}
                    height={size * 0.5}
                    viewBox="0 0 60 60"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <motion.path
                        d="M30 10L50 22V38L30 50L10 38V22L30 10Z"
                        fill="white"
                        fillOpacity="0.9"
                        animate={animate ? {
                            scale: [1, 1.03, 1],
                        } : undefined}
                        transition={{
                            duration: 2.2,
                            repeat: Infinity,
                            ease: 'easeInOut',
                        }}
                    />
                    <path
                        d="M30 18L40 25V35L30 42L20 35V25L30 18Z"
                        fill={colors.sam.primary}
                        fillOpacity="0.3"
                    />
                </svg>
            </motion.div>

            {/* Breathing ring */}
            <motion.div
                className="absolute inset-0 rounded-full border-2"
                style={{
                    borderColor: colors.sam.primary,
                    opacity: 0.4,
                }}
                animate={animate ? {
                    scale: [1, 1.12, 1],
                    opacity: [0.4, 0, 0.4],
                } : undefined}
                transition={{
                    duration: 2.5,
                    repeat: Infinity,
                    ease: 'easeInOut',
                }}
            />
        </div>
    );
}
