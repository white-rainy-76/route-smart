import React from 'react'
import { StyleSheet, Text, View } from 'react-native'

interface TruckMarkerProps {
  isActive?: boolean
}

export const TruckMarker: React.FC<TruckMarkerProps> = ({
  isActive = true,
}) => {
  return (
    <View style={styles.markerContainer}>
      {/* Main truck marker body */}
      <View
        style={[
          styles.markerBody,
          {
            backgroundColor: isActive ? '#10B981' : '#6B7280',
            borderColor: isActive ? '#059669' : '#4B5563',
            shadowColor: isActive ? '#10B981' : '#6B7280',
          },
        ]}>
        {/* Truck icon placeholder - you can replace with actual truck icon */}
        <View style={styles.truckIcon}>
          <Text style={styles.truckEmoji}>🚛</Text>
        </View>

        {/* Status indicator */}
        <View
          style={[
            styles.statusIndicator,
            {
              backgroundColor: isActive ? '#22C55E' : '#EF4444',
            },
          ]}
        />
      </View>

      {/* Marker pointer/tail */}
      <View
        style={[
          styles.markerPointer,
          {
            borderTopColor: isActive ? '#10B981' : '#6B7280',
          },
        ]}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  markerContainer: {
    alignItems: 'center',
    justifyContent: 'flex-end',
    width: 45,
    height: 55,
  },
  markerBody: {
    width: 35,
    height: 35,
    borderRadius: 17.5,
    borderWidth: 3,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 4,
    // Shadow effects
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  truckIcon: {
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  truckEmoji: {
    fontSize: 16,
  },
  statusIndicator: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#FFFFFF',
    // Shadow for status indicator
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 3,
  },
  markerPointer: {
    width: 0,
    height: 0,
    borderLeftWidth: 6,
    borderRightWidth: 6,
    borderTopWidth: 10,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    marginTop: -1,
  },
})
