import { DrawerContent } from '@/components/drawer'
import { DrawerProvider } from '@/shared/contexts/drawer-context'
import { startLocationTracking } from '@/shared/lib/location'
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet'
import { Stack } from 'expo-router'
import { useEffect, useMemo, useRef } from 'react'
import { Dimensions, Platform } from 'react-native'
import ReanimatedDrawerLayout from 'react-native-gesture-handler/ReanimatedDrawerLayout'

export default function RootLayout() {
  // Запускаем отслеживание геолокации один раз при монтировании
  useEffect(() => {
    startLocationTracking()  }, [])

  const drawerRef = useRef<any>(null)
  const drawerWidth = Math.min(
    360,
    Math.floor(Dimensions.get('window').width * 0.82),
  )

  const drawerController = useMemo(
    () => ({
      openDrawer: () => drawerRef.current?.openDrawer?.(),
      closeDrawer: () => drawerRef.current?.closeDrawer?.(),
      toggleDrawer: () => drawerRef.current?.toggleDrawer?.(),
    }),
    [],
  )

  return (
    <BottomSheetModalProvider>
      <DrawerProvider value={drawerController}>
        <ReanimatedDrawerLayout
          ref={drawerRef}
          drawerWidth={drawerWidth}
          overlayColor="rgba(0,0,0,0.35)"
          renderNavigationView={() => <DrawerContent />}>
          <Stack
            screenOptions={{
              headerShown: false,
              // Android + MapView: stack animations (slide) can cause severe jank / surface reattach on return.
              // Disable animations inside (root) to keep map smooth.
              animation: Platform.OS === 'android' ? 'none' : 'slide_from_right',
            }}>
            <Stack.Screen name="home" />
            <Stack.Screen
              name="(modals)/saved-routes"
              options={{ presentation: 'transparentModal' }}
            />
            <Stack.Screen
              name="(modals)/my-subscription"
              options={{ presentation: 'transparentModal' }}
            />
            <Stack.Screen
              name="(modals)/settings"
              options={{ presentation: 'transparentModal' }}
            />
            <Stack.Screen
              name="(modals)/location-picker"
              options={{ presentation: 'transparentModal' }}
            />
          </Stack>
        </ReanimatedDrawerLayout>
      </DrawerProvider>
    </BottomSheetModalProvider>
  )
}
