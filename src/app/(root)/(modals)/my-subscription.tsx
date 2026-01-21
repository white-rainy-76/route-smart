import { Button } from '@/shared/ui/button'
import { Typography } from '@/shared/ui/typography'
import { useApp } from '@/shared/contexts/app-context'
import { useTheme } from '@/shared/hooks/use-theme'
import { useTranslation } from '@/shared/hooks/use-translation'
import { MaterialIcons } from '@expo/vector-icons'
import { router } from 'expo-router'
import {
    Linking,
    Platform,
    ScrollView,
    TouchableOpacity,
    View,
} from 'react-native'

export default function MySubscriptionScreen() {
  const { t } = useTranslation()
  const { resolvedTheme } = useTheme()
  const {
    hasActiveSubscription,
    refreshSubscriptionStatus,
    isSubscriptionLoading,
  } = useApp()

  // Theme colors
  const textColor = resolvedTheme === 'dark' ? '#F8FAFC' : '#111827'
  const mutedColor = resolvedTheme === 'dark' ? '#94A3B8' : '#6B7280'
  const borderColor = resolvedTheme === 'dark' ? '#334155' : '#E5E7EB'
  const cardBg = resolvedTheme === 'dark' ? '#1E293B' : '#FFFFFF'
  const sectionHeaderColor = resolvedTheme === 'dark' ? '#CBD5E1' : '#475569'
  const iconBg = resolvedTheme === 'dark' ? '#334155' : '#F1F5F9'

  const manageSubscriptions = async () => {
    if (Platform.OS !== 'ios') return
    // Apple official "Manage Subscriptions" deep link
    await Linking.openURL('https://apps.apple.com/account/subscriptions')
  }

  const SectionHeader = ({ title }: { title: string }) => (
    <View className="px-5 mb-3 mt-6">
      <Typography
        variant="label"
        weight="600"
        style={{ color: sectionHeaderColor, fontSize: 13, letterSpacing: 0.5 }}>
        {title.toUpperCase()}
      </Typography>
    </View>
  )

  const SettingCard = ({ children }: { children: React.ReactNode }) => (
    <View
      className="mx-5 rounded-2xl overflow-hidden"
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
      {children}
    </View>
  )

  return (
    <View className="flex-1 bg-background">
      {/* Header */}
      <View className="flex-row items-center px-5 pt-20 pb-5 bg-background">
        <View className="w-10 items-start">
          <TouchableOpacity
            onPress={() => router.back()}
            className="w-10 h-10 items-center justify-center rounded-full active:opacity-70"
            style={{ backgroundColor: iconBg }}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <MaterialIcons name="arrow-back" size={24} color={textColor} />
          </TouchableOpacity>
        </View>
        <View className="flex-1 items-center">
          <Typography variant="h1" weight="700" className="text-foreground">
            {t('subscription.title')}
          </Typography>
        </View>
        <View className="w-10" />
      </View>

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 32 }}>
        {/* Status Section */}
        <SectionHeader title={t('subscription.status') || 'Status'} />
        <SettingCard>
          <View className="px-5 py-4">
            <View className="flex-row items-center mb-4">
              <View
                className="w-10 h-10 rounded-xl items-center justify-center mr-4"
                style={{
                  backgroundColor: hasActiveSubscription
                    ? '#10B98120'
                    : resolvedTheme === 'dark'
                      ? '#EF444420'
                      : '#FEE2E2',
                }}>
                <MaterialIcons
                  name={hasActiveSubscription ? 'check-circle' : 'cancel'}
                  size={22}
                  color={hasActiveSubscription ? '#10B981' : '#EF4444'}
                />
              </View>
              <View className="flex-1">
                <Typography
                  variant="body"
                  weight="600"
                  style={{ color: textColor, fontSize: 16, marginBottom: 2 }}>
                  {hasActiveSubscription
                    ? t('subscription.statusActive')
                    : t('subscription.statusInactive')}
                </Typography>
                <Typography
                  variant="caption"
                  style={{ color: mutedColor, fontSize: 13 }}>
                  {isSubscriptionLoading
                    ? t('subscription.checking')
                    : t('subscription.hint')}
                </Typography>
              </View>
            </View>

            {hasActiveSubscription ? (
              <View
                className="flex-row items-center px-4 py-3 rounded-xl"
                style={{
                  backgroundColor:
                    resolvedTheme === 'dark' ? '#064E3B' : '#ECFDF5',
                  borderWidth: 1,
                  borderColor: resolvedTheme === 'dark' ? '#065F46' : '#D1FAE5',
                }}>
                <View
                  className="w-2 h-2 rounded-full mr-3"
                  style={{ backgroundColor: '#10B981' }}
                />
                <Typography
                  variant="body"
                  weight="500"
                  style={{ color: '#10B981', fontSize: 14 }}>
                  {t('subscription.activeDescription') ||
                    'Your subscription is active and you have access to all premium features.'}
                </Typography>
              </View>
            ) : (
              <View
                className="flex-row items-center px-4 py-3 rounded-xl"
                style={{
                  backgroundColor:
                    resolvedTheme === 'dark' ? '#7F1D1D' : '#FEF2F2',
                  borderWidth: 1,
                  borderColor: resolvedTheme === 'dark' ? '#991B1B' : '#FEE2E2',
                }}>
                <View
                  className="w-2 h-2 rounded-full mr-3"
                  style={{ backgroundColor: '#EF4444' }}
                />
                <Typography
                  variant="body"
                  weight="500"
                  style={{ color: '#EF4444', fontSize: 14 }}>
                  {t('subscription.inactiveDescription') ||
                    'You do not have an active subscription. Subscribe to unlock all features.'}
                </Typography>
              </View>
            )}
          </View>
        </SettingCard>

        {/* Actions Section */}
        <SectionHeader title={t('subscription.actions') || 'Actions'} />
        <SettingCard>
          <View className="px-5 py-4 gap-3">
            <Button
              variant="outline"
              size="sm"
              onPress={() => void refreshSubscriptionStatus()}
              disabled={isSubscriptionLoading}
              style={{ width: '100%' }}>
              {isSubscriptionLoading ? t('common.loading') : t('subscription.refresh')}
            </Button>

            {Platform.OS === 'ios' && (
              <Button
                variant="outline"
                size="sm"
                onPress={() => void manageSubscriptions()}
                style={{ width: '100%' }}>
                {t('subscription.manage')}
              </Button>
            )}

            {!hasActiveSubscription && (
              <Button
                variant="primary"
                size="sm"
                onPress={() => router.replace('/subscription')}
                style={{ width: '100%' }}>
                {t('subscription.goToPaywall')}
              </Button>
            )}
          </View>
        </SettingCard>

        {/* Info Section */}
        <View className="px-5 mt-4">
          <Typography
            variant="caption"
            align="center"
            style={{ color: mutedColor, fontSize: 12, lineHeight: 18 }}>
            {t('subscription.description')}
          </Typography>
        </View>
      </ScrollView>
    </View>
  )
}


