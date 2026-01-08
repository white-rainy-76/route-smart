import { Button, Typography } from '@/components/ui'
import { useApp } from '@/shared/contexts/app-context'
import { useTranslation } from '@/shared/hooks/use-translation'
import { useRouter } from 'expo-router'
import { useRef, useState } from 'react'
import {
  Dimensions,
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
      {/* Skip button */}
      <View className="absolute top-12 right-6 z-10">
        <TouchableOpacity onPress={handleSkip}>
          <Text className="text-primary text-base font-medium">
            {t('onboarding.skip')}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Upper block - Slides */}
      <View style={{ paddingTop: 158, flex: 1 }}>
        <ScrollView
          ref={scrollViewRef}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onScroll={handleScroll}
          scrollEventThrottle={16}>
          {slides.map((slide) => (
            <View key={slide.id} style={{ width: SCREEN_WIDTH }}>
              <View className="items-center" style={{ paddingHorizontal: 48 }}>
                {/* Illustration */}
                <View className="w-48 h-48 items-center justify-center bg-primary/10 rounded-full">
                  <Text className="text-8xl">{slide.illustration}</Text>
                </View>

                {/* Text content */}
                <View
                  style={{
                    marginTop: 64,
                    alignItems: 'center',
                    maxWidth: 320,
                  }}>
                  <Typography variant="h1" align="center">
                    {slide.title}
                  </Typography>
                  <View style={{ marginTop: 16 }}>
                    <Typography variant="body" weight="600" align="center">
                      {slide.description}
                    </Typography>
                  </View>
                </View>
              </View>
            </View>
          ))}
        </ScrollView>
      </View>

      {/* Lower block - Button and pagination */}
      <View
        style={{ paddingHorizontal: 55, paddingTop: 64, paddingBottom: 36 }}>
        {/* Button */}
        <View className="items-center">
          <Button onPress={handleNext} variant="primary" size="md">
            {currentIndex === slides.length - 1
              ? t('onboarding.getStarted')
              : t('onboarding.next')}
          </Button>
        </View>

        {/* Pagination bar */}
        <View
          style={{
            marginTop: 36,
            alignItems: 'center',
          }}>
          <View
            style={{
              width: 90,
              height: 6,
              backgroundColor: '#EFEFF4',
              borderRadius: 4,
            }}>
            <View
              style={{
                width: 30,
                height: 6,
                backgroundColor: '#4964D8',
                borderRadius: 4,
                position: 'absolute',
                left: (90 / slides.length) * currentIndex,
              }}
            />
          </View>
        </View>
      </View>
    </View>
  )
}
