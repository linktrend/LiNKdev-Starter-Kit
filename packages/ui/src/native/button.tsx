import React from "react";
import { TouchableOpacity, TouchableOpacityProps } from "react-native";
import { styled } from "nativewind";

const StyledTouchableOpacity = styled(TouchableOpacity);

export interface ButtonProps extends TouchableOpacityProps {
  children?: React.ReactNode;
}

export const Button = React.forwardRef<TouchableOpacity, ButtonProps>(
  ({ children, ...props }, ref) => {
    return (
      <StyledTouchableOpacity ref={ref} {...props}>
        {children}
      </StyledTouchableOpacity>
    );
  }
);

Button.displayName = "Button";
