export const ROUTES = {
  ROOT: '/',
  NOT_FOUND: '/not-found',
  ERROR: '/error',
  AUTH: {
    SIGN_IN: '/sign-in',
    SIGN_UP: '/sign-up',
  },
  USER: {
    ROOT: '/user',
    VERIFY: '/user/verify',
    SETTINGS: '/user/settings',
    ADMIN: '/user/admin',
    VIEW: (id: string) => `/user/${id}`,
  },
  WALLET: '/wallet',
  BUY_TOKENS: '/buy-tokens',
  COLLAB_TEST: '/collab-test',
  EMERGENCY: '/emergency',
  REPORTS: '/reports',
  LEGAL: {
    PRIVACY: 'legal/privacy',
    TERMS: 'legal/terms',
  },
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
