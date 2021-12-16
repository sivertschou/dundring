import * as React from 'react';
import {
  chakra,
  ImageProps,
  forwardRef,
  useColorModeValue,
} from '@chakra-ui/react';
import logoPurple from '../assets/LogoPurpleGradient.svg';
import logoBlack from '../assets/LogoBlackGradient.svg';
import logoBlackTransparent from '../assets/LogoBlackGradientTransparent.svg';
import logoWhite from '../assets/LogoWhiteGradient.svg';

type LogoVariant = 'black' | 'black_transparent' | 'white' | 'purple';

interface Props {
  variant?: LogoVariant;
}

const getLogo = (variant: LogoVariant) => {
  switch (variant) {
    case 'black':
      return logoBlack;
    case 'black_transparent':
      return logoBlackTransparent;
    case 'white':
      return logoWhite;
    case 'purple':
      return logoPurple;
  }
};

export const Logo = forwardRef<ImageProps & Props, 'img'>((props, ref) => {
  const themeLogo = useColorModeValue(logoBlack, logoWhite);
  const logo = props.variant ? getLogo(props.variant) : themeLogo;

  return <chakra.img src={logo} ref={ref} {...props} />;
});
