/**
 * RTL (Right-to-Left) utility functions
 */

import { I18nManager } from 'react-native'

/**
 * Check if current language is RTL
 */
export function isRTL(language?: string): boolean {
  const rtlLanguages = ['ar', 'he', 'fa', 'ur']
  const currentLanguage =
    language || I18nManager.getConstants().localeIdentifier?.split('_')[0]
  return rtlLanguages.includes(currentLanguage || '')
}

/**
 * Get RTL-aware style properties
 * Use start/end instead of left/right for better RTL support
 */
export function getRTLStyle(style: {
  left?: number
  right?: number
  marginLeft?: number
  marginRight?: number
  paddingLeft?: number
  paddingRight?: number
}) {
  const rtl = I18nManager.isRTL

  return {
    ...(style.left !== undefined && {
      [rtl ? 'right' : 'left']: style.left,
    }),
    ...(style.right !== undefined && {
      [rtl ? 'left' : 'right']: style.right,
    }),
    ...(style.marginLeft !== undefined && {
      [rtl ? 'marginRight' : 'marginLeft']: style.marginLeft,
    }),
    ...(style.marginRight !== undefined && {
      [rtl ? 'marginLeft' : 'marginRight']: style.marginRight,
    }),
    ...(style.paddingLeft !== undefined && {
      [rtl ? 'paddingRight' : 'paddingLeft']: style.paddingLeft,
    }),
    ...(style.paddingRight !== undefined && {
      [rtl ? 'paddingLeft' : 'paddingRight']: style.paddingRight,
    }),
  }
}

/**
 * Flip icon horizontally for RTL
 */
export function getRTLTransform() {
  return I18nManager.isRTL ? [{ scaleX: -1 }] : []
}
