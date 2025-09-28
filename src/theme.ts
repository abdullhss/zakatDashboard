// src/theme.ts
import { extendTheme, type ThemeConfig } from "@chakra-ui/react";

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
      700: "#184F4A", // active
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
        // Chakra solid المعتاد لكن بألوان البراند
        solid: {
          bg: "brand.900",
          color: "white",
          _hover: { bg: "brand.800" },
          _active: { bg: "brand.700" },
          _disabled: { opacity: 0.6, cursor: "not-allowed" },
        },

        // ✅ جراديانت بنفس ألوان التصميم
        brandGradient: {
          bgGradient: "linear(to-l, side.a, side.b)",
          color: "white",
          boxShadow: "sm",
          _hover: {
            bgGradient: "linear(to-l, brand.800, side.b)",
            filter: "brightness(1.02)",
          },
          _active: {
            bgGradient: "linear(to-l, side.b, side.c)",
            filter: "brightness(0.98)",
          },
          _disabled: { opacity: 0.6, cursor: "not-allowed" },
        },

        // إطار بلون البراند
        brandOutline: {
          border: "1px solid",
          borderColor: "side.a",
          color: "side.a",
          bg: "white",
          _hover: { bg: "side.a", color: "white" },
          _active: { bg: "side.b", color: "white" },
          _disabled: { opacity: 0.6, cursor: "not-allowed" },
        },

        // شفاف خفيف
        brandGhost: {
          color: "side.a",
          bg: "transparent",
          _hover: { bg: "blackAlpha.50" },
          _active: { bg: "blackAlpha.100" },
          _disabled: { opacity: 0.6, cursor: "not-allowed" },
        },
      },
      defaultProps: {
        size: "md",
        variant: "brandGradient", // تقدر تغيّرها لو عايز
      },
    },

    // أمثلة خفيفة لتحسين الحواف والأحجام الافتراضية
    Input: {
      baseStyle: {
        field: { rounded: "md" },
      },
      sizes: {
        md: {
          field: { fontSize: "sm", px: 4, h: 12 },
        },
      },
      variants: {
        outline: {
          field: {
            bg: "white",
            borderColor: "gray.200",
            _hover: { borderColor: "gray.300" },
            _focusVisible: {
              borderColor: "brand.900",
              boxShadow: "0 0 0 1px var(--chakra-colors-brand-900)",
            },
          },
        },
      },
      defaultProps: { size: "md", variant: "outline" },
    },

    Select: {
      baseStyle: { field: { rounded: "md" } },
      sizes: {
        md: { field: { fontSize: "sm", px: 4, h: 12 } },
      },
      defaultProps: { size: "md", variant: "outline" },
    },

    Badge: {
      baseStyle: { rounded: "full", px: 2, fontWeight: "600" },
    },
  },
});

export default theme;
