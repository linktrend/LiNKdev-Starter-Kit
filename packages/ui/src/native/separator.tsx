import React from "react";
import { View, ViewProps } from "react-native";
import { styled } from "nativewind";

const StyledView = styled(View);

export interface SeparatorProps extends ViewProps {
  children?: React.ReactNode;
  orientation?: "horizontal" | "vertical";
}

export const Separator = React.forwardRef<View, SeparatorProps>(
  ({ children, orientation = "horizontal", ...props }, ref) => {
    const className = orientation === "horizontal" 
      ? "h-px w-full bg-border" 
      : "w-px h-full bg-border";
    
    return (
      <StyledView ref={ref} className={className} {...props}>
        {children}
      </StyledView>
    );
  }
);

Separator.displayName = "Separator";
