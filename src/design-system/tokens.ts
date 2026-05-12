export const palette = {
  // Warm neutrals
  cream: '#FDF8F0',
  sand: '#F5EDD6',
  latte: '#E8D5B7',
  cocoa: '#C4956A',
  bark: '#8B6144',

  // Sage greens
  mint: '#E8F5F0',
  sage: '#7CB9A8',
  forest: '#4A8B7A',

  // Warm accents
  peach: '#FDDBC7',
  apricot: '#F4A261',
  terracotta: '#E07B55',

  // Sky blues
  mist: '#EAF4FB',
  sky: '#A8DADC',
  denim: '#457B9D',

  // Lavender
  lavender: '#F0EAF8',
  violet: '#9B8EC4',
  plum: '#6B5B95',

  // Sunshine
  cream_yellow: '#FFF8E1',
  honey: '#FFD166',
  amber: '#F4A261',

  // Neutrals
  white: '#FFFFFF',
  off_white: '#FAFAFA',
  light: '#F5F5F5',
  muted: '#E0E0E0',
  subtle: '#9E9E9E',
  mid: '#616161',
  dark: '#212121',
  black: '#000000',

  // Status
  success: '#4CAF8C',
  warning: '#FFD166',
  error: '#FF6B6B',
  info: '#74C0FC',
} as const

export const categoryEmojis: Record<string, string> = {
  cleaning: '🧹',
  cooking: '🍳',
  laundry: '👕',
  shopping: '🛒',
  maintenance: '🔧',
  admin: '📋',
  pets: '🐾',
  garden: '🌱',
  childcare: '👶',
  other: '✨',
}

export const groceryCategoryEmojis: Record<string, string> = {
  produce: '🥦',
  dairy: '🥛',
  meat: '🥩',
  bakery: '🍞',
  frozen: '🧊',
  pantry: '🫙',
  beverages: '🥤',
  snacks: '🍫',
  cleaning: '🧴',
  personal_care: '🪥',
  pet: '🐾',
  other: '🛒',
}

export const expenseCategoryEmojis: Record<string, string> = {
  rent: '🏠',
  utilities: '⚡',
  groceries: '🛒',
  dining: '🍽️',
  entertainment: '🎬',
  transport: '🚗',
  health: '💊',
  household: '🏡',
  subscriptions: '📱',
  insurance: '🛡️',
  maintenance: '🔧',
  pets: '🐾',
  childcare: '👶',
  clothing: '👔',
  other: '💰',
}
