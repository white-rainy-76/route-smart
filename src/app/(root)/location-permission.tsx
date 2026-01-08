import { Button } from '@/components/ui'
import { Typography } from '@/components/ui/typography'
import { useLocation } from '@/shared/hooks/use-location'
import { useTranslation } from '@/shared/hooks/use-translation'
import { useRouter } from 'expo-router'
import { View } from 'react-native'

export default function LocationPermissionScreen() {
  const { t } = useTranslation()
  const router = useRouter()
  const { permissionStatus, requestPermission, isLoading } = useLocation()

  const handleRequestPermission = async () => {
    const granted = await requestPermission()
    if (granted) {
      // Переход на главную страницу после получения разрешения
      router.replace('/(root)/home')
    }
  }

  const handleSkip = () => {
    // Пропустить и перейти на главную страницу
    router.replace('/(root)/home')
  }

  return (
    <View className="flex-1 bg-white px-6 pt-16 pb-8">
      <View className="flex-1 justify-center items-center">
        {/* Иконка */}
        <View className="mb-8">
          <Typography variant="h1" className="text-6xl">
            📍
          </Typography>
        </View>

        {/* Заголовок */}
        <Typography
          variant="h1"
          weight="700"
          align="center"
          className="mb-4 text-gray-900">
          {t('location.permissionTitle') || 'Разрешить доступ к геолокации'}
        </Typography>

        {/* Описание */}
        <Typography
          variant="body"
          align="center"
          className="mb-8 text-gray-600 px-4">
          {t('location.permissionDescription') ||
            'Мы используем вашу геолокацию для показа вашего местоположения на карте и предоставления персонализированных маршрутов. Ваши данные остаются конфиденциальными и используются только в рамках приложения.'}
        </Typography>

        {/* Преимущества */}
        <View className="w-full mb-8 px-4">
          <View className="mb-4">
            <Typography
              variant="body"
              weight="600"
              className="mb-2 text-gray-900">
              ✓ Точное определение местоположения
            </Typography>
            <Typography variant="caption" className="text-gray-600">
              Видите свое местоположение на карте в реальном времени
            </Typography>
          </View>
          <View className="mb-4">
            <Typography
              variant="body"
              weight="600"
              className="mb-2 text-gray-900">
              ✓ Персонализированные маршруты
            </Typography>
            <Typography variant="caption" className="text-gray-600">
              Получайте маршруты от вашего текущего местоположения
            </Typography>
          </View>
          <View>
            <Typography
              variant="body"
              weight="600"
              className="mb-2 text-gray-900">
              ✓ Улучшенная навигация
            </Typography>
            <Typography variant="caption" className="text-gray-600">
              Более точные и быстрые маршруты с учетом вашего положения
            </Typography>
          </View>
        </View>
      </View>

      {/* Кнопки */}
      <View className="w-full gap-3">
        <Button
          variant="primary"
          size="lg"
          onPress={handleRequestPermission}
          disabled={isLoading || permissionStatus?.granted}>
          {isLoading
            ? 'Загрузка...'
            : permissionStatus?.granted
              ? 'Разрешение получено'
              : 'Разрешить доступ'}
        </Button>

        <Button variant="ghost" size="lg" onPress={handleSkip}>
          Пропустить
        </Button>
      </View>
    </View>
  )
}
