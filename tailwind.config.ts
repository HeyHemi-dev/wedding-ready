import type { Config } from 'tailwindcss'
import { withUt } from 'uploadthing/tw'

const config = {
  darkMode: ['class'],
  content: ['./pages/**/*.{ts,tsx}', './components/**/*.{ts,tsx}', './app/**/*.{ts,tsx}', './src/**/*.{ts,tsx}'],
  prefix: '',
  theme: {
    container: {
      center: true,
      padding: '2rem',
      screens: {
        '2xl': '1400px',
      },
    },
    extend: {
      gap: {
        strangers: '8rem',
        acquaintances: '4rem',
        friends: '2rem',
        'close-friends': '1.5rem',
        bffs: '1rem',
        siblings: '0.5rem',
        spouses: '0.25rem',
      },
      spacing: {
        siteWidth: '80rem',
        sitePadding: '1.5rem',
        sectionPadding: '6rem',
        headerHeight: '4rem',
        contour: '2px',
        hairline: '1px',
        xxl: '4rem',
        xl: '3rem',
        lg: '2rem',
        md: '1.5rem',
        sm: '1rem',
        xs: '0.5rem',
        xxs: '0.25rem',
        textLength: '80ch',
      },
      height: {
        'svh-minus-header': 'calc(100svh - theme(spacing.headerHeight))',
      },
      minHeight: {
        'svh-minus-header': 'calc(100svh - theme(spacing.headerHeight))',
      },
      gridTemplateColumns: {
        siteLayout: 'minmax(theme(spacing.sitePadding), auto) minmax(0, theme(spacing.siteWidth)) minmax(theme(spacing.sitePadding), auto)',
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
        outside: 'calc(var(--radius) + theme(spacing.contour))',
        inside: 'calc(var(--radius) - theme(spacing.contour))',
        area: 'var(--area-radius)',
        'area-outside': 'calc(var(--area-radius) + theme(spacing.contour))',
        'area-inside': 'calc(var(--area-radius) - theme(spacing.contour))',
        lg: 'calc(var(--radius) * 2)',
        md: 'calc(var(--radius) * 1.5)',
        sm: 'calc(var(--radius) * 0.5)',
        full: 'calc(var(--radius) * 999)',
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
