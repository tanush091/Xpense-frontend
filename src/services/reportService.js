import { apiClient } from './apiClient';

export const reportService = {
  /**
   * Downloads a CSV statement for the specified date range.
   */
  async downloadCsvReport(from = '', to = '') {
    const token = apiClient.getToken();
    const params = new URLSearchParams();
    if (from) params.append('from', from);
    if (to) params.append('to', to);
    params.append('format', 'csv');

    const baseUrl = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api').replace(/\/+$/, '');
    const url = `${baseUrl}/reports?${params.toString()}`;

    const headers = {
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    };

    const res = await fetch(url, { headers });
    if (!res.ok) {
      throw new Error(`Report export failed with status ${res.status}`);
    }

    const blob = await res.blob();
    const downloadUrl = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = `xpense-statement-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(downloadUrl);
  },

  /**
   * Fetches JSON transactions report for the date range
   */
  async getJsonReport(from = '', to = '') {
    const params = {};
    if (from) params.from = from;
    if (to) params.to = to;
    params.format = 'json';
    return apiClient.get('/reports', params);
  }
};
