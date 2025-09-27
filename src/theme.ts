import { extendTheme } from "@chakra-ui/react";
import type { ThemeConfig } from "@chakra-ui/react";

const config: ThemeConfig = {
  initialColorMode: "light",
  useSystemColorMode: false,
};

export const theme = extendTheme({
  config,
  direction: "rtl",
  fonts: {
    heading: "IBM Plex Sans Arabic, system-ui, sans-serif",
    body: "IBM Plex Sans Arabic, system-ui, sans-serif",
  },
  colors: {
    brand: {
      900: "#24645E", // الأساسي للأزرار
      800: "#1B5853", // hover
      700: "#184F4A",
    },
    side: {
      a: "#24645E",
      b: "#18383D",
      c: "#17343B",
    },
  },
  styles: {
    global: {
      "html, body, #root": {
        height: "100%",
        bg: "#f7f9fb",
        color: "gray.700",
      },
      "*": {
        fontFamily: "IBM Plex Sans Arabic, system-ui, sans-serif",
      },
    },
  },
  components: {
    Button: {
      baseStyle: {
        rounded: "md",
        fontWeight: "600",
      },
      variants: {
        solid: {
          bg: "brand.900",
          color: "white",
          _hover: { bg: "brand.800" },
        },
      },
    },
    Input: {
      baseStyle: {
        field: {
          rounded: "md",
        },
      },
      sizes: {
        md: {
          field: {
            fontSize: "sm",
            px: 4,
            h: 12,
          },
        },
      },
      colors: {
  // ...
  side: {
    a: "#24645E",
    b: "#18383D",
    c: "#17343B",
  },
},
    },
  },
});
