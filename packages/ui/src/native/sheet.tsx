import React from "react";
import { View, ViewProps } from "react-native";
import { styled } from "nativewind";

const StyledView = styled(View);

export interface SheetProps extends ViewProps {
  children?: React.ReactNode;
}

export const Sheet = React.forwardRef<View, SheetProps>(
  ({ children, ...props }, ref) => {
    // TODO: Implement proper Sheet component with bottom sheet behavior
    return (
      <StyledView ref={ref} {...props}>
        {children}
      </StyledView>
    );
  }
);

Sheet.displayName = "Sheet";
