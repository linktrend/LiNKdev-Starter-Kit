import React from "react";
import { Switch, SwitchProps } from "react-native";
import { styled } from "nativewind";

const StyledSwitch = styled(Switch);

export interface CheckboxProps extends SwitchProps {
  children?: React.ReactNode;
}

export const Checkbox = React.forwardRef<Switch, CheckboxProps>(
  ({ children, ...props }, ref) => {
    return (
      <StyledSwitch ref={ref} {...props}>
        {children}
      </StyledSwitch>
    );
  }
);

Checkbox.displayName = "Checkbox";
