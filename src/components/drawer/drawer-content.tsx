import {
  MySubscriptionIcon,
  SavedRoutesIcon,
  SettingsIcon,
} from '@/shared/ui/icons'
import { Typography } from '@/shared/ui/typography'
import { useLogoutMutation } from '@/services/auth'
import { useApp } from '@/shared/contexts/app-context'
import { useDrawer } from '@/shared/contexts/drawer-context'
import { getUserId } from '@/shared/lib/auth'
import { useTheme } from '@/shared/hooks/use-theme'
import { useTranslation } from '@/shared/hooks/use-translation'
import { MaterialIcons } from '@expo/vector-icons'
import { router } from 'expo-router'
import type { ReactElement } from 'react'
import { useEffect, useState } from 'react'
import { Alert, Pressable, ScrollView, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

interface MenuItem {
  id: string
  label: string
  icon: ReactElement
  onPress: () => void
}

export function DrawerContent() {
  const { t } = useTranslation()
  const { resolvedTheme } = useTheme()
  const { setAuthenticated } = useApp()
  const { closeDrawer } = useDrawer()
  const insets = useSafeAreaInsets()
  const [userId, setUserId] = useState<string | null>(null)

  useEffect(() => {
    getUserId().then(setUserId)
  }, [])

  // Theme colors
  const textColor = resolvedTheme === 'dark' ? '#F8FAFC' : '#111827'
  const mutedColor = resolvedTheme === 'dark' ? '#94A3B8' : '#6B7280'
  const borderColor = resolvedTheme === 'dark' ? '#334155' : '#E5E7EB'
  const cardBg = resolvedTheme === 'dark' ? '#1E293B' : '#FFFFFF'
  const iconBg = resolvedTheme === 'dark' ? '#334155' : '#F1F5F9'
  const userSectionBg = resolvedTheme === 'dark' ? '#1E293B' : '#F8FAFC'

  const logoutMutation = useLogoutMutation({
    onSuccess: async () => {
      await setAuthenticated(false)
      closeDrawer()
      router.replace('/(auth)/login')
    },
    onError: (error) => {
      Alert.alert(t('common.error'), 'Failed to sign out')
      console.error('Logout error:', error)
    },
  })

  const handleSignOut = () => {
    Alert.alert(t('drawer.signOut'), 'Are you sure you want to sign out?', [
      {
        text: t('common.cancel'),
        style: 'cancel',
      },
      {
        text: t('drawer.signOut'),
        style: 'destructive',
        onPress: () => logoutMutation.mutate(),
      },
    ])
  }

  // Обработчики меню
  const menuItems: MenuItem[] = [
    {
      id: 'saved-routes',
      label: t('drawer.savedRoutes'),
      icon: <SavedRoutesIcon color="#4964D8" width={22} height={22} />,
      onPress: () => {
        closeDrawer()
        router.push('/saved-routes')
      },
    },
    {
      id: 'my-subscription',
      label: t('drawer.mySubscription'),
      icon: <MySubscriptionIcon color="#4964D8" width={22} height={22} />,
      onPress: () => {
        closeDrawer()
        router.push('/my-subscription')
      },
    },
  ]

  const settingsItem: MenuItem = {
    id: 'settings',
    label: t('drawer.settings'),
    icon: <SettingsIcon color="#4964D8" width={22} height={22} />,
    onPress: () => {
      closeDrawer()
      router.push('/settings')
    },
  }

  return (
    <ScrollView
      contentContainerStyle={{
        flexGrow: 1,
        paddingTop: Math.max(16, insets.top),
        paddingBottom: Math.max(16, insets.bottom),
      }}
      className="bg-background"
      showsVerticalScrollIndicator={false}>
      <View className="flex-1 px-5 pt-8">
        {/* User section */}
        <View
          className="mb-8 px-5 py-4 rounded-2xl"
          style={{
            backgroundColor: userSectionBg,
            borderWidth: 1,
            borderColor: borderColor,
            shadowColor: resolvedTheme === 'dark' ? '#000' : '#000',
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: resolvedTheme === 'dark' ? 0.3 : 0.05,
            shadowRadius: 3,
            elevation: 2,
          }}>
          <View className="flex-row items-center">
            <View
              className="w-12 h-12 rounded-full items-center justify-center mr-4"
              style={{ backgroundColor: '#4964D8' }}>
              <MaterialIcons name="person" size={24} color="#FFFFFF" />
            </View>
            <View className="flex-1">
              <Typography
                variant="body"
                weight="600"
                style={{ color: textColor, fontSize: 16, marginBottom: 2 }}>
                Account
              </Typography>
              <Typography
                variant="caption"
                style={{ color: mutedColor, fontSize: 13 }}
                numberOfLines={1}>
                {userId ?? '—'}
              </Typography>
            </View>
          </View>
        </View>

        {/* Menu items */}
        <View className="flex-1">
          <View className="gap-2">
            {menuItems.map((item) => (
              <Pressable
                key={item.id}
                onPress={item.onPress}
                className="active:opacity-70">
                <View
                  className="flex-row items-center px-5 py-4 rounded-2xl"
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
                  <View
                    className="w-10 h-10 rounded-xl items-center justify-center mr-4"
                    style={{ backgroundColor: iconBg }}>
                    {item.icon}
                  </View>
                  <Typography
                    variant="body"
                    weight="600"
                    style={{ color: textColor, fontSize: 16 }}>
                    {item.label}
                  </Typography>
                </View>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Settings and Sign out at the bottom */}
        <View className="pb-5 gap-2">
          <Pressable
            onPress={settingsItem.onPress}
            className="active:opacity-70">
            <View
              className="flex-row items-center px-5 py-4 rounded-2xl"
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
              <View
                className="w-10 h-10 rounded-xl items-center justify-center mr-4"
                style={{ backgroundColor: iconBg }}>
                {settingsItem.icon}
              </View>
              <Typography
                variant="body"
                weight="600"
                style={{ color: textColor, fontSize: 16 }}>
                {settingsItem.label}
              </Typography>
            </View>
          </Pressable>

          {/* Sign out button */}
          <Pressable
            onPress={handleSignOut}
            className="active:opacity-70"
            disabled={logoutMutation.isPending}>
            <View
              className="flex-row items-center px-5 py-4 rounded-2xl"
              style={{
                backgroundColor: cardBg,
                borderWidth: 1,
                borderColor: borderColor,
                shadowColor: resolvedTheme === 'dark' ? '#000' : '#000',
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: resolvedTheme === 'dark' ? 0.3 : 0.05,
                shadowRadius: 3,
                elevation: 2,
                opacity: logoutMutation.isPending ? 0.5 : 1,
              }}>
              <View
                className="w-10 h-10 rounded-xl items-center justify-center mr-4"
                style={{ backgroundColor: iconBg }}>
                <MaterialIcons name="logout" size={22} color="#EF4444" />
              </View>
              <Typography
                variant="body"
                weight="600"
                style={{ color: '#EF4444', fontSize: 16 }}>
                {t('drawer.signOut')}
              </Typography>
            </View>
          </Pressable>
        </View>
      </View>
    </ScrollView>
  )
}
