import { startLocationTracking } from '@/shared/location'
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet'
import { Drawer } from 'expo-router/drawer'
import { useEffect } from 'react'

export default function RootLayout() {
  // Запускаем отслеживание геолокации один раз при монтировании
  useEffect(() => {
    startLocationTracking()
  }, [])

  return (
    <BottomSheetModalProvider>
      <Drawer
        screenOptions={{
          headerShown: false,
          drawerPosition: 'left',
          drawerType: 'front',
        }}>
        <Drawer.Screen
          name="home"
          options={{
            drawerLabel: 'Home',
            title: 'Home',
          }}
        />
        <Drawer.Screen
          name="onboarding"
          options={{
            drawerLabel: 'Onboarding',
            title: 'Onboarding',
          }}
        />
        <Drawer.Screen
          name="create-truck-profile"
          options={{
            drawerLabel: 'Create Truck Profile',
            title: 'Create Truck Profile',
          }}
        />
        <Drawer.Screen
          name="location-permission"
          options={{
            drawerLabel: 'Location Permission',
            title: 'Location Permission',
            // drawerItemStyle: { height: 0 }, // Скрыть из drawer меню
          }}
        />
      </Drawer>
    </BottomSheetModalProvider>
  )
}
