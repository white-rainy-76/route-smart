import { Button } from '@/components/ui/button'
import { CheckIcon } from '@/components/ui/icons'
import { Typography } from '@/components/ui/typography'
import type { RestoreSubscriptionPayload } from '@/services/subscription'
import { restoreSubscription } from '@/services/subscription'
import { useApp } from '@/shared/contexts/app-context'
import { useTheme } from '@/shared/hooks/use-theme'
import { useTranslation } from '@/shared/hooks/use-translation'
import { IOS_MONTHLY_SUBSCRIPTION_ID } from '@/shared/iap/products'
import { getAppAccountToken } from '@/shared/lib/iap/app-account-token'
import { MaterialIcons } from '@expo/vector-icons'
import { isAxiosError } from 'axios'
import { router } from 'expo-router'
import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  Alert,
  Image,
  Linking,
  Platform,
  Pressable,
  ScrollView,
  TouchableOpacity,
  View,
} from 'react-native'
import type { Purchase } from 'react-native-iap'
import { ErrorCode, getAvailablePurchases, initConnection, useIAP } from 'react-native-iap'

function isReassignNotFoundError(e: unknown): boolean {
  return isAxiosError(e) && e.response?.status === 400
}

const FEATURE_KEYS = [
  'paywall.feature1',
  'paywall.feature2',
  'paywall.feature3',
] as const

const OUR_PRODUCT_ID = IOS_MONTHLY_SUBSCRIPTION_ID

const LEGAL_URLS = {
  privacyPolicy: 'https://fuelsmart.us/privacy_policy',
  termsOfUse: 'https://fuelsmart.us/terms_and_conditions',
} as const

function buildRestorePayload(purchase: Purchase): RestoreSubscriptionPayload | null {
  const transactionJws =
    purchase.purchaseToken && purchase.purchaseToken.length > 0
      ? purchase.purchaseToken
      : undefined
  const originalTransactionId =
    'originalTransactionIdentifierIOS' in purchase &&
    purchase.originalTransactionIdentifierIOS
      ? purchase.originalTransactionIdentifierIOS
      : undefined
  if (!transactionJws && !originalTransactionId) return null
  return {
    productId: purchase.productId,
    transactionJws: transactionJws ?? undefined,
    originalTransactionId: originalTransactionId ?? undefined,
    transactionId: 'transactionId' in purchase ? purchase.transactionId : undefined,
  }
}

function findOurSubscriptionPurchase(purchases: Purchase[]): Purchase | null {
  for (const p of purchases) {
    if (p.productId !== OUR_PRODUCT_ID) continue
    if (buildRestorePayload(p)) return p
  }
  return null
}

