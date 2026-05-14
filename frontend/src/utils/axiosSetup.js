import axios from 'axios';

let isRefreshing = false;
let pendingQueue = [];

function processQueue(error, newToken) {
  pendingQueue.forEach((p) => (error ? p.reject(error) : p.resolve(newToken)));
  pendingQueue = [];
}

axios.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;

    const is401 = error.response?.status === 401;
    const alreadyRetried = original._retry;
    const isRefreshCall = original.url?.includes('/auth/refresh');

    if (!is401 || alreadyRetried || isRefreshCall) {
      return Promise.reject(error);
    }

    original._retry = true;

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        pendingQueue.push({ resolve, reject });
      }).then((token) => {
        original.headers['Authorization'] = `Bearer ${token}`;
        return axios(original);
      });
    }

    isRefreshing = true;
    const currentToken = localStorage.getItem('token');

    try {
      const res = await axios.get('/auth/refresh', {
        headers: { Authorization: `Bearer ${currentToken}` },
      });

      const newToken = res.data.token;
      localStorage.setItem('token', newToken);
      processQueue(null, newToken);

      original.headers['Authorization'] = `Bearer ${newToken}`;
      return axios(original);
    } catch (refreshError) {
      processQueue(refreshError, null);
      localStorage.removeItem('token');
      window.location.href = '/';
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  }
);
