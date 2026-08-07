import axios from 'axios';

export function getApplicationErrorMessage(error: unknown) {
  if (!axios.isAxiosError(error)) {
    return error instanceof Error ? error.message : 'Đã xảy ra lỗi';
  }

  const detail = error.response?.data?.detail;
  if (error.response?.status === 400 && detail === 'Application name already exists') {
    return 'Tên ứng dụng đã tồn tại';
  }
  if (error.response?.status === 404) {
    return 'Không tìm thấy ứng dụng';
  }
  if (error.response?.status === 403) {
    return 'Bạn không có quyền quản lý ứng dụng';
  }
  return typeof detail === 'string' ? detail : error.message;
}
