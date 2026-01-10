import { MaterialIcons } from '@expo/vector-icons'
import { TextInput, TouchableOpacity, View } from 'react-native'

interface LocationPickerSearchProps {
  value: string
  onChangeText: (text: string) => void
  onClear?: () => void
  placeholder?: string
  autoFocus?: boolean
}

export function LocationPickerSearch({
  value,
  onChangeText,
  onClear,
  placeholder = 'Enter your start point',
  autoFocus = false,
}: LocationPickerSearchProps) {
  const showClear = Boolean(onClear) && value.length > 0

  return (
    <View className="px-5" style={{ marginBottom: 16 }}>
      <View
        className="rounded-lg border-[1.5px] border-[#C1C6CC] flex-row items-center px-3"
        style={{ height: 44 }}>
        <View className="mr-3">
          <MaterialIcons name="search" size={20} color="#BDBCBC" />
        </View>
        <TextInput
          placeholder={placeholder}
          placeholderTextColor="#BDBCBC"
          value={value}
          onChangeText={onChangeText}
          autoFocus={autoFocus}
          className="flex-1 text-[#383838] p-0 m-0"
          style={{
            fontFamily: 'Nunito_600SemiBold',
            fontSize: 14,
            lineHeight: 20,
            letterSpacing: 0,
          }}
        />
        {showClear && (
          <TouchableOpacity
            onPress={onClear}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <MaterialIcons name="close" size={20} color="#BDBCBC" />
          </TouchableOpacity>
        )}
      </View>
    </View>
  )
}
