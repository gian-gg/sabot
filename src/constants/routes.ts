export const ROUTES = {
  ROOT: '/',
  NOT_FOUND: '/not-found',
  ERROR: '/error',
  AUTH: {
    SIGN_IN: '/sign-in',
    SIGN_UP: '/sign-up',
  },
  HOME: {
    ROOT: '/home',
  },
  PROFILE: {
    VIEW: (id: string) => `/profile/${id}`,
  },
  EMERGENCY: '/emergency',
  REPORTS: '/reports',
  TRANSACTION: {
    NEW: '/transaction/new',
    INVITE: '/transaction/invite',
    VIEW: (id: string) => `/transaction/${id}`,
    ACTIVE: (id: string) => `/transaction/${id}/active`,
  },
  SOCIALS: {
    GITHUB: 'https://github.com/gian-gg/sabot',
  },
};
