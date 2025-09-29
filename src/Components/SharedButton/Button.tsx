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

type SharedButtonProps = ButtonProps & {
  label?: string;
  to?: string;
  href?: string;
  badge?: number | string;
  fullWidth?: boolean;
};

const SharedButton = React.forwardRef<HTMLButtonElement, SharedButtonProps>(
  (
    { label, to, href, badge, fullWidth, children, leftIcon, rightIcon, ...rest },
    ref
  ) => {
    const content = (
      <HStack spacing="8px" justify="center">
        {leftIcon}
        <Text as="span" fontWeight="600">
          {children ?? label}
        </Text>
        {rightIcon}
        {badge !== undefined && badge !== null && (
          <Badge
            rounded="full"
            px="2"
            fontSize="0.7rem"
            // اللون يتظبط تلقائيًا حسب variant (على الغامق تبقى فاتح والعكس)
            bg="blackAlpha.100"
            _dark={{ bg: "whiteAlpha.300", color: "white" }}
          >
            {badge}
          </Badge>
        )}
      </HStack>
    );

    const commonProps: ButtonProps = {
      ref,
      w: fullWidth ? "full" : undefined,
      leftIcon, 
      rightIcon,
      ...rest,  
    };

    if (to) {
      return (
        <Button as={RouterLink} to={to} {...commonProps}>
          {content}
        </Button>
      );
    }

    if (href) {
      return (
        <Button as="a" href={href} target={rest.target} rel={rest.rel} {...commonProps}>
          {content}
        </Button>
      );
    }

    return (
      <Button {...commonProps}>
        {content}
      </Button>
    );
  }
);

SharedButton.displayName = "SharedButton";
export default SharedButton;
