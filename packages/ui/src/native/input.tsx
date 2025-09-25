import React from "react";
import { TextInput, TextInputProps } from "react-native";
import { styled } from "nativewind";

const StyledTextInput = styled(TextInput);

export interface InputProps extends TextInputProps {
  children?: React.ReactNode;
}

export const Input = React.forwardRef<TextInput, InputProps>(
  ({ children, ...props }, ref) => {
    return (
      <StyledTextInput ref={ref} {...props}>
        {children}
      </StyledTextInput>
    );
  }
);

Input.displayName = "Input";
