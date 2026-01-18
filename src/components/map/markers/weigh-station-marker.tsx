import { WeighStationIcon } from '@/components/ui/icons'
import { StyleSheet, View } from 'react-native'

export function WeighStationMarker() {
  return (
    <View style={styles.container}>
      <WeighStationIcon width={28} height={40} />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    width: 28,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
})
