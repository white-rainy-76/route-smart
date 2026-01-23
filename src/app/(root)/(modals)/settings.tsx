import { Button } from '@/components/ui/button'
import { Typography } from '@/components/ui/typography'
import { RTL_LANGUAGES } from '@/i18n/config'
import { useLocation } from '@/shared/hooks/use-location'
import { useTheme } from '@/shared/hooks/use-theme'
import { useTranslation } from '@/shared/hooks/use-translation'
import { startLocationTracking, stopLocationTracking } from '@/shared/location'
import { MaterialIcons } from '@expo/vector-icons'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { router } from 'expo-router'
import { useEffect, useRef } from 'react'
import {
  Alert,
  AppState,
  I18nManager,
  Linking,
  Pressable,
  ScrollView,
  TouchableOpacity,
  View,
} from 'react-native'
import RNRestart from 'react-native-restart'

const LANGUAGES = [
  { code: 'en', name: 'English', nativeName: 'English', icon: 'language' },
  { code: 'ru', name: 'Russian', nativeName: 'Русский', icon: 'language' },
]

const THEMES = [
  {
    value: 'light',
    label: 'Light',
    icon: 'wb-sunny',
    color: '#F59E0B',
  },
  {
    value: 'dark',
    label: 'Dark',
    icon: 'nights-stay',
    color: '#6366F1',
  },
  {
    value: 'system',
    label: 'System',
    icon: 'phone-android',
    color: '#10B981',
  },
]

