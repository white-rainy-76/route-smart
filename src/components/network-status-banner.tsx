import { useNetworkStatus } from '@/hooks/use-network-status'
import { useTheme } from '@/hooks/use-theme'
import { useTranslation } from '@/hooks/use-translation'
import { useEffect, useRef, useState } from 'react'
import { Animated, Text, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

export function NetworkStatusBanner() {
  const { isConnected, isInternetReachable } = useNetworkStatus()
  const { t } = useTranslation()
  const { resolvedTheme } = useTheme()
  const insets = useSafeAreaInsets()
  const [showBanner, setShowBanner] = useState(false)
  const slideAnim = useRef(new Animated.Value(-100)).current
  const previousStatus = useRef<boolean | null>(null)

  // Определяем, есть ли интернет
  const hasInternet = isConnected === true && isInternetReachable === true

  useEffect(() => {
    // Пропускаем первую инициализацию
    if (previousStatus.current === null) {
      previousStatus.current = hasInternet
      if (hasInternet === false) {
        setShowBanner(true)
        Animated.spring(slideAnim, {
          toValue: 0,
          useNativeDriver: true,
          tension: 50,
          friction: 8,
        }).start()
      }
      return
    }

    // Показываем баннер только если нет интернета
    if (hasInternet === false && previousStatus.current !== false) {
      setShowBanner(true)
      // Анимация появления
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        tension: 50,
        friction: 8,
      }).start()
    } else if (hasInternet === true && showBanner) {
      // Анимация исчезновения
      Animated.timing(slideAnim, {
        toValue: -100,
        duration: 300,
        useNativeDriver: true,
      }).start(() => {
        setShowBanner(false)
      })
    }

    previousStatus.current = hasInternet
  }, [hasInternet, showBanner, slideAnim])

  if (!showBanner && hasInternet !== false) {
    return null
  }

  return (
    <Animated.View
      style={{
        transform: [{ translateY: slideAnim }],
        position: 'absolute',
        top: insets.top,
        left: 0,
        right: 0,
        zIndex: 9999,
      }}
      className={`${
        resolvedTheme === 'dark' ? 'bg-red-600' : 'bg-red-500'
      } px-4 py-3 shadow-lg`}>
      <View className="flex-row items-center justify-center gap-2">
        <Text className="text-white text-base">⚠️</Text>
        <Text className="text-white text-sm font-semibold">
          {t('network.noConnection')}
        </Text>
      </View>
    </Animated.View>
  )
}
