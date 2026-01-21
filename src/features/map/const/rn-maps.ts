// Стиль для скрытия точек интереса (POI)
export const RN_MAP_STYLE = [
  {
    featureType: 'poi',
    stylers: [{ visibility: 'off' }],
  },
  {
    featureType: 'poi.business',
    stylers: [{ visibility: 'off' }],
  },
]
