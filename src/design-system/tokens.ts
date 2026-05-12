export const palette = {
  // Backgrounds
  bg:       '#F6F1E8',
  surface:  '#FFFFFF',
  surface2: '#F3EDE3',

  // Text
  textPrimary:   '#2E2A27',
  textSecondary: '#6F665F',
  textMuted:     '#A39A92',

  // Brand accents
  green:  '#8FAF9A',
  blue:   '#8FA8C3',
  yellow: '#E7D39C',
  red:    '#D9A2A2',
  orange: '#D7A98C',

  // Borders
  border:       '#E7DED3',
  borderSoft:   '#F0E8DD',
  borderStrong: '#D9CFC2',

  // Semantic
  success: '#8FAF9A',
  warning: '#E7D39C',
  danger:  '#D9A2A2',
  info:    '#8FA8C3',
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
