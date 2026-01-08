/**
 * Custom hook for translations with additional utilities
 */
import { useMemo } from 'react'
import { useTranslation as useI18nTranslation } from 'react-i18next'

export function useTranslation() {
  const { t, i18n } = useI18nTranslation()

  const currentLanguage = i18n.language
  const isRTL = useMemo(() => {
    // Определяем RTL языки
    const rtlLanguages = ['ar', 'he', 'fa', 'ur']
    return rtlLanguages.includes(currentLanguage)
  }, [currentLanguage])

  const changeLanguage = async (language: string) => {
    await i18n.changeLanguage(language)
  }

  return {
    t,
    i18n,
    currentLanguage,
    isRTL,
    changeLanguage,
  }
}
