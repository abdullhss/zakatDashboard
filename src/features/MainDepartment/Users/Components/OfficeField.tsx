
import { Grid, GridItem, Input, Text } from "@chakra-ui/react";
import FieldRow from "../../../../Components/SharedField/FieldRow";
import { FieldSelect } from "../../../../Components/SharedField/FieldControl";

type Office = { id: number; name: string };

type Props = {
  visible: boolean; // IF IT IS (O) AS AN OFFICE, IT WILL APPEAR ********************
  isOfficeSession: boolean;
  sessionOfficeName: string;
  sessionOfficeId: number;
  officesLoading: boolean;
  officesError: any;
  officeOptions: Office[];
  Office_Id: string | number | "";
  setOfficeId: (v: string) => void;
};

export default function OfficeField({
  visible,
  isOfficeSession,
  sessionOfficeName,
  sessionOfficeId,
  officesLoading,
  officesError,
  officeOptions,
  Office_Id,
  setOfficeId,
}: Props) {
  if (!visible) return null;

  return (
    <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)", lg: "repeat(3, 1fr)" }} gap={6}>
      <GridItem>
        <FieldRow label="المكتب">
          {isOfficeSession ? (
            <>
              <Input value={sessionOfficeName} isReadOnly />
              <input type="hidden" value={sessionOfficeId} />
            </>
          ) : (
            <FieldSelect
              placeholder={officesLoading ? "جاري تحميل المكاتب..." : "اختر المكتب"}
              value={String(Office_Id ?? "")}
              onChange={(e) => setOfficeId(e.target.value)}
              isDisabled={officesLoading}
            >
              {officeOptions.map((o) => (
                <option key={String(o.id)} value={String(o.id)}>{o.name}</option>
              ))}
            </FieldSelect>
          )}
          {officesError ? (
            <Text mt={2} color="red.500" fontSize="sm">تعذّر تحميل قائمة المكاتب</Text>
          ) : null}
        </FieldRow>
      </GridItem>
    </Grid>
  );
}
