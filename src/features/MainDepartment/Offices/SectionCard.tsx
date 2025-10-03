import React from "react";
import {
  Box,
  HStack,
  Text,
  Icon,
  chakra,
  type BoxProps,
  Spacer,
} from "@chakra-ui/react";
import { ChevronDownIcon } from "@chakra-ui/icons";

/** توكنز قريبة من فجما */
const CARD_RADIUS = "10px";
const CARD_BORDER = "#B7B7B7";
const HEADER_BG   = "rgba(0,0,0,0.02)"; // بديل خفيف للخلفية المزخرفة
const PAD_X = 4; // 16px
const PAD_Y = 3; // 12px

type Props = {
  title: string;
  /** عناصر ناحية اليسار (أزرار/أكشنز) */
  actions?: React.ReactNode;
  /** محتوى الكارد */
  children: React.ReactNode;
} & BoxProps;

/** كارد ثابت الاستايل زي فجما */
const SectionCard: React.FC<Props> = ({ title, actions, children, ...rest }) => {
  return (
    <Box
      bg="white"
      border="1px solid"
      borderColor={CARD_BORDER}
      rounded={CARD_RADIUS}
      boxShadow="sm"
      overflow="hidden"
      {...rest}
    >
      {/* Header */}
      <HStack
        px={PAD_X}
        py={PAD_Y}
        bg={HEADER_BG}
        borderBottom="1px solid"
        borderColor={CARD_BORDER}
      >
        <Icon as={ChevronDownIcon} color="gray.600" />
        <Text fontWeight="700" fontSize="md" color="gray.700">
          {title}
        </Text>
        <Spacer />
        {actions}
      </HStack>

      {/* Body */}
      <Box px={PAD_X} py={4}>{children}</Box>
    </Box>
  );
};

export default SectionCard;
