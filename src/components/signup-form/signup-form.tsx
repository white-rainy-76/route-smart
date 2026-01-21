import { AuthBackground } from '@/components/auth/auth-background'
import { AuthLogo } from '@/components/auth/auth-logo'
import { Button } from '@/shared/ui/button'
import { Input } from '@/shared/ui/input'
import { Typography } from '@/shared/ui/typography'
import { useSignUpMutation } from '@/services/auth'
import { useApp } from '@/shared/contexts/app-context'
import { useTranslation } from '@/shared/hooks/use-translation'
import { saveTokens } from '@/shared/lib/auth'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'expo-router'
import { useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { Text, TouchableOpacity, View } from 'react-native'
import { z } from 'zod'

const createSignupSchema = (t: (key: string) => string) =>
  z
    .object({
      email: z
        .string()
        .min(1, t('auth.emailRequired'))
        .email(t('auth.emailInvalid')),
      password: z
        .string()
        .min(1, t('auth.passwordRequired'))
        .min(6, t('auth.passwordMinLength')),
      confirmPassword: z.string().min(1, t('auth.passwordRequired')),
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: t('auth.passwordsDontMatch'),
      path: ['confirmPassword'],
    })

export function SignupForm() {
  const { t } = useTranslation()
  const router = useRouter()
  const { setAuthenticated } = useApp()
  const [serverError, setServerError] = useState<string | null>(null)

  const signupSchema = createSignupSchema(t)

  type SignupFormData = z.infer<typeof signupSchema>

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      email: '',
      password: '',
      confirmPassword: '',
    },
  })

  const signUpMutation = useSignUpMutation({
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
      setServerError(t('auth.emailAlreadyExists'))
      console.error('Signup error:', error)
    },
  })

  const onSubmit = async (data: SignupFormData) => {
    setServerError(null)
    signUpMutation.mutate({
      email: data.email,
      password: data.password,
    })
  }

  const handleLoginPress = () => {
    router.push('/(auth)/login')
  }

  return (
    <View className="flex-1 relative">
      <AuthBackground />
      <View className="flex-1 px-6 pt-16 pb-8 relative z-10">
        <AuthLogo
          icon="person-add"
          titleKey="auth.createAccount"
          subtitleKey="auth.signupSubtitle"
        />

        {/* Form */}
        <View className="gap-5 mb-6">
          {/* Email Input */}
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
                leftIcon="mail-outline"
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
                autoComplete="password-new"
                error={errors.password?.message}
              />
            )}
          />

          {/* Confirm Password Input */}
          <Controller
            control={control}
            name="confirmPassword"
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                label={t('auth.confirmPassword')}
                placeholder={t('auth.confirmPasswordPlaceholder')}
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                secureTextEntry
                autoCapitalize="none"
                autoComplete="password-new"
                error={errors.confirmPassword?.message}
              />
            )}
          />

          {/* Server Error */}
          {serverError && (
            <Typography variant="bodySmall" color="#ef4444" align="center">
              {serverError}
            </Typography>
          )}

          {/* Sign Up Button */}
          <Button
            onPress={handleSubmit(onSubmit)}
            disabled={signUpMutation.isPending}
            size="lg"
            className="mt-2">
            {signUpMutation.isPending ? t('common.loading') : t('auth.signUp')}
          </Button>
        </View>

        {/* Login link */}
        <View className="flex-row justify-center items-center gap-2 mt-6">
          <Typography variant="body" align="center" color="#77808D">
            {t('auth.haveAccount')}
          </Typography>
          <TouchableOpacity onPress={handleLoginPress} activeOpacity={0.7}>
            <Text className="text-primary font-bold text-base">
              {t('auth.login')}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  )
}
