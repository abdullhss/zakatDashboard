import React from "react";
import {
  Box, Grid, Text, HStack, VStack, Divider, chakra, useToken
} from "@chakra-ui/react";

/** ألوان/مسافات من مكان واحد */
export const useDetailTokens = () => {
  const [border, muted, cardBg] = useToken("colors", [
    "gray.200", "gray.600", "white",
  ]);
  return { border, muted, cardBg };
};

/** كارت رئيسي */
export const DetailCard = chakra(Box, {
  baseStyle: {
    rounded: "15px",
    borderWidth: "1px",
    borderColor: "gray.200",
    bg: "white",
    p: { base: 4, md: 6 },
  },
});

/** هيدر قسم (يمين العنوان – شمال سويتش) */
export const SectionHeader = chakra(HStack, {
  baseStyle: {
    justifyContent: "space-between",
    alignItems: "center",
    mb: 4,
  },
});

export const SectionTitle = chakra(Text, {
  baseStyle: {
    fontWeight: "700",
    color: "gray.700",
    fontSize: { base: "md", md: "lg" },
  },
});

/** شبكة عمودين: يمين labels بعرض ثابت – شمال values تتمد */
export const TwoCols = ({
  labelColWidth = "220px",
  children,
}: { labelColWidth?: string; children: React.ReactNode }) => (
  <Grid
    templateColumns={{ base: "1fr", md: `${labelColWidth} 1fr` }}
    columnGap={800}
    rowGap={6}
    fontSize={18}
  >
    {children}
  </Grid>
);

/** صف (Label | Value) */
export const KVRow = ({
  label, value,
}: { label: React.ReactNode; value: React.ReactNode }) => (
  <>
    <Text fontWeight="700" color="gray.700" >
      {label}
    </Text>
    <Text color="gray.800" fontWeight="600">
      {value}
    </Text>
  </>
);

export const SectionDivider = () => <Divider my={6} />;

/** كارت جدول بسيط للحساب البنكي */
export const TableCard = chakra(VStack, {
  baseStyle: {
    rounded: "15px",
    borderWidth: "1px",
    borderColor: "gray.200",
    bg: "white",
    gap: 0,
    overflow: "hidden",
    fontsize:"22px",
    fontWeight:"bold"
  },
});

export const TableHeader = ({ children , nowhite=false}: { children: React.ReactNode , nowhite?:boolean }) => (
  <Box bg={nowhite?"transparent":"gray.50"} px={5} py={3} dir="ltr" >
    <Text fontWeight="800" color="gray.700">{children}</Text>
  </Box>
);

/** صف الأعمدة/البيانات */
export const TableRow = ({
  cells, withBorder = true,
}: { cells: (React.ReactNode | string)[]; withBorder?: boolean }) => (
  <Grid
    templateColumns="repeat(6, 1fr)"
    px={5}
    py={3}
    gap={4}
    width="70%"
    borderTopWidth={withBorder ? "1px" : 0}
    borderColor="gray.200"
  
  >
    {cells.map((c, i) => (
      <Text key={i} fontSize="sm" color="gray.800" noOfLines={2}>
        {c}
      </Text>
    ))}
  </Grid>
);
export const TableRow2 = ({
  cells, withBorder = true,
}: { cells: (React.ReactNode | string)[]; withBorder?: boolean }) => (
  <Grid
    templateColumns="repeat(6, 1fr)"
    px={5}
    py={3}
    gap={4}
    width="70%"
    borderTopWidth={withBorder ? "1px" : 0}
    borderColor="gray.200"
  >
    {cells.map((c, i) => (
      <Text key={i} fontSize="sm" color="gray.800" noOfLines={2}>
        {c}
      </Text>
    ))}
  </Grid>
);
