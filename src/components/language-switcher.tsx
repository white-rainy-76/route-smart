import { useTranslation } from '@/shared/hooks/use-translation'
import { RTL_LANGUAGES } from '@/i18n/config'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { I18nManager, Pressable, Text, View } from 'react-native'
import RNRestart from 'react-native-restart'

const LANGUAGES = [
  { code: 'en', name: 'English', nativeName: 'English' },
  { code: 'ru', name: 'Russian', nativeName: 'Русский' },
]

export function LanguageSwitcher() {
  const { currentLanguage, changeLanguage, t } = useTranslation()

  const handleLanguageChange = async (languageCode: string) => {
    try {
      await changeLanguage(languageCode)
      await AsyncStorage.setItem('@app_language', languageCode)

      // Проверяем, нужен ли RTL
      const isRTL = RTL_LANGUAGES.includes(languageCode)

      if (I18nManager.isRTL !== isRTL) {
        I18nManager.forceRTL(isRTL)
        // Перезапускаем приложение для применения RTL
        RNRestart.restart()
      }
    } catch (error) {
      console.warn('Failed to change language:', error)
    }
  }

  return (
    <View className="gap-2">
      <Text className="text-card-foreground font-semibold mb-2">
        {t('language.changeLanguage')}
      </Text>
      {LANGUAGES.map((lang) => (
        <Pressable
          key={lang.code}
          onPress={() => handleLanguageChange(lang.code)}
          className={`bg-card border border-border rounded-lg p-4 active:opacity-80 ${
            currentLanguage === lang.code ? 'border-primary' : ''
          }`}>
          <View className="flex-row items-center justify-between">
            <View>
              <Text className="text-card-foreground font-medium">
                {lang.nativeName}
              </Text>
              <Text className="text-muted-foreground text-xs mt-0.5">
                {lang.name}
              </Text>
            </View>
            {currentLanguage === lang.code && (
              <View className="w-2 h-2 bg-primary rounded-full" />
            )}
          </View>
        </Pressable>
      ))}
    </View>
  )
}
