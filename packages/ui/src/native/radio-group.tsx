import React from "react";
import { View, ViewProps } from "react-native";
import { styled } from "nativewind";

const StyledView = styled(View);

export interface RadioGroupProps extends ViewProps {
  children?: React.ReactNode;
}

export const RadioGroup = React.forwardRef<View, RadioGroupProps>(
  ({ children, ...props }, ref) => {
    return (
      <StyledView ref={ref} {...props}>
        {children}
      </StyledView>
    );
  }
);

RadioGroup.displayName = "RadioGroup";
