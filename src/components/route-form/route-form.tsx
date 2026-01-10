import { Button } from '@/components/ui/button'
import { useTheme } from '@/shared/hooks/use-theme'
import { useTranslation } from '@/shared/hooks/use-translation'
import { useRouteStore } from '@/shared/stores/route-store'
import { MaterialIcons } from '@expo/vector-icons'
import { BottomSheetTextInput } from '@gorhom/bottom-sheet'
import { router } from 'expo-router'
import { useState } from 'react'
import { View } from 'react-native'
import { RouteInput } from './route-input'

export function RouteForm({
  onManageWaypoints,
}: {
  onManageWaypoints?: () => void
}) {
  const { t } = useTranslation()
  const { resolvedTheme } = useTheme()
  const { origin, destination, waypoints, hasOriginAndDestination } =
    useRouteStore()

  const [mpg, setMpg] = useState('')
  const totalPointsCount = waypoints.length + (destination ? 1 : 0)

  const mutedColor = resolvedTheme === 'dark' ? '#94A3B8' : '#64748B'
  const valueColor = resolvedTheme === 'dark' ? '#F8FAFC' : '#50565A'

  const handleOriginPress = () => {
    router.push('/location-picker?type=origin')
  }

  const handleDestinationPress = () => {
    if (waypoints.length > 0 && onManageWaypoints) {
      onManageWaypoints()
      return
    }
    router.push('/location-picker?type=destination')
  }

  const handleAddWaypoint = () => {
    router.push('/location-picker?type=waypoint')
  }

  const handleSubmit = () => {
    // TODO: Submit form
    console.log('Submit', { origin, destination, waypoints, mpg })
  }

  const destinationValueText =
    origin && destination && waypoints.length > 0
      ? [origin.name, ...waypoints.map((w) => w.name), destination.name].join(
          ' - ',
        )
      : null

  return (
    <View>
      {/* Container with icons on left and inputs on right */}
      <View className="flex-row">
        {/* Left side: Icons with dots between them */}
        <View className="items-center mr-[15px] mt-1">
          <MaterialIcons
            name="place"
            size={15}
            color={origin ? '#4964D8' : mutedColor}
          />
          <View className="my-2">
            <View className="w-1 h-1 bg-muted-foreground rounded-full mb-1" />
            <View className="w-1 h-1 bg-muted-foreground rounded-full mb-1" />
            <View className="w-1 h-1 bg-muted-foreground rounded-full" />
          </View>
          <MaterialIcons
            name="place"
            size={15}
            color={destination ? '#4964D8' : mutedColor}
          />
        </View>

        {/* Right side: Two input fields */}
        <View className="flex-1">
          <RouteInput
            label={t('routeForm.chooseStart')}
            point={origin}
            onPress={handleOriginPress}
            icon="place"
            showIcon={false}
          />
          <View className="mt-5">
            <RouteInput
              label={t('routeForm.chooseDestination')}
              point={destination}
              waypointsCount={totalPointsCount}
              valueText={destinationValueText}
              numberOfLines={4}
              showAddButton={hasOriginAndDestination()}
              onPress={handleDestinationPress}
              onAddPress={handleAddWaypoint}
              icon="place"
              showIcon={false}
            />
          </View>
        </View>
      </View>

      <View className="mt-5 mb-0">
        <View className="flex-row items-center w-[240px]">
          <View className="mr-[15px]">
            <MaterialIcons name="speed" size={15} color={mutedColor} />
          </View>
          <BottomSheetTextInput
            value={mpg}
            onChangeText={setMpg}
            placeholder={t('routeForm.mpgPlaceholder')}
            placeholderTextColor={mutedColor}
            keyboardType="numeric"
            className="flex-1 p-0"
            style={{
              fontFamily: 'Nunito_400Regular',
              fontSize: 16,
              lineHeight: 20,
              letterSpacing: 0,
              color: valueColor,
            }}
          />
        </View>
        <View className="h-[1px] bg-border mt-1 ml-[39px]" />
      </View>

      <View className="mt-[26px]">
        <Button
          variant="primary"
          size="lg"
          onPress={handleSubmit}
          disabled={!hasOriginAndDestination()}>
          {t('routeForm.calculate')}
        </Button>
      </View>
    </View>
  )
}
