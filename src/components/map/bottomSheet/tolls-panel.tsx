import { Typography } from '@/components/ui/typography'
import {
  AxelType,
  TollPaymentType,
  TollPriceTimeOfDay,
} from '@/services/tolls/get-tolls-along-polyline-sections'
import { useTheme } from '@/shared/hooks/use-theme'
import { useTranslation } from '@/shared/hooks/use-translation'
import { formatDriveTime } from '@/shared/lib/format-drive-time'
import { useDirectionsStore } from '@/shared/stores/directions-store'
import { useTollsStore } from '@/shared/stores/tolls-store'
import { useMemo, useState } from 'react'
import { TouchableOpacity, View } from 'react-native'

export const TOLL_PAYMENT_TYPE_PRIORITY: TollPaymentType[] = [
  TollPaymentType.PayOnline,
  TollPaymentType.VideoTolls,
  TollPaymentType.Cash,
  TollPaymentType.IPass,
  TollPaymentType.EZPass,
  TollPaymentType.SunPass,
  TollPaymentType.OutOfStateEZPass,
  TollPaymentType.AccountToll,
  TollPaymentType.NonAccountToll,
  TollPaymentType.PalPass,
]

function formatMoney(value: number) {
  return `$${value.toFixed(2)}`
}

function metersToMiles(meters: number): number {
  // 1 mile = 1609.34 meters
  return meters / 1609.34
}

export function getTollPaymentTypeLabel(type: TollPaymentType): string {
  switch (type) {
    case TollPaymentType.PayOnline:
      return 'Pay Online'
    case TollPaymentType.VideoTolls:
      return 'Video Tolls'
    case TollPaymentType.Cash:
      return 'Cash'
    case TollPaymentType.IPass:
      return 'IPass'
    case TollPaymentType.EZPass:
      return 'EZPass'
    case TollPaymentType.SunPass:
      return 'SunPass'
    case TollPaymentType.OutOfStateEZPass:
      return 'Out Of State EZPass'
    case TollPaymentType.AccountToll:
      return 'Account Toll'
    case TollPaymentType.NonAccountToll:
      return 'Non Account Toll'
    case TollPaymentType.PalPass:
      return 'PalPass'
    default:
      return 'Other'
  }
}

function isKnownPaymentType(
  value: number | null | undefined,
): value is TollPaymentType {
  if (value == null) return false
  if (typeof value !== 'number') return false
  // enum in TS is both ways; numeric membership check via values
  return Object.values(TollPaymentType).includes(value as TollPaymentType)
}

type TollPriceLite = {
  paymentType: number | null
  axelType: number
  timeOfDay: number | null
  amount: number
}

export function getTollPriceAmountFor(
  tollPrices: TollPriceLite[] | undefined,
  axelType: AxelType,
  paymentType: TollPaymentType,
): number | undefined {
  if (!tollPrices || tollPrices.length === 0) return undefined

  const matches = tollPrices.filter((tp) => {
    if (tp.axelType !== axelType) return false
    if (!isKnownPaymentType(tp.paymentType)) return false
    return tp.paymentType === paymentType
  })

  if (matches.length === 0) return undefined

  // Prefer "Any" (or null) time-of-day entries, then fallback to min amount for determinism.
  const anyTimeMatches = matches.filter(
    (m) => m.timeOfDay == null || m.timeOfDay === TollPriceTimeOfDay.Any,
  )
  const candidates = anyTimeMatches.length > 0 ? anyTimeMatches : matches
  return Math.min(...candidates.map((c) => c.amount))
}

export function getAvailablePaymentTypesForAxles(
  tollsInput: {
    tollPrices?: TollPriceLite[] | undefined
    payOnline?: number | undefined
    iPass?: number | undefined
  }[],
  axelType: AxelType,
): TollPaymentType[] {
  const set = new Set<TollPaymentType>()

  for (const toll of tollsInput) {
    // Prefer tollPrices; but keep backward compatibility with older fields.
    if (toll.tollPrices && toll.tollPrices.length > 0) {
      for (const tp of toll.tollPrices) {
        if (tp.axelType !== axelType) continue
        if (!isKnownPaymentType(tp.paymentType)) continue
        set.add(tp.paymentType)
      }
    } else {
      if ((toll.payOnline ?? 0) > 0) set.add(TollPaymentType.PayOnline)
      if ((toll.iPass ?? 0) > 0) set.add(TollPaymentType.IPass)
    }
  }

  const all = Array.from(set.values())
  const priorityIndex = new Map(
    TOLL_PAYMENT_TYPE_PRIORITY.map((t, idx) => [t, idx]),
  )

  return all.sort((a, b) => {
    const ai = priorityIndex.has(a) ? priorityIndex.get(a)! : 999
    const bi = priorityIndex.has(b) ? priorityIndex.get(b)! : 999
    if (ai !== bi) return ai - bi
    return a - b
  })
}

