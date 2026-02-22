'use client';

import { motion } from 'framer-motion';
import { colors, typography } from '@/lib/design/theme';

interface MetricCardProps {
    title: string;
    value: string | number;
    subtitle?: string;
    icon?: string;
    trend?: {
        value: number;
        isPositive: boolean;
    };
}

export default function MetricCard({ title, value, subtitle, icon, trend }: MetricCardProps) {
    return (
        <motion.div
            className="p-6 rounded-xl"
            style={{
                background: colors.glass.background,
                backdropFilter: 'blur(20px)',
                border: `1px solid ${colors.glass.border}`,
            }}
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.2 }}
        >
            <div className="flex items-start justify-between">
                <div className="space-y-2">
                    <p className="text-sm" style={{ color: colors.text.tertiary }}>
                        {title}
                    </p>
                    <p
                        className="text-3xl font-bold"
                        style={{
                            color: colors.text.primary,
                            fontWeight: typography.fontWeight.bold,
                        }}
                    >
                        {value}
                    </p>
                    {subtitle && (
                        <p className="text-sm" style={{ color: colors.text.secondary }}>
                            {subtitle}
                        </p>
                    )}
                </div>

                {icon && (
                    <div className="text-3xl opacity-50">{icon}</div>
                )}
            </div>

            {trend && (
                <div
                    className="mt-4 text-sm flex items-center gap-1"
                    style={{
                        color: trend.isPositive ? '#4ade80' : '#f87171',
                    }}
                >
                    <span>{trend.isPositive ? '↑' : '↓'}</span>
                    <span>{Math.abs(trend.value)}%</span>
                </div>
            )}
        </motion.div>
    );
}
