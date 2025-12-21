import { useApp } from '@/contexts/app-context'
import { useTranslation } from '@/hooks/use-translation'
import { useRouter } from 'expo-router'
import { useState } from 'react'
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native'

export default function SignupScreen() {
  const { t } = useTranslation()
  const router = useRouter()
  const { setAuthenticated } = useApp()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSignup = async () => {
    if (!email.trim() || !password.trim() || !confirmPassword.trim()) {
      Alert.alert(t('auth.error'), t('auth.fillAllFields'))
      return
    }

    if (password !== confirmPassword) {
      Alert.alert(t('auth.error'), t('auth.passwordsDontMatch'))
      return
    }

    if (password.length < 6) {
      Alert.alert(t('auth.error'), t('auth.passwordTooShort'))
      return
    }

    setIsLoading(true)
    try {
      // TODO: Implement actual signup logic
      // For now, just simulate signup
      await new Promise((resolve) => setTimeout(resolve, 1000))
      await setAuthenticated(true)
      router.replace('/create-truck-profile')
    } catch (error) {
      Alert.alert(t('auth.error'), t('auth.signupFailed'))
      console.error('Signup error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleLoginPress = () => {
    router.push('/(auth)/login')
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-background">
      <ScrollView
        contentContainerClassName="flex-grow"
        keyboardShouldPersistTaps="handled">
        <View className="flex-1 px-6 justify-center">
          {/* Logo/Header */}
          <View className="items-center mb-12">
            <View className="w-24 h-24 bg-primary rounded-full items-center justify-center mb-6">
              <Text className="text-5xl">🚚</Text>
            </View>
            <Text className="text-3xl font-bold text-foreground mb-2">
              {t('auth.createAccount')}
            </Text>
            <Text className="text-muted-foreground text-base text-center">
              {t('auth.signupSubtitle')}
            </Text>
          </View>

          {/* Form */}
          <View className="gap-4 mb-6">
            <View>
              <Text className="text-foreground font-medium mb-2">
                {t('auth.email')}
              </Text>
              <TextInput
                value={email}
                onChangeText={setEmail}
                placeholder={t('auth.emailPlaceholder')}
                placeholderTextColor="#94a3b8"
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
                className="bg-card border border-border rounded-xl px-4 py-4 text-foreground"
              />
            </View>

            <View>
              <Text className="text-foreground font-medium mb-2">
                {t('auth.password')}
              </Text>
              <TextInput
                value={password}
                onChangeText={setPassword}
                placeholder={t('auth.passwordPlaceholder')}
                placeholderTextColor="#94a3b8"
                secureTextEntry
                autoCapitalize="none"
                autoComplete="password-new"
                className="bg-card border border-border rounded-xl px-4 py-4 text-foreground"
              />
            </View>

            <View>
              <Text className="text-foreground font-medium mb-2">
                {t('auth.confirmPassword')}
              </Text>
              <TextInput
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                placeholder={t('auth.confirmPasswordPlaceholder')}
                placeholderTextColor="#94a3b8"
                secureTextEntry
                autoCapitalize="none"
                autoComplete="password-new"
                className="bg-card border border-border rounded-xl px-4 py-4 text-foreground"
              />
            </View>

            <TouchableOpacity
              onPress={handleSignup}
              disabled={isLoading}
              className={`bg-primary py-4 rounded-xl items-center mt-2 ${
                isLoading ? 'opacity-50' : ''
              }`}>
              <Text className="text-primary-foreground text-lg font-semibold">
                {isLoading ? t('common.loading') : t('auth.signUp')}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Login link */}
          <View className="flex-row justify-center items-center gap-2">
            <Text className="text-muted-foreground">
              {t('auth.haveAccount')}
            </Text>
            <TouchableOpacity onPress={handleLoginPress}>
              <Text className="text-primary font-semibold">
                {t('auth.login')}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}
