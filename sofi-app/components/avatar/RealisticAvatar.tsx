'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { colors } from '@/lib/design/theme';

type AvatarCharacter = 'sofi' | 'sam';
type AvatarState = 'idle' | 'listening' | 'speaking';

interface RealisticAvatarProps {
    character: AvatarCharacter;
    state?: AvatarState;
    size?: number;
    className?: string;
}

export default function RealisticAvatar({
    character,
    state = 'idle',
    size = 300,
    className = '',
}: RealisticAvatarProps) {
    const [currentState, setCurrentState] = useState<AvatarState>(state);
    const [isLoading, setIsLoading] = useState(true);
    const videoRef = useRef<HTMLVideoElement>(null);

    useEffect(() => {
        setCurrentState(state);
    }, [state]);

    // Video source paths (will use video assets when available)
    const getVideoSource = () => {
        const basePrefix = character === 'sofi' ? 'sofi' : 'sam';
        return `/avatars/${basePrefix}-${currentState}.webm`;
    };

    // Fallback: SVG placeholder until video assets are ready
    const theme = character === 'sofi' ? colors.sofi : colors.sam;

    return (
        <div
            className={`relative flex items-center justify-center ${className}`}
            style={{ width: size, height: size }}
        >
            {/* Video avatar (hidden until assets available) */}
            <video
                ref={videoRef}
                className="absolute inset-0 w-full h-full object-cover rounded-full opacity-0 hidden"
                src={getVideoSource()}
                autoPlay
                loop
                muted
                playsInline
                onLoadedData={() => setIsLoading(false)}
            />

            {/* SVG Placeholder - Realistic style */}
            <div className="relative w-full h-full">
                {/* Glow effect */}
                <motion.div
                    className="absolute inset-0 rounded-full"
                    style={{
                        background: theme.gradient,
                        filter: 'blur(40px)',
                        opacity: 0.2,
                    }}
                    animate={{
                        scale: [1, 1.1, 1],
                        opacity: currentState === 'speaking' ? [0.2, 0.35, 0.2] : [0.2, 0.25, 0.2],
                    }}
                    transition={{
                        duration: currentState === 'speaking' ? 2 : 3.5,
                        repeat: Infinity,
                        ease: 'easeInOut',
                    }}
                />

                {/* Main avatar circle */}
                <motion.div
                    className="relative w-full h-full rounded-full overflow-hidden"
                    style={{
                        background: `linear-gradient(135deg, ${theme.primary}15 0%, ${theme.secondary}25 100%)`,
                        border: `2px solid ${theme.primary}40`,
                        boxShadow: `0 8px 32px ${theme.glow}`,
                    }}
                    animate={{
                        y: currentState === 'listening' ? [0, -4, 0] : [0, -2, 0],
                    }}
                    transition={{
                        duration: currentState === 'listening' ? 2 : 3,
                        repeat: Infinity,
                        ease: 'easeInOut',
                    }}
                >
                    {/* Face representation - minimalist human silhouette */}
                    <svg
                        width="100%"
                        height="100%"
                        viewBox="0 0 200 200"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        {/* Background gradient */}
                        <defs>
                            <radialGradient id={`face-gradient-${character}`}>
                                <stop offset="0%" stopColor={theme.primary} stopOpacity="0.3" />
                                <stop offset="100%" stopColor={theme.secondary} stopOpacity="0.1" />
                            </radialGradient>
                            <linearGradient id={`skin-${character}`} x1="0%" y1="0%" x2="0%" y2="100%">
                                <stop offset="0%" stopColor="#f5d5c8" />
                                <stop offset="100%" stopColor="#e8c4b5" />
                            </linearGradient>
                        </defs>

                        <circle cx="100" cy="100" r="100" fill={`url(#face-gradient-${character})`} />

                        {/* Face shape */}
                        <ellipse
                            cx="100"
                            cy="105"
                            rx="45"
                            ry="55"
                            fill={`url(#skin-${character})`}
                            opacity="0.9"
                        />

                        {/* Eyes */}
                        <motion.g
                            animate={{
                                scaleY: currentState === 'speaking' ? [1, 0.3, 1] : [1, 0.1, 1],
                            }}
                            transition={{
                                duration: currentState === 'speaking' ? 3 : 4,
                                repeat: Infinity,
                                repeatDelay: currentState === 'speaking' ? 1 : 3,
                            }}
                        >
                            {/* Left eye */}
                            <ellipse cx="85" cy="95" rx="6" ry="8" fill="#3a3a3a" opacity="0.8" />
                            {/* Right eye */}
                            <ellipse cx="115" cy="95" rx="6" ry="8" fill="#3a3a3a" opacity="0.8" />
                        </motion.g>

                        {/* Eyebrows - gentler for Sofi, firmer for Sam */}
                        <path
                            d={character === 'sofi'
                                ? "M 75 85 Q 85 82 95 85"
                                : "M 75 87 Q 85 85 95 87"
                            }
                            stroke="#3a3a3a"
                            strokeWidth="2.5"
                            strokeLinecap="round"
                            opacity="0.6"
                            fill="none"
                        />
                        <path
                            d={character === 'sofi'
                                ? "M 105 85 Q 115 82 125 85"
                                : "M 105 87 Q 115 85 125 87"
                            }
                            stroke="#3a3a3a"
                            strokeWidth="2.5"
                            strokeLinecap="round"
                            opacity="0.6"
                            fill="none"
                        />

                        {/* Nose */}
                        <ellipse cx="100" cy="108" rx="3" ry="5" fill="#d4a99a" opacity="0.5" />

                        {/* Mouth - changes based on state */}
                        <AnimatePresence mode="wait">
                            {currentState === 'speaking' ? (
                                <motion.ellipse
                                    key="speaking"
                                    cx="100"
                                    cy="125"
                                    rx="12"
                                    ry="8"
                                    fill="#c47b6a"
                                    opacity="0.6"
                                    initial={{ scaleY: 0.5 }}
                                    animate={{ scaleY: [0.5, 1, 0.5] }}
                                    exit={{ scaleY: 0.5 }}
                                    transition={{ duration: 0.8, repeat: Infinity }}
                                />
                            ) : (
                                <motion.path
                                    key="idle"
                                    d={character === 'sofi'
                                        ? "M 85 125 Q 100 130 115 125"  // Gentle smile
                                        : "M 90 125 L 110 125"          // Neutral/slight smile
                                    }
                                    stroke="#c47b6a"
                                    strokeWidth="2.5"
                                    strokeLinecap="round"
                                    opacity="0.7"
                                    fill="none"
                                    initial={{ pathLength: 0 }}
                                    animate={{ pathLength: 1 }}
                                    transition={{ duration: 0.5 }}
                                />
                            )}
                        </AnimatePresence>

                        {/* Hair suggestion */}
                        <path
                            d="M 55 70 Q 55 50 75 45 Q 100 40 125 45 Q 145 50 145 70"
                            fill={character === 'sofi' ? '#8b6f47' : '#4a4a4a'}
                            opacity="0.3"
                        />
                    </svg>
                </motion.div>

                {/* State indicator ring */}
                <motion.div
                    className="absolute inset-0 rounded-full border-2"
                    style={{
                        borderColor: theme.primary,
                    }}
                    animate={{
                        scale: currentState === 'listening' ? [1, 1.08, 1] : [1, 1.05, 1],
                        opacity: currentState === 'listening' ? [0.6, 0, 0.6] : [0.4, 0, 0.4],
                    }}
                    transition={{
                        duration: currentState === 'listening' ? 2 : 2.5,
                        repeat: Infinity,
                        ease: 'easeOut',
                    }}
                />

                {/* State label (optional, for debugging) */}
                {process.env.NODE_ENV === 'development' && (
                    <div
                        className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 text-xs"
                        style={{ color: theme.primary }}
                    >
                        {currentState}
                    </div>
                )}
            </div>
        </div>
    );
}
