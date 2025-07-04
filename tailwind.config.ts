import type { Config } from 'tailwindcss'
import { withUt } from 'uploadthing/tw'

const config = {
  darkMode: ['class'],
  content: ['./pages/**/*.{ts,tsx}', './components/**/*.{ts,tsx}', './app/**/*.{ts,tsx}', './src/**/*.{ts,tsx}'],
  prefix: '',
  theme: {
    screens: {
      // mobile first. Breakpoint names apply to screen sizes larger than the pixel breakpoint value.
      tablet: '450px',
      laptop: '850px',
      wide: '1550px',
    },

    extend: {
      gap: {
        stranger: 'var(--gap-stranger)',
        acquaintance: 'var(--gap-acquaintance)',
        friend: 'var(--gap-friend)',
        'close-friend': 'var(--gap-close-friend)',
        sibling: 'var(--gap-sibling)',
        partner: 'var(--gap-partner)',
        spouse: 'var(--gap-spouse)',
        area: 'var(--gap-area)',
      },
      spacing: {
        hairline: 'var(--hairline)',
        xxl: '4rem',
        xl: '3rem',
        lg: '2rem',
        md: '1.5rem',
        sm: '1rem',
        xs: '0.5rem',
        xxs: '0.25rem',
      },
      padding: {
        site: 'var(--padding-site-gutter)',
        section: 'var(--padding-section)',
        contour: 'var(--padding-contour)',
        area: 'var(--padding-area)',
      },
      width: {
        site: 'var(--width-site)',
        prose: 'var(--width-prose)',
      },
      height: {
        'header-content': 'var(--height-header-content)',
        header: 'var(--height-header)',
        'action-bar': 'calc(var(--radius-area) * 2)',
      },
      minHeight: {
        'svh-minus-header': 'calc(100svh - theme(height.header))',
      },
      gridTemplateColumns: {
        siteLayout: 'var(--site-layout)',
      },
      colors: {
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        area: {
          DEFAULT: 'hsl(var(--area))',
          foreground: 'hsl(var(--area-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
      },
      borderRadius: {
        DEFAULT: 'var(--radius)',
        outside: 'calc(var(--radius) + theme(padding.contour))',
        inside: 'calc(var(--radius) - theme(padding.contour))',
        area: 'var(--radius-area)',
        'area-outside': 'calc(var(--radius-area) + theme(padding.contour))',
        'area-inside': 'calc(var(--radius-area) - theme(padding.contour))',
        lg: 'calc(var(--radius) * 2)',
        md: 'calc(var(--radius) * 1.5)',
        sm: 'calc(var(--radius) * 0.5)',
        full: 'calc(var(--radius) * 999)',
      },
      boxShadow: {
        contour: '0 0 0 theme(padding.contour) hsl(var(--primary))',
      },
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
} satisfies Config

export default withUt(config)
