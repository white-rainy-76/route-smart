import { Button } from '@/shared/ui/button'
import { FormInput } from '@/shared/ui/form-input'
import { Typography } from '@/shared/ui/typography'
import { useTheme } from '@/shared/hooks/use-theme'
import { useTranslation } from '@/shared/hooks/use-translation'
import { MaterialIcons } from '@expo/vector-icons'
import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { z } from 'zod'

interface DiscountCardModalProps {
  visible: boolean
  onClose: () => void
  onSubmit: (data: DiscountCardFormData) => void
}

const createDiscountCardSchema = (t: (key: string) => string) =>
  z
    .object({
      firstName: z.string().min(1, 'First name is required'),
      lastName: z.string().min(1, 'Last name is required'),
      phone: z.string().min(1, 'Phone is required'),
      email: z
        .string()
        .email('Invalid email address')
        .min(1, 'Email is required'),
      companyName: z.string().min(1, 'Company name is required'),
      ein: z.string().min(1, 'EIN is required'),
      monthlyFuelUsageType: z.enum(['file', 'gallons']),
      gallonsPerMonth: z.string().optional(),
      file: z.any().optional(),
    })
    .refine(
      (data) => {
        if (data.monthlyFuelUsageType === 'gallons') {
          return data.gallonsPerMonth && data.gallonsPerMonth.length > 0
        }
        return true
      },
      {
        message: 'Gallons per month is required',
        path: ['gallonsPerMonth'],
      },
    )

export type DiscountCardFormData = z.infer<
  ReturnType<typeof createDiscountCardSchema>
>

