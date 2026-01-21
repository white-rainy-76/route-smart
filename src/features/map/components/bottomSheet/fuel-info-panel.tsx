import { Typography } from '@/shared/ui/typography'
import { useTheme } from '@/shared/hooks/use-theme'
import { useTranslation } from '@/shared/hooks/use-translation'
import { useDirectionsStore } from '@/shared/stores/directions-store'
import { MaterialIcons } from '@expo/vector-icons'
import { useMemo } from 'react'
import { View } from 'react-native'

function formatMoney(value: number) {
  return `$${value.toFixed(2)}`
}

function formatPricePerGallon(value: number) {
  return `$${value.toFixed(3)}`
}

export function FuelInfoPanel() {
  const { t } = useTranslation()
  const { resolvedTheme } = useTheme()
  const directions = useDirectionsStore((s) => s.directions)
  const selectedRouteSectionId = useDirectionsStore(
    (s) => s.selectedRouteSectionId,
  )

  const selectedSection = useMemo(() => {
    if (!directions?.route || directions.route.length === 0) return null
    if (!selectedRouteSectionId) return null
    return (
      directions.route.find(
        (s) => s.routeSectionId === selectedRouteSectionId,
      ) ?? null
    )
  }, [directions, selectedRouteSectionId])

  const fuelPricePerGallon = 2.89
  const gallons = selectedSection?.routeInfo.gallons ?? 0
  const totalPrice = gallons * fuelPricePerGallon

  // Theme colors
  const textColor = resolvedTheme === 'dark' ? '#F8FAFC' : '#111827'
  const mutedColor = resolvedTheme === 'dark' ? '#94A3B8' : '#6B7280'
  const borderColor = resolvedTheme === 'dark' ? '#334155' : '#E5E7EB'
  const cardBg = resolvedTheme === 'dark' ? '#1E293B' : '#FFFFFF'
  const discountBg = resolvedTheme === 'dark' ? '#064E3B' : '#ECFDF5'
  const discountBorder = resolvedTheme === 'dark' ? '#065F46' : '#D1FAE5'

  if (!selectedSection) return null

  return (
    <View
      className="mt-4 rounded-2xl p-5"
      style={{
        backgroundColor: cardBg,
        borderWidth: 1,
        borderColor: borderColor,
        shadowColor: resolvedTheme === 'dark' ? '#000' : '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: resolvedTheme === 'dark' ? 0.3 : 0.05,
        shadowRadius: 3,
        elevation: 2,
      }}>
      <View className="flex-row items-baseline justify-between mb-2.5">
        <Typography variant="label" weight="800" color="#4964D8">
          {t('fuelInfo.title')}
        </Typography>
      </View>

      {/* Gallons, Price per gallon, Total */}
      <View className="flex-row items-center justify-between mb-3">
        <View className="flex-1">
          <Typography
            variant="caption"
            weight="600"
            className="text-muted-foreground">
            {t('fuelInfo.gallons')}
          </Typography>
          <Typography
            variant="bodySmall"
            weight="700"
            className="mt-0.5"
            style={{ fontSize: 13, color: textColor }}>
            {gallons.toFixed(1)}
          </Typography>
        </View>

        <View className="flex-1 items-center">
          <Typography
            variant="caption"
            weight="600"
            className="text-muted-foreground">
            {t('fuelInfo.pricePerGallon')}
          </Typography>
          <View className="mt-0.5 px-2 py-0.5 rounded-[6px] bg-primary/10 border border-primary">
            <Typography
              variant="bodySmall"
              weight="700"
              className="text-primary"
              style={{ fontSize: 13, color: textColor }}>
              {formatPricePerGallon(fuelPricePerGallon)}
            </Typography>
          </View>
        </View>

        <View className="flex-1 items-end">
          <Typography
            variant="caption"
            weight="600"
            className="text-muted-foreground">
            {t('fuelInfo.total')}
          </Typography>
          <Typography
            variant="bodySmall"
            weight="700"
            className="mt-0.5"
            style={{ fontSize: 13, color: textColor }}>
            {totalPrice > 0 ? formatMoney(totalPrice) : '-'}
          </Typography>
        </View>
      </View>

      {/* Discount card text */}
      <View
        className="px-4 py-3 rounded-xl"
        style={{
          backgroundColor: discountBg,
          borderWidth: 1,
          borderColor: discountBorder,
        }}>
        <View className="flex-row items-center mb-1">
          <MaterialIcons name="info" size={16} color="#10B981" />
          <Typography
            variant="caption"
            weight="600"
            style={{ color: '#10B981', fontSize: 12, marginLeft: 6 }}>
            Discount Available
          </Typography>
        </View>
        <Typography
          variant="caption"
          weight="400"
          style={{ color: mutedColor, fontSize: 12 }}>
          {t('fuelInfo.discountText')}
        </Typography>
      </View>
    </View>
  )
}
