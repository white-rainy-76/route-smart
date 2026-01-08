/**
 * i18n utility functions
 */

import i18n from '@/i18n/config'
import { format, formatDistance, formatRelative } from 'date-fns'
import { enUS, ru, type Locale } from 'date-fns/locale'

const locales: Record<string, Locale> = {
  en: enUS,
  ru: ru,
}

/**
 * Format a date based on current locale
 */
export function formatDate(
  date: Date | number,
  formatStr: string = 'PPP',
): string {
  const locale = locales[i18n.language] || locales.en
  return format(date, formatStr, { locale })
}

/**
 * Format a relative date (e.g., "2 hours ago")
 */
export function formatRelativeDate(date: Date | number): string {
  const locale = locales[i18n.language] || locales.en
  return formatRelative(date, new Date(), { locale })
}

/**
 * Format a distance date (e.g., "about 2 hours")
 */
export function formatDistanceDate(
  date: Date | number,
  baseDate: Date | number = new Date(),
): string {
  const locale = locales[i18n.language] || locales.en
  return formatDistance(date, baseDate, { locale, addSuffix: true })
}

/**
 * Format a number based on current locale
 */
export function formatNumber(
  value: number,
  options?: Intl.NumberFormatOptions,
): string {
  return new Intl.NumberFormat(i18n.language, options).format(value)
}

/**
 * Format currency based on current locale
 */
export function formatCurrency(
  value: number,
  currency: string = 'USD',
  options?: Intl.NumberFormatOptions,
): string {
  return new Intl.NumberFormat(i18n.language, {
    style: 'currency',
    currency,
    ...options,
  }).format(value)
}

/**
 * Get locale object for date-fns
 */
export function getLocale(): Locale {
  return locales[i18n.language] || locales.en
}
