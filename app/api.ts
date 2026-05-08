import axios from 'axios';

export const BASE_URL = 'http://192.168.1.2:5000';

const API = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
});

// Function to set auth token
export const setAuthToken = (token: string) => {
  API.defaults.headers.common['Authorization'] = `Bearer ${token}`;
};

// Function to remove auth token
export const removeAuthToken = () => {
  delete API.defaults.headers.common['Authorization'];
};

export type PendingAccount = {
  _id: string;
  name: string;
  age: number;
  email: string;
  role: string;
  accountType: 'tourist' | 'authority';
  approvalStatus: 'pending' | 'approved' | 'rejected';
  phoneNumber?: string;
  emergencyPhone?: string;
  medicalInfo?: string;
  createdAt?: string;
  approvalUpdatedAt?: string;
  approvalReviewedBy?: string;
  rejectionReason?: string;
  pendingDays?: number;
  duplicateEmailCount?: number;
  duplicatePhoneCount?: number;
  riskFlags?: string[];
  verificationFlags?: {
    hasEmail: boolean;
    hasPhone: boolean;
    hasEmergencyContact: boolean;
    hasMedicalInfo: boolean;
  };
  adminNotes?: {
    text: string;
    createdBy: string;
    createdAt: string;
  }[];
  approvalHistory?: {
    status: string;
    reason?: string;
    createdBy?: string;
    createdAt: string;
  }[];
  priorityScore?: number;
};

export type ReviewAccountsResponse = {
  items: PendingAccount[];
  page: number;
  limit: number;
  total: number;
  hasMore: boolean;
};

export type ReviewQuery = {
  search?: string;
  accountType?: 'all' | 'tourist' | 'authority';
  status?: 'all' | 'pending' | 'approved' | 'rejected';
  sort?: 'newest' | 'oldest' | 'priority' | 'name';
  page?: number;
  limit?: number;
};

export type ApprovalStats = {
  pendingTourists: number;
  pendingAuthorities: number;
  approvedToday: number;
  rejectedToday: number;
  duplicateFlagged: number;
  urgentPending: number;
  latestPendingCreatedAt?: string | null;
  lastUpdatedAt?: string | null;
};

export type ApprovalHistoryItem = {
  status: string;
  reason?: string;
  createdBy?: string;
  createdAt: string;
  accountId: string;
  accountName: string;
  accountEmail: string;
  accountType: 'tourist' | 'authority';
};

export async function getPendingAccounts() {
  const response = await API.get<PendingAccount[]>('/api/users/pending-accounts');
  return response.data;
}

export async function getReviewAccounts(query: ReviewQuery) {
  const response = await API.get<ReviewAccountsResponse>('/api/users/review-accounts', {
    params: query,
  });
  return response.data;
}

export async function getApprovalStats() {
  const response = await API.get<ApprovalStats>('/api/users/stats');
  return response.data;
}

export async function getApprovalHistory(limit = 20) {
  const response = await API.get<ApprovalHistoryItem[]>('/api/users/approval-history', {
    params: { limit },
  });
  return response.data;
}

export async function updateAccountApproval(
  accountType: 'tourist' | 'authority',
  userId: string,
  status: 'approved' | 'rejected',
  options?: {
    reason?: string;
    adminName?: string;
    note?: string;
  }
) {
  const response = await API.patch<PendingAccount>(
    `/api/users/${accountType}/${userId}/approval`,
    { status, ...options }
  );
  return response.data;
}

export async function bulkUpdateAccountApproval(
  accounts: { id: string; accountType: 'tourist' | 'authority' }[],
  status: 'approved' | 'rejected',
  options?: {
    reason?: string;
    adminName?: string;
  }
) {
  const response = await API.post<{ updated: number }>('/api/users/bulk-approval', {
    accounts,
    status,
    ...options,
  });
  return response.data;
}

export async function addAdminNote(
  accountType: 'tourist' | 'authority',
  userId: string,
  note: string,
  adminName?: string
) {
  const response = await API.post<PendingAccount>(`/api/users/${accountType}/${userId}/note`, {
    note,
    adminName,
  });
  return response.data;
}

export default API;
