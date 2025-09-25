declare module '@starter/ui/native' {
  import { ComponentType } from 'react';
  import { TouchableOpacityProps, TextProps, TextInputProps, ViewProps } from 'react-native';

  export interface ButtonProps extends TouchableOpacityProps {
    children?: React.ReactNode;
  }

  export interface TextProps extends TextProps {
    children?: React.ReactNode;
  }

  export interface InputProps extends TextInputProps {
    children?: React.ReactNode;
  }

  export interface CardProps extends ViewProps {
    children?: React.ReactNode;
  }

  export const Button: ComponentType<ButtonProps>;
  export const Text: ComponentType<TextProps>;
  export const Input: ComponentType<InputProps>;
  export const Card: ComponentType<CardProps>;
}
