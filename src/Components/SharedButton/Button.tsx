// src/components/Shared/SharedButton.tsx
import React from "react";
import {
  Button,
  HStack,
  Text,
  Badge,
  type ButtonProps,
} from "@chakra-ui/react";
import { Link as RouterLink } from "react-router-dom";

type SharedButtonProps =
  Omit<ButtonProps, "as" | "children" | "leftIcon" | "rightIcon"> & {
    label?: string;
    to?: string;
    href?: string;
    target?: React.HTMLAttributeAnchorTarget;
    rel?: string;
    badge?: number | string;
    fullWidth?: boolean;
    leftIcon?: React.ReactElement;
    rightIcon?: React.ReactElement;
    children?: React.ReactNode;
  };

const SharedButton = React.forwardRef<HTMLButtonElement, SharedButtonProps>(
  (
    {
      label,
      to,
      href,
      target,
      rel,
      badge,
      fullWidth,
      children,
      leftIcon,
      rightIcon,
      ...rest
    },
    ref
  ) => {
    // زر أيقونة فقط (لو مفيش label/children وفيه أيقونة)
    const isIconOnly = !label && !children && (leftIcon || rightIcon);

    const content = isIconOnly ? (
      <>{leftIcon ?? rightIcon}</>
    ) : (
      <HStack spacing="8px" justify="center">
        <Text as="span" fontWeight="600">
          {children ?? label}
        </Text>
        {badge !== undefined && badge !== null && (
          <Badge
            rounded="full"
            px="2"
            fontSize="0.7rem"
            bg="blackAlpha.100"
            _dark={{ bg: "whiteAlpha.300", color: "white" }}
          >
            {badge}
          </Badge>
        )}
      </HStack>
    );

    // Props مشتركة للزر فقط (بدون ref/target/rel)
    const commonProps = {
      w: fullWidth ? "full" : undefined,
      leftIcon: isIconOnly ? undefined : leftIcon,
      rightIcon: isIconOnly ? undefined : rightIcon,
      ...rest,
    } satisfies ButtonProps;

    if (to) {
      // زر كرابط داخلي
      return (
        <Button as={RouterLink} to={to} {...commonProps} ref={ref}>
          {content}
        </Button>
      );
    }

    if (href) {
      // زر كرابط خارجي
      return (
        <Button
          as="a"
          href={href}
          target={target}
          rel={rel}
          {...commonProps}
          ref={ref}
        >
          {content}
        </Button>
      );
    }

    // زر عادي
    return (
      <Button {...commonProps} ref={ref}>
        {content}
      </Button>
    );
  }
);

SharedButton.displayName = "SharedButton";
export default SharedButton;
