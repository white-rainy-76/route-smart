import { Button } from '@/shared/ui/button'
import { CheckIcon } from '@/shared/ui/icons'
import { Typography } from '@/shared/ui/typography'
import { verifyAppleSubscription } from '@/services/subscription'
import { useApp } from '@/shared/contexts/app-context'
import { useTheme } from '@/shared/hooks/use-theme'
import { useTranslation } from '@/shared/hooks/use-translation'
import { IOS_MONTHLY_SUBSCRIPTION_ID } from '@/shared/iap/products'
import { getAppAccountToken } from '@/shared/lib/iap/app-account-token'
import { MaterialIcons } from '@expo/vector-icons'
import { router } from 'expo-router'
import { useEffect, useMemo, useState } from 'react'
import {
  Image,
  Platform,
  Pressable,
  ScrollView,
  TouchableOpacity,
  View,
} from 'react-native'
import { ErrorCode, initConnection, useIAP } from 'react-native-iap'

const FEATURE_KEYS = [
  'paywall.feature1',
  'paywall.feature2',
  'paywall.feature3',
] as const

export default function SubscriptionScreen() {
  const { t } = useTranslation()
  const { resolvedTheme } = useTheme()
  const { refreshSubscriptionStatus, hasSubscriptionHistory } = useApp()
  const [isPurchasing, setIsPurchasing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const textColor = resolvedTheme === 'dark' ? '#F8FAFC' : '#11181C'
  const iconBg = resolvedTheme === 'dark' ? 'rgba(148, 163, 184, 0.1)' : 'rgba(107, 114, 128, 0.1)'

  const {
    connected,
    subscriptions,
    fetchProducts,
    requestPurchase,
    finishTransaction,
    restorePurchases,
  } = useIAP({
    onPurchaseSuccess: async (purchase) => {
      try {
        if (!(await ensureIapConnection())) {
          setIsPurchasing(false)
          return
        }
        await finishTransaction({ purchase })
        const snapshot = await refreshSubscriptionStatus()
        const isActive = snapshot?.hasActiveSubscription ?? false
        if (isActive) {
          router.replace('/home')
        } else {
          setError(t('paywall.errorNoSubscription'))
        }
      } catch (e: any) {
        setError(e?.message ?? t('paywall.errorFinalization'))
      } finally {
        setIsPurchasing(false)
      }
    },
    onPurchaseError: async (e) => {
      const isAlreadyOwned =
        e?.code === ErrorCode.AlreadyOwned ||
        (typeof e?.message === 'string' && /already\s*own/i.test(e.message))

      if (isAlreadyOwned) {
        try {
          if (!(await ensureIapConnection())) {
            setIsPurchasing(false)
            return
          }
          await restorePurchases()
          const snapshot = await refreshSubscriptionStatus()
          if (snapshot?.hasActiveSubscription) {
            setError(null)
            router.replace('/home')
          } else {
            setError(t('paywall.errorNoSubscription'))
          }
        } catch (err: unknown) {
          setError((err as Error)?.message ?? t('paywall.errorRestoreFailed'))
        } finally {
          setIsPurchasing(false)
        }
        return
      }

      setIsPurchasing(false)
      setError(e?.message ?? t('paywall.errorPurchaseFailed'))
    },
  })

  const ensureIapConnection = async () => {
    if (connected) return true
    try {
      const ok = await initConnection()
      if (!ok) {
        setError(t('paywall.errorStoreConnection'))
      }
      return ok
    } catch (e: any) {
      setError(e?.message ?? t('paywall.errorInitStore'))
      return false
    }
  }

  useEffect(() => {
    if (!connected) return
    void fetchProducts({ skus: [IOS_MONTHLY_SUBSCRIPTION_ID], type: 'subs' })
  }, [connected, fetchProducts])

  const monthly = useMemo(
    () => subscriptions.find((s) => s.id === IOS_MONTHLY_SUBSCRIPTION_ID),
    [subscriptions],
  )

  const priceText =
    Platform.OS === 'ios' && monthly?.platform === 'ios'
      ? monthly.displayPrice
      : '—'

  const handleContinue = async () => {
    setError(null)
    setIsPurchasing(true)
    try {
      if (!(await ensureIapConnection())) {
        setIsPurchasing(false)
        return
      }
      const snapshot = await refreshSubscriptionStatus()
      if (snapshot?.hasActiveSubscription) {
        router.replace('/home')
        setIsPurchasing(false)
        return
      }

      // Get appAccountToken to link purchase with user account
      const appAccountToken = await getAppAccountToken()

      console.log('appAccountToken ===>', appAccountToken)
      await requestPurchase({
        type: 'subs',
        request: {
          apple: {
            sku: IOS_MONTHLY_SUBSCRIPTION_ID,
            andDangerouslyFinishTransactionAutomatically: false,
            ...(appAccountToken && { appAccountToken }),
          },
        },
      })
      // Success is handled by onPurchaseSuccess listener above.
    } catch (e: any) {
      setIsPurchasing(false)
      setError(e?.message ?? t('paywall.errorStartPurchase'))
    }
  }

  const handleRestore = async () => {
    setError(null)
    setIsPurchasing(true)
    try {
      if (!(await ensureIapConnection())) {
        setIsPurchasing(false)
        return
      }
      await restorePurchases()
      const snapshot = await refreshSubscriptionStatus()
      if (snapshot?.hasActiveSubscription) {
        router.replace('/home')
      } else {
        setError(t('paywall.errorNoSubscription'))
      }
    } catch (e: unknown) {
      setError((e as Error)?.message ?? t('paywall.errorRestoreFailed'))
    } finally {
      setIsPurchasing(false)
    }
  }

  return (
    <ScrollView
      className="flex-1 bg-background"
      contentContainerStyle={{ flexGrow: 1 }}
      showsVerticalScrollIndicator={false}>
      {/* Header with back button */}
      <View className="flex-row items-center px-5 pt-20 pb-5 bg-background">
        <View className="w-10 items-start">
          <TouchableOpacity
            onPress={() => router.replace('/(auth)/login')}
            className="w-10 h-10 items-center justify-center rounded-full active:opacity-70"
            style={{ backgroundColor: iconBg }}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <MaterialIcons name="arrow-back" size={24} color={textColor} />
          </TouchableOpacity>
        </View>
        <View className="flex-1" />
        <View className="w-10" />
      </View>

      <View
        className="flex-1 items-center"
        style={{ paddingTop: 20, paddingHorizontal: 40 }}>
        {/* Image */}
        <Image
          source={require('../../../assets/images/UnlockSmartTolls.png')}
          style={{ width: 278, height: 278 }}
          resizeMode="contain"
        />

        {/* Title - 35px margin from image */}
        <View style={{ marginTop: 35, width: '100%' }}>
          <Typography
            variant="h1"
            weight="700"
            align="center"
            className="text-foreground"
            style={{
              fontSize: 32,
              lineHeight: 36,
              letterSpacing: 0,
            }}>
            {t('paywall.title')}
          </Typography>

          {/* Description - 16px margin */}
          <View style={{ marginTop: 16 }}>
            <Typography
              variant="body"
              weight="600"
              align="center"
              className="text-muted-foreground"
              style={{
                fontSize: 16,
                lineHeight: 24,
                letterSpacing: 0,
              }}>
              {t('paywall.description')}
            </Typography>
          </View>

          {/* Features list - 16px margin */}
          <View style={{ marginTop: 16 }} className="mx-auto">
            {FEATURE_KEYS.map((key) => (
              <View
                key={key}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                }}>
                <CheckIcon color="#22c55e" size={24} />
                <View style={{ marginLeft: 8 }}>
                  <Typography
                    weight="700"
                    className="text-muted-foreground"
                    style={{
                      fontSize: 15,
                      lineHeight: 32,
                      letterSpacing: 0,
                    }}>
                    {t(key)}
                  </Typography>
                </View>
              </View>
            ))}
          </View>

          {/* Button - 16px margin */}
          <View style={{ marginTop: 16, width: '100%', alignItems: 'center' }}>
            {hasSubscriptionHistory ? (
              <Button
                variant="primary"
                onPress={handleRestore}
                disabled={!connected || isPurchasing}
                className="w-full">
                {isPurchasing ? t('paywall.processing') : t('paywall.restore')}
              </Button>
            ) : (
              <Button
                variant="primary"
                onPress={handleContinue}
                disabled={!connected || isPurchasing}
                className="w-full">
                {isPurchasing
                  ? t('paywall.processing')
                  : t('paywall.startTrial')}
              </Button>
            )}

            {/* Price text - 8px margin */}
            <View style={{ marginTop: 8, width: '100%' }}>
              <Typography
                weight="600"
                align="center"
                className="text-muted-foreground"
                style={{
                  fontSize: 15,
                  lineHeight: 32,
                  letterSpacing: 0,
                }}>
                {t('paywall.thenPerMonth', { price: priceText })}
              </Typography>
            </View>

            {/* Restore - 8px margin */}
            {hasSubscriptionHistory ? null : (
              <Pressable
                onPress={handleRestore}
                disabled={!connected || isPurchasing}
                style={{ marginTop: 8 }}>
                <Typography
                  weight="600"
                  align="center"
                  className="text-primary"
                  style={{ fontSize: 14, textDecorationLine: 'underline' }}>
                  {t('paywall.alreadySubscribedRestore')}
                </Typography>
              </Pressable>
            )}

            {error ? (
              <View style={{ marginTop: 10, width: '100%' }}>
                <Typography
                  align="center"
                  className="text-destructive"
                  style={{ fontSize: 13, lineHeight: 18 }}>
                  {error}
                </Typography>
              </View>
            ) : null}
          </View>
        </View>
      </View>
    </ScrollView>
  )
}
