'use client';

import HeroSection from '@/components/landing/HeroSection';
import PricingSection from '@/components/landing/PricingSection';
import { colors, typography } from '@/lib/design/theme';
import { landingCopy } from '@/lib/copy/landing';
import { motion } from 'framer-motion';
import Card from '@/components/ui/Card';

export default function LandingPage() {
    return (
        <div style={{ background: colors.background.primary }}>
            {/* Hero */}
            <HeroSection />

            {/* What Is Section */}
            <section className="py-20 px-6">
                <div className="max-w-4xl mx-auto text-center space-y-8">
                    <motion.h2
                        className="text-4xl md:text-5xl font-bold"
                        style={{ color: colors.text.primary }}
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                    >
                        {landingCopy.whatIs.title}
                    </motion.h2>

                    <motion.div
                        className="space-y-4"
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                    >
                        {landingCopy.whatIs.notItems.map((item, i) => (
                            <p
                                key={i}
                                className="text-xl"
                                style={{
                                    color: colors.text.tertiary,
                                    textDecoration: 'line-through',
                                }}
                            >
                                {item}
                            </p>
                        ))}
                    </motion.div>

                    <motion.p
                        className="text-2xl md:text-3xl font-semibold"
                        style={{ color: colors.sofi.primary }}
                        initial={{ opacity: 0, scale: 0.95 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                    >
                        {landingCopy.whatIs.isText}
                    </motion.p>

                    <motion.p
                        className="text-lg max-w-2xl mx-auto"
                        style={{
                            color: colors.text.secondary,
                            lineHeight: typography.lineHeight.relaxed,
                        }}
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                    >
                        {landingCopy.whatIs.description}
                    </motion.p>
                </div>
            </section>

            {/* How It Works */}
            <section className="py-20 px-6" style={{ background: colors.background.secondary }}>
                <div className="max-w-5xl mx-auto">
                    <h2
                        className="text-4xl md:text-5xl font-bold text-center mb-16"
                        style={{ color: colors.text.primary }}
                    >
                        {landingCopy.howItWorks.title}
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {landingCopy.howItWorks.steps.map((step, index) => (
                            <motion.div
                                key={step.number}
                                initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.1 }}
                                viewport={{ once: true }}
                            >
                                <Card variant="medium" className="h-full">
                                    <div className="p-8 space-y-4">
                                        <div
                                            className="w-12 h-12 rounded-full flex items-center justify-center text-2xl font-bold"
                                            style={{
                                                background: colors.sofi.gradient,
                                                color: 'white',
                                            }}
                                        >
                                            {step.number}
                                        </div>
                                        <h3
                                            className="text-2xl font-semibold"
                                            style={{ color: colors.text.primary }}
                                        >
                                            {step.title}
                                        </h3>
                                        <p style={{ color: colors.text.secondary }}>
                                            {step.description}
                                        </p>
                                    </div>
                                </Card>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Who It's For */}
            <section className="py-20 px-6">
                <div className="max-w-5xl mx-auto">
                    <h2
                        className="text-4xl md:text-5xl font-bold text-center mb-16"
                        style={{ color: colors.text.primary }}
                    >
                        {landingCopy.whoItsFor.title}
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {landingCopy.whoItsFor.personas.map((persona, index) => (
                            <motion.div
                                key={persona.title}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                                viewport={{ once: true }}
                            >
                                <div className="text-center space-y-4 p-6">
                                    <div className="text-5xl">{persona.icon}</div>
                                    <h3
                                        className="text-xl font-semibold"
                                        style={{ color: colors.text.primary }}
                                    >
                                        {persona.title}
                                    </h3>
                                    <p style={{ color: colors.text.secondary }}>
                                        {persona.description}
                                    </p>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Pricing */}
            <PricingSection />

            {/* Trust Section */}
            <section className="py-20 px-6">
                <div className="max-w-5xl mx-auto">
                    <h2
                        className="text-4xl md:text-5xl font-bold text-center mb-16"
                        style={{ color: colors.text.primary }}
                    >
                        {landingCopy.trust.title}
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {landingCopy.trust.items.map((item, index) => (
                            <motion.div
                                key={item.title}
                                className="text-center space-y-4"
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                                viewport={{ once: true }}
                            >
                                <div className="text-5xl">{item.icon}</div>
                                <h3
                                    className="text-xl font-semibold"
                                    style={{ color: colors.text.primary }}
                                >
                                    {item.title}
                                </h3>
                                <p style={{ color: colors.text.secondary }}>
                                    {item.description}
                                </p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Final CTA */}
            <section className="py-20 px-6" style={{ background: colors.background.secondary }}>
                <div className="max-w-3xl mx-auto text-center space-y-8">
                    <motion.h2
                        className="text-4xl md:text-5xl font-bold"
                        style={{ color: colors.text.primary }}
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                    >
                        {landingCopy.finalCTA.title}
                    </motion.h2>

                    <motion.p
                        className="text-xl"
                        style={{ color: colors.text.secondary }}
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                    >
                        {landingCopy.finalCTA.subtitle}
                    </motion.p>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                    >
                        <a
                            href="/auth/signup"
                            className="inline-block px-12 py-4 rounded-full text-lg font-semibold transition-all hover:scale-105"
                            style={{
                                background: colors.sofi.gradient,
                                color: 'white',
                                boxShadow: `0 4px 20px ${colors.sofi.glow}`,
                            }}
                        >
                            {landingCopy.finalCTA.cta}
                        </a>
                    </motion.div>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-12 px-6 border-t" style={{ borderColor: colors.glass.border }}>
                <div className="max-w-6xl mx-auto">
                    <div className="text-center space-y-4">
                        <p
                            className="text-lg font-semibold"
                            style={{ color: colors.text.primary }}
                        >
                            {landingCopy.footer.tagline}
                        </p>
                        <p style={{ color: colors.text.tertiary }}>
                            {landingCopy.footer.description}
                        </p>
                        <div className="flex justify-center gap-6 text-sm">
                            <a href="/privacy" style={{ color: colors.text.secondary }}>
                                {landingCopy.footer.links.privacy}
                            </a>
                            <a href="/terms" style={{ color: colors.text.secondary }}>
                                {landingCopy.footer.links.terms}
                            </a>
                            <a href="/contact" style={{ color: colors.text.secondary }}>
                                {landingCopy.footer.links.contact}
                            </a>
                        </div>
                        <p className="text-sm" style={{ color: colors.text.tertiary }}>
                            {landingCopy.footer.copyright}
                        </p>
                    </div>
                </div>
            </footer>
        </div>
    );
}
