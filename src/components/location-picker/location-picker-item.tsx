import { Typography } from '@/components/ui/typography'
import { MaterialIcons } from '@expo/vector-icons'
import { TouchableOpacity, View } from 'react-native'

export interface LocationItem {
  id: string
  name: string
  address: string
  latitude: number
  longitude: number
}

interface LocationPickerItemProps {
  item: LocationItem
  onPress: (item: LocationItem) => void
}

export function LocationPickerItem({ item, onPress }: LocationPickerItemProps) {
  return (
    <TouchableOpacity
      onPress={() => onPress(item)}
      className="flex-row items-center"
      style={{ marginBottom: 20 }}
      activeOpacity={0.7}>
      <View
        className="rounded-full items-center justify-center"
        style={{
          width: 32,
          height: 32,
          backgroundColor: '#F1F1F1',
          marginRight: 12,
        }}>
        <MaterialIcons name="place" size={20} color="#50565A" />
      </View>
      <View className="flex-1">
        <Typography
          variant="body"
          weight="600"
          numberOfLines={1}
          ellipsizeMode="tail"
          style={{
            fontFamily: 'Nunito_600SemiBold',
            fontSize: 14,
            lineHeight: 20,
            letterSpacing: 0,
            color: '#50565A',
          }}>
          {item.name}
        </Typography>
        <Typography
          variant="caption"
          numberOfLines={1}
          ellipsizeMode="tail"
          style={{
            fontFamily: 'Nunito_600SemiBold',
            fontSize: 12,
            lineHeight: 18,
            letterSpacing: 0,
            color: '#BDBCBC',
          }}>
          {item.address}
        </Typography>
      </View>
    </TouchableOpacity>
  )
}
