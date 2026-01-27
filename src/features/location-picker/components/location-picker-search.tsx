import { useTheme } from '@/shared/hooks/use-theme'
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
  const { resolvedTheme } = useTheme()
  const showClear = Boolean(onClear) && value.length > 0

  // Theme colors
  const textColor = resolvedTheme === 'dark' ? '#F8FAFC' : '#111827'
  const mutedColor = resolvedTheme === 'dark' ? '#94A3B8' : '#6B7280'
  const borderColor = resolvedTheme === 'dark' ? '#334155' : '#E5E7EB'
  const inputBg = resolvedTheme === 'dark' ? '#1E293B' : '#FFFFFF'
  const placeholderColor = resolvedTheme === 'dark' ? '#64748B' : '#94A3B8'

  return (
    <View className="px-5 mb-4">
      <View
        className="flex-row items-center rounded-2xl px-4 py-3"
        style={{
          backgroundColor: inputBg,
          borderWidth: 1,
          borderColor: borderColor,
        }}>
        <MaterialIcons name="search" size={20} color={mutedColor} />
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={placeholderColor}
          autoFocus={autoFocus}
          className="flex-1 ml-3"
          style={{
            fontFamily: 'Nunito_400Regular',
            fontSize: 16,
            lineHeight: 20,
            color: textColor,
          }}
        />
        {showClear && (
          <TouchableOpacity
            onPress={onClear}
            className="ml-2"
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <MaterialIcons name="close" size={20} color={mutedColor} />
          </TouchableOpacity>
        )}
      </View>
    </View>
  )
}
