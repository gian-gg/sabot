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
    VERIFY: '/home/verify',
  },
  ADMIN: {
    ROOT: '/home/admin',
  },
  PROFILE: {
    VIEW: (id: string) => `/profile/${id}`,
  },
  WALLET: '/wallet',
  EMERGENCY: '/emergency',
  REPORTS: '/reports',
  PRIVACY: '/privacy',
  TERMS: '/terms',
  TUTORIAL: '/tutorial',
  TRANSACTION: {
    ACCEPT: '/transaction/accept',
    UPLOAD: '/transaction/upload',
    INVITE: '/transaction/invite',
    VIEW: (id: string) => `/transaction/${id}`,
    ACTIVE: (id: string) => `/transaction/${id}/active`,
  },
  AGREEMENT: {
    INVITE: '/agreement/invite',
    VIEW: (id: string) => `/agreement/${id}`,
    ACTIVE: (id: string) => `/agreement/${id}/active`,
    FINALIZE: (id: string) => `/agreement/${id}/finalize`,
  },
  ESCROW: {
    NEW: '/escrow/new',
    VIEW: (id: string) => `/escrow/${id}`,
  },
  SOCIALS: {
    GITHUB: 'https://github.com/gian-gg/sabot',
  },
};
