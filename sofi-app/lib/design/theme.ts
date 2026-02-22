// SOFI TE ACOMPAÑA - Design Tokens
// Futuristic, emotional, premium aesthetic

export const colors = {
    // Sofi - Warm, empathetic
    sofi: {
        primary: '#ff6b9d',      // Warm pink
        secondary: '#ffa8c5',    // Light pink
        accent: '#ff4d7d',       // Deep pink
        gradient: 'linear-gradient(135deg, #ff6b9d 0%, #ffa8c5 100%)',
        glow: 'rgba(255, 107, 157, 0.3)',
    },

    // Sam - Cool, structured
    sam: {
        primary: '#4a90e2',      // Cool blue
        secondary: '#7eb3ff',    // Light blue
        accent: '#2c5aa0',       // Deep blue
        gradient: 'linear-gradient(135deg, #4a90e2 0%, #7eb3ff 100%)',
        glow: 'rgba(74, 144, 226, 0.3)',
    },

    // Base colors
    background: {
        primary: '#0a0a0f',      // Deep dark
        secondary: '#12121a',    // Card background
        tertiary: '#1a1a25',     // Elevated surfaces
    },

    text: {
        primary: '#ffffff',
        secondary: 'rgba(255, 255, 255, 0.7)',
        tertiary: 'rgba(255, 255, 255, 0.5)',
    },

    // Glassmorphism
    glass: {
        background: 'rgba(255, 255, 255, 0.05)',
        border: 'rgba(255, 255, 255, 0.1)',
        shadow: 'rgba(0, 0, 0, 0.2)',
    },
};

export const typography = {
    fontFamily: {
        primary: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        secondary: '"Plus Jakarta Sans", sans-serif',
    },

    fontSize: {
        xs: '0.75rem',     // 12px
        sm: '0.875rem',    // 14px
        base: '1rem',      // 16px
        lg: '1.125rem',    // 18px
        xl: '1.25rem',     // 20px
        '2xl': '1.5rem',   // 24px
        '3xl': '2rem',     // 32px
        '4xl': '2.5rem',   // 40px
    },

    fontWeight: {
        normal: 400,
        medium: 500,
        semibold: 600,
        bold: 700,
    },

    lineHeight: {
        tight: 1.2,
        normal: 1.5,
        relaxed: 1.75,
    },
};

export const spacing = {
    xs: '0.25rem',   // 4px
    sm: '0.5rem',    // 8px
    md: '1rem',      // 16px
    lg: '1.5rem',    // 24px
    xl: '2rem',      // 32px
    '2xl': '3rem',   // 48px
    '3xl': '4rem',   // 64px
    '4xl': '6rem',   // 96px
};

export const borderRadius = {
    sm: '0.5rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem',
    full: '9999px',
};

export const shadows = {
    sm: '0 2px 8px rgba(0, 0, 0, 0.1)',
    md: '0 4px 16px rgba(0, 0, 0, 0.15)',
    lg: '0 8px 32px rgba(0, 0, 0, 0.2)',
    glow: (color: string) => `0 0 24px ${color}`,
};

export const animations = {
    duration: {
        fast: '200ms',
        normal: '300ms',
        slow: '400ms',
    },

    easing: {
        easeOut: 'cubic-bezier(0.16, 1, 0.3, 1)',
        easeIn: 'cubic-bezier(0.4, 0, 0.6, 1)',
        easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
    },
};

export const glassmorphism = {
    light: {
        background: 'rgba(255, 255, 255, 0.05)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
    },

    medium: {
        background: 'rgba(255, 255, 255, 0.08)',
        backdropFilter: 'blur(24px)',
        border: '1px solid rgba(255, 255, 255, 0.15)',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.15)',
    },

    heavy: {
        background: 'rgba(255, 255, 255, 0.12)',
        backdropFilter: 'blur(30px)',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
    },
};

// Helper to get avatar theme
export const getAvatarTheme = (avatar: 'sofi' | 'sam' | 'neutral') => {
    if (avatar === 'sofi') return colors.sofi;
    if (avatar === 'sam') return colors.sam;
    return { ...colors.sofi, primary: '#9d9dff' }; // Neutral purple
};
