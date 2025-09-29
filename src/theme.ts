// src/theme.ts
import { extendTheme, type ThemeConfig } from "@chakra-ui/react";

const config: ThemeConfig = {
  initialColorMode: "light",
  useSystemColorMode: false,
};

const theme = extendTheme({
  config,
  direction: "rtl",

  fonts: {
    heading: "IBM Plex Sans Arabic, system-ui, sans-serif",
    body: "IBM Plex Sans Arabic, system-ui, sans-serif",
  },

  colors: {
    brand: {
      900: "#24645E", // الأساسي
      800: "#1B5853", // hover
      700: "#184F4A", // active
    },
    side: {
      a: "#24645E",
      b: "#18383D",
      c: "#17343B",
    },
    background: {
 page: "#FFFFFF",   // خلفية الصفحة = أبيض
    surface: "#F7F9FB", // الكروت والجداول = رمادي فاتح
    subtle: "#F2F5F8", // رؤوس الجداول = رمادي أغمق سنة
    stripe: "#FAFBFC", // الصفوف المتبادلة
    hover: "#F5F7FA",  // Hover
    border: "#E6EAF0", // حدود
      sidebar: "#F7F9FB",  // السايدبار رمادي فاتح

    },
  },

  styles: {
    global: {
      "html, body, #root": {
        height: "100%",
        bg: "background.page",
        color: "gray.700",
      },
      "*": {
        fontFamily: "IBM Plex Sans Arabic, system-ui, sans-serif",
      },
      // ✅ Scrollbars
      "::-webkit-scrollbar": { width: "10px", height: "10px" },
      "::-webkit-scrollbar-thumb": {
        background: "#D7DEE6",
        borderRadius: "8px",
      },
      "::-webkit-scrollbar-track": { background: "#EFF3F7" },
    },
  },

  components: {
    // ✅ Buttons
    Button: {
      baseStyle: { rounded: "md", fontWeight: "600" },
      variants: {
        solid: {
          bg: "brand.900",
          color: "white",
          _hover: { bg: "brand.800" },
          _active: { bg: "brand.700" },
          _disabled: { opacity: 0.6, cursor: "not-allowed" },
        },
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
        },
        brandOutline: {
          border: "1px solid",
          borderColor: "side.a",
          color: "side.a",
          bg: "white",
          _hover: { bg: "side.a", color: "white" },
          _active: { bg: "side.b", color: "white" },
        },
        brandGhost: {
          color: "side.a",
          bg: "transparent",
          _hover: { bg: "blackAlpha.50" },
          _active: { bg: "blackAlpha.100" },
        },
        dangerOutline: {
          border: "2px solid",
          borderColor: "red.500",
          color: "red.500",
          bg: "white",
          _hover: { bg: "red.50" },
          _active: { bg: "red.100" },
        },
        dangerGradient: {
          bgGradient: "linear(to-l, #E53E3E, #C53030)",
          color: "white",
          boxShadow: "sm",
          _hover: { bgGradient: "linear(to-l, #C53030, #9B2C2C)" },
          _active: { bgGradient: "linear(to-l, #9B2C2C, #7B1F1F)" },
        },
      },
      defaultProps: { size: "md", variant: "brandGradient" },
    },

    // ✅ Inputs
    Input: {
      baseStyle: { field: { rounded: "md" } },
      sizes: { md: { field: { fontSize: "sm", px: 4, h: 12 } } },
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
      sizes: { md: { field: { fontSize: "sm", px: 4, h: 12 } } },
      defaultProps: { size: "md", variant: "outline" },
    },

    Badge: { baseStyle: { rounded: "full", px: 2, fontWeight: "600" } },

    // ✅ Tables
    Table: {
      baseStyle: {
        table: { bg: "background.surface" },
        th: {
          bg: "background.subtle",
          color: "gray.700",
          fontWeight: 700,
          borderColor: "background.border",
          whiteSpace: "nowrap",
        },
        td: { borderColor: "background.border" },
      },
      variants: {
        elevated: {
          table: {
            border: "1px solid",
            borderColor: "background.border",
            rounded: "md",
            boxShadow: "sm",
          },
          tbody: {
            tr: {
              _odd: { bg: "background.stripe" },
              _hover: { bg: "background.hover" },
              transition: "background 120ms ease",
            },
          },
        },
      },
      defaultProps: { variant: "elevated", size: "sm" },
    },

    // ✅ Modals / Drawers / Menus
    Modal: {
      baseStyle: {
        dialog: {
          bg: "background.surface",
          border: "1px solid",
          borderColor: "background.border",
          boxShadow: "lg",
          rounded: "lg",
        },
      },
    },
    Drawer: {
      baseStyle: {
        dialog: {
          bg: "background.surface",
          borderLeft: "1px solid",
          borderColor: "background.border",
        },
      },
    },
    Menu: {
      baseStyle: {
        list: {
          bg: "background.surface",
          border: "1px solid",
          borderColor: "background.border",
          boxShadow: "md",
          rounded: "md",
        },
        item: { _hover: { bg: "background.hover" }, _focus: { bg: "background.hover" } },
      },
    },
    Popover: {
      baseStyle: {
        content: {
          bg: "background.surface",
          border: "1px solid",
          borderColor: "background.border",
          boxShadow: "md",
          rounded: "md",
        },
      },
    },

    // ✅ Tabs
    Tabs: {
      variants: {
        soft: {
          tab: {
            rounded: "md",
            _selected: { bg: "background.subtle", color: "brand.900" },
          },
        },
      },
      defaultProps: { variant: "soft", colorScheme: "teal" },
    },

    // ✅ Labels & Switches
    FormLabel: { baseStyle: { color: "gray.700", fontWeight: "600" } },
    Checkbox: {
      baseStyle: {
        control: {
          borderColor: "background.border",
          _checked: { bg: "brand.900", borderColor: "brand.900" },
        },
      },
    },
    Switch: {
      baseStyle: {
        track: { bg: "gray.300", _checked: { bg: "brand.900" } },
      },
    },
  },
});

export default theme;
