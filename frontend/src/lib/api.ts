import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000',
});

if (typeof window !== 'undefined') {
  (async () => {
    try {
      const [{ onIdTokenChanged, getIdToken }, { auth }] = await Promise.all([
        import('firebase/auth'),
        import('@/lib/firebase'),
      ]);
      onIdTokenChanged(auth, async (user) => {
        const token = user ? await getIdToken(user) : null;
        if (token) {
          api.defaults.headers.common.Authorization = `Bearer ${token}`;
        } else {
          delete api.defaults.headers.common.Authorization;
        }
      });
    } catch {
      // noop for non-browser or firebase not ready
    }
  })();
}

export default api;


