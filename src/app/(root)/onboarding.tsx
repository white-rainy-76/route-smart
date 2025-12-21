import { useApp } from '@/contexts/app-context'
import { useTranslation } from '@/hooks/use-translation'
import { useRouter } from 'expo-router'
import { useRef, useState } from 'react'
import {
  Dimensions,
  Image,
  NativeScrollEvent,
  NativeSyntheticEvent,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native'

const { width: SCREEN_WIDTH } = Dimensions.get('window')

interface OnboardingSlide {
  id: string
  title: string
  description: string
  illustration: string
}

export default function OnboardingScreen() {
  const { t } = useTranslation()
  const router = useRouter()
  const { completeOnboarding } = useApp()
  const scrollViewRef = useRef<ScrollView>(null)
  const [currentIndex, setCurrentIndex] = useState(0)

  const slides: OnboardingSlide[] = [
    {
      id: '1',
      title: t('onboarding.slide1.title'),
      description: t('onboarding.slide1.description'),
      illustration: '🚚',
    },
    {
      id: '2',
      title: t('onboarding.slide2.title'),
      description: t('onboarding.slide2.description'),
      illustration: '📍',
    },
    {
      id: '3',
      title: t('onboarding.slide3.title'),
      description: t('onboarding.slide3.description'),
      illustration: '⚡',
    },
  ]

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offsetX = event.nativeEvent.contentOffset.x
    const index = Math.round(offsetX / SCREEN_WIDTH)
    setCurrentIndex(index)
  }

  const handleNext = () => {
    if (currentIndex < slides.length - 1) {
      scrollViewRef.current?.scrollTo({
        x: (currentIndex + 1) * SCREEN_WIDTH,
        animated: true,
      })
    } else {
      handleFinish()
    }
  }

  const handleSkip = () => {
    handleFinish()
  }

  const handleFinish = async () => {
    await completeOnboarding()
    router.replace('/(auth)/login')
  }

  return (
    <View className="flex-1 bg-background">
      <View className="flex-1">
        {/* Skip button */}
        <View className="absolute top-12 right-6 z-10">
          <TouchableOpacity onPress={handleSkip}>
            <Text className="text-primary text-base font-medium">
              {t('onboarding.skip')}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Slides */}
        <ScrollView
          ref={scrollViewRef}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onScroll={handleScroll}
          scrollEventThrottle={16}>
          {slides.map((slide) => (
            <View
              key={slide.id}
              style={{ width: SCREEN_WIDTH }}
              className="flex-1 items-center justify-center px-8">
              <View className="items-center gap-8">
                <View className="w-48 h-48 items-center justify-center bg-primary/10 rounded-full">
                  <Text className="text-8xl">{slide.illustration}</Text>
                </View>
                <View className="items-center gap-4 max-w-sm">
                  <Text className="text-3xl font-bold text-foreground text-center">
                    {slide.title}
                  </Text>
                  <Text className="text-lg text-muted-foreground text-center leading-6">
                    {slide.description}
                  </Text>
                </View>
              </View>
            </View>
          ))}
        </ScrollView>

        {/* Pagination dots */}
        <View className="flex-row justify-center gap-2 pb-8">
          {slides.map((_, index) => (
            <View
              key={index}
              className={`h-2 rounded-full ${
                index === currentIndex ? 'w-8 bg-primary' : 'w-2 bg-muted'
              }`}
            />
          ))}
        </View>

        {/* Navigation buttons */}
        <View className="px-6 pb-8 gap-4">
          <TouchableOpacity
            onPress={handleNext}
            className="bg-primary py-4 rounded-xl items-center">
            <Text className="text-primary-foreground text-lg font-semibold">
              {currentIndex === slides.length - 1
                ? t('onboarding.getStarted')
                : t('onboarding.next')}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  )
}
