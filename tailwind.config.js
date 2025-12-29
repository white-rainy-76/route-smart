/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Используем CSS переменные для динамических тем
        background: 'rgb(var(--color-background) / <alpha-value>)',
        foreground: 'rgb(var(--color-foreground) / <alpha-value>)',
        card: 'rgb(var(--color-card) / <alpha-value>)',
        'card-foreground': 'rgb(var(--color-card-foreground) / <alpha-value>)',
        muted: 'rgb(var(--color-muted) / <alpha-value>)',
        'muted-foreground':
          'rgb(var(--color-muted-foreground) / <alpha-value>)',
        accent: 'rgb(var(--color-accent) / <alpha-value>)',
        'accent-foreground':
          'rgb(var(--color-accent-foreground) / <alpha-value>)',
        border: 'rgb(var(--color-border) / <alpha-value>)',
        input: 'rgb(var(--color-input) / <alpha-value>)',
        primary: 'rgb(var(--color-primary) / <alpha-value>)',
        'primary-foreground':
          'rgb(var(--color-primary-foreground) / <alpha-value>)',
        secondary: 'rgb(var(--color-secondary) / <alpha-value>)',
        'secondary-foreground':
          'rgb(var(--color-secondary-foreground) / <alpha-value>)',
        destructive: 'rgb(var(--color-destructive) / <alpha-value>)',
        'destructive-foreground':
          'rgb(var(--color-destructive-foreground) / <alpha-value>)',
      },
    },
  },
  plugins: [
    // Устанавливаем значения по умолчанию для светлой темы
    ({ addBase }) =>
      addBase({
        ':root': {
          '--color-background': '255 255 255',
          '--color-foreground': '17 24 28',
          '--color-card': '255 255 255',
          '--color-card-foreground': '17 24 28',
          '--color-muted': '241 245 249',
          '--color-muted-foreground': '100 116 139',
          '--color-accent': '241 245 249',
          '--color-accent-foreground': '15 23 42',
          '--color-border': '226 232 240',
          '--color-input': '226 232 240',
          '--color-primary': '10 126 164',
          '--color-primary-foreground': '255 255 255',
          '--color-secondary': '241 245 249',
          '--color-secondary-foreground': '15 23 42',
          '--color-destructive': '239 68 68',
          '--color-destructive-foreground': '255 255 255',
        },
      }),
  ],
}
