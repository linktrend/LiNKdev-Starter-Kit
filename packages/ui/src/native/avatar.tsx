import React from "react";
import { Image, ImageProps } from "react-native";
import { styled } from "nativewind";

const StyledImage = styled(Image);

export interface AvatarProps extends ImageProps {
  children?: React.ReactNode;
}

export const Avatar = React.forwardRef<Image, AvatarProps>(
  ({ children, ...props }, ref) => {
    return (
      <StyledImage ref={ref} {...props}>
        {children}
      </StyledImage>
    );
  }
);

Avatar.displayName = "Avatar";
