import { Switch, chakra } from "@chakra-ui/react";

/**
 * سويتش بنفس شكل فيجما:
 * - Track: 52x28, رمادي عند الإطفاء وأخضر غامق عند التشغيل
 * - Thumb: 22x22 أبيض، يتحرك 24px عند التشغيل
 */
const SwitchComp = chakra(Switch, {
  baseStyle: {
    sx: {
      ".chakra-switch__track": {
        w: "52px",
        h: "28px",
        p: "2px",
        bg: "gray.300",
        borderRadius: "999px",
        transition: "background-color .2s ease",
      },
      "&[data-checked] .chakra-switch__track": {
        bg: "#155b55",
      },
      ".chakra-switch__thumb": {
        w: "22px",
        h: "22px",
        bg: "white",
        boxShadow: "sm",
        transform: "translateX(0)",
        transition: "transform .2s ease",
      },
      "&[data-checked] .chakra-switch__thumb": {
        transform: "translateX(24px)",
      },
    },
  },
});

export default SwitchComp;
