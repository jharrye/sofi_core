'use client';

import { useEffect, useState } from 'react';
import MetricCard from '@/components/admin/MetricCard';
import { getDashboardStats } from '@/lib/admin/queries';
import { colors, typography } from '@/lib/design/theme';

export default function AdminDashboard() {
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadStats() {
            const data = await getDashboardStats();
            setStats(data);
            setLoading(false);
        }
        loadStats();
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <p style={{ color: colors.text.secondary }}>Cargando estadísticas...</p>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* Header */}
            <div>
                <h1
                    className="text-4xl font-bold mb-2"
                    style={{
                        color: colors.text.primary,
                        fontWeight: typography.fontWeight.bold,
                    }}
                >
                    Dashboard
                </h1>
                <p style={{ color: colors.text.secondary }}>
                    Resumen general de Sofi te Acompaña
                </p>
            </div>

            {/* Main metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <MetricCard
                    title="Usuarios totales"
                    value={stats?.total_users || 0}
                    icon="👥"
                />
                <MetricCard
                    title="Activos (7 días)"
                    value={stats?.active_users_7d || 0}
                    icon="📊"
                />
                <MetricCard
                    title="Trials activos"
                    value={stats?.active_trials || 0}
                    icon="🎁"
                />
                <MetricCard
                    title="Conversión"
                    value={`${stats?.trial_to_paid_conversion || 0}%`}
                    icon="💰"
                    subtitle="Trial → Pago"
                />
            </div>

            {/* Secondary metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <MetricCard
                    title="Activos (30 días)"
                    value={stats?.active_users_30d || 0}
                />
                <MetricCard
                    title="Suscripciones activas"
                    value={stats?.active_subscriptions || 0}
                />
                <MetricCard
                    title="Mensajes totales"
                    value={stats?.total_messages || 0}
                />
                <MetricCard
                    title="Conversaciones"
                    value={stats?.total_conversations || 0}
                />
            </div>

            {/* Quick actions */}
            <div className="mt-12">
                <h2
                    className="text-2xl font-semibold mb-4"
                    style={{ color: colors.text.primary }}
                >
                    Acciones rápidas
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <a
                        href="/admin/users"
                        className="p-6 rounded-xl transition-all hover:scale-105"
                        style={{
                            background: colors.glass.background,
                            border: `1px solid ${colors.glass.border}`,
                            color: colors.text.primary,
                        }}
                    >
                        <div className="text-2xl mb-2">👥</div>
                        <h3 className="font-semibold">Ver usuarios</h3>
                        <p className="text-sm" style={{ color: colors.text.tertiary }}>
                            Gestionar usuarios y suscripciones
                        </p>
                    </a>

                    <a
                        href="/admin/events"
                        className="p-6 rounded-xl transition-all hover:scale-105"
                        style={{
                            background: colors.glass.background,
                            border: `1px solid ${colors.glass.border}`,
                            color: colors.text.primary,
                        }}
                    >
                        <div className="text-2xl mb-2">🔔</div>
                        <h3 className="font-semibold">Eventos recientes</h3>
                        <p className="text-sm" style={{ color: colors.text.tertiary }}>
                            Ver actividad del sistema
                        </p>
                    </a>

                    <a
                        href="/admin/settings"
                        className="p-6 rounded-xl transition-all hover:scale-105"
                        style={{
                            background: colors.glass.background,
                            border: `1px solid ${colors.glass.border}`,
                            color: colors.text.primary,
                        }}
                    >
                        <div className="text-2xl mb-2">⚙️</div>
                        <h3 className="font-semibold">Configuración</h3>
                        <p className="text-sm" style={{ color: colors.text.tertiary }}>
                            Feature flags y ajustes
                        </p>
                    </a>
                </div>
            </div>
        </div>
    );
}
