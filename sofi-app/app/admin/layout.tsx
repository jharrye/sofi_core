'use client';

import { ReactNode } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { colors, typography } from '@/lib/design/theme';

interface AdminLayoutProps {
    children: ReactNode;
}

const navItems = [
    { href: '/admin', label: 'Dashboard', icon: '📊' },
    { href: '/admin/users', label: 'Usuarios', icon: '👥' },
    { href: '/admin/usage', label: 'Uso', icon: '📈' },
    { href: '/admin/events', label: 'Eventos', icon: '🔔' },
    { href: '/admin/settings', label: 'Configuración', icon: '⚙️' },
];

export default function AdminLayout({ children }: AdminLayoutProps) {
    const pathname = usePathname();

    return (
        <div className="flex min-h-screen" style={{ background: colors.background.primary }}>
            {/* Sidebar */}
            <aside
                className="w-64 border-r"
                style={{
                    borderColor: colors.glass.border,
                    background: colors.background.secondary,
                }}
            >
                <div className="p-6">
                    <h1
                        className="text-2xl font-bold mb-8"
                        style={{ color: colors.text.primary }}
                    >
                        Admin Panel
                    </h1>

                    <nav className="space-y-2">
                        {navItems.map(item => {
                            const isActive = pathname === item.href;
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className="flex items-center gap-3 px-4 py-3 rounded-lg transition-colors"
                                    style={{
                                        background: isActive ? colors.glass.background : 'transparent',
                                        color: isActive ? colors.sofi.primary : colors.text.secondary,
                                        fontWeight: isActive ? typography.fontWeight.semibold : typography.fontWeight.normal,
                                    }}
                                >
                                    <span>{item.icon}</span>
                                    <span>{item.label}</span>
                                </Link>
                            );
                        })}
                    </nav>
                </div>

                {/* User info */}
                <div className="absolute bottom-0 w-64 p-6 border-t" style={{ borderColor: colors.glass.border }}>
                    <div className="flex items-center gap-3">
                        <div
                            className="w-10 h-10 rounded-full flex items-center justify-center"
                            style={{ background: colors.sofi.gradient }}
                        >
                            👤
                        </div>
                        <div>
                            <p className="text-sm font-semibold" style={{ color: colors.text.primary }}>
                                Admin
                            </p>
                            <a
                                href="/api/auth/signout"
                                className="text-xs"
                                style={{ color: colors.text.tertiary }}
                            >
                                Cerrar sesión
                            </a>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Main content */}
            <main className="flex-1 p-8">
                {children}
            </main>
        </div>
    );
}
