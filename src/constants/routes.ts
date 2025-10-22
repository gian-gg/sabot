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
  PROFILE: {
    VIEW: (id: string) => `/profile/${id}`,
  },
  WALLET: '/wallet',
  EMERGENCY: '/emergency',
  REPORTS: '/reports',
  TRANSACTION: {
    NEW: '/transaction/new',
    ACCEPT: '/transaction/accept',
    UPLOAD: '/transaction/upload',
    INVITE: '/transaction/invite',
    VIEW: (id: string) => `/transaction/${id}`,
    ACTIVE: (id: string) => `/transaction/${id}/active`,
  },
  AGREEMENT: {
    NEW: '/agreement/new',
    INVITE: '/agreement/invite',
    VIEW: (id: string) => `/agreement/${id}`,
    ACTIVE: (id: string) => `/agreement/${id}/active`,
    FINALIZE: (id: string) => `/agreement/${id}/finalize`,
  },
  ESCROW: {
    // Escrow is now part of agreements, not standalone
    // Keep VIEW for existing escrows
    VIEW: (id: string) => `/escrow/${id}`,
    // Deprecated: NEW and LIST (use agreement finalization instead)
  },
  SOCIALS: {
    GITHUB: 'https://github.com/gian-gg/sabot',
  },
};
