import { LoginForm } from '@/components/login-form/login-form'
import { KeyboardAvoidingView, Platform, ScrollView } from 'react-native'

export default function LoginScreen() {
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-background">
      <ScrollView
        contentContainerClassName="flex-grow"
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}>
        <LoginForm />
      </ScrollView>
    </KeyboardAvoidingView>
  )
}
