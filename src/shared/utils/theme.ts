/**
 * Theme utility functions
 *
 * Note: With NativeWind vars() approach, you can now use semantic color classes directly:
 * - bg-background, bg-card, bg-muted
 * - text-foreground, text-card-foreground, text-muted-foreground
 * - border-border
 * - etc.
 *
 * These classes automatically adapt based on the theme set via vars() in ThemeProvider
 */

export type Theme = 'light' | 'dark'

/**
 * Get theme-aware class names
 * Combines base classes with dark mode variants
 */
export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ')
}
