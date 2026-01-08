import { cn } from '@/shared/utils/theme'
import { Pressable, PressableProps, ViewStyle } from 'react-native'
import { Typography } from './typography'

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost'
export type ButtonSize = 'sm' | 'md' | 'lg'

export interface ButtonProps extends Omit<PressableProps, 'children'> {
  variant?: ButtonVariant
  size?: ButtonSize
  children: React.ReactNode
  className?: string
  textClassName?: string
  disabled?: boolean
}

const buttonVariants: Record<
  ButtonVariant,
  { bg: string; textColor: string; border?: string }
> = {
  primary: {
    bg: '#4964D8',
    textColor: '#FFFFFF',
  },
  secondary: {
    bg: '#EFF3F9',
    textColor: '#383838',
  },
  outline: {
    bg: 'transparent',
    textColor: '#4964D8',
    border: '#4964D8',
  },
  ghost: {
    bg: 'transparent',
    textColor: '#77808D',
  },
}

const buttonSizes: Record<
  ButtonSize,
  {
    height: number
    width?: number
    paddingHorizontal: number
    fontSize: number
    lineHeight: number
  }
> = {
  sm: { height: 36, paddingHorizontal: 16, fontSize: 14, lineHeight: 20 },
  md: {
    height: 48,
    width: 265,
    paddingHorizontal: 24,
    fontSize: 16,
    lineHeight: 24,
  },
  lg: { height: 56, paddingHorizontal: 32, fontSize: 18, lineHeight: 24 },
}

export function Button({
  variant = 'primary',
  size = 'md',
  children,
  className,
  textClassName,
  disabled = false,
  style,
  ...props
}: ButtonProps) {
  const variantStyle = buttonVariants[variant]
  const sizeStyle = buttonSizes[size]

  const buttonStyle: ViewStyle = {
    backgroundColor: variantStyle.bg,
    height: sizeStyle.height,
    width: sizeStyle.width,
    paddingHorizontal: sizeStyle.width ? 0 : sizeStyle.paddingHorizontal,
    borderRadius: size === 'md' ? 24.05 : size === 'lg' ? 28 : 18,
    borderWidth: variantStyle.border ? 1 : 0,
    borderColor: variantStyle.border,
    opacity: disabled ? 0.5 : 1,
    alignItems: 'center',
    justifyContent: 'center',
  }

  return (
    <Pressable
      className={cn(className)}
      style={[buttonStyle, style] as PressableProps['style']}
      disabled={disabled}
      {...props}>
      {typeof children === 'string' ? (
        <Typography
          variant="body"
          weight="700"
          align="center"
          color={variantStyle.textColor}
          className={textClassName}
          style={{
            fontSize: sizeStyle.fontSize,
            lineHeight: sizeStyle.lineHeight,
          }}>
          {children}
        </Typography>
      ) : (
        children
      )}
    </Pressable>
  )
}
