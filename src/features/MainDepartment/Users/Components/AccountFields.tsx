import { Grid, GridItem, Text } from "@chakra-ui/react";
import FieldRow from "../../../../Components/SharedField/FieldRow";
import { FieldSelect } from "../../../../Components/SharedField/FieldControl";
import { privIdOf, privNameOf } from "../helpers/mappers";

type Props = {
  isOfficeSession: boolean;
  UserType: "M" | "O" | "";
  setUserType: (v: "M" | "O" | "") => void;

  privLoading: boolean;
  privileges: any[];
  GroupRight_Id: number | "";
  setGroupRightId: (v: number | "") => void;
};

export default function AccountFields({
  isOfficeSession,
  UserType, setUserType,
  privLoading, privileges, GroupRight_Id, setGroupRightId,
}: Props) {
  return (
    <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)", lg: "repeat(3, 1fr)" }} gap={6}>
      <GridItem>
        <FieldRow label="نوع الحساب">
          <FieldSelect
            placeholder="برجاء اختيار نوع الحساب"
            value={UserType}
            onChange={(e) => setUserType(e.target.value as "M" | "O" | "")}
            isDisabled={isOfficeSession}
          >
            <option value="M">إدارة</option>
            <option value="O">مكتب</option>
          </FieldSelect>
        </FieldRow>
      </GridItem>

      <GridItem>
        <FieldRow label="الصلاحية">
          <FieldSelect
            placeholder={privLoading ? "جاري تحميل الصلاحيات..." : "اختر الصلاحية"}
            value={GroupRight_Id ? String(GroupRight_Id) : ""}
            onChange={(e) => setGroupRightId(e.target.value)}
            isDisabled={privLoading || privileges.length === 0}
          >
            {privileges.map((p: any) => {
              const id = String(privIdOf(p)); // 👈 خليه string
              const name = String(privNameOf(p));
              return (
                <option key={id} value={id}>
                  {name}
                </option>
              );
            })}
          </FieldSelect>


          {!privLoading && privileges.length === 0 && UserType === "M" ? (
            <Text mt={1} fontSize="sm" color="orange.500">لا توجد صلاحيات متاحة للإدارة.</Text>
          ) : null}
        </FieldRow>
      </GridItem>
    </Grid>
  );
}
