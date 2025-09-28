// src/components/shared/SharedButton.tsx
import React from "react";
// ✅ صح
import { Button, HStack, Text, Badge } from "@chakra-ui/react";
import type { ButtonProps } from "@chakra-ui/react";

import { Link as RouterLink } from "react-router-dom";

type SharedButtonProps = ButtonProps & {
  label?: string;
  to?: string;            // لو عايزه لينك داخلي
  badge?: number | string; // عدّاد صغير اختياري
  variant?: ButtonProps["variant"] | "brandGradient" | "brandOutline" | "brandGhost";
  fullWidth?: boolean;
};

const SharedButton: React.FC<SharedButtonProps> = ({
  label,
  to,
  badge,
  variant = "brandGradient",
  fullWidth,
  leftIcon,
  rightIcon,
  children,
  ...rest
}) => {
  const content = (
    <HStack spacing="8px">
      {leftIcon}
      {label || children ? (
        <Text as="span" fontWeight="600">
          {label || children}
        </Text>
      ) : null}
      {rightIcon}
      {typeof badge !== "undefined" && (
        <Badge
          colorScheme="whiteAlpha"
          bg="whiteAlpha.300"
          color="white"
          rounded="full"
          px="2"
          fontSize="0.7rem"
        >
          {badge}
        </Badge>
      )}
    </HStack>
  );

  const commonProps: ButtonProps = {
    variant,
    w: fullWidth ? "full" : undefined,
    leftIcon: undefined, // احنا بنرندرهم يدويًا داخل HStack علشان الـBadge
    rightIcon: undefined,
    ...rest,
  };

  if (to) {
    return (
      <Button as={RouterLink} to={to} {...commonProps}>
        {content}
      </Button>
    );
  }

  return <Button {...commonProps}>{content}</Button>;
};

export default SharedButton;
