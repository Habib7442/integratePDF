// Design System Configuration for IntegratePDF Minimal Dark Landing Page
// Optimized for dark mode with high contrast and minimal design

export const designSystem = {
  // Dark Mode Color Palette
  colors: {
    // Dark theme backgrounds
    dark: {
      50: '#fafafa',   // Light mode fallback
      100: '#f5f5f5',  // Light mode fallback
      800: '#1f2937',  // Dark surface
      850: '#1a202c',  // Darker surface
      900: '#111827',  // Primary dark background
      950: '#0f172a'   // Deepest dark background
    },
    // Primary brand colors (adjusted for dark mode)
    primary: {
      50: '#eff6ff',
      100: '#dbeafe',
      400: '#60a5fa',  // Lighter for dark backgrounds
      500: '#3b82f6',  // Main brand blue
      600: '#2563eb',  // Darker blue
      700: '#1d4ed8',
      800: '#1e40af',
      900: '#1e3a8a'
    },
    // Accent colors for highlights
    accent: {
      400: '#a78bfa',  // Purple accent
      500: '#8b5cf6',
      600: '#7c3aed'
    },
    // Neutral grays for dark mode
    neutral: {
      50: '#f9fafb',   // Light text on dark
      100: '#f3f4f6',  // Secondary light text
      200: '#e5e7eb',  // Borders on dark
      300: '#d1d5db',  // Muted text
      400: '#9ca3af',  // Placeholder text
      500: '#6b7280',  // Secondary text
      600: '#4b5563',  // Primary text on light surfaces
      700: '#374151',  // Dark surface text
      800: '#1f2937',  // Dark surface
      900: '#111827'   // Darkest surface
    },
    // Success/positive (adjusted for dark mode)
    success: {
      400: '#34d399',  // Lighter green for dark backgrounds
      500: '#10b981',
      600: '#059669'
    },
    // Warning/attention (adjusted for dark mode)
    warning: {
      400: '#fbbf24',  // Lighter yellow for dark backgrounds
      500: '#f59e0b',
      600: '#d97706'
    },
    // Error/destructive (adjusted for dark mode)
    error: {
      400: '#f87171',  // Lighter red for dark backgrounds
      500: '#ef4444',
      600: '#dc2626'
    }
  },

  // Typography Scale
  typography: {
    // Font families
    fontFamily: {
      sans: ['Inter', 'system-ui', 'sans-serif'],
      mono: ['JetBrains Mono', 'monospace']
    },
    
    // Font sizes (following Tailwind scale)
    fontSize: {
      xs: '0.75rem',
      sm: '0.875rem', 
      base: '1rem',
      lg: '1.125rem',
      xl: '1.25rem',
      '2xl': '1.5rem',
      '3xl': '1.875rem',
      '4xl': '2.25rem',
      '5xl': '3rem',
      '6xl': '3.75rem',
      '7xl': '4.5rem'
    },

    // Line heights
    lineHeight: {
      tight: '1.25',
      snug: '1.375',
      normal: '1.5',
      relaxed: '1.625',
      loose: '2'
    }
  },

  // Spacing Scale
  spacing: {
    section: {
      sm: '4rem',   // 64px
      md: '6rem',   // 96px  
      lg: '8rem',   // 128px
      xl: '10rem'   // 160px
    },
    container: {
      sm: '640px',
      md: '768px', 
      lg: '1024px',
      xl: '1280px',
      '2xl': '1536px'
    }
  },

  // Animation Presets
  animation: {
    // Durations
    duration: {
      fast: 200,
      normal: 300,
      slow: 500,
      slower: 700
    },
    
    // Easing curves
    easing: {
      easeOut: [0.0, 0.0, 0.2, 1],
      easeIn: [0.4, 0.0, 1, 1],
      easeInOut: [0.4, 0.0, 0.2, 1],
      bounce: [0.68, -0.55, 0.265, 1.55]
    },

    // Common animation variants
    variants: {
      fadeInUp: {
        initial: { opacity: 0, y: 20 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.5, ease: [0.0, 0.0, 0.2, 1] }
      },
      fadeInScale: {
        initial: { opacity: 0, scale: 0.95 },
        animate: { opacity: 1, scale: 1 },
        transition: { duration: 0.3, ease: [0.0, 0.0, 0.2, 1] }
      },
      slideInLeft: {
        initial: { opacity: 0, x: -20 },
        animate: { opacity: 1, x: 0 },
        transition: { duration: 0.5, ease: [0.0, 0.0, 0.2, 1] }
      },
      slideInRight: {
        initial: { opacity: 0, x: 20 },
        animate: { opacity: 1, x: 0 },
        transition: { duration: 0.5, ease: [0.0, 0.0, 0.2, 1] }
      }
    }
  },

  // Component Styles
  components: {
    button: {
      primary: {
        base: 'inline-flex items-center justify-center rounded-lg font-semibold transition-all duration-200',
        sizes: {
          sm: 'px-4 py-2 text-sm',
          md: 'px-6 py-3 text-base', 
          lg: 'px-8 py-4 text-lg',
          xl: 'px-10 py-5 text-xl'
        },
        variants: {
          primary: 'bg-primary-600 text-white hover:bg-primary-700 shadow-lg hover:shadow-xl',
          secondary: 'bg-white text-primary-600 border-2 border-primary-600 hover:bg-primary-50',
          ghost: 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100'
        }
      }
    },
    
    card: {
      base: 'bg-white rounded-2xl border border-neutral-200 shadow-sm hover:shadow-lg transition-shadow duration-300',
      variants: {
        elevated: 'shadow-lg hover:shadow-xl',
        flat: 'border-neutral-100 shadow-none hover:shadow-sm'
      }
    }
  },

  // Breakpoints
  breakpoints: {
    sm: '640px',
    md: '768px',
    lg: '1024px', 
    xl: '1280px',
    '2xl': '1536px'
  }
} as const;

// Helper functions for consistent styling
export const getSpacing = (size: keyof typeof designSystem.spacing.section) => 
  designSystem.spacing.section[size];

export const getColor = (color: string, shade: number = 500) => {
  const [colorName, colorShade] = color.includes('-') ? color.split('-') : [color, shade.toString()];
  return designSystem.colors[colorName as keyof typeof designSystem.colors]?.[colorShade as keyof typeof designSystem.colors.primary];
};

export const getAnimation = (variant: keyof typeof designSystem.animation.variants) =>
  designSystem.animation.variants[variant];
