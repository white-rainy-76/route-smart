import { cn } from '@/shared/utils/theme'
import { Platform, Text, TextProps } from 'react-native'

export type TypographyVariant =
  | 'h1'
  | 'h2'
  | 'h3'
  | 'h4'
  | 'body'
  | 'bodyLarge'
  | 'bodySmall'
  | 'caption'
  | 'label'

export type TypographyWeight = '400' | '500' | '600' | '700' | '800' | '900'

export interface TypographyProps extends TextProps {
  variant?: TypographyVariant
  weight?: TypographyWeight
  align?: 'left' | 'center' | 'right' | 'justify'
  color?: string
  className?: string
  children: React.ReactNode
}

// Mapping для весов шрифта к именам шрифтов Expo Google Fonts
const fontFamilyMap: Record<TypographyWeight, string> = {
  '400': 'Nunito_400Regular',
  '500': 'Nunito_500Medium',
  '600': 'Nunito_600SemiBold',
  '700': 'Nunito_700Bold',
  '800': 'Nunito_800ExtraBold',
  '900': 'Nunito_900Black',
}

// Базовые стили для каждого варианта с учётом различий между платформами
// Android рендерит Nunito шире, поэтому используем меньшие размеры
const variantStyles: Record<
  TypographyVariant,
  { fontSize: number; lineHeight: number; defaultWeight: TypographyWeight }
> = {
  h1: {
    fontSize: Platform.select({ android: 28, default: 32 })!,
    lineHeight: Platform.select({ android: 32, default: 36 })!,
    defaultWeight: '700',
  },
  h2: {
    fontSize: Platform.select({ android: 22, default: 24 })!,
    lineHeight: Platform.select({ android: 26, default: 28 })!,
    defaultWeight: '700',
  },
  h3: { fontSize: 20, lineHeight: 24, defaultWeight: '600' },
  h4: { fontSize: 18, lineHeight: 22, defaultWeight: '600' },
  bodyLarge: { fontSize: 18, lineHeight: 26, defaultWeight: '400' },
  body: { fontSize: 16, lineHeight: 24, defaultWeight: '400' },
  bodySmall: { fontSize: 14, lineHeight: 20, defaultWeight: '400' },
  caption: { fontSize: 12, lineHeight: 16, defaultWeight: '400' },
  label: { fontSize: 14, lineHeight: 20, defaultWeight: '600' },
}

export function Typography({
  variant = 'body',
  weight,
  align = 'left',
  color,
  className,
  style,
  children,
  ...props
}: TypographyProps) {
  const variantStyle = variantStyles[variant]
  const finalWeight = weight || variantStyle.defaultWeight

  const textStyle = {
    fontFamily: Platform.select({
      ios: fontFamilyMap[finalWeight],
      android: fontFamilyMap[finalWeight],
      web: 'Nunito',
      default: fontFamilyMap[finalWeight],
    }),
    fontSize: variantStyle.fontSize,
    lineHeight: variantStyle.lineHeight,
    fontWeight: Platform.select({
      web: finalWeight as '400' | '500' | '600' | '700' | '800' | '900',
      default: 'normal' as const, // В React Native используем fontFamily для веса
    }),
    textAlign: align,
    color:
      color || (variant === 'h1' || variant === 'h2' ? '#383838' : '#77808D'),
  }

  return (
    <Text className={cn(className)} style={[textStyle, style]} {...props}>
      {children}
    </Text>
  )
}
