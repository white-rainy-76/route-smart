import { View } from 'react-native'

export function AuthBackground() {
  return (
    <View className="absolute inset-0 overflow-hidden">
      {/* Very subtle gradient circles */}
      <View
        className="absolute -top-32 -right-32 w-96 h-96 rounded-full"
        style={{
          backgroundColor: '#4964D8',
          opacity: 0.06,
        }}
      />
      <View
        className="absolute top-1/3 -left-24 w-72 h-72 rounded-full"
        style={{
          backgroundColor: '#4964D8',
          opacity: 0.05,
        }}
      />
      <View
        className="absolute bottom-20 left-3/4 w-64 h-64 rounded-full"
        style={{
          backgroundColor: '#4964D8',
          opacity: 0.04,
        }}
      />
      {/* Abstract Shapes */}
      <View
        className="absolute top-40 right-8 w-32 h-32 rounded-3xl"
        style={{
          backgroundColor: '#4964D8',
          opacity: 0.04,
          transform: [{ rotate: '45deg' }],
        }}
      />
      <View
        className="absolute bottom-40 left-12 w-24 h-24 rounded-2xl"
        style={{
          backgroundColor: '#4964D8',
          opacity: 0.035,
          transform: [{ rotate: '-30deg' }],
        }}
      />
      <View
        className="absolute top-1/2 left-2/3 w-40 h-40 rounded-full"
        style={{
          backgroundColor: '#4964D8',
          opacity: 0.03,
        }}
      />
    </View>
  )
}
