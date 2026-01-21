import { formatDriveTime } from '@/shared/lib/format-drive-time'
import { StyleSheet, Text, View } from 'react-native'

interface RouteTimeMarkerProps {
  driveTime: number // время в секундах
  isSelected?: boolean // выбрана ли секция
}

export function RouteTimeMarker({
  driveTime,
  isSelected = false,
}: RouteTimeMarkerProps) {
  const timeText = formatDriveTime(driveTime)

  return (
    <View style={[styles.container, isSelected && styles.containerSelected]}>
      <Text style={[styles.text, isSelected && styles.textSelected]}>
        {timeText}
      </Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 4,
    paddingHorizontal: 5,
    paddingVertical: 3,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.25,
    shadowRadius: 2,
    elevation: 2,
    minWidth: 25,
    alignItems: 'center',
    justifyContent: 'center',
  },
  containerSelected: {
    backgroundColor: '#4964D8',
    shadowColor: '#4964D8',
    shadowOpacity: 0.4,
    shadowRadius: 4,
    elevation: 4,
  },
  text: {
    fontSize: 10,
    fontWeight: '600',
    color: '#383838',
    fontFamily: 'Nunito_600SemiBold',
  },
  textSelected: {
    color: '#FFFFFF',
  },
})
