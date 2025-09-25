import React from "react";
import { View, ViewProps } from "react-native";
import { styled } from "nativewind";

const StyledView = styled(View);

export interface DialogProps extends ViewProps {
  children?: React.ReactNode;
}

export const Dialog = React.forwardRef<View, DialogProps>(
  ({ children, ...props }, ref) => {
    // TODO: Implement proper Dialog component with modal behavior
    return (
      <StyledView ref={ref} {...props}>
        {children}
      </StyledView>
    );
  }
);

Dialog.displayName = "Dialog";