export default function SettingsScreen() {
  const { t } = useTranslation()
  const { theme, setTheme, resolvedTheme } = useTheme()
  const { permissionStatus, requestPermission, checkPermissionStatus } =
    useLocation()
  const { currentLanguage, changeLanguage } = useTranslation()
  const appState = useRef(AppState.currentState)

  // Проверяем статус разрешений при возврате приложения из настроек
  useEffect(() => {
    const subscription = AppState.addEventListener(
      'change',
      async (nextAppState) => {
        if (
          appState.current.match(/inactive|background/) &&
          nextAppState === 'active'
        ) {
          // Приложение вернулось в фокус - проверяем статус разрешений
          const previousStatus = permissionStatus?.granted ?? false
          await checkPermissionStatus()

          // Небольшая задержка, чтобы checkPermissionStatus успел обновить состояние
          setTimeout(async () => {
            // Проверяем статус разрешений напрямую через API
            const Location = await import('expo-location')
            const status = await Location.getForegroundPermissionsAsync()

            // Если разрешение только что получено, перезапускаем location tracking
            if (!previousStatus && status.status === 'granted') {
              stopLocationTracking()
              await startLocationTracking()
            }
          }, 200)
        }
        appState.current = nextAppState
      },
    )

    return () => {
      subscription.remove()
    }
  }, [checkPermissionStatus, permissionStatus])

  // Theme colors
  const textColor = resolvedTheme === 'dark' ? '#F8FAFC' : '#111827'
  const mutedColor = resolvedTheme === 'dark' ? '#94A3B8' : '#6B7280'
  const borderColor = resolvedTheme === 'dark' ? '#334155' : '#E5E7EB'
  const cardBg = resolvedTheme === 'dark' ? '#1E293B' : '#FFFFFF'
  const sectionHeaderColor = resolvedTheme === 'dark' ? '#CBD5E1' : '#475569'
  const activeBg = resolvedTheme === 'dark' ? '#1E3A8A' : '#EFF6FF'
  const iconBg = resolvedTheme === 'dark' ? '#334155' : '#F1F5F9'

  const handleRequestLocation = async () => {
    const granted = await requestPermission()
    if (granted) {
      Alert.alert(t('settings.locationGranted'))
    } else {
      if (!permissionStatus?.canAskAgain) {
        Alert.alert(
          t('settings.locationDenied'),
          t('location.permissionDeniedDescription'),
          [
            {
              text: t('common.cancel'),
              style: 'cancel',
            },
            {
              text: t('settings.openDeviceSettings'),
              onPress: () => Linking.openSettings(),
            },
          ],
        )
      }
    }
    checkPermissionStatus()
  }

  const handleOpenSettings = async () => {
    try {
      await Linking.openSettings()
    } catch {
      Alert.alert(t('common.error'), 'Failed to open settings')
    }
  }

  const handleLanguageChange = async (languageCode: string) => {
    try {
      await changeLanguage(languageCode)
      await AsyncStorage.setItem('@app_language', languageCode)

      const isRTL = RTL_LANGUAGES.includes(languageCode)
      if (I18nManager.isRTL !== isRTL) {
        I18nManager.forceRTL(isRTL)
        RNRestart.restart()
      }
    } catch (error) {
      console.warn('Failed to change language:', error)
    }
  }

  const handleThemeChange = (themeValue: 'light' | 'dark' | 'system') => {
    setTheme(themeValue)
  }

  const isLocationGranted = permissionStatus?.granted ?? false
  const canRequestLocation = permissionStatus?.canAskAgain ?? true

  const getThemeLabel = (themeValue: string) => {
    switch (themeValue) {
      case 'light':
        return t('home.lightTheme')
      case 'dark':
        return t('home.darkTheme')
      case 'system':
        return t('home.systemTheme')
      default:
        return themeValue
    }
  }

  const getActiveThemeValue = () => {
    return theme || 'system'
  }

  const SectionHeader = ({ title }: { title: string }) => (
    <View className="px-5 mb-3 mt-6">
      <Typography
        variant="label"
        weight="600"
        style={{ color: sectionHeaderColor, fontSize: 13, letterSpacing: 0.5 }}>
        {title.toUpperCase()}
      </Typography>
    </View>
  )

  const SettingCard = ({ children }: { children: React.ReactNode }) => (
    <View
      className="mx-5 rounded-2xl overflow-hidden"
      style={{
        backgroundColor: cardBg,
        borderWidth: 1,
        borderColor: borderColor,
        shadowColor: resolvedTheme === 'dark' ? '#000' : '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: resolvedTheme === 'dark' ? 0.3 : 0.05,
        shadowRadius: 3,
        elevation: 2,
      }}>
      {children}
    </View>
  )

  return (
    <View className="flex-1 bg-background">
      {/* Header */}
      <View className="flex-row items-center px-5 pt-20 pb-5 bg-background">
        <View className="w-10 items-start">
          <TouchableOpacity
            onPress={() => router.back()}
            className="w-10 h-10 items-center justify-center rounded-full active:opacity-70"
            style={{ backgroundColor: iconBg }}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <MaterialIcons name="arrow-back" size={24} color={textColor} />
          </TouchableOpacity>
        </View>
        <View className="flex-1 items-center">
          <Typography variant="h1" weight="700" className="text-foreground">
            {t('settings.title')}
          </Typography>
        </View>
        <View className="w-10" />
      </View>

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 32 }}>
        {/* Theme Section */}
        <SectionHeader title={t('settings.theme')} />
        <SettingCard>
          {THEMES.map((themeOption, index) => {
            const isActive = getActiveThemeValue() === themeOption.value
            return (
              <Pressable
                key={themeOption.value}
                onPress={() =>
                  handleThemeChange(
                    themeOption.value as 'light' | 'dark' | 'system',
                  )
                }
                className="flex-row items-center px-5 py-4 active:opacity-70"
                style={
                  index !== THEMES.length - 1
                    ? {
                        borderBottomWidth: 1,
                        borderBottomColor: borderColor,
                      }
                    : undefined
                }>
                <View
                  className="w-10 h-10 rounded-xl items-center justify-center mr-4"
                  style={{
                    backgroundColor: isActive ? `${themeOption.color}20` : iconBg,
                  }}>
                  <MaterialIcons
                    name={themeOption.icon as keyof typeof MaterialIcons.glyphMap}
                    size={22}
                    color={isActive ? themeOption.color : mutedColor}
                  />
                </View>
                <View className="flex-1">
                  <Typography
                    variant="body"
                    weight="600"
                    style={{
                      color: textColor,
                      fontSize: 16,
                    }}>
                    {getThemeLabel(themeOption.value)}
                  </Typography>
                </View>
                {isActive && (
                  <View
                    className="w-6 h-6 rounded-full items-center justify-center"
                    style={{ backgroundColor: '#4964D8' }}>
                    <MaterialIcons name="check" size={16} color="#FFFFFF" />
                  </View>
                )}
              </Pressable>
            )
          })}
        </SettingCard>

        {/* Language Section */}
        <SectionHeader title={t('settings.language')} />
        <SettingCard>
          {LANGUAGES.map((lang, index) => {
            const isActive = currentLanguage === lang.code
            return (
              <Pressable
                key={lang.code}
                onPress={() => handleLanguageChange(lang.code)}
                className="flex-row items-center px-5 py-4 active:opacity-70"
                style={
                  index !== LANGUAGES.length - 1
                    ? {
                        borderBottomWidth: 1,
                        borderBottomColor: borderColor,
                      }
                    : undefined
                }>
                <View
                  className="w-10 h-10 rounded-xl items-center justify-center mr-4"
                  style={{
                    backgroundColor: isActive ? activeBg : iconBg,
                  }}>
                  <MaterialIcons
                    name={lang.icon as keyof typeof MaterialIcons.glyphMap}
                    size={22}
                    color={isActive ? '#4964D8' : mutedColor}
                  />
                </View>
                <View className="flex-1">
                  <Typography
                    variant="body"
                    weight="600"
                    style={{ color: textColor, fontSize: 16, marginBottom: 2 }}>
                    {lang.nativeName}
                  </Typography>
                  <Typography
                    variant="caption"
                    style={{ color: mutedColor, fontSize: 13 }}>
                    {lang.name}
                  </Typography>
                </View>
                {isActive && (
                  <View
                    className="w-6 h-6 rounded-full items-center justify-center"
                    style={{ backgroundColor: '#4964D8' }}>
                    <MaterialIcons name="check" size={16} color="#FFFFFF" />
                  </View>
                )}
              </Pressable>
            )
          })}
        </SettingCard>

        {/* Location Section */}
        <SectionHeader title={t('settings.location')} />
        <SettingCard>
          <View className="px-5 py-4">
            <View className="flex-row items-center mb-3">
              <View
                className="w-10 h-10 rounded-xl items-center justify-center mr-4"
                style={{
                  backgroundColor: isLocationGranted ? '#10B98120' : iconBg,
                }}>
                <MaterialIcons
                  name="location-on"
                  size={22}
                  color={isLocationGranted ? '#10B981' : mutedColor}
                />
              </View>
              <View className="flex-1">
                <Typography
                  variant="body"
                  weight="600"
                  style={{ color: textColor, fontSize: 16, marginBottom: 2 }}>
                  {t('settings.location')}
                </Typography>
                <Typography
                  variant="caption"
                  style={{ color: mutedColor, fontSize: 13 }}>
                  {t('settings.locationDescription')}
                </Typography>
              </View>
            </View>

            {isLocationGranted ? (
              <View
                className="flex-row items-center px-4 py-3 rounded-xl"
                style={{
                  backgroundColor: resolvedTheme === 'dark' ? '#064E3B' : '#ECFDF5',
                  borderWidth: 1,
                  borderColor: resolvedTheme === 'dark' ? '#065F46' : '#D1FAE5',
                }}>
                <View
                  className="w-2 h-2 rounded-full mr-3"
                  style={{ backgroundColor: '#10B981' }}
                />
                <Typography
                  variant="body"
                  weight="500"
                  style={{ color: '#10B981', fontSize: 14 }}>
                  {t('settings.locationGranted')}
                </Typography>
              </View>
            ) : (
              <Button
                variant={canRequestLocation ? 'primary' : 'outline'}
                size="sm"
                onPress={canRequestLocation ? handleRequestLocation : handleOpenSettings}
                style={{ width: '100%', marginTop: 4 }}>
                {canRequestLocation
                  ? t('settings.requestLocation')
                  : t('settings.openDeviceSettings')}
              </Button>
            )}
          </View>
        </SettingCard>
      </ScrollView>
    </View>
  )
}


