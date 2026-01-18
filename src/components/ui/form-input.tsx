import { useTheme } from '@/shared/hooks/use-theme'
import { cn } from '@/shared/utils/theme'
import { Ionicons } from '@expo/vector-icons'
import { forwardRef, useState } from 'react'
import { TextInput, TextInputProps, TouchableOpacity, View } from 'react-native'
import { Typography } from './typography'

export interface FormInputProps extends TextInputProps {
  label?: string
  error?: string
  leftIcon?: keyof typeof Ionicons.glyphMap
  rightIcon?: keyof typeof Ionicons.glyphMap
  onRightIconPress?: () => void
  containerClassName?: string
}

export const FormInput = forwardRef<TextInput, FormInputProps>(
  (
    {
      label,
      error,
      leftIcon,
      rightIcon,
      onRightIconPress,
      containerClassName,
      className,
      style,
      secureTextEntry,
      ...props
    },
    ref,
  ) => {
    const { resolvedTheme } = useTheme()
    const [isFocused, setIsFocused] = useState(false)
    const [isPasswordVisible, setIsPasswordVisible] = useState(false)
    const isPassword = secureTextEntry
    const showPasswordToggle = isPassword && !rightIcon

    const handlePasswordToggle = () => {
      setIsPasswordVisible(!isPasswordVisible)
    }

    const borderColor = error
      ? '#EF4444'
      : isFocused
        ? '#4964D8'
        : resolvedTheme === 'dark'
          ? '#334155'
          : '#E5E7EB'

    const backgroundColor = resolvedTheme === 'dark' ? '#1E293B' : '#FFFFFF'

    const textColor = resolvedTheme === 'dark' ? '#F8FAFC' : '#11181C'

    const placeholderColor = resolvedTheme === 'dark' ? '#64748B' : '#94A3B8'

    const iconColor = resolvedTheme === 'dark' ? '#64748B' : '#94A3B8'

    return (
      <View className={cn('gap-1.5', containerClassName)}>
        {label && (
          <Typography
            variant="label"
            weight="600"
            className="text-foreground"
            style={{ fontSize: 13, marginBottom: 4 }}>
            {label}
          </Typography>
        )}
        <View
          className="relative"
          style={{
            shadowColor: isFocused && !error ? '#4964D8' : '#000',
            shadowOffset: {
              width: 0,
              height: isFocused ? 2 : 1,
            },
            shadowOpacity: isFocused ? 0.1 : 0.05,
            shadowRadius: isFocused ? 4 : 2,
            elevation: isFocused ? 2 : 1,
          }}>
          {leftIcon && (
            <View className="absolute left-4 top-0 bottom-0 justify-center z-10">
              <Ionicons name={leftIcon} size={18} color={iconColor} />
            </View>
          )}
          <TextInput
            ref={ref}
            secureTextEntry={isPassword && !isPasswordVisible}
            placeholderTextColor={placeholderColor}
            onFocus={() => setIsFocused(true)}
            onBlur={(e) => {
              setIsFocused(false)
              props.onBlur?.(e)
            }}
            className={cn(
              'rounded-xl px-4 text-foreground text-base',
              leftIcon && 'pl-11',
              (rightIcon || showPasswordToggle) && 'pr-11',
              className,
            )}
            style={[
              {
                fontFamily: 'Nunito_400Regular',
                backgroundColor,
                borderWidth: 1.5,
                borderColor,
                paddingVertical: 14,
                paddingHorizontal: 16,
                fontSize: 15,
                color: textColor,
                minHeight: 52,
              },
              style,
            ]}
            {...props}
          />
          {showPasswordToggle && (
            <TouchableOpacity
              onPress={handlePasswordToggle}
              className="absolute right-4 top-0 bottom-0 justify-center"
              activeOpacity={0.7}>
              <Ionicons
                name={isPasswordVisible ? 'eye-off-outline' : 'eye-outline'}
                size={20}
                color={iconColor}
              />
            </TouchableOpacity>
          )}
          {rightIcon && !showPasswordToggle && (
            <TouchableOpacity
              onPress={onRightIconPress}
              className="absolute right-4 top-0 bottom-0 justify-center"
              activeOpacity={0.7}>
              <Ionicons name={rightIcon} size={18} color={iconColor} />
            </TouchableOpacity>
          )}
        </View>
        {error && (
          <View className="flex-row items-center gap-1.5 mt-1">
            <Ionicons name="alert-circle" size={14} color="#EF4444" />
            <Typography
              variant="caption"
              color="#EF4444"
              style={{ fontSize: 12 }}>
              {error}
            </Typography>
          </View>
        )}
      </View>
    )
  },
)

FormInput.displayName = 'FormInput'
