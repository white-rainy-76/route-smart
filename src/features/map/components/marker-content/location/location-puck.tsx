import { MaterialIcons } from '@expo/vector-icons'
import { useEffect, useRef } from 'react'
import { Animated, StyleSheet, View } from 'react-native'

const PULSE_COUNT = 3
const PULSE_DURATION = 2000

export function LocationPuck() {
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
            useNativeDriver: true,
          }),
          Animated.timing(anim, {
            toValue: 0,
            duration: 0,
            useNativeDriver: true,
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
          outputRange: [1, 3],
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

      {/* Основной маркер - круг 20×20 */}
      <View style={styles.circle}>
        <MaterialIcons name="navigation" size={12} color="#FFFFFF" />
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    width: 60,
    height: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pulse: {
    position: 'absolute',
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#4964D8',
  },
  circle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#4964D8',
    alignItems: 'center',
    justifyContent: 'center',
  },
})
