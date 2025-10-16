import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';

interface LiquidGlassCardProps {
  children: React.ReactNode;
  style?: ViewStyle;
}

export const LiquidGlassCard: React.FC<LiquidGlassCardProps> = ({ children, style }) => (
  <View style={[styles.card, style]}>
    {children}
  </View>
);

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.4)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.3,
    shadowRadius: 40,
    elevation: 24, // Android shadow
  }
});