export function TollsPanel() {
  const { t } = useTranslation()
  const { resolvedTheme } = useTheme()
  const directions = useDirectionsStore((s) => s.directions)
  const selectedRouteSectionId = useDirectionsStore(
    (s) => s.selectedRouteSectionId,
  )
  const tolls = useTollsStore((s) => s.tolls)

  const [selectedAxles, setSelectedAxles] = useState<5 | 6>(5)
  // null => will fall back to first available payment type (if any)
  const [selectedPaymentType, setSelectedPaymentType] =
    useState<TollPaymentType | null>(null)

  // Цвета для темы
  const textColor = resolvedTheme === 'dark' ? '#F8FAFC' : '#111827'
  const borderColor = resolvedTheme === 'dark' ? '#334155' : '#E5E7EB'
  const cardBg = resolvedTheme === 'dark' ? '#1E293B' : '#FFFFFF'
  const inactiveBorderColor = resolvedTheme === 'dark' ? '#475569' : '#D1D5DB'
  const inactiveTextColor = resolvedTheme === 'dark' ? '#94A3B8' : '#6B7280'

  // Функция для получения переведенного типа оплаты
  const getPaymentTypeTranslation = (type: TollPaymentType): string => {
    switch (type) {
      case TollPaymentType.PayOnline:
        return t('tolls.paymentTypes.payOnline')
      case TollPaymentType.VideoTolls:
        return t('tolls.paymentTypes.videoTolls')
      case TollPaymentType.Cash:
        return t('tolls.paymentTypes.cash')
      case TollPaymentType.IPass:
        return t('tolls.paymentTypes.iPass')
      case TollPaymentType.EZPass:
        return t('tolls.paymentTypes.ezPass')
      case TollPaymentType.SunPass:
        return t('tolls.paymentTypes.sunPass')
      case TollPaymentType.OutOfStateEZPass:
        return t('tolls.paymentTypes.outOfStateEZPass')
      case TollPaymentType.AccountToll:
        return t('tolls.paymentTypes.accountToll')
      case TollPaymentType.NonAccountToll:
        return t('tolls.paymentTypes.nonAccountToll')
      case TollPaymentType.PalPass:
        return t('tolls.paymentTypes.palPass')
      default:
        return t('tolls.paymentTypes.other')
    }
  }

  const selectedSection = useMemo(() => {
    if (!directions?.route || directions.route.length === 0) return null
    if (!selectedRouteSectionId) return null
    return (
      directions.route.find(
        (s) => s.routeSectionId === selectedRouteSectionId,
      ) ?? null
    )
  }, [directions, selectedRouteSectionId])

  const filteredTolls = useMemo(() => {
    if (!tolls || !selectedRouteSectionId) return []
    return tolls.filter(
      (toll) => toll.routeSection === selectedRouteSectionId && !toll.isDynamic,
    )
  }, [tolls, selectedRouteSectionId])

  const selectedAxelType = useMemo(
    () => (selectedAxles === 5 ? AxelType._5L : AxelType._6L),
    [selectedAxles],
  )

  const availablePaymentTypes = useMemo(() => {
    return getAvailablePaymentTypesForAxles(filteredTolls, selectedAxelType)
  }, [filteredTolls, selectedAxelType])

  const effectivePaymentType = useMemo(() => {
    if (availablePaymentTypes.length === 0) return null
    if (selectedPaymentType === null) return availablePaymentTypes[0]
    return availablePaymentTypes.includes(selectedPaymentType)
      ? selectedPaymentType
      : availablePaymentTypes[0]
  }, [availablePaymentTypes, selectedPaymentType])

  const tollsInfo = useMemo(() => {
    if (!filteredTolls || filteredTolls.length === 0) return { total: 0 }
    const payment = effectivePaymentType
    if (payment == null) return { total: 0 }

    const hasSelectedPrice = (toll: (typeof filteredTolls)[number]) => {
      return (
        getTollPriceAmountFor(toll.tollPrices, selectedAxelType, payment) !=
        null
      )
    }

    // Оставляем по ключу toll, у которого есть цена для выбранных осей и типа оплаты
    const uniqueTollsByKey = filteredTolls.reduce((acc, toll) => {
      const key = toll.key || toll.id
      if (!acc.has(key)) {
        acc.set(key, toll)
      } else {
        const existingToll = acc.get(key)!
        const existingHasPrice = hasSelectedPrice(existingToll)
        const currentHasPrice = hasSelectedPrice(toll)
        if (currentHasPrice && !existingHasPrice) {
          acc.set(key, toll)
        }
      }
      return acc
    }, new Map<string, (typeof filteredTolls)[number]>())

    const uniqueTolls = Array.from(uniqueTollsByKey.values())

    const total = uniqueTolls.reduce((sum, toll) => {
      const amountFromTollPrices = getTollPriceAmountFor(
        toll.tollPrices,
        selectedAxelType,
        payment,
      )
      if (amountFromTollPrices != null && amountFromTollPrices > 0) {
        return sum + amountFromTollPrices
      }
      return sum
    }, 0)

    return { total }
  }, [filteredTolls, selectedAxelType, effectivePaymentType])

  const selectPaymentType = (type: TollPaymentType) => {
    setSelectedPaymentType(type)
  }

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
          {t('tolls.title')}
        </Typography>
      </View>

      {/* Axles */}
      <View className="flex-row items-center justify-between">
        <Typography
          variant="caption"
          weight="600"
          className="text-muted-foreground">
          {t('tolls.axles')}
        </Typography>
        <View
          className="flex-row overflow-hidden rounded-[10px] border"
          style={{ borderColor }}>
          <TouchableOpacity
            className="px-3 py-1.5"
            style={{
              backgroundColor: selectedAxles === 5 ? '#4964D8' : cardBg,
            }}
            onPress={() => setSelectedAxles(5)}>
            <Typography
              variant="bodySmall"
              weight="600"
              style={{
                fontSize: 13,
                color: selectedAxles === 5 ? '#FFFFFF' : '#4964D8',
              }}>
              5
            </Typography>
          </TouchableOpacity>
          <TouchableOpacity
            className="px-3 py-1.5"
            style={{
              backgroundColor: selectedAxles === 6 ? '#4964D8' : cardBg,
            }}
            onPress={() => setSelectedAxles(6)}>
            <Typography
              variant="bodySmall"
              weight="600"
              style={{
                fontSize: 13,
                color: selectedAxles === 6 ? '#FFFFFF' : '#4964D8',
              }}>
              6
            </Typography>
          </TouchableOpacity>
        </View>
      </View>

      {/* Payment types */}
      <View className="mt-2.5">
        <Typography
          variant="caption"
          weight="600"
          className="text-muted-foreground mb-1.5">
          {t('tolls.payment')}
        </Typography>
        <View className="flex-row flex-wrap gap-2">
          {availablePaymentTypes.map((pt) => {
            const active = effectivePaymentType === pt
            return (
              <TouchableOpacity
                key={`pay-${pt}`}
                className="px-2.5 py-1.5 rounded-full border"
                style={{
                  borderColor: active ? '#4964D8' : inactiveBorderColor,
                  backgroundColor: active
                    ? '#EFF3FF'
                    : resolvedTheme === 'dark'
                      ? '#1F2937'
                      : '#FFFFFF',
                }}
                onPress={() => selectPaymentType(pt)}>
                <Typography
                  variant="caption"
                  weight="600"
                  style={{
                    fontSize: 12,
                    color: active ? '#4964D8' : inactiveTextColor,
                  }}>
                  {getPaymentTypeTranslation(pt)}
                </Typography>
              </TouchableOpacity>
            )
          })}
          {availablePaymentTypes.length === 0 && (
            <Typography
              variant="caption"
              weight="600"
              className="text-muted-foreground">
              {t('tolls.noPaymentData')}
            </Typography>
          )}
        </View>
      </View>

      {/* Summary */}
      <View
        className="mt-3 border-t pt-3 flex-row justify-between"
        style={{ borderTopColor: borderColor }}>
        <View className="flex-1">
          <Typography
            variant="caption"
            weight="600"
            className="text-muted-foreground"
            style={{ fontSize: 11 }}>
            {t('tolls.driveTime')}
          </Typography>
          <Typography
            variant="bodySmall"
            weight="700"
            className="mt-0.5"
            style={{ fontSize: 13, color: textColor }}>
            {formatDriveTime(selectedSection.routeInfo.driveTime ?? 0)}
          </Typography>
        </View>
        <View className="flex-1">
          <Typography
            variant="caption"
            weight="600"
            className="text-muted-foreground"
            style={{ fontSize: 11 }}>
            {t('tolls.miles')}
          </Typography>
          <Typography
            variant="bodySmall"
            weight="700"
            className="mt-0.5"
            style={{ fontSize: 13, color: textColor }}>
            {metersToMiles(selectedSection.routeInfo.miles ?? 0).toFixed(1)}
          </Typography>
        </View>
        <View className="flex-1">
          <Typography
            variant="caption"
            weight="600"
            className="text-muted-foreground"
            style={{ fontSize: 11 }}>
            {t('tolls.title')}
          </Typography>
          <Typography
            variant="bodySmall"
            weight="700"
            className="mt-0.5"
            style={{ fontSize: 13, color: textColor }}>
            {tollsInfo.total > 0 ? formatMoney(tollsInfo.total) : '-'}
          </Typography>
        </View>
      </View>
    </View>
  )
}
