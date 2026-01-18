import { TollIcon } from '@/components/ui/icons'
import { StyleSheet, View } from 'react-native'

export function TollMarker() {
  return (
    <View style={styles.container}>
      <TollIcon width={28} height={40} />
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
