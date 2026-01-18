import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Typography } from '@/components/ui/typography'
import { useTheme } from '@/shared/hooks/use-theme'
import { useTranslation } from '@/shared/hooks/use-translation'
import { MaterialIcons } from '@expo/vector-icons'
import { useState } from 'react'
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  StyleSheet,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

interface SaveRouteNameModalProps {
  visible: boolean
  onClose: () => void
  onSave: (name: string | null) => void
}

export function SaveRouteNameModal({
  visible,
  onClose,
  onSave,
}: SaveRouteNameModalProps) {
  const { t } = useTranslation()
  const { resolvedTheme } = useTheme()
  const insets = useSafeAreaInsets()
  const [routeName, setRouteName] = useState('')

  const mutedColor = resolvedTheme === 'dark' ? '#94A3B8' : '#6B7280'
  const modalBg = resolvedTheme === 'dark' ? '#1E293B' : '#FFFFFF'
  const overlayBg =
    resolvedTheme === 'dark' ? 'rgba(0, 0, 0, 0.7)' : 'rgba(0, 0, 0, 0.5)'

  const handleSave = () => {
    const trimmedName = routeName.trim()
    onSave(trimmedName.length > 0 ? trimmedName : null)
    setRouteName('')
  }

  const handleClose = () => {
    setRouteName('')
    onClose()
  }

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleClose}>
      <TouchableWithoutFeedback onPress={handleClose}>
        <KeyboardAvoidingView
          style={[styles.overlay, { backgroundColor: overlayBg }]}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}>
          <TouchableWithoutFeedback>
            <View
              style={[
                styles.modal,
                {
                  backgroundColor: modalBg,
                  marginTop: Platform.OS === 'ios' ? 0 : 40,
                  marginBottom: insets.bottom,
                },
              ]}>
              {/* Header */}
              <View className="flex-row items-center justify-between mb-4">
                <Typography
                  variant="h3"
                  weight="700"
                  className="text-foreground">
                  {t('savedRoutes.saveRoute') || 'Save Route'}
                </Typography>
                <TouchableOpacity
                  onPress={handleClose}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                  <MaterialIcons name="close" size={24} color={mutedColor} />
                </TouchableOpacity>
              </View>

              {/* Input */}
              <View className="mb-6">
                <Input
                  label={t('savedRoutes.routeName') || 'Route Name (Optional)'}
                  value={routeName}
                  onChangeText={setRouteName}
                  placeholder={
                    t('savedRoutes.routeNamePlaceholder') ||
                    'Enter route name...'
                  }
                  autoFocus
                  containerClassName="mb-0"
                />
                <Typography
                  variant="caption"
                  style={{ color: mutedColor, marginTop: 8, fontSize: 12 }}>
                  {t('savedRoutes.routeNameHint') ||
                    "You can leave this empty if you don't want to name the route"}
                </Typography>
              </View>

              {/* Buttons */}
              <View className="flex-row gap-3">
                <View className="flex-1">
                  <Button
                    variant="outline"
                    size="sm"
                    onPress={handleClose}
                    textClassName="text-foreground">
                    {t('common.cancel') || 'Cancel'}
                  </Button>
                </View>
                <View className="flex-1">
                  <Button variant="primary" size="sm" onPress={handleSave}>
                    {t('common.save') || 'Save'}
                  </Button>
                </View>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
      </TouchableWithoutFeedback>
    </Modal>
  )
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modal: {
    width: '100%',
    maxWidth: 400,
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
})
