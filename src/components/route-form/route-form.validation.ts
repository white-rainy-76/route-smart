import type { RoutePoint } from '@/stores/route/types'
import { z } from 'zod'

/**
 * Проверяет, совпадают ли две точки по координатам
 * Использует небольшую толерантность (≈10 метров) для учета погрешностей
 */
export function pointsEqual(point1: RoutePoint, point2: RoutePoint): boolean {
  const TOLERANCE = 0.0001 // примерно 10 метров
  return (
    Math.abs(point1.latitude - point2.latitude) < TOLERANCE &&
    Math.abs(point1.longitude - point2.longitude) < TOLERANCE
  )
}

/**
 * Схема валидации для MPG поля
 */
export const mpgSchema = z
  .string()
  .refine(
    (val) => {
      const trimmed = val.trim().replace(',', '.')
      if (trimmed === '') return true // пустое значение = 0
      const num = Number(trimmed)
      return !Number.isNaN(num) && num >= 0
    },
    { message: 'Miles per gallon must be a number >= 0' },
  )
  .refine(
    (val) => {
      const trimmed = val.trim().replace(',', '.')
      if (trimmed === '') return true
      const num = Number(trimmed)
      return num <= 100
    },
    { message: 'Miles per gallon must be <= 100' },
  )

/**
 * Валидация точек маршрута
 */
export function validateRoutePoints(
  origin: RoutePoint | null,
  destination: RoutePoint | null,
  waypoints: RoutePoint[],
): { destination?: string } {
  const errors: { destination?: string } = {}

  if (!destination || !origin) {
    return errors
  }

  // Проверка на совпадение origin и destination
  if (pointsEqual(destination, origin)) {
    errors.destination = 'Destination cannot be the same as origin'
    return errors
  }

  // Проверка на совпадение destination с waypoints
  const duplicateWaypoint = waypoints.find((wp) => pointsEqual(destination, wp))
  if (duplicateWaypoint) {
    errors.destination = 'Destination cannot be the same as any waypoint'
    return errors
  }

  return errors
}

export const routeFormSchema = z.object({
  mpg: mpgSchema,
})

export type RouteFormData = z.infer<typeof routeFormSchema>
