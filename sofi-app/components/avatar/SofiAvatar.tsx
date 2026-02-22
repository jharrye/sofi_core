'use client';

import { motion } from 'framer-motion';
import { colors } from '@/lib/design/theme';

interface SofiAvatarProps {
    size?: number;
    animate?: boolean;
}

export default function SofiAvatar({ size = 120, animate = true }: SofiAvatarProps) {
    return (
        <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
            {/* Glow effect */}
            <motion.div
                className="absolute inset-0 rounded-full"
                style={{
                    background: colors.sofi.gradient,
                    filter: 'blur(30px)',
                    opacity: 0.3,
                }}
                animate={animate ? {
                    scale: [1, 1.2, 1],
                    opacity: [0.3, 0.5, 0.3],
                } : undefined}
                transition={{
                    duration: 4,
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
                    background: colors.sofi.gradient,
                    boxShadow: `0 8px 32px ${colors.sofi.glow}`,
                }}
                animate={animate ? {
                    y: [0, -8, 0],
                } : undefined}
                transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: 'easeInOut',
                }}
            >
                {/* Sofi Icon - Simple heart-like shape */}
                <svg
                    width={size * 0.5}
                    height={size * 0.5}
                    viewBox="0 0 60 60"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <motion.path
                        d="M30 50C30 50 10 38 10 22C10 10 18 8 23 12C28 16 30 22 30 22C30 22 32 16 37 12C42 8 50 10 50 22C50 38 30 50 30 50Z"
                        fill="white"
                        fillOpacity="0.9"
                        animate={animate ? {
                            scale: [1, 1.05, 1],
                        } : undefined}
                        transition={{
                            duration: 2,
                            repeat: Infinity,
                            ease: 'easeInOut',
                        }}
                    />
                </svg>
            </motion.div>

            {/* Breathing ring */}
            <motion.div
                className="absolute inset-0 rounded-full border-2"
                style={{
                    borderColor: colors.sofi.primary,
                    opacity: 0.4,
                }}
                animate={animate ? {
                    scale: [1, 1.15, 1],
                    opacity: [0.4, 0, 0.4],
                } : undefined}
                transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: 'easeInOut',
                }}
            />
        </div>
    );
}
