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

export default function CreateTruckProfileScreen() {
  const { t } = useTranslation()
  const router = useRouter()
  const { setTruckProfile } = useApp()
  const [truckName, setTruckName] = useState('')
  const [licensePlate, setLicensePlate] = useState('')
  const [truckType, setTruckType] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleCreate = async () => {
    if (!truckName.trim() || !licensePlate.trim() || !truckType.trim()) {
      Alert.alert(t('truckProfile.error'), t('truckProfile.fillAllFields'))
      return
    }

    setIsLoading(true)
    try {
      // TODO: Implement actual truck profile creation logic
      // For now, just simulate creation
      await new Promise((resolve) => setTimeout(resolve, 1000))
      await setTruckProfile(true)
      router.replace('/home')
    } catch (error) {
      Alert.alert(t('truckProfile.error'), t('truckProfile.creationFailed'))
      console.error('Truck profile creation error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-background">
      <ScrollView
        contentContainerClassName="flex-grow px-6 py-8"
        keyboardShouldPersistTaps="handled">
        <View className="flex-1 justify-center">
          {/* Header */}
          <View className="items-center mb-10">
            <View className="w-24 h-24 bg-primary rounded-full items-center justify-center mb-6">
              <Text className="text-5xl">🚛</Text>
            </View>
            <Text className="text-3xl font-bold text-foreground mb-2 text-center">
              {t('truckProfile.title')}
            </Text>
            <Text className="text-muted-foreground text-base text-center">
              {t('truckProfile.subtitle')}
            </Text>
          </View>

          {/* Form */}
          <View className="gap-4 mb-6">
            <View>
              <Text className="text-foreground font-medium mb-2">
                {t('truckProfile.truckName')}
              </Text>
              <TextInput
                value={truckName}
                onChangeText={setTruckName}
                placeholder={t('truckProfile.truckNamePlaceholder')}
                placeholderTextColor="#94a3b8"
                autoCapitalize="words"
                className="bg-card border border-border rounded-xl px-4 py-4 text-foreground"
              />
            </View>

            <View>
              <Text className="text-foreground font-medium mb-2">
                {t('truckProfile.licensePlate')}
              </Text>
              <TextInput
                value={licensePlate}
                onChangeText={setLicensePlate}
                placeholder={t('truckProfile.licensePlatePlaceholder')}
                placeholderTextColor="#94a3b8"
                autoCapitalize="characters"
                className="bg-card border border-border rounded-xl px-4 py-4 text-foreground"
              />
            </View>

            <View>
              <Text className="text-foreground font-medium mb-2">
                {t('truckProfile.truckType')}
              </Text>
              <TextInput
                value={truckType}
                onChangeText={setTruckType}
                placeholder={t('truckProfile.truckTypePlaceholder')}
                placeholderTextColor="#94a3b8"
                autoCapitalize="words"
                className="bg-card border border-border rounded-xl px-4 py-4 text-foreground"
              />
            </View>

            <TouchableOpacity
              onPress={handleCreate}
              disabled={isLoading}
              className={`bg-primary py-4 rounded-xl items-center mt-2 ${
                isLoading ? 'opacity-50' : ''
              }`}>
              <Text className="text-primary-foreground text-lg font-semibold">
                {isLoading ? t('common.loading') : t('truckProfile.create')}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}
