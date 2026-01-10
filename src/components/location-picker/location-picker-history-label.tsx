import { Typography } from '@/components/ui/typography'
import { View } from 'react-native'

export function LocationPickerHistoryLabel() {
  return (
    <View className="px-5 mb-3">
      <Typography
        variant="body"
        weight="600"
        style={{
          fontFamily: 'Nunito_600SemiBold',
          fontSize: 16,
          lineHeight: 24,
          letterSpacing: 0,
          color: '#383838',
        }}>
        History
      </Typography>
    </View>
  )
}
