import { SignupForm } from '@/components/signup-form/signup-form'
import { KeyboardAvoidingView, Platform, ScrollView } from 'react-native'

export default function SignupScreen() {
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-background">
      <ScrollView
        contentContainerClassName="flex-grow"
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}>
        <SignupForm />
      </ScrollView>
    </KeyboardAvoidingView>
  )
}
