// Project Configuration & Global Constants

export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export const USER_ROLES = {
  ADMIN: 'admin',
  MODERATOR: 'moderator',
  USER: 'user'
};

export const THREAT_SEVERITIES = {
  DANGER: 'danger',
  WARNING: 'warning',
  INFO: 'info'
};

export const THREAT_TYPES = {
  URL: 'url',
  PHONE: 'phone',
  BANK_ACCOUNT: 'bank_account'
};

export const REPORT_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected'
};
