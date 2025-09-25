import React from "react";
import { View, ViewProps } from "react-native";
import { styled } from "nativewind";

const StyledView = styled(View);

export interface PopoverProps extends ViewProps {
  children?: React.ReactNode;
}

export const Popover = React.forwardRef<View, PopoverProps>(
  ({ children, ...props }, ref) => {
    // TODO: Implement proper Popover component with modal behavior
    return (
      <StyledView ref={ref} {...props}>
        {children}
      </StyledView>
    );
  }
);

Popover.displayName = "Popover";
