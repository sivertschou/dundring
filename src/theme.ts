import { extendTheme, withDefaultColorScheme } from "@chakra-ui/react";

const theme = extendTheme(
  {
    config: {
      initialColorMode: "dark",
    },
    colors: {
      gray: {
        100: "#fafafa",
        200: "#eeeeee",
        300: "#e0e0e0",
        400: "#bdbdbd",
        500: "#9e9e9e",
        700: "#424242",
        800: "#212121",
        900: "#1a1a1a",
      },
    },
  },
  withDefaultColorScheme({ colorScheme: "gray" })
);

export default theme;
