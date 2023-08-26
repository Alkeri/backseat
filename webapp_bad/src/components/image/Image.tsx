import { Box, ChakraComponent } from "@chakra-ui/react";
import * as React from ".pnpm/@types+react@18.0.11/node_modules/@types/react";
import NextImage from ".pnpm/next@13.4.19_react-dom@18.2.0_react@18.2.0/node_modules/next/image";
import { ComponentProps } from ".pnpm/@types+react@18.0.11/node_modules/@types/react";

interface ImageProps extends ComponentProps<ChakraComponent<"div", {}>> {}

export const Image = (props: ImageProps) => {
  const { src, alt, ...rest } = props;
  return (
    <Box overflow={"hidden"} position="relative" {...rest}>
      <NextImage objectFit="cover" layout="fill" src={src} alt={alt} />
    </Box>
  );
};
