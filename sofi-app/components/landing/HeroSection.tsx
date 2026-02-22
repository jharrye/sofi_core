'use client';

import { motion } from 'framer-motion';
import RealisticAvatar from '@/components/avatar/RealisticAvatar';
import { colors, spacing, typography } from '@/lib/design/theme';
import { landingCopy } from '@/lib/copy/landing';

export default function HeroSection() {
    return (
        <section
            className="min-h-screen flex flex-col items-center justify-center px-6 py-20"
            style={{ background: colors.background.primary }}
        >
            <div className="max-w-4xl w-full space-y-12">
                {/* Avatar - subtle presence */}
                <motion.div
                    className="flex justify-center"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.8 }}
                >
                    <RealisticAvatar character="sofi" state="idle" size={120} />
                </motion.div>

                {/* Main heading */}
                <motion.div
                    className="text-center space-y-6"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3, duration: 0.6 }}
                >
                    <h1
                        className="text-5xl md:text-6xl font-bold leading-tight"
                        style={{
                            color: colors.text.primary,
                            fontWeight: typography.fontWeight.bold,
                        }}
                    >
                        {landingCopy.hero.title}
                    </h1>

                    <p
                        className="text-xl md:text-2xl whitespace-pre-line"
                        style={{
                            color: colors.text.secondary,
                            lineHeight: typography.lineHeight.relaxed,
                        }}
                    >
                        {landingCopy.hero.subtitle}
                    </p>
                </motion.div>

                {/* CTAs */}
                <motion.div
                    className="flex flex-col sm:flex-row gap-4 justify-center items-center"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.6, duration: 0.6 }}
                >
                    <a
                        href="/auth/signup"
                        className="w-full sm:w-auto px-8 py-4 rounded-full text-lg font-semibold text-center transition-all hover:scale-105"
                        style={{
                            background: colors.sofi.gradient,
                            color: 'white',
                            boxShadow: `0 4px 20px ${colors.sofi.glow}`,
                        }}
                    >
                        {landingCopy.hero.ctaPrimary}
                    </a>

                    <a
                        href="/auth/login"
                        className="w-full sm:w-auto px-8 py-4 rounded-full text-lg font-semibold text-center transition-all hover:bg-white/10"
                        style={{
                            color: colors.text.primary,
                            border: `1px solid ${colors.glass.border}`,
                        }}
                    >
                        {landingCopy.hero.ctaSecondary}
                    </a>
                </motion.div>

                {/* Scroll hint */}
                <motion.div
                    className="text-center pt-12"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.2 }}
                >
                    <p className="text-sm" style={{ color: colors.text.tertiary }}>
                        ↓
                    </p>
                </motion.div>
            </div>
        </section>
    );
}
