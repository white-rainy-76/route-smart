import * as React from 'react'
import type { SvgProps } from 'react-native-svg'
import Svg, { Path } from 'react-native-svg'

export const MySubscriptionIcon = ({
  color = '#4964D8',
  width = 24,
  height = 24,
  ...props
}: SvgProps) => (
  <Svg width={width} height={height} viewBox="0 0 20 13" fill="none" {...props}>
    <Path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M0 5.30317V10.3399C0 11.7904 1.20829 12.9661 2.69882 12.9661H17.3012C18.7917 12.9661 20 11.7904 20 10.3399V5.30317C20 5.05094 19.7898 4.84644 19.5306 4.84644H0.469361C0.210156 4.84644 0 5.05094 0 5.30317ZM4.99354 8.50067H3.74191C3.28828 8.50067 2.92053 8.14282 2.92053 7.70139C2.92053 7.25995 3.28828 6.9021 3.74191 6.9021H4.99354C5.44718 6.9021 5.81492 7.25995 5.81492 7.70139C5.81492 8.14282 5.44718 8.50067 4.99354 8.50067Z"
      fill={color}
    />
    <Path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M20 2.79114V2.62622C20 1.17579 18.7917 0 17.3012 0H2.69882C1.20829 0 0 1.17579 0 2.62622V2.79114C0 3.04337 0.210156 3.24788 0.469361 3.24788H19.5306C19.7898 3.24788 20 3.04337 20 2.79114Z"
      fill={color}
    />
  </Svg>
)
