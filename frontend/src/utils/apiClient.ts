import axios, { AxiosRequestConfig, AxiosError } from 'axios';

interface RetryConfig {
  maxRetries?: number;
  retryDelay?: number;
  timeout?: number;
}

/**
 * API呼び出し用のaxiosインスタンス（タイムアウトとリトライ機能付き）
 */
const createApiClient = (config: RetryConfig = {}) => {
  const {
    maxRetries = 3,
    retryDelay = 1000,
    timeout = 30000, // 30秒
  } = config;

  const apiClient = axios.create({
    timeout,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  // リトライ機能を追加
  apiClient.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
      const config = error.config as AxiosRequestConfig & { _retry?: number };
      
      // リトライ可能なエラーかチェック
      if (
        !config ||
        !shouldRetry(error) ||
        (config._retry && config._retry >= maxRetries)
      ) {
        return Promise.reject(error);
      }

      // リトライ回数を記録
      config._retry = (config._retry || 0) + 1;

      // 指数バックオフでリトライ
      const delay = retryDelay * Math.pow(2, config._retry - 1);
      
      await new Promise((resolve) => setTimeout(resolve, delay));

      return apiClient(config);
    }
  );

  return apiClient;
};

/**
 * リトライすべきエラーかどうかを判定
 */
const shouldRetry = (error: AxiosError): boolean => {
  // ネットワークエラーまたはタイムアウトエラー
  if (!error.response) {
    return true;
  }

  // 5xxエラー（サーバーエラー）はリトライ
  const status = error.response.status;
  return status >= 500 && status < 600;
};

/**
 * デフォルトのAPIクライアント（リトライ3回、タイムアウト30秒）
 */
export const apiClient = createApiClient({
  maxRetries: 3,
  retryDelay: 1000,
  timeout: 30000,
});

/**
 * カスタム設定でAPIクライアントを作成
 */
export const createCustomApiClient = createApiClient;

