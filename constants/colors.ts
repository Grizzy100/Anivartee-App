// constants/colors.ts

export const Colors = {
  bgPrimary: '#0B1220',
  bgSecondary: '#111827',
  bgTertiary: '#1F2937',
  bgElevated: '#1F2937',

  borderDefault: '#374151',
  borderSubtle: '#1F2937',
  borderActive: '#3B82F6',

  textPrimary: '#E5E7EB',
  textSecondary: '#9CA3AF',
  textMuted: '#6B7280',
  textLink: '#3B82F6',

  accentPrimary: '#3B82F6',
  accentPrimary10: '#3B82F615',
  accentGlow: '#3B82F630',

  greenValidated: '#22C55E',
  greenValidated10: '#22C55E18',
  redDebunked: '#EF4444',
  redDebunked10: '#EF444418',
  yellowPending: '#F59E0B',
  orangeClaimed: '#F97316',

  goldPoints: '#F59E0B',

  rank: {
    NOVICE: { text: '#9CA3AF', bg: '#9CA3AF10' },
    APPRENTICE: { text: '#3B82F6', bg: '#3B82F610' },
    JOURNALIST: { text: '#A855F7', bg: '#A855F710' },
    ANALYST: { text: '#F59E0B', bg: '#F59E0B10' },
    EXPERT: { text: '#22C55E', bg: '#22C55E10' },
  },
} as const;
