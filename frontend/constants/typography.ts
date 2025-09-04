import { StyleSheet } from 'react-native';

export const typography = StyleSheet.create({
  h1: {
    fontFamily: 'SpaceGrotesk-Bold',
    fontSize: 32,
    lineHeight: 40,
  },
  h2: {
    fontFamily: 'SpaceGrotesk-Bold',
    fontSize: 24,
    lineHeight: 32,
  },
  h3: {
    fontFamily: 'SpaceGrotesk-Bold',
    fontSize: 20,
    lineHeight: 28,
  },
  body: {
    fontFamily: 'SpaceGrotesk-Regular',
    fontSize: 16,
    lineHeight: 24,
  },
  bodyBold: {
    fontFamily: 'SpaceGrotesk-Bold',
    fontSize: 16,
    lineHeight: 24,
  },
  button: {
    fontFamily: 'SpaceGrotesk-Medium',
    fontSize: 16,
    lineHeight: 24,
    textTransform: 'uppercase',
  },
  caption: {
    fontFamily: 'SpaceGrotesk-Regular',
    fontSize: 12,
    lineHeight: 16,
  },
});

export default typography;
