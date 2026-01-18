import { useEffect, useRef } from 'react'
import { Animated, Platform, StyleSheet, View } from 'react-native'

const PULSE_COUNT = 3
const PULSE_DURATION = 2000

export function UserLocationMarkerFill() {
  const pulseAnims = useRef(
    Array.from({ length: PULSE_COUNT }, () => new Animated.Value(0)),
  ).current

  useEffect(() => {
    const animations = pulseAnims.map((anim, index) => {
      return Animated.loop(
        Animated.sequence([
          Animated.delay(index * (PULSE_DURATION / PULSE_COUNT)),
          Animated.timing(anim, {
            toValue: 1,
            duration: PULSE_DURATION,
            // ИСПОЛЬЗУЕМ false ДЛЯ ANDROID, чтобы триггерить рендер маркера
            useNativeDriver: Platform.OS !== 'android', 
          }),
          Animated.timing(anim, {
            toValue: 0,
            duration: 0,
            useNativeDriver: Platform.OS !== 'android',
          }),
        ]),
      )
    })

    animations.forEach((anim) => anim.start())

    return () => {
      animations.forEach((anim) => anim.stop())
      pulseAnims.forEach((anim) => anim.setValue(0))
    }
  }, [pulseAnims])

  return (
    <View style={styles.container}>
      {/* Пульсирующие волны */}
      {pulseAnims.map((anim, index) => {
        const scale = anim.interpolate({
          inputRange: [0, 1],
          outputRange: [1, 4],
        })
        const opacity = anim.interpolate({
          inputRange: [0, 0.5, 1],
          outputRange: [0.6, 0.3, 0],
        })

        return (
          <Animated.View
            key={index}
            style={[
              styles.pulse,
              {
                transform: [{ scale }],
                opacity,
              },
            ]}
          />
        )
      })}

      {/* Основной маркер - внешний круг 12×12 */}
      <View style={styles.outerCircle}>
        {/* Внутренний белый круг 4×4 */}
        <View style={styles.innerCircle} />
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pulse: {
    position: 'absolute',
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#4964D8',
  },
  outerCircle: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#4964D8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  innerCircle: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#FFFFFF',
  },
})
