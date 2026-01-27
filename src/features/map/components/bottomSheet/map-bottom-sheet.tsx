import { RouteForm, WaypointsEditor } from '@/components/route-form'
import {
  useDirectionsSavedRouteId,
  useDirectionsTripActive,
} from '@/stores/directions/hooks'
import {
  useRouteDestination,
  useRouteOrigin,
  useRouteWaypointsCount,
} from '@/stores/route/hooks'
import BottomSheet, {
  BottomSheetScrollView,
  BottomSheetView,
  useBottomSheet,
} from '@gorhom/bottom-sheet'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Dimensions, Platform, StatusBar, StyleSheet } from 'react-native'
import {
  SharedValue,
  useAnimatedReaction,
  useSharedValue,
} from 'react-native-reanimated'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { BottomSheetHeader } from './bottom-sheet-header'
import { FuelInfoButtons } from './fuel-info-buttons'
import { FuelInfoPanel } from './fuel-info-panel'
import { TollsPanel } from './tolls-panel'

interface MapBottomSheetProps {
  onButtonOpacityChange?: (opacity: SharedValue<number>) => void
  onButtonAnimationChange?: (
    buttonBottom: SharedValue<number>,
    buttonOpacity: SharedValue<number>,
  ) => void
  onStartTrip?: () => void
  onEndTrip?: () => void
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
  maxIndex,
}: {
  buttonBottom: SharedValue<number>
  screenHeight: number
  headerOpacity: SharedValue<number>
  buttonOpacity: SharedValue<number>
  bottomSheetPosition: SharedValue<number>
  maxIndex: number
}) {
  const { animatedPosition, animatedIndex } = useBottomSheet()

  const gapPx = Platform.OS === 'android' ? 70 : 20

  // Реакция на изменение позиции bottom sheet в реальном времени
  useAnimatedReaction(
    () => animatedPosition.value,
    (position) => {
      // Сохраняем позицию bottomSheet от верха экрана
      bottomSheetPosition.value = position

      // Вычисляем позицию кнопки: высота экрана - позиция bottom sheet + 20px отступ
      buttonBottom.value = screenHeight - position + gapPx

      // Вычисляем прозрачность заголовка на основе позиции bottom sheet
      // maxPosition (11.9% от верха) - заголовок полностью виден (opacity = 1)
      // startFadePosition (35% от верха) - заголовок начинает появляться (opacity = 0)
      // Выше startFadePosition - заголовок скрыт (opacity = 0)
      const maxPosition = screenHeight * 0.119 // 11.9% от верха (88.1% от низа)
      const startFadePosition = screenHeight * 0.35 // 35% от верха (65% от низа)

      let opacity = 0

      // Если позиция выше точки начала fade, заголовок скрыт
      if (position >= startFadePosition) {
        opacity = 0
      } else {
        // Интерполируем прозрачность от startFadePosition до maxPosition
        opacity =
          1 - (position - maxPosition) / (startFadePosition - maxPosition)
        opacity = Math.max(0, Math.min(1, opacity))
      }

      // На Android при полностью открытом bottomSheet (максимальный индекс) устанавливаем точные значения
      if (Platform.OS === 'android' && animatedIndex.value === maxIndex) {
        headerOpacity.value = 1
        buttonOpacity.value = 0
      } else {
        headerOpacity.value = opacity
        // Кнопки скрываются когда заголовок появляется (инвертированная прозрачность)
        buttonOpacity.value = 1 - opacity
      }
    },
    [screenHeight],
  )

  return null
}

