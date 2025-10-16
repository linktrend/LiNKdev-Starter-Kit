import React from 'react';
import { TextInput, StyleSheet, TextInputProps, ViewStyle } from 'react-native';

interface LiquidGlassInputProps extends TextInputProps {
  style?: ViewStyle;
}

export const LiquidGlassInput: React.FC<LiquidGlassInputProps> = ({ style, ...props }) => (
  <TextInput
    style={[styles.input, style]}
    placeholderTextColor="rgba(51, 51, 51, 0.5)"
    {...props}
  />
);

const styles = StyleSheet.create({
  input: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.4)',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    color: '#333333',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  }
});
