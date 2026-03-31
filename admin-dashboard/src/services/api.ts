export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1';

export const endpoints = {
  podcasts: '/podcasts',
  episodes: '/episodes',
  admin: {
    podcasts: '/admin/podcasts',
    episodes: '/admin/episodes',
    stats: '/admin/stats',
    system: '/admin/system',
  },
  auth: {
    login: '/auth/login',
    register: '/auth/register',
    profile: '/auth/profile',
  },
  health: '/health',
};
