import { Stack } from 'expo-router'

export default function UtilsLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="onboarding" />
      <Stack.Screen name="location-permission" />
      <Stack.Screen name="subscription" />
    </Stack>
  )
}
