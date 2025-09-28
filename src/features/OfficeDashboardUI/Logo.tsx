import { chakra, Image } from "@chakra-ui/react";

const StyledLogo = chakra("header", {
  baseStyle: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center", 
    py: 4,
  },
});

export default function Logo() {
  return (
    <StyledLogo>
      <Image src="/assets/Logo.png"  h="88px" w="120px" />
    </StyledLogo>
  );
}
