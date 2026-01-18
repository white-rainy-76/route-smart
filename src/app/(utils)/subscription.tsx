import { Button } from '@/components/ui/button'
import { CheckIcon } from '@/components/ui/icons'
import { Typography } from '@/components/ui/typography'
import { verifyAppleSubscription } from '@/services/subscription'
import { useApp } from '@/shared/contexts/app-context'
import { IOS_MONTHLY_SUBSCRIPTION_ID } from '@/shared/iap/products'
import { getAppAccountToken } from '@/shared/lib/iap/app-account-token'
import { router } from 'expo-router'
import { useEffect, useMemo, useState } from 'react'
import { Image, Platform, ScrollView, View } from 'react-native'
import { getTransactionJwsIOS, useIAP } from 'react-native-iap'

const features = [
  'Unlimited route planning',
  'Toll cost breakdown & avoid tolls',
  'Save and reuse routes',
]

export default function SubscriptionScreen() {
  const { setSubscriptionActive } = useApp()
  const [isPurchasing, setIsPurchasing] = useState(false)
  const [error, setError] = useState<string | null>(null)

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
        // --- Backend verification (stub) ---
        // In StoreKit2, `purchase.purchaseToken` is a JWS; if missing, we can fetch it by sku.
        const transactionJws =
          purchase.purchaseToken ??
          (await getTransactionJwsIOS(
            purchase.productId ?? IOS_MONTHLY_SUBSCRIPTION_ID,
          ))

        if (transactionJws) {
          try {
            // Get appAccountToken to send to backend for user identification
            const appAccountToken = await getAppAccountToken()

            const res = await verifyAppleSubscription({
              productId: purchase.productId,
              transactionJws,
              transactionId: (purchase as any)?.transactionId,
              originalTransactionId: (purchase as any)
                ?.originalTransactionIdentifierIOS,
              ...(appAccountToken && { appAccountToken }),
            })
            await setSubscriptionActive(Boolean(res.entitlement?.isActive))
          } catch (e) {
            // Backend isn't wired yet (or returned error). For now we fall back to local unlock,
            // but in production you typically want to REQUIRE server entitlement.
            console.warn('verifyAppleSubscription failed (stub backend):', e)
          }
        }

        await finishTransaction({ purchase })
        await setSubscriptionActive(true)
        router.replace('/home')
      } catch (e: any) {
        setError(e?.message ?? 'Purchase completed but finalization failed.')
      } finally {
        setIsPurchasing(false)
      }
    },
    onPurchaseError: (e) => {
      setIsPurchasing(false)
      setError(e?.message ?? 'Purchase failed.')
    },
  })

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
      // Get appAccountToken to link purchase with user account
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
      setError(e?.message ?? 'Failed to start purchase flow.')
    }
  }

  const handleRestore = async () => {
    setError(null)
    setIsPurchasing(true)
    try {
      await restorePurchases()
      // Subscription state is refreshed globally in AppProvider once IAP is connected,
      // but we optimistically return to home on restore flow completion.
      router.replace('/home')
    } catch (e: any) {
      setError(e?.message ?? 'Restore failed.')
    } finally {
      setIsPurchasing(false)
    }
  }

  return (
    <ScrollView
      className="flex-1 bg-background"
      contentContainerStyle={{ flexGrow: 1 }}
      showsVerticalScrollIndicator={false}>
      <View
        className="flex-1 items-center"
        style={{ paddingTop: 100, paddingHorizontal: 40 }}>
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
            style={{
              fontSize: 32,
              lineHeight: 36,
              letterSpacing: 0,
              color: '#383838',
            }}>
            Unlock Smart Tolls
          </Typography>

          {/* Description - 16px margin */}
          <View style={{ marginTop: 16 }}>
            <Typography
              variant="body"
              weight="600"
              align="center"
              style={{
                fontSize: 16,
                lineHeight: 24,
                letterSpacing: 0,
                color: '#77808D',
              }}>
              Smart Tolls helps you plan routes, avoid expensive tolls, and know
              your full trip cost before you drive.
            </Typography>
          </View>

          {/* Features list - 16px margin */}
          <View style={{ marginTop: 16 }} className="mx-auto">
            {features.map((feature, index) => (
              <View
                key={index}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  marginBottom: index < features.length - 1 ? 0 : 0,
                }}>
                <CheckIcon color="#4CAF50" size={24} />
                <View style={{ marginLeft: 8 }}>
                  <Typography
                    weight="700"
                    style={{
                      fontSize: 15,
                      lineHeight: 32,
                      letterSpacing: 0,
                      color: '#77808D',
                    }}>
                    {feature}
                  </Typography>
                </View>
              </View>
            ))}
          </View>

          {/* Button - 16px margin */}
          <View style={{ marginTop: 16, width: '100%', alignItems: 'center' }}>
            <Button
              variant="primary"
              onPress={handleContinue}
              disabled={!connected || isPurchasing}
              className="w-full">
              {isPurchasing ? 'Processing…' : 'Start 7-Day Free Trial'}
            </Button>

            {/* Price text - 8px margin */}
            <View style={{ marginTop: 8, width: '100%' }}>
              <Typography
                weight="600"
                align="center"
                style={{
                  fontSize: 15,
                  lineHeight: 32,
                  letterSpacing: 0,
                  color: '#77808D',
                }}>
                Then {priceText}/month. Cancel anytime.
              </Typography>
            </View>

            {Platform.OS === 'ios' ? (
              <View style={{ marginTop: 8, width: '100%' }}>
                <Button
                  variant="outline"
                  onPress={handleRestore}
                  disabled={!connected || isPurchasing}
                  className="w-full">
                  Restore Purchases
                </Button>
              </View>
            ) : null}

            {error ? (
              <View style={{ marginTop: 10, width: '100%' }}>
                <Typography
                  align="center"
                  style={{ color: '#d32f2f', fontSize: 13, lineHeight: 18 }}>
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
