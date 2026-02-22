import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import RealisticAvatar from '@/components/avatar/RealisticAvatar';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { colors, spacing, typography } from '@/lib/design/theme';

export default function HomePage() {
  const [profile, setProfile] = useState<{ avatar_choice: 'sofi' | 'sam' | 'neutral' } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // TODO: Load user profile from Supabase
    // For now, default to Sofi
    setProfile({ avatar_choice: 'sofi' });
    setLoading(false);
  }, []);

  if (loading) {
    return <div className="min-h-screen bg-background-primary flex items-center justify-center">
      <div className="text-white">Cargando...</div>
    </div>;
  }

  const avatarChoice = (profile?.avatar_choice === 'sam' || profile?.avatar_choice === 'sofi')
    ? profile.avatar_choice
    : 'sofi';
  const welcomeMessage = avatarChoice === 'sam'
    ? {
      greeting: 'Hola, soy Sam.',
      description: 'Este espacio es para ayudarte a ordenar lo que llevas.',
    }
    : {
      greeting: 'Hola, soy Sofi.',
      description: 'Este es un espacio para acompañarte, no para juzgarte.',
    };

  const actions = [
    {
      title: 'Hablar ahora',
      description: 'Inicia una conversación',
      icon: '💬',
      href: '/interact',
    },
    {
      title: 'Cómo me siento',
      description: 'Explora tus emociones',
      icon: '❤️',
      href: '/feelings',
    },
    {
      title: 'Ejercicio rápido',
      description: '5 minutos de calma',
      icon: '🧘',
      href: '/exercise',
    },
    {
      title: 'Biblioteca',
      description: 'Recursos y guías',
      icon: '📚',
      href: '/library',
    },
  ];

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center p-6"
      style={{
        background: colors.background.primary,
        fontFamily: typography.fontFamily.primary,
      }}
    >
      <div className="max-w-2xl w-full space-y-12">
        {/* Avatar Section */}
        <motion.div
          className="flex flex-col items-center space-y-6"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <RealisticAvatar character={avatarChoice} state="idle" size={180} />

          <div className="text-center space-y-2">
            <h1
              className="text-4xl font-bold"
              style={{
                color: colors.text.primary,
                fontWeight: typography.fontWeight.bold,
              }}
            >
              {welcomeMessage.greeting}
            </h1>
            <p
              className="text-xl"
              style={{
                color: colors.text.secondary,
                lineHeight: typography.lineHeight.relaxed,
              }}
            >
              {welcomeMessage.description}
            </p>
          </div>
        </motion.div>

        {/* Action Cards */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 gap-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.6 }}
        >
          {actions.map((action, index) => (
            <motion.a
              key={action.title}
              href={action.href}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 + index * 0.1 }}
            >
              <Card variant="medium" hover className="h-full">
                <div
                  className="p-6 space-y-3"
                  style={{ cursor: 'pointer' }}
                >
                  <div className="text-4xl">{action.icon}</div>
                  <h2
                    className="text-2xl font-semibold"
                    style={{
                      color: colors.text.primary,
                      fontWeight: typography.fontWeight.semibold,
                    }}
                  >
                    {action.title}
                  </h2>
                  <p style={{ color: colors.text.tertiary }}>
                    {action.description}
                  </p>
                </div>
              </Card>
            </motion.a>
          ))}
        </motion.div>

        {/* Bottom Navigation Hint */}
        <motion.div
          className="text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
        >
          <p
            className="text-sm"
            style={{ color: colors.text.tertiary }}
          >
            Un espacio diseñado para ti
          </p>
        </motion.div>
      </div>
    </div>
  );
}
