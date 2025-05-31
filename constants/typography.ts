import { Platform } from 'react-native';

export const typography = {
  quoteFont: Platform.select({
    ios: 'Baskerville',
    android: 'serif',
    default: 'serif',
  }),
  bodyFont: Platform.select({
    ios: 'Avenir-Book',
    android: 'sans-serif',
    default: 'sans-serif',
  }),
  headingFont: Platform.select({
    ios: 'Avenir-Medium',
    android: 'sans-serif-medium',
    default: 'sans-serif-medium',
  }),
  sizes: {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 20,
    xl: 24,
    xxl: 32,
    xxxl: 40,
  },
};