import { authService } from '../features/auth/api/authService';
import { checkService } from '../features/scan/api/checkService';
import { reportService } from '../features/report/api/reportService';
import { statsService } from '../features/dashboard/api/statsService';

export const api = {
  ...authService,
  ...checkService,
  ...reportService,
  ...statsService
};
