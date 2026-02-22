'use client';

import { motion } from 'framer-motion';
import Card from '@/components/ui/Card';
import { colors, typography, spacing } from '@/lib/design/theme';
import { landingCopy } from '@/lib/copy/landing';

export default function PricingSection() {
    const plans = [landingCopy.pricing.trial, landingCopy.pricing.monthly, landingCopy.pricing.annual];

    return (
        <section
            className="py-20 px-6"
            style={{ background: colors.background.secondary }}
            id="pricing"
        >
            <div className="max-w-6xl mx-auto">
                {/* Title */}
                <div className="text-center mb-12 space-y-4">
                    <h2
                        className="text-4xl md:text-5xl font-bold"
                        style={{
                            color: colors.text.primary,
                            fontWeight: typography.fontWeight.bold,
                        }}
                    >
                        {landingCopy.pricing.title}
                    </h2>
                    <p
                        className="text-lg max-w-2xl mx-auto"
                        style={{
                            color: colors.text.secondary,
                            lineHeight: typography.lineHeight.relaxed,
                        }}
                    >
                        {landingCopy.pricing.description}
                    </p>
                </div>

                {/* Pricing cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {plans.map((plan, index) => (
                        <motion.div
                            key={plan.name}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            viewport={{ once: true }}
                        >
                            <Card
                                variant={plan.highlight ? 'heavy' : 'medium'}
                                className="h-full relative"
                            >
                                {plan.highlight && (
                                    <div
                                        className="absolute -top-4 left-1/2 transform -translate-x-1/2 px-4 py-1 rounded-full text-sm font-semibold"
                                        style={{
                                            background: colors.sofi.gradient,
                                            color: 'white',
                                        }}
                                    >
                                        Recomendado
                                    </div>
                                )}

                                <div className="p-8 space-y-6">
                                    {/* Plan name */}
                                    <div>
                                        <h3
                                            className="text-2xl font-semibold"
                                            style={{
                                                color: colors.text.primary,
                                                fontWeight: typography.fontWeight.semibold,
                                            }}
                                        >
                                            {plan.name}
                                        </h3>
                                    </div>

                                    {/* Price */}
                                    <div>
                                        <div className="flex items-baseline gap-2">
                                            <span
                                                className="text-5xl font-bold"
                                                style={{ color: colors.text.primary }}
                                            >
                                                {plan.price}
                                            </span>
                                            <span style={{ color: colors.text.tertiary }}>
                                                / {plan.period}
                                            </span>
                                        </div>
                                        {plan.savings && (
                                            <p
                                                className="text-sm mt-2"
                                                style={{ color: colors.sofi.primary }}
                                            >
                                                {plan.savings}
                                            </p>
                                        )}
                                    </div>

                                    {/* Features */}
                                    <ul className="space-y-3">
                                        {plan.features.map((feature, i) => (
                                            <li
                                                key={i}
                                                className="flex items-start gap-2"
                                                style={{ color: colors.text.secondary }}
                                            >
                                                <span style={{ color: colors.sofi.primary }}>✓</span>
                                                <span>{feature}</span>
                                            </li>
                                        ))}
                                    </ul>

                                    {/* CTA */}
                                    <a
                                        href={plan.highlight ? '/auth/signup' : '/auth/signup?plan=' + plan.name.toLowerCase()}
                                        className="block w-full py-3 rounded-full text-center font-semibold transition-all hover:scale-105"
                                        style={{
                                            background: plan.highlight ? colors.sofi.gradient : 'transparent',
                                            color: plan.highlight ? 'white' : colors.sofi.primary,
                                            border: plan.highlight ? 'none' : `2px solid ${colors.sofi.primary}`,
                                        }}
                                    >
                                        {plan.cta}
                                    </a>
                                </div>
                            </Card>
                        </motion.div>
                    ))}
                </div>

                {/* Trust note */}
                <motion.p
                    className="text-center mt-12 text-sm"
                    style={{ color: colors.text.tertiary }}
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                >
                    💳 No necesitas tarjeta para el trial de 15 días
                </motion.p>
            </div>
        </section>
    );
}
