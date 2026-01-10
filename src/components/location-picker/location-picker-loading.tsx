import { ActivityIndicator, View } from 'react-native'

export function LocationPickerLoading() {
  return (
    <View className="flex-1 justify-center items-center">
      <ActivityIndicator size="large" color="#4964D8" />
    </View>
  )
}
