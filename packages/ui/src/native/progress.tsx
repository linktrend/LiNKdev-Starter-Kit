import React from "react";
import { View, ViewProps } from "react-native";
import { styled } from "nativewind";

const StyledView = styled(View);

export interface ProgressProps extends ViewProps {
  children?: React.ReactNode;
  value?: number;
  max?: number;
}

export const Progress = React.forwardRef<View, ProgressProps>(
  ({ children, value = 0, max = 100, ...props }, ref) => {
    const percentage = Math.min(Math.max((value / max) * 100, 0), 100);
    
    return (
      <StyledView ref={ref} className="w-full h-2 bg-muted rounded-full overflow-hidden" {...props}>
        <StyledView 
          className="h-full bg-primary transition-all duration-300"
          style={{ width: `${percentage}%` }}
        />
        {children}
      </StyledView>
    );
  }
);

Progress.displayName = "Progress";
