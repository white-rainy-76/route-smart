import { Map, MapBottomSheet } from '@/components/map'
import { MaterialIcons } from '@expo/vector-icons'
import { DrawerActions } from '@react-navigation/native'
import { useNavigation } from 'expo-router'
import { useRef, useState } from 'react'
import { StyleSheet, TouchableOpacity, View } from 'react-native'
import type MapView from 'react-native-maps'
import Animated, {
  SharedValue,
  useAnimatedStyle,
} from 'react-native-reanimated'

export default function HomeScreen() {
  const navigation = useNavigation()
  const mapRef = useRef<MapView>(null)
  const [sidebarButtonOpacity, setSidebarButtonOpacity] =
    useState<SharedValue<number> | null>(null)

  const openDrawer = () => {
    navigation.dispatch(DrawerActions.openDrawer())
  }

  const sidebarButtonStyle = useAnimatedStyle(() => {
    if (!sidebarButtonOpacity) {
      return { opacity: 1, pointerEvents: 'auto' }
    }
    return {
      opacity: sidebarButtonOpacity.value,
      pointerEvents: sidebarButtonOpacity.value > 0 ? 'auto' : 'none',
    }
  })

  return (
    <View style={styles.container}>
      <Map className="flex-1" mapRef={mapRef} />
      <Animated.View
        className="absolute left-5 top-[52px] w-10 h-10 bg-white rounded-full justify-center items-center z-[1000] shadow-lg"
        style={[styles.menuButton, sidebarButtonStyle]}>
        <TouchableOpacity
          className="w-full h-full justify-center items-center"
          onPress={openDrawer}>
          <MaterialIcons name="menu" size={24} color="#4964D8" />
        </TouchableOpacity>
      </Animated.View>
      <MapBottomSheet
        mapRef={mapRef}
        onButtonOpacityChange={setSidebarButtonOpacity}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  menuButton: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
})
