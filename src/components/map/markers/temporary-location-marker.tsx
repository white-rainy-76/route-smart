import { Typography } from '@/components/ui/typography'
import { MaterialIcons } from '@expo/vector-icons'
import { StyleSheet, View } from 'react-native'

interface TemporaryLocationMarkerProps {
  address: string
  name: string
}

export function TemporaryLocationMarker({
  address,
  name,
}: TemporaryLocationMarkerProps) {
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.addressContainer}>
          <Typography
            variant="caption"
            weight="600"
            color="#383838"
            numberOfLines={1}
            style={{ fontSize: 12 }}>
            {name || address}
          </Typography>
          {name && address !== name && (
            <Typography
              variant="caption"
              color="#64748B"
              numberOfLines={1}
              style={{ fontSize: 10, marginTop: 2 }}>
              {address}
            </Typography>
          )}
        </View>
        <View style={styles.iconContainer}>
          <MaterialIcons name="add" size={16} color="#4964D8" />
        </View>
      </View>
      {/* Стрелка вниз */}
      <View style={styles.arrow} />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  content: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
    flexDirection: 'row',
    alignItems: 'center',
    minWidth: 150,
    maxWidth: 220,
  },
  addressContainer: {
    flex: 1,
    marginRight: 6,
  },
  iconContainer: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#EFF3F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  arrow: {
    width: 0,
    height: 0,
    borderLeftWidth: 6,
    borderRightWidth: 6,
    borderTopWidth: 6,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: '#FFFFFF',
    marginTop: -1,
  },
})
