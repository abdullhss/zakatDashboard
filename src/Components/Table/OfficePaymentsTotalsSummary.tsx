import React from "react";
import { Box, Flex, Text } from "@chakra-ui/react";
import { useLocation } from "react-router-dom";

export type OfficePaymentTotals = {
  TotalDebitValue?: string | number;
  TotalCreditValue?: string | number;
  TotalNetValue?: string | number;
};

/** Summary line for report APIs that return TotalDebit/Credit/Net alongside OfficePaymentsData */
export function OfficePaymentsTotalsSummary({
  TotalDebitValue = "0",
  TotalCreditValue = "0",
}: OfficePaymentTotals) {
  const usePathname = useLocation();
  const pathname = usePathname.pathname;
  console.log(pathname);
  
  const TotalNetValue = Number(TotalDebitValue) - Number(TotalCreditValue);
  return (
    <Box
      mt={2}
      mx={1}
      px={4}
      py={3}
      borderTop="1px solid"
      borderColor="gray.200"
      bg="gray.50"
      borderRadius="md"
    >
      <Flex
        flexWrap="wrap"
        gap={4}
        justify="space-between"
        align="center"
        fontSize="md"
      >
        {
          "/officedashboard/Receipts" != pathname && (
        <Text>
          إجمالي المقبوضات:{" "}
          <Text as="span" fontWeight="700">
            {TotalDebitValue}
          </Text>
        </Text>
          )
        }

        {
          "/officedashboard/Payments" != pathname && (
            <Text>
              إجمالي المدفوعات:{" "}
              <Text as="span" fontWeight="700">
                {TotalCreditValue}
              </Text>
            </Text>
          )
        }
        
        <Text fontWeight="600">
          الصافي:{" "}
          <Text as="span" fontWeight="700">
            {TotalNetValue}
          </Text>
        </Text>
      </Flex>
    </Box>
  );
}
