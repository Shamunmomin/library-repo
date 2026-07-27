import api from './axios'
import type { OnboardingStatus } from '../types'

export const userService = {
  async getOnboardingStatus() {
    const response = await api.get<OnboardingStatus>('/users/onboarding-status')
    return response.data
  },
}
