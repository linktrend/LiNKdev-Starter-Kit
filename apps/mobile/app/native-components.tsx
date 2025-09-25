import React from "react";
import { TouchableOpacity, Text as RNText, TextInput, View } from "react-native";
import { styled } from "nativewind";

const StyledTouchableOpacity = styled(TouchableOpacity);
const StyledText = styled(RNText);
const StyledTextInput = styled(TextInput);
const StyledView = styled(View);

export const Button = React.forwardRef<any, any>(({ children, ...props }, ref) => {
  return (
    <StyledTouchableOpacity ref={ref} {...props}>
      {children}
    </StyledTouchableOpacity>
  );
});

export const Text = React.forwardRef<any, any>(({ children, ...props }, ref) => {
  return (
    <StyledText ref={ref} {...props}>
      {children}
    </StyledText>
  );
});

export const Input = React.forwardRef<any, any>(({ children, ...props }, ref) => {
  return (
    <StyledTextInput ref={ref} {...props}>
      {children}
    </StyledTextInput>
  );
});

export const Card = React.forwardRef<any, any>(({ children, ...props }, ref) => {
  return (
    <StyledView ref={ref} {...props}>
      {children}
    </StyledView>
  );
});