export default function SubscriptionScreen() {
  const { t } = useTranslation()
  const { resolvedTheme } = useTheme()
  const { refreshSubscriptionStatus } = useApp()
  const [isPurchasing, setIsPurchasing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const textColor = resolvedTheme === 'dark' ? '#F8FAFC' : '#11181C'
  const iconBg = resolvedTheme === 'dark' ? 'rgba(148, 163, 184, 0.1)' : 'rgba(107, 114, 128, 0.1)'

  const syncPurchaseWithBackend = useCallback(
    async (purchase: Purchase) => {
      const payload = buildRestorePayload(purchase)
      if (!payload) return null
      await restoreSubscription(payload)
      return refreshSubscriptionStatus()
    },
    [refreshSubscriptionStatus],
  )

  const runReassignAfterConfirm = useCallback(
    async (purchase: Purchase) => {
      try {
        const snapshot = await syncPurchaseWithBackend(purchase)
        if (snapshot?.hasActiveSubscription) {
          setError(null)
          router.replace('/home')
        } else {
          setError(t('paywall.errorNoSubscription'))
        }
      } catch (e: unknown) {
        if (isReassignNotFoundError(e)) {
          setError(t('paywall.errorNoSubscription'))
        } else {
          setError((e as Error)?.message ?? t('paywall.errorRestoreFailed'))
        }
      } finally {
        setIsPurchasing(false)
      }
    },
    [syncPurchaseWithBackend, t],
  )

  const {
    connected,
    subscriptions,
    fetchProducts,
    requestPurchase,
    finishTransaction,
    restorePurchases,
  } = useIAP({
    onPurchaseSuccess: async (purchase) => {
      // Do NOT call reassign here. Reassign is only for Buy+AlreadyOwned+user confirms transfer.
      // New purchases are delivered via App Store Server Notifications to the backend.
      try {
        if (!(await ensureIapConnection())) {
          setIsPurchasing(false)
          return
        }
        const snapshot = await refreshSubscriptionStatus()
        if (snapshot?.hasActiveSubscription) {
          await finishTransaction({ purchase })
          router.replace('/home')
        } else {
          // Backend may not have processed webhook yet; finish transaction to clear queue
          await finishTransaction({ purchase })
          setError(t('paywall.errorNoSubscription'))
        }
      } catch (e: unknown) {
        await finishTransaction({ purchase }).catch(() => {})
        setError((e as Error)?.message ?? t('paywall.errorFinalization'))
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
          const purchases = await getAvailablePurchases({
            alsoPublishToEventListenerIOS: false,
            onlyIncludeActiveItemsIOS: true,
          })
          const ourPurchase = findOurSubscriptionPurchase(purchases)
          if (ourPurchase) {
            Alert.alert(
              t('paywall.reassignTitle'),
              t('paywall.reassignMessage'),
              [
                {
                  text: t('common.cancel'),
                  style: 'cancel',
                  onPress: () => setIsPurchasing(false),
                },
                {
                  text: t('paywall.reassignConfirm'),
                  onPress: () => void runReassignAfterConfirm(ourPurchase),
                },
              ],
            )
            return
          }
          setError(t('paywall.errorNoSubscription'))
        } catch (err: unknown) {
          if (isReassignNotFoundError(err)) {
            setError(t('paywall.errorNoSubscription'))
          } else {
            setError((err as Error)?.message ?? t('paywall.errorRestoreFailed'))
          }
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

      const appAccountToken = await getAppAccountToken()
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
    // Restore: check backend status. Reassign is ONLY for Buy+AlreadyOwned+confirm (see onPurchaseError).
    setError(null)
    setIsPurchasing(true)
    try {
      if (!(await ensureIapConnection())) {
        setIsPurchasing(false)
        return
      }
      await restorePurchases()
      const purchases = await getAvailablePurchases({
        alsoPublishToEventListenerIOS: false,
        onlyIncludeActiveItemsIOS: true,
      })
      const ourPurchase = findOurSubscriptionPurchase(purchases)
      if (ourPurchase) {
        const snapshot = await refreshSubscriptionStatus()
        if (snapshot?.hasActiveSubscription) {
          router.replace('/home')
        } else {
          // Subscription on Apple ID but not linked here - user must use Buy to get reassign prompt
          setError(t('paywall.errorNoSubscription'))
        }
        return
      }
      setError(t('paywall.errorNoSubscription'))
    } catch (e: unknown) {
      if (isReassignNotFoundError(e)) {
        setError(t('paywall.errorNoSubscription'))
      } else {
        setError((e as Error)?.message ?? t('paywall.errorRestoreFailed'))
      }
    } finally {
      setIsPurchasing(false)
    }
  }

  return (
    <ScrollView
      className="flex-1 bg-background"
      contentContainerStyle={{ flexGrow: 1, paddingBottom: 24 }}
      showsVerticalScrollIndicator={false}>
      {/* Header with back button */}
      <View className="flex-row items-center px-5 pt-12 pb-3 bg-background">
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
        style={{ paddingTop: 8, paddingHorizontal: 40 }}>
        {/* Image */}
        <Image
          source={require('../../../assets/images/UnlockSmartTolls.png')}
          style={{ width: 240, height: 240 }}
          resizeMode="contain"
        />

        {/* Title */}
        <View style={{ marginTop: 20, width: '100%' }}>
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

          {/* Description */}
          <View style={{ marginTop: 12 }}>
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

          {/* Features list */}
          <View style={{ marginTop: 12 }} className="mx-auto">
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

          {/* Button. Main CTA always starts purchase when premium is not active. */}
          <View style={{ marginTop: 12, width: '100%', alignItems: 'center' }}>
            <Button
              variant="primary"
              onPress={handleContinue}
              disabled={!connected || isPurchasing}
              className="w-full">
              {isPurchasing ? t('paywall.processing') : t('paywall.startTrial')}
            </Button>

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

            {/* Restore - always visible as secondary option (Apple requirement) */}
            <Pressable
              onPress={handleRestore}
              disabled={!connected || isPurchasing}
              style={{ marginTop: 8 }}>
              <Typography
                weight="600"
                align="center"
                className="text-primary"
                style={{ fontSize: 14, textDecorationLine: 'underline' }}>
                {t('paywall.restore')}
              </Typography>
            </Pressable>


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

            {/* Legal links (Apple Review requirement) */}
            <View style={{ marginTop: 8, flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 8 }}>
              <Pressable onPress={() => Linking.openURL(LEGAL_URLS.termsOfUse)}>
                <Typography
                  weight="600"
                  align="center"
                  className="text-muted-foreground"
                  style={{ fontSize: 13, textDecorationLine: 'underline' }}>
                  {t('paywall.termsOfUse')}
                </Typography>
              </Pressable>
              <Typography weight="600" className="text-muted-foreground" style={{ fontSize: 13 }}>
                {' · '}
              </Typography>
              <Pressable onPress={() => Linking.openURL(LEGAL_URLS.privacyPolicy)}>
                <Typography
                  weight="600"
                  align="center"
                  className="text-muted-foreground"
                  style={{ fontSize: 13, textDecorationLine: 'underline' }}>
                  {t('paywall.privacyPolicy')}
                </Typography>
              </Pressable>
            </View>

           
          </View>
        </View>
      </View>
    </ScrollView>
  )
}
