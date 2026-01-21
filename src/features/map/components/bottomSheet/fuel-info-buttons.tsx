import { Button } from '@/shared/ui/button'
import { useTranslation } from '@/shared/hooks/use-translation'
import { useDirectionsStore } from '@/shared/stores/directions-store'
import { useMemo, useState } from 'react'
import { View } from 'react-native'
import { DiscountCardModal } from './discount-card-modal'

interface FuelInfoButtonsProps {
  onStartTrip?: () => void
  onEndTrip?: () => void
}

export function FuelInfoButtons({
  onStartTrip,
  onEndTrip,
}: FuelInfoButtonsProps) {
  const { t } = useTranslation()
  const directions = useDirectionsStore((s) => s.directions)
  const selectedRouteSectionId = useDirectionsStore(
    (s) => s.selectedRouteSectionId,
  )
  const isTripActive = useDirectionsStore((s) => s.isTripActive)
  const [isDiscountCardModalVisible, setIsDiscountCardModalVisible] =
    useState(false)

  const selectedSection = useMemo(() => {
    if (!directions?.route || directions.route.length === 0) return null
    if (!selectedRouteSectionId) return null
    return (
      directions.route.find(
        (s) => s.routeSectionId === selectedRouteSectionId,
      ) ?? null
    )
  }, [directions, selectedRouteSectionId])

  if (!selectedSection) return null

  const handleButtonPress = () => {
    if (isTripActive) {
      onEndTrip?.()
    } else {
      onStartTrip?.()
    }
  }

  return (
    <View className="gap-2" style={{ marginTop: 16 }}>
      {!isTripActive && (
        <Button
          variant="outline"
          size="md"
          onPress={() => {
            setIsDiscountCardModalVisible(true)
          }}
          style={{ width: '100%' }}>
          {t('fuelInfo.getDiscountCard')}
        </Button>
      )}
      <Button
        variant="primary"
        size="md"
        onPress={handleButtonPress}
        style={{ width: '100%' }}>
        {isTripActive ? t('fuelInfo.endTrip') : t('fuelInfo.go')}
      </Button>

      <DiscountCardModal
        visible={isDiscountCardModalVisible}
        onClose={() => setIsDiscountCardModalVisible(false)}
        onSubmit={(data) => {
          // TODO: Handle form submission
          console.log('Discount card form submitted:', data)
        }}
      />
    </View>
  )
}
