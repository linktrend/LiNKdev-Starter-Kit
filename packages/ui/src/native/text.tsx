import React from "react";
import { Text as RNText, TextProps as RNTextProps } from "react-native";
import { styled } from "nativewind";

const StyledText = styled(RNText);

export interface TextProps extends RNTextProps {
  children?: React.ReactNode;
}

export const Text = React.forwardRef<RNText, TextProps>(
  ({ children, ...props }, ref) => {
    return (
      <StyledText ref={ref} {...props}>
        {children}
      </StyledText>
    );
  }
);

Text.displayName = "Text";
