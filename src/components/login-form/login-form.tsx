import { AuthBackground } from '@/components/auth/auth-background'
import { AuthLogo } from '@/components/auth/auth-logo'
import { Button } from '@/shared/ui/button'
import { Input } from '@/shared/ui/input'
import { Typography } from '@/shared/ui/typography'
import { useAppleSignInMutation, useSignInMutation } from '@/services/auth'
import { useApp } from '@/shared/contexts/app-context'
import { useTranslation } from '@/shared/hooks/use-translation'
import { saveTokens } from '@/shared/lib/auth'
import { zodResolver } from '@hookform/resolvers/zod'
import * as AppleAuthentication from 'expo-apple-authentication'
import { useRouter } from 'expo-router'
import { useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { Alert, Platform, Text, TouchableOpacity, View } from 'react-native'
import { z } from 'zod'

const createLoginSchema = (t: (key: string) => string) =>
  z.object({
    email: z
      .string()
      .min(1, t('auth.emailRequired'))
      .email(t('auth.emailInvalid')),
    password: z
      .string()
      .min(1, t('auth.passwordRequired'))
      .min(6, t('auth.passwordMinLength')),
  })

export function LoginForm() {
  const { t } = useTranslation()
  const router = useRouter()
  const { setAuthenticated } = useApp()
  const [serverError, setServerError] = useState<string | null>(null)

  const loginSchema = createLoginSchema(t)

  type LoginFormData = z.infer<typeof loginSchema>

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  })

  const signInMutation = useSignInMutation({
    onSuccess: async (data) => {
      setServerError(null)
      // Save tokens and userId
      await saveTokens(data.token, data.refreshToken, data.userId)
      // Update auth state
      await setAuthenticated(true)
      // Navigate to index to handle routing logic
      router.replace('/')
    },
    onError: (error) => {
      setServerError(t('auth.invalidCredentials'))
      console.error('Login error:', error)
    },
  })

  const onSubmit = async (data: LoginFormData) => {
    setServerError(null)
    signInMutation.mutate({
      email: data.email,
      password: data.password,
    })
  }

  const handleSignupPress = () => {
    router.push('/(auth)/signup')
  }

  const appleSignInMutation = useAppleSignInMutation({
    onSuccess: async (data) => {
      // Save tokens and userId
      await saveTokens(data.token, data.refreshToken, data.userId)
      // Update auth state
      await setAuthenticated(true)
      // Navigate to index to handle routing logic
      router.replace('/')
    },
    onError: (error) => {
      Alert.alert(t('auth.error'), t('auth.appleSignInFailed'))
      console.error('Apple Sign In error:', error)
    },
  })

  const handleAppleSignIn = async () => {
    try {
      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
      })

      if (!credential.identityToken) {
        Alert.alert(t('auth.error'), t('auth.appleSignInFailed'))
        return
      }

      // Prepare payload for Apple Sign In
      appleSignInMutation.mutate({
        identityToken: credential.identityToken,
      })
    } catch (e: any) {
      if (e.code === 'ERR_CANCELED') {
        // Пользователь отменил авторизацию
        console.log('Apple Sign In cancelled by user')
      } else if (e.code === 'ERR_NOT_AVAILABLE') {
        Alert.alert(t('auth.error'), t('auth.appleSignInNotAvailable'))
      } else {
        console.error('Apple Sign In error:', e)
        Alert.alert(t('auth.error'), t('auth.appleSignInFailed'))
      }
    }
  }

  return (
    <View className="flex-1 relative">
      <AuthBackground />
      <View className="flex-1 px-6 pt-16 pb-8 relative z-10">
        <AuthLogo
          icon="map"
          titleKey="auth.welcomeBack"
          subtitleKey="auth.loginSubtitle"
        />
        {/* Form */}
        <View className="gap-5 mb-6">
          {/* Username Input */}
          <Controller
            control={control}
            name="email"
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                label={t('auth.email')}
                placeholder={t('auth.emailPlaceholder')}
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
                leftIcon="person-outline"
                error={errors.email?.message}
              />
            )}
          />

          {/* Password Input */}
          <Controller
            control={control}
            name="password"
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                label={t('auth.password')}
                placeholder={t('auth.passwordPlaceholder')}
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                secureTextEntry
                autoCapitalize="none"
                autoComplete="password"
                error={errors.password?.message}
              />
            )}
          />

          {/* Server Error */}
          {serverError && (
            <Typography variant="bodySmall" color="#ef4444" align="center">
              {serverError}
            </Typography>
          )}

          {/* Login Button */}
          <Button
            onPress={handleSubmit(onSubmit)}
            disabled={signInMutation.isPending}
            size="lg"
            className="mt-2">
            {signInMutation.isPending ? t('common.loading') : t('auth.login')}
          </Button>

          {/* Divider */}
          {Platform.OS === 'ios' && (
            <View className="flex-row items-center my-4">
              <View className="flex-1 h-px bg-border" />
              <Typography
                variant="bodySmall"
                align="center"
                color="#94a3b8"
                className="px-4">
                {t('common.or') || 'or'}
              </Typography>
              <View className="flex-1 h-px bg-border" />
            </View>
          )}

          {/* Apple Sign In button */}
          {Platform.OS === 'ios' && (
            <View className="mt-2">
              <AppleAuthentication.AppleAuthenticationButton
                buttonType={
                  AppleAuthentication.AppleAuthenticationButtonType.SIGN_IN
                }
                buttonStyle={
                  AppleAuthentication.AppleAuthenticationButtonStyle.BLACK
                }
                cornerRadius={20}
                style={{ width: '100%', height: 52 }}
                onPress={handleAppleSignIn}
              />
            </View>
          )}
        </View>
        {/* Sign up link */}
        <View className="flex-row justify-center items-center gap-2 mt-6">
          <Typography variant="body" align="center" color="#77808D">
            {t('auth.noAccount')}
          </Typography>
          <TouchableOpacity onPress={handleSignupPress} activeOpacity={0.7}>
            <Text className="text-primary font-bold text-base">
              {t('auth.signUp')} now
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  )
}