export function DiscountCardModal({
  visible,
  onClose,
  onSubmit,
}: DiscountCardModalProps) {
  const { t } = useTranslation()
  const { resolvedTheme } = useTheme()
  const insets = useSafeAreaInsets()
  const [fuelUsageType, setFuelUsageType] = useState<'file' | 'gallons'>(
    'gallons',
  )

  const schema = createDiscountCardSchema(t)

  type FormData = z.infer<typeof schema>

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      firstName: '',
      lastName: '',
      phone: '',
      email: '',
      companyName: '',
      ein: '',
      monthlyFuelUsageType: 'gallons',
      gallonsPerMonth: '',
    },
  })

  const mutedColor = resolvedTheme === 'dark' ? '#94A3B8' : '#6B7280'
  const modalBg = resolvedTheme === 'dark' ? '#1E293B' : '#FFFFFF'
  const overlayBg =
    resolvedTheme === 'dark' ? 'rgba(0, 0, 0, 0.7)' : 'rgba(0, 0, 0, 0.5)'
  const borderColor = resolvedTheme === 'dark' ? '#334155' : '#E5E7EB'

  const handleFormSubmit = (data: FormData) => {
    onSubmit(data)
    reset()
    onClose()
  }

  const handleClose = () => {
    reset()
    onClose()
  }

  const handleFuelUsageTypeChange = (type: 'file' | 'gallons') => {
    setFuelUsageType(type)
    setValue('monthlyFuelUsageType', type)
    if (type === 'file') {
      setValue('gallonsPerMonth', '')
    }
  }

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleClose}>
      <TouchableWithoutFeedback onPress={handleClose}>
        <KeyboardAvoidingView
          style={[styles.overlay, { backgroundColor: overlayBg }]}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}>
          <TouchableWithoutFeedback>
            <View
              style={[
                styles.modal,
                {
                  backgroundColor: modalBg,
                  marginTop: Platform.OS === 'ios' ? 40 : 40,
                  maxHeight: '90%',
                  paddingBottom: insets.bottom + 20,
                },
              ]}>
              <ScrollView
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled">
                {/* Header */}
                <View className="flex-row items-center justify-between mb-6">
                  <View className="flex-1 pr-4">
                    <Typography
                      variant="h3"
                      weight="700"
                      className="text-foreground mb-2"
                      style={{ fontSize: 22 }}>
                      {t('fuelInfo.fuelCardApplication') ||
                        'Fuel Card Application'}
                    </Typography>
                    <Typography
                      variant="body"
                      className="text-muted-foreground"
                      style={{ fontSize: 14, lineHeight: 20 }}>
                      {t('fuelInfo.fuelCardSubtitle') ||
                        "Get access to discounted diesel pricing. Fill out the form — we'll contact you shortly."}
                    </Typography>
                  </View>
                  <TouchableOpacity
                    onPress={handleClose}
                    className="ml-2 p-1 rounded-full"
                    style={{
                      backgroundColor:
                        resolvedTheme === 'dark'
                          ? 'rgba(148, 163, 184, 0.1)'
                          : 'rgba(107, 114, 128, 0.1)',
                    }}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                    <MaterialIcons name="close" size={22} color={mutedColor} />
                  </TouchableOpacity>
                </View>

                {/* Form */}
                <View className="gap-4 mb-4">
                  {/* First Name and Last Name */}
                  <View className="flex-row gap-3">
                    <View className="flex-1">
                      <Controller
                        control={control}
                        name="firstName"
                        render={({ field: { onChange, onBlur, value } }) => (
                          <FormInput
                            label={t('fuelInfo.firstName') || 'First Name'}
                            value={value}
                            onChangeText={onChange}
                            onBlur={onBlur}
                            error={errors.firstName?.message}
                            autoCapitalize="words"
                            containerClassName="mb-0"
                          />
                        )}
                      />
                    </View>
                    <View className="flex-1">
                      <Controller
                        control={control}
                        name="lastName"
                        render={({ field: { onChange, onBlur, value } }) => (
                          <FormInput
                            label={t('fuelInfo.lastName') || 'Last Name'}
                            value={value}
                            onChangeText={onChange}
                            onBlur={onBlur}
                            error={errors.lastName?.message}
                            autoCapitalize="words"
                            containerClassName="mb-0"
                          />
                        )}
                      />
                    </View>
                  </View>

                  {/* Phone and Email */}
                  <View className="flex-row gap-3">
                    <View className="flex-1">
                      <Controller
                        control={control}
                        name="phone"
                        render={({ field: { onChange, onBlur, value } }) => (
                          <FormInput
                            label={t('fuelInfo.phone') || 'Phone'}
                            value={value}
                            onChangeText={onChange}
                            onBlur={onBlur}
                            error={errors.phone?.message}
                            keyboardType="phone-pad"
                            containerClassName="mb-0"
                          />
                        )}
                      />
                    </View>
                    <View className="flex-1">
                      <Controller
                        control={control}
                        name="email"
                        render={({ field: { onChange, onBlur, value } }) => (
                          <FormInput
                            label={t('fuelInfo.email') || 'Email'}
                            value={value}
                            onChangeText={onChange}
                            onBlur={onBlur}
                            error={errors.email?.message}
                            keyboardType="email-address"
                            autoCapitalize="none"
                            autoComplete="email"
                            containerClassName="mb-0"
                          />
                        )}
                      />
                    </View>
                  </View>

                  {/* Company Name and EIN */}
                  <View className="flex-row gap-3">
                    <View className="flex-1">
                      <Controller
                        control={control}
                        name="companyName"
                        render={({ field: { onChange, onBlur, value } }) => (
                          <FormInput
                            label={t('fuelInfo.companyName') || 'Company Name'}
                            value={value}
                            onChangeText={onChange}
                            onBlur={onBlur}
                            error={errors.companyName?.message}
                            autoCapitalize="words"
                            containerClassName="mb-0"
                          />
                        )}
                      />
                    </View>
                    <View className="flex-1">
                      <Controller
                        control={control}
                        name="ein"
                        render={({ field: { onChange, onBlur, value } }) => (
                          <FormInput
                            label={t('fuelInfo.ein') || 'EIN (Tax ID)'}
                            value={value}
                            onChangeText={onChange}
                            onBlur={onBlur}
                            error={errors.ein?.message}
                            containerClassName="mb-0"
                          />
                        )}
                      />
                    </View>
                  </View>

                  {/* Monthly Fuel Usage */}
                  <View>
                    <Typography
                      variant="label"
                      weight="600"
                      className="mb-3 text-foreground"
                      style={{ fontSize: 14 }}>
                      {t('fuelInfo.monthlyFuelUsage') || 'Monthly Fuel Usage'}
                    </Typography>
                    <View className="flex-row gap-3 mb-3">
                      <TouchableOpacity
                        onPress={() => handleFuelUsageTypeChange('file')}
                        className="flex-1 px-4 py-3.5 rounded-2xl border-2"
                        style={{
                          backgroundColor:
                            fuelUsageType === 'file'
                              ? resolvedTheme === 'dark'
                                ? '#1E3A8A'
                                : '#EFF6FF'
                              : 'transparent',
                          borderColor:
                            fuelUsageType === 'file' ? '#4964D8' : borderColor,
                        }}>
                        <Typography
                          variant="body"
                          weight="600"
                          align="center"
                          style={{
                            color:
                              fuelUsageType === 'file' ? '#4964D8' : mutedColor,
                            fontSize: 14,
                          }}>
                          {t('fuelInfo.uploadFile') || 'Upload File'}
                        </Typography>
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() => handleFuelUsageTypeChange('gallons')}
                        className="flex-1 px-4 py-3.5 rounded-2xl border-2"
                        style={{
                          backgroundColor:
                            fuelUsageType === 'gallons'
                              ? resolvedTheme === 'dark'
                                ? '#1E3A8A'
                                : '#EFF6FF'
                              : 'transparent',
                          borderColor:
                            fuelUsageType === 'gallons'
                              ? '#4964D8'
                              : borderColor,
                        }}>
                        <Typography
                          variant="body"
                          weight="600"
                          align="center"
                          style={{
                            color:
                              fuelUsageType === 'gallons'
                                ? '#4964D8'
                                : mutedColor,
                            fontSize: 14,
                          }}>
                          {t('fuelInfo.enterGallons') || 'Enter gallons'}
                        </Typography>
                      </TouchableOpacity>
                    </View>

                    {fuelUsageType === 'gallons' && (
                      <Controller
                        control={control}
                        name="gallonsPerMonth"
                        render={({ field: { onChange, onBlur, value } }) => (
                          <FormInput
                            label={
                              t('fuelInfo.gallonsPerMonth') ||
                              'Gallons per month'
                            }
                            value={value || ''}
                            onChangeText={onChange}
                            onBlur={onBlur}
                            error={errors.gallonsPerMonth?.message}
                            keyboardType="numeric"
                            containerClassName="mb-0"
                          />
                        )}
                      />
                    )}

                    {fuelUsageType === 'file' && (
                      <View
                        className="px-4 py-4 rounded-2xl border-2"
                        style={{ borderColor, borderStyle: 'dashed' }}>
                        <Typography
                          variant="body"
                          align="center"
                          style={{ color: mutedColor, fontSize: 14 }}>
                          File upload functionality coming soon
                        </Typography>
                      </View>
                    )}
                  </View>
                </View>

                {/* Privacy Text */}
                <Typography
                  variant="caption"
                  align="center"
                  style={{ color: mutedColor, fontSize: 12, marginBottom: 20 }}>
                  {t('fuelInfo.privacyText') ||
                    'By clicking the button, you allow us to process your personal data'}
                </Typography>

                {/* Submit Button */}
                <Button
                  variant="primary"
                  size="md"
                  onPress={handleSubmit(handleFormSubmit)}
                  style={{ width: '100%' }}>
                  {t('fuelInfo.submit') || 'Submit'}
                </Button>
              </ScrollView>
            </View>
          </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
      </TouchableWithoutFeedback>
    </Modal>
  )
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modal: {
    width: '100%',
    maxWidth: 400,
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
})
