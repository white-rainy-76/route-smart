import AsyncStorage from '@react-native-async-storage/async-storage'
import { getLocales } from 'expo-localization'
import i18n from 'i18next'
import 'intl-pluralrules'
import { initReactI18next } from 'react-i18next'

// Импортируем переводы
import en from './translations/en.json'
import ru from './translations/ru.json'

// Определяем RTL языки
const RTL_LANGUAGES = ['ar', 'he', 'fa', 'ur']

// Получаем язык устройства
const getDeviceLanguage = (): string => {
  try {
    const locales = getLocales()
    if (locales && locales.length > 0) {
      return locales[0].languageCode || 'en'
    }
  } catch (error) {
    console.warn('Failed to get device language:', error)
  }
  return 'en'
}

// Загружаем сохранённый язык или используем язык устройства
const loadSavedLanguage = async (): Promise<string> => {
  try {
    const saved = await AsyncStorage.getItem('@app_language')
    if (saved) return saved
  } catch (error) {
    console.warn('Failed to load saved language:', error)
  }
  return getDeviceLanguage()
}

// Инициализация i18n
const initI18n = async () => {
  const savedLanguage = await loadSavedLanguage()
  const language = ['en', 'ru'].includes(savedLanguage) ? savedLanguage : 'en'

  i18n.use(initReactI18next).init({
    resources: {
      en: { translation: en },
      ru: { translation: ru },
    },
    lng: language,
    fallbackLng: 'en',
    compatibilityJSON: 'v4',
    interpolation: {
      escapeValue: false, // React уже экранирует значения
    },
    react: {
      useSuspense: false,
    },
  })

  return language
}

// Инициализируем сразу
initI18n()

export default i18n
export { getDeviceLanguage, RTL_LANGUAGES }
