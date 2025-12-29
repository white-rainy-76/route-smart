import axios, { AxiosInstance } from 'axios'
import { API_URL } from '../env'

export const apiInstance: AxiosInstance = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

