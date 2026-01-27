import type { StateCreator } from 'zustand'
import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'

type ImmerStateCreator<T> = StateCreator<T, [['zustand/immer', never]], [], T>

export const createStore = <T>(initializer: ImmerStateCreator<T>) =>
  create<T>()(immer(initializer))
