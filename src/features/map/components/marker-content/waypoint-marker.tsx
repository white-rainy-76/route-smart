import { StyleSheet, Text, View } from 'react-native'

interface WaypointMarkerProps {
  index: number
}

export function WaypointMarker({ index }: WaypointMarkerProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>{index}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    width: 17,
    height: 17,
    borderRadius: 999,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#4964D8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontFamily: 'Nunito_600SemiBold',
    fontWeight: '600',
    fontSize: 9.71,
    lineHeight: 16.19,
    letterSpacing: 0,
    color: '#4964D8',
    textAlign: 'center',
    includeFontPadding: false,
    textAlignVertical: 'center',
  },
})
