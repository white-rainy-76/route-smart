import { useTranslation } from '@/shared/hooks/use-translation'
import { Button } from '@/shared/ui/button'
import {
    useDirections,
    useDirectionsSelectedRouteSectionId,
    useDirectionsTripActive,
} from '@/stores/directions/hooks'
import { useMemo } from 'react'
import { Linking, View } from 'react-native'

interface FuelInfoButtonsProps {
  onStartTrip?: () => void
  onEndTrip?: () => void
}

export function FuelInfoButtons({
  onStartTrip,
  onEndTrip,
}: FuelInfoButtonsProps) {
  const { t } = useTranslation()
  const directions = useDirections()
  const selectedRouteSectionId = useDirectionsSelectedRouteSectionId()
  const isTripActive = useDirectionsTripActive()

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

  const handleDiscountCardPress = async () => {
    const url = 'https://fuelsmart.us/smart_tolls_application'
    const canOpen = await Linking.canOpenURL(url)
    if (canOpen) {
      await Linking.openURL(url)
    }
  }

  return (
    <View className="gap-2" style={{ marginTop: 16 }}>
      {!isTripActive && (
        <Button
          variant="outline"
          size="md"
          onPress={handleDiscountCardPress}
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
    </View>
  )
}
