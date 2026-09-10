import api from '../api/axios';
import type { FraudLog, KeyAuthRequest, KeyAuthResponse, LogFraudRequest } from '../types';

export async function authenticateKey(payload: KeyAuthRequest) {
  const { data } = await api.post<KeyAuthResponse>('/key-auth', payload);
  return data;
}

export async function logFraud(payload: LogFraudRequest) {
  const { data } = await api.post<FraudLog>('/log_fraud', payload);
  return data;
}
