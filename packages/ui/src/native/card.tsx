import React from "react";
import { View, ViewProps } from "react-native";
import { styled } from "nativewind";

const StyledView = styled(View);

export interface CardProps extends ViewProps {
  children?: React.ReactNode;
}

export const Card = React.forwardRef<View, CardProps>(
  ({ children, ...props }, ref) => {
    return (
      <StyledView ref={ref} {...props}>
        {children}
      </StyledView>
    );
  }
);

Card.displayName = "Card";
