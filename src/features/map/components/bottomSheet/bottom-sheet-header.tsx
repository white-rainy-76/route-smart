import { MaterialIcons } from '@expo/vector-icons'
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import Animated, {
  SharedValue,
  useAnimatedStyle,
} from 'react-native-reanimated'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { SaveRouteButton } from './save-route-button'

interface BottomSheetHeaderProps {
  onClose: () => void
  title: string
  opacity: SharedValue<number>
  bottomSheetPosition: SharedValue<number>
}

/**
 * Компонент заголовка, который появляется когда bottom sheet открыт на максимум
 */
export function BottomSheetHeader({
  onClose,
  title,
  opacity,
  bottomSheetPosition,
}: BottomSheetHeaderProps) {
  const insets = useSafeAreaInsets()

  const headerStyle = useAnimatedStyle(() => {
    return {
      opacity: opacity.value,
      height: bottomSheetPosition.value + 15, // Высота = позиция bottomSheet + 15px (заходит под bottomSheet)
      pointerEvents: opacity.value > 0 ? 'auto' : 'none',
    }
  })

  return (
    <Animated.View
      style={[styles.headerContainer, { paddingTop: insets.top }, headerStyle]}>
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

        <SaveRouteButton />
      </View>
    </Animated.View>
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
})
