import { LovesIcon } from '@/components/ui/icons/loves'
import { PilotIcon } from '@/components/ui/icons/pilot'
import { TAIcon } from '@/components/ui/icons/ta'
import { GasStation } from '@/services/gas-station/types/gas-station'
import React, { useMemo } from 'react'
import { StyleSheet, Text, View } from 'react-native'

interface GasStationMarkerProps {
  station: GasStation
}

export const GasStationMarker: React.FC<GasStationMarkerProps> = ({
  station,
}) => {
  // Memoize icon to prevent unnecessary re-renders
  const stationIcon = useMemo(() => {
    try {
      const stationNameLower = station.name?.toLowerCase() || ''

      switch (stationNameLower) {
        case 'ta':
          return <TAIcon width={18} height={18} />
        case 'pilot':
          return <PilotIcon width={18} height={18} />
        case 'loves':
          return <LovesIcon width={18} height={18} />
        case 'road rangers':
          return <TAIcon width={18} height={18} />
        default:
          return <TAIcon width={18} height={18} />
      }
    } catch (error) {
      console.error('Error rendering station icon:', error)
      return <TAIcon width={18} height={18} />
    }
  }, [station.name])

  // Memoize fuel price with validity check
  const fuelPrice = useMemo(() => {
    try {
      if (station.fuelPrice?.finalPrice) {
        return station.fuelPrice.finalPrice
      }
      if (station.fuelPrice?.price) {
        return station.fuelPrice.price
      }
      return 'N/A'
    } catch (error) {
      console.error('Error getting fuel price:', error)
      return 'N/A'
    }
  }, [station.fuelPrice])

  // Memoize marker colors and styles
  const markerStyles = useMemo(() => {
    try {
      if (station.isAlgorithm) {
        return {
          containerBg: '#4964D8', // Project blue color
          containerBgSecondary: '#3B4FCC', // Darker blue variant
          priceBg: '#FFFFFF',
          priceText: '#4964D8',
          iconBg: '#FFFFFF',
          borderColor: '#4964D8',
          shadowColor: '#4964D8',
        }
      } else {
        return {
          containerBg: '#059669', // Emerald gradient start
          containerBgSecondary: '#10B981', // Emerald gradient end
          priceBg: '#FFFFFF',
          priceText: '#059669',
          iconBg: '#FFFFFF',
          borderColor: '#059669',
          shadowColor: '#059669',
        }
      }
    } catch (error) {
      console.error('Error determining marker styles:', error)
      return {
        containerBg: '#6B7280',
        containerBgSecondary: '#9CA3AF',
        priceBg: '#FFFFFF',
        priceText: '#6B7280',
        iconBg: '#FFFFFF',
        borderColor: '#6B7280',
        shadowColor: '#6B7280',
      }
    }
  }, [station.isAlgorithm])

  // Validate data before rendering
  if (!station || !station.name) {
    console.warn('Invalid station data for marker:', station)
    return null
  }

  return (
    <View style={styles.markerContainer}>
      {/* Main marker body with gradient effect */}
      <View
        style={[
          styles.markerBody,
          {
            backgroundColor: markerStyles.containerBg,
            borderColor: markerStyles.borderColor,
            shadowColor: markerStyles.shadowColor,
          },
        ]}>
        {/* Icon container */}
        <View
          style={[
            styles.iconContainer,
            { backgroundColor: markerStyles.iconBg },
          ]}>
          {stationIcon}
        </View>

        {/* Price badge */}
        <View
          style={[
            styles.priceBadge,
            { backgroundColor: markerStyles.priceBg },
          ]}>
          <Text style={[styles.priceText, { color: markerStyles.priceText }]}>
            ${fuelPrice}
          </Text>
        </View>
      </View>

      {/* Marker pointer/tail */}
      <View
        style={[
          styles.markerPointer,
          {
            borderTopColor: markerStyles.containerBg,
            borderLeftColor: 'transparent',
            borderRightColor: 'transparent',
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
    width: 50,
    height: 60,
  },
  markerBody: {
    width: 40,
    height: 40,
    borderRadius: 20,
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
  iconContainer: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 2,
    // Subtle shadow for icon
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  priceBadge: {
    position: 'absolute',
    bottom: -8,
    left: '50%',
    marginLeft: -15,
    width: 30,
    height: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
    // Shadow for price badge
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  priceText: {
    fontSize: 9,
    fontWeight: '700',
    fontFamily: 'Nunito-Bold',
    textAlign: 'center',
  },
  markerPointer: {
    width: 0,
    height: 0,
    borderLeftWidth: 8,
    borderRightWidth: 8,
    borderTopWidth: 12,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    marginTop: -1,
  },
})