export function MapBottomSheet({
  onButtonOpacityChange,
  onButtonAnimationChange,
  onStartTrip,
  onEndTrip,
}: MapBottomSheetProps) {
  const bottomSheetRef = useRef<BottomSheet>(null)
  const [mode, setMode] = useState<'form' | 'waypoints'>('form')
  const insets = useSafeAreaInsets()
  const savedRouteId = useDirectionsSavedRouteId()
  const isTripActive = useDirectionsTripActive()
  console.log('BottomSHeet' )
  // Если используется сохранённый маршрут, увеличиваем начальную высоту до 40%
  // Добавляем очень маленький snap point (8%) только в режиме поездки
  const formSnapPoints = useMemo(() => {
    if (isTripActive) {
      // В режиме поездки доступны 3 snap points: 8%, 35%/40%, 88.1%
      return savedRouteId ? ['8%', '40%', '88.1%'] : ['8%', '35%', '88.1%']
    } else {
      // В обычном режиме доступны только 2 snap points: 35%/40%, 88.1%
      return savedRouteId ? ['40%', '88.1%'] : ['35%', '88.1%']
    }
  }, [savedRouteId, isTripActive])
  const origin = useRouteOrigin()
  const destination = useRouteDestination()
  const waypointsCount = useRouteWaypointsCount()
  const totalStopsCount =
    (origin ? 1 : 0) + waypointsCount + (destination ? 1 : 0)

  const windowHeight = Dimensions.get('window').height
  // BottomSheet's animated position on Android can be offset by the status bar height.
  // Use an adjusted height for converting "position from top" into "bottom offset".
  const trackerHeight =
    windowHeight +
    (Platform.OS === 'android' ? (StatusBar.currentHeight ?? 0) : 0)
  const gapPx = Platform.OS === 'android' ? 40 : 20

  // Для waypoints mode используем trackerHeight для корректного расчета на Android
  const maxSheetHeight = ((Platform.OS === 'android' ? trackerHeight : windowHeight) * 0.881) +(Platform.OS === 'android'? 50 : 0)
  const waypointsCollapsedHeight = useMemo(() => {
    // Approximate content height without relying on unsupported CONTENT_HEIGHT.
    const rowHeight = 64
    const footerHeight = 200 // add stop + back + spacing
    const minHeight = 260
    return Math.min(
      maxSheetHeight,
      Math.max(minHeight, footerHeight + totalStopsCount * rowHeight),
    )
  }, [maxSheetHeight, totalStopsCount])
  const waypointsSnapPoints = useMemo(
    () => [waypointsCollapsedHeight, maxSheetHeight],
    [waypointsCollapsedHeight, maxSheetHeight],
  )
  // Вычисляем максимальный индекс для текущего режима
  const maxIndex = useMemo(() => {
    if (mode === 'form') {
      // В режиме поездки 3 snap points (макс индекс 2), иначе 2 snap points (макс индекс 1)
      return isTripActive ? 2 : 1
    } else {
      // В режиме waypoints всегда 2 snap points (макс индекс 1)
      return 1
    }
  }, [mode, isTripActive])
  // Начальная высота bottom sheet зависит от наличия savedRouteId
  // В обычном режиме индекс 0 соответствует нормальному минимуму (35%/40%)
  // В режиме поездки индекс 1 соответствует нормальному минимуму (35%/40%)
  const initialSheetHeight = savedRouteId ? 0.4 : 0.35
  const initialSnapIndex = isTripActive ? 1 : 0 // Нормальный минимум

  // Shared value для анимации позиции кнопки - отслеживает позицию bottom sheet в реальном времени
  const buttonBottom = useSharedValue(
    trackerHeight * (1 - initialSheetHeight) + gapPx,
  )
  // Shared value для прозрачности заголовка
  const headerOpacity = useSharedValue(0)
  // Shared value для прозрачности кнопки локации (скрывается когда заголовок виден)
  const buttonOpacity = useSharedValue(1)
  // Shared value для позиции bottomSheet от верха экрана (для высоты заголовка)
  const bottomSheetPosition = useSharedValue(trackerHeight * initialSheetHeight)

  // Обновляем начальную позицию bottom sheet при изменении savedRouteId
  // useEffect(() => {
  //   const newInitialHeight = savedRouteId ? 0.4 : 0.35
  //   buttonBottom.value = screenHeight * (1 - newInitialHeight) + 20
  //   bottomSheetPosition.value = screenHeight * newInitialHeight
  //   // Обновляем позицию bottom sheet
  //   bottomSheetRef.current?.snapToIndex(0)
  // }, [savedRouteId, screenHeight, buttonBottom, bottomSheetPosition])

  // Передаем buttonOpacity наружу для скрытия sidebar button
  useEffect(() => {
    if (onButtonOpacityChange) {
      onButtonOpacityChange(buttonOpacity)
    }
  }, [onButtonOpacityChange, buttonOpacity])

  // Передаем SharedValue для анимации кнопок наружу
  useEffect(() => {
    if (onButtonAnimationChange) {
      onButtonAnimationChange(buttonBottom, buttonOpacity)
    }
  }, [onButtonAnimationChange, buttonBottom, buttonOpacity])

  // Автоматически закрываем bottom sheet до 8% при включении режима поездки
  useEffect(() => {
    if (isTripActive) {
      // Небольшая задержка, чтобы snap points успели обновиться
      const timer = setTimeout(() => {
        bottomSheetRef.current?.snapToIndex(0)
      }, 50)
      return () => clearTimeout(timer)
    }
  }, [isTripActive])

  const handleSheetChanges = useCallback(
    (index: number) => {
      // В обычном режиме доступны индексы 0 (35%/40%) и 1 (88.1%)
      // В режиме поездки доступны индексы 0 (8%), 1 (35%/40%) и 2 (88.1%)
      const maxIndex = isTripActive ? 2 : 1
      if (index < 0 || index > maxIndex) {
        // Если индекс выходит за допустимые пределы, возвращаемся к нормальному минимуму
        bottomSheetRef.current?.snapToIndex(isTripActive ? 1 : 0)
      }
    },
    [isTripActive],
  )

  const handleCloseSheet = useCallback(() => {
    // Закрываем до нормального минимума
    bottomSheetRef.current?.snapToIndex(isTripActive ? 1 : 0)
  }, [isTripActive])

  const handleStartTrip = useCallback(() => {
    // Включаем режим поездки и drive mode
    // Bottom sheet автоматически закроется до 8% через useEffect
    if (onStartTrip) {
      onStartTrip()
    }
  }, [onStartTrip])

  const handleEndTrip = useCallback(() => {
    // Выключаем режим поездки и drive mode
    if (onEndTrip) {
      onEndTrip()
    }
    // Открываем bottom sheet обратно до нормального минимума (35%/40%)
    bottomSheetRef.current?.snapToIndex(1)
  }, [onEndTrip])

  return (
    <>
      {/* Заголовок, появляющийся когда bottom sheet открыт на максимум */}
      <BottomSheetHeader
        onClose={handleCloseSheet}
        title="Название"
        opacity={headerOpacity}
        bottomSheetPosition={bottomSheetPosition}
      />
      <BottomSheet
        ref={bottomSheetRef}
        index={initialSnapIndex}
        snapPoints={mode === 'waypoints' ? waypointsSnapPoints : formSnapPoints}
        android_keyboardInputMode="adjustResize"
        keyboardBehavior="extend"
        keyboardBlurBehavior="none"
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
          screenHeight={trackerHeight}
          headerOpacity={headerOpacity}
          buttonOpacity={buttonOpacity}
          bottomSheetPosition={bottomSheetPosition}
          maxIndex={maxIndex}
        />
        {mode === 'form' ? (
          <BottomSheetScrollView
            contentContainerStyle={[
              styles.contentContainer,
              { paddingBottom: Math.max(32, 16 + insets.bottom) },
            ]}
            keyboardShouldPersistTaps="handled">
            <RouteForm
              onManageWaypoints={() => {
                setMode('waypoints')
              }}
            />

            <TollsPanel />
            <FuelInfoPanel />
            <FuelInfoButtons
              onStartTrip={handleStartTrip}
              onEndTrip={handleEndTrip}
            />
          </BottomSheetScrollView>
        ) : (
          <BottomSheetView style={[styles.contentContainer, { paddingTop: 6 }]}>
            <WaypointsEditor
              onBack={() => {
                setMode('form')
              }}
            />
          </BottomSheetView>
        )}
      </BottomSheet>
    </>
  )
}

const styles = StyleSheet.create({
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
    paddingHorizontal: 19,
    paddingTop: 17,
  },
})
