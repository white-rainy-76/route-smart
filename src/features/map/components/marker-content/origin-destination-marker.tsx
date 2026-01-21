import { StyleSheet, Text, View } from 'react-native'

type OriginDestinationMarkerVariant = 'origin' | 'destination'

interface OriginDestinationMarkerProps {
  variant: OriginDestinationMarkerVariant
}

export function OriginDestinationMarker({
  variant,
}: OriginDestinationMarkerProps) {
  const label = variant === 'origin' ? 'A' : 'B'
  return (
    <View style={styles.container}>
      <Text style={styles.text}>{label}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    width: 22,
    height: 22,
    borderRadius: 999,
    backgroundColor: '#4964D8',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#4964D8',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3,
    elevation: 3,
  },
  text: {
    fontFamily: 'Nunito_600SemiBold',
    fontWeight: '600',
    fontSize: 12,
    lineHeight: 16,
    color: '#FFFFFF',
    letterSpacing: 0,
    textAlign: 'center',
    includeFontPadding: false,
    textAlignVertical: 'center',
  },
})
