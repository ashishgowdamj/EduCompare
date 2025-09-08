import React from 'react';
import { Text as RNText, TextProps as RNTextProps, StyleSheet } from 'react-native';
import typography from '../constants/typography';

type TextVariant = keyof typeof typography;

type TextProps = RNTextProps & {
  variant?: TextVariant;
  children: React.ReactNode;
};

export const Text = ({ 
  variant = 'body', 
  style, 
  children, 
  ...props 
}: TextProps) => {
  const textStyle = typography[variant];
  const defaultColor = '#111827';
  
  return (
    <RNText style={[{ color: defaultColor }, textStyle, style]} {...props}>
      {children}
    </RNText>
  );
};

export const H1 = (props: Omit<TextProps, 'variant'>) => (
  <Text variant="h1" {...props} />
);

export const H2 = (props: Omit<TextProps, 'variant'>) => (
  <Text variant="h2" {...props} />
);

export const H3 = (props: Omit<TextProps, 'variant'>) => (
  <Text variant="h3" {...props} />
);

export const Body = (props: Omit<TextProps, 'variant'>) => (
  <Text variant="body" {...props} />
);

export const ButtonText = (props: Omit<TextProps, 'variant'>) => (
  <Text variant="button" {...props} />
);

export const Caption = (props: Omit<TextProps, 'variant'>) => (
  <Text variant="caption" {...props} />
);

export default Text;
