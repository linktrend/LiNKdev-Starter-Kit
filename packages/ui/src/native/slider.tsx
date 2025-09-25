import React from "react";
import { Slider as RNSlider, SliderProps as RNSliderProps } from "react-native";
import { styled } from "nativewind";

const StyledSlider = styled(RNSlider);

export interface SliderProps extends RNSliderProps {
  children?: React.ReactNode;
}

export const Slider = React.forwardRef<RNSlider, SliderProps>(
  ({ children, ...props }, ref) => {
    return (
      <StyledSlider ref={ref} {...props}>
        {children}
      </StyledSlider>
    );
  }
);

Slider.displayName = "Slider";
