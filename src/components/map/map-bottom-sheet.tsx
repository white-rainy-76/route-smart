import { useUserLocation } from '@/shared/location'
import { MaterialIcons } from '@expo/vector-icons'
import BottomSheet, {
  BottomSheetView,
  useBottomSheet,
} from '@gorhom/bottom-sheet'
import { useCallback, useEffect, useMemo, useRef } from 'react'
import {
  Dimensions,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native'
import type MapView from 'react-native-maps'
import Animated, {
  SharedValue,
  useAnimatedReaction,
  useAnimatedStyle,
  useSharedValue,
} from 'react-native-reanimated'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

interface MapBottomSheetProps {
  mapRef: React.RefObject<MapView | null>
  onButtonOpacityChange?: (opacity: SharedValue<number>) => void
}

/**
 * Компонент для отслеживания позиции bottom sheet в реальном времени
 * и обновления позиции кнопки
 */
function BottomSheetPositionTracker({
  buttonBottom,
  screenHeight,
  headerOpacity,
  buttonOpacity,
  bottomSheetPosition,
}: {
  buttonBottom: SharedValue<number>
  screenHeight: number
  headerOpacity: SharedValue<number>
  buttonOpacity: SharedValue<number>
  bottomSheetPosition: SharedValue<number>
}) {
  const { animatedPosition } = useBottomSheet()

  // Реакция на изменение позиции bottom sheet в реальном времени
  useAnimatedReaction(
    () => animatedPosition.value,
    (position) => {
      // Сохраняем позицию bottomSheet от верха экрана
      bottomSheetPosition.value = position

      // Вычисляем bottom
      // Позиция кнопки = высота экрана - позиция bottom sheet + 20px
      buttonBottom.value = screenHeight - position + 20

      // Вычисляем прозрачность заголовка
      // При 25% (screenHeight * 0.75) - opacity = 0
      // При 75% (screenHeight * 0.25) - opacity начинает появляться (0)
      // При 88.1% (screenHeight * 0.119) - opacity = 1
      const maxPosition = screenHeight * 0.119 // 88.1% от низа (100% - 88.1% = 11.9% от верха)
      const startFadePosition = screenHeight * 0.25 // 75% от низа (100% - 75% = 25% от верха) - начало появления

      let opacity = 0

      // Если позиция выше точки начала fade (75%), opacity = 0
      if (position >= startFadePosition) {
        opacity = 0
      } else {
        // Интерполируем от startFadePosition до maxPosition
        opacity =
          1 - (position - maxPosition) / (startFadePosition - maxPosition)
        opacity = Math.max(0, Math.min(1, opacity))
      }

      headerOpacity.value = opacity
      // Кнопки скрываются когда заголовок появляется
      buttonOpacity.value = 1 - opacity
    },
    [screenHeight],
  )

  return null
}

/**
 * Компонент заголовка, который появляется когда bottom sheet открыт на максимум
 */
function BottomSheetHeader({
  onClose,
  onSave,
  title,
  opacity,
  bottomSheetPosition,
}: {
  onClose: () => void
  onSave: () => void
  title: string
  opacity: SharedValue<number>
  bottomSheetPosition: SharedValue<number>
}) {
  const insets = useSafeAreaInsets()

  const headerStyle = useAnimatedStyle(() => {
    return {
      opacity: opacity.value,
      height: bottomSheetPosition.value + 15, // Высота = позиция bottomSheet + 10px (заходит под bottomSheet)
      pointerEvents: opacity.value > 0 ? 'auto' : 'none',
    }
  })

  return (
    <Animated.View
      style={[styles.headerContainer, { paddingTop: insets.top }, headerStyle]}>
      {/* Текст зафиксирован в верхней части */}
      <View style={styles.headerContent}>
        <TouchableOpacity
          onPress={onClose}
          style={styles.headerButton}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <MaterialIcons name="keyboard-arrow-down" size={24} color="#FFFFFF" />
        </TouchableOpacity>

        <Text style={styles.headerTitle} numberOfLines={1}>
          {title}
        </Text>

        <TouchableOpacity
          onPress={onSave}
          style={styles.headerButton}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <MaterialIcons name="save" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
    </Animated.View>
  )
}

export function MapBottomSheet({
  mapRef,
  onButtonOpacityChange,
}: MapBottomSheetProps) {
  const bottomSheetRef = useRef<BottomSheet>(null)
  const userLocation = useUserLocation()

  const snapPoints = useMemo(() => ['25%', '88.1%'], [])

  const screenHeight = Dimensions.get('window').height
  // Shared value для анимации позиции кнопки - отслеживает позицию bottom sheet в реальном времени
  const buttonBottom = useSharedValue(screenHeight * 0.25 + 20) // начальная позиция при 25%
  // Shared value для прозрачности заголовка
  const headerOpacity = useSharedValue(0)
  // Shared value для прозрачности кнопки локации (скрывается когда заголовок виден)
  const buttonOpacity = useSharedValue(1)
  // Shared value для позиции bottomSheet от верха экрана (для высоты заголовка)
  const bottomSheetPosition = useSharedValue(screenHeight * 0.75) // начальная позиция при 25%

  // Передаем buttonOpacity наружу для скрытия sidebar button
  useEffect(() => {
    if (onButtonOpacityChange) {
      onButtonOpacityChange(buttonOpacity)
    }
  }, [onButtonOpacityChange, buttonOpacity])

  const handleFocusUserLocation = () => {
    if (userLocation && mapRef.current) {
      mapRef.current.animateToRegion(
        {
          latitude: userLocation.latitude,
          longitude: userLocation.longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        },
        5000,
      )
    }
  }

  const handleSheetChanges = useCallback((index: number) => {
    console.log('Bottom sheet index:', index)
    // Предотвращаем закрытие ниже минимума
    // index должен быть 0 (25%) или 1 (90%)
    if (index < 0 || index > 1) {
      // Если индекс выходит за допустимые пределы, возвращаемся к минимуму
      bottomSheetRef.current?.snapToIndex(0)
    }
  }, [])

  const handleCloseSheet = useCallback(() => {
    bottomSheetRef.current?.snapToIndex(0)
  }, [])

  const handleSave = useCallback(() => {
    // TODO: Реализовать логику сохранения
    console.log('Save pressed')
  }, [])

  // Анимированный стиль для кнопки - позиционируется чуть выше bottom sheet
  const locationButtonStyle = useAnimatedStyle(() => {
    return {
      bottom: buttonBottom.value,
      opacity: buttonOpacity.value,
      pointerEvents: buttonOpacity.value > 0 ? 'auto' : 'none',
    }
  })

  return (
    <>
      {/* Заголовок, появляющийся когда bottom sheet открыт на максимум */}
      <BottomSheetHeader
        onClose={handleCloseSheet}
        onSave={handleSave}
        title="Название"
        opacity={headerOpacity}
        bottomSheetPosition={bottomSheetPosition}
      />
      {/* Кнопка для возврата к местоположению пользователя */}
      {userLocation && (
        <Animated.View
          style={[styles.locationButtonContainer, locationButtonStyle]}>
          <TouchableOpacity
            className="w-10 h-10 bg-white rounded-full justify-center items-center shadow-lg"
            style={{
              shadowColor: '#000',
              shadowOffset: {
                width: 0,
                height: 2,
              },
              shadowOpacity: 0.25,
              shadowRadius: 3.84,
              elevation: 5,
            }}
            onPress={handleFocusUserLocation}>
            <MaterialIcons name="my-location" size={24} color="#4964D8" />
          </TouchableOpacity>
        </Animated.View>
      )}
      <BottomSheet
        ref={bottomSheetRef}
        index={0}
        snapPoints={snapPoints}
        onChange={handleSheetChanges}
        onAnimate={(fromIndex, toIndex) => {
          // Блокируем анимацию к индексу меньше 0
          if (toIndex < 0) {
            bottomSheetRef.current?.snapToIndex(0)
          }
        }}
        enablePanDownToClose={false}
        enableOverDrag={false}
        animateOnMount={true}
        enableDynamicSizing={false}
        bottomInset={0}
        handleIndicatorStyle={styles.handleIndicator}
        backgroundStyle={styles.bottomSheetBackground}>
        <BottomSheetPositionTracker
          buttonBottom={buttonBottom}
          screenHeight={screenHeight}
          headerOpacity={headerOpacity}
          buttonOpacity={buttonOpacity}
          bottomSheetPosition={bottomSheetPosition}
        />
        <BottomSheetView style={styles.contentContainer}>
          <View>
            <Text>
              {' '}
              Lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam,
              quos.
            </Text>
          </View>
        </BottomSheetView>
      </BottomSheet>
    </>
  )
}

const styles = StyleSheet.create({
  headerContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: '#4964D8',
    zIndex: 0, // Под bottomSheet (который имеет z-index выше), но выше карты
    paddingHorizontal: 16,
    paddingBottom: 16,
    overflow: 'hidden',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 30,
  },
  headerButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    textAlign: 'center',
    marginHorizontal: 16,
  },
  locationButtonContainer: {
    position: 'absolute',
    right: 20,
    zIndex: 1000,
  },
  handleIndicator: {
    backgroundColor: '#ccc',
    width: 40,
    height: 4,
  },
  bottomSheetBackground: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 10,
  },
})
