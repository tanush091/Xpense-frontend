import { apiClient } from './apiClient';

/** Recurring bills (Personal dashboard). Server errors are shown to the user, never hidden. */
export const billService = {
  getBills() {
    return apiClient.get('/bills').then((data) => (Array.isArray(data) ? data : []));
  },

  createBill(bill) {
    return apiClient.post('/bills', bill);
  },

  updateBill(id, updates) {
    return apiClient.put(`/bills/${id}`, updates);
  },

  deleteBill(id) {
    return apiClient.delete(`/bills/${id}`);
  },

  /** Records the payment and moves the due date forward. Returns { bill, transaction }. */
  payBill(id) {
    return apiClient.post(`/bills/${id}/pay`, {});
  }
};
