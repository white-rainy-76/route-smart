import { cn } from '@/shared/utils/theme'
import { Ionicons } from '@expo/vector-icons'
import { forwardRef, useState } from 'react'
import { TextInput, TextInputProps, TouchableOpacity, View } from 'react-native'
import { Typography } from './typography'

export interface InputProps extends TextInputProps {
  label?: string
  error?: string
  leftIcon?: keyof typeof Ionicons.glyphMap
  rightIcon?: keyof typeof Ionicons.glyphMap
  onRightIconPress?: () => void
  containerClassName?: string
}

export const Input = forwardRef<TextInput, InputProps>(
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
    const [isPasswordVisible, setIsPasswordVisible] = useState(false)
    const isPassword = secureTextEntry
    const showPasswordToggle = isPassword && !rightIcon

    const handlePasswordToggle = () => {
      setIsPasswordVisible(!isPasswordVisible)
    }

    return (
      <View className={cn('gap-2', containerClassName)}>
        {label && (
          <Typography
            variant="label"
            weight="600"
            color="#383838"
            className="mb-1">
            {label}
          </Typography>
        )}
        <View className="relative">
          {leftIcon && (
            <View className="absolute left-4 top-0 bottom-0 justify-center z-10">
              <Ionicons name={leftIcon} size={20} color="#94a3b8" />
            </View>
          )}
          <TextInput
            ref={ref}
            secureTextEntry={isPassword && !isPasswordVisible}
            placeholderTextColor="#94a3b8"
            className={cn(
              'bg-card border-2 rounded-2xl px-4 py-4 text-foreground text-base',
              error ? 'border-red-500' : 'border-input',
              leftIcon && 'pl-12',
              (rightIcon || showPasswordToggle) && 'pr-12',
              className,
            )}
            style={[
              {
                fontFamily: 'Nunito_400Regular',
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
                size={22}
                color="#94a3b8"
              />
            </TouchableOpacity>
          )}
          {rightIcon && !showPasswordToggle && (
            <TouchableOpacity
              onPress={onRightIconPress}
              className="absolute right-4 top-0 bottom-0 justify-center"
              activeOpacity={0.7}>
              <Ionicons name={rightIcon} size={20} color="#94a3b8" />
            </TouchableOpacity>
          )}
        </View>
        {error && (
          <Typography variant="caption" color="#ef4444" className="ml-1">
            {error}
          </Typography>
        )}
      </View>
    )
  },
)

Input.displayName = 'Input'
