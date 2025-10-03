import { Box } from "@chakra-ui/react";

type Props = {
  my?: number | string;
};

export default function SectionDivider({ my = 6 }: Props) {
  return (
    <Box
      w="full"
      borderTop="1px solid"
      borderColor="#979797"
      my={my}
    />
  );
}
