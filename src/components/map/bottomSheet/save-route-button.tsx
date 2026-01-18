import { SavedRoutesIcon } from '@/components/ui/icons'
import { useAddSavedRouteMutation } from '@/services/route/add-saved-route'
import { routeQueries } from '@/services/route/get-saved-route'
import { useTranslation } from '@/shared/hooks/use-translation'
import { useDirectionsStore } from '@/shared/stores/directions-store'
import { useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { Alert, StyleSheet, TouchableOpacity } from 'react-native'
import { SaveRouteNameModal } from './save-route-name-modal'

interface SaveRouteButtonProps {
  onPress?: () => void
  disabled?: boolean
}

export function SaveRouteButton({ onPress, disabled }: SaveRouteButtonProps) {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const selectedRouteSectionId = useDirectionsStore(
    (s) => s.selectedRouteSectionId,
  )
  const [isModalVisible, setIsModalVisible] = useState(false)

  const addSavedRouteMutation = useAddSavedRouteMutation({
    onSuccess: () => {
      // Инвалидируем список сохранённых маршрутов
      queryClient.invalidateQueries({ queryKey: routeQueries.all() })
      Alert.alert(t('common.save'), 'Route saved successfully')
      onPress?.()
    },
    onError: () => {
      Alert.alert(t('common.error'), 'Failed to save route')
    },
  })

  const handleSaveClick = () => {
    if (!selectedRouteSectionId) {
      Alert.alert(t('common.error'), 'No route selected')
      return
    }

    setIsModalVisible(true)
  }

  const handleSaveWithName = (name: string | null) => {
    setIsModalVisible(false)

    if (!selectedRouteSectionId) return

    addSavedRouteMutation.mutate({
      routeSectionId: selectedRouteSectionId,
      routeName: name || undefined,
    })
  }

  const isDisabled =
    disabled || addSavedRouteMutation.isPending || !selectedRouteSectionId

  return (
    <>
      <TouchableOpacity
        onPress={handleSaveClick}
        disabled={isDisabled}
        style={[styles.button, isDisabled && styles.buttonDisabled]}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
        <SavedRoutesIcon
          color={isDisabled ? 'rgba(255, 255, 255, 0.4)' : '#FFFFFF'}
          width={24}
          height={24}
        />
      </TouchableOpacity>

      <SaveRouteNameModal
        visible={isModalVisible}
        onClose={() => setIsModalVisible(false)}
        onSave={handleSaveWithName}
      />
    </>
  )
}

const styles = StyleSheet.create({
  button: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
})
