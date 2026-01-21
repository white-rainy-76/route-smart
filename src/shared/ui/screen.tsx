import { View, ViewProps } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

export interface ScreenProps extends ViewProps {
  /** Add padding for top safe area (status bar, notch) */
  safeTop?: boolean
  /** Add padding for bottom safe area (navigation bar, home indicator) */
  safeBottom?: boolean
  /** Additional bottom padding (added to safe area) */
  bottomPadding?: number
  children: React.ReactNode
}

/**
 * Screen wrapper that handles safe area insets automatically.
 * Use this component as the root container for your screens.
 */
export function Screen({
  safeTop = false,
  safeBottom = true,
  bottomPadding = 0,
  children,
  style,
  className,
  ...props
}: ScreenProps) {
  const insets = useSafeAreaInsets()

  return (
    <View
      className={className ?? 'flex-1 bg-background'}
      style={[
        {
          paddingTop: safeTop ? insets.top : 0,
          paddingBottom: safeBottom ? insets.bottom + bottomPadding : bottomPadding,
        },
        style,
      ]}
      {...props}>
      {children}
    </View>
  )
}

