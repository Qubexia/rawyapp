import { apiClient } from '@/lib/api';

export interface HealthStatus {
  status: 'ok' | 'error';
  timestamp: string;
}

export const healthService = {
  async check(): Promise<HealthStatus> {
    const response = await apiClient.get<HealthStatus>('/admin/system/health');
    return response.data;
  },
};
