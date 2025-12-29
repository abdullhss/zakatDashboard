// src/features/MainDepartment/Users/AddUserPage/components/BasicInfoFields.tsx
import React from "react";
import { Grid, GridItem, InputLeftElement } from "@chakra-ui/react";
import FieldRow from "../../../../Components/SharedField/FieldRow";
import { FieldInput } from "../../../../Components/SharedField/FieldControl";
import { useLocation, useParams } from "react-router-dom";
import {
  InputGroup,
  InputRightElement,
  IconButton
} from "@chakra-ui/react";
import { ViewIcon, ViewOffIcon } from "@chakra-ui/icons";
import { useState } from "react";


type Props = {
  isEdit: boolean;
  firstInputRef: React.Ref<HTMLInputElement>;
  FullName: string; setFullName: (v: string) => void;
  UserName: string; setUserName: (v: string) => void;
  Email: string; setEmail: (v: string) => void;
  PhoneNum: string; setPhoneNum: (v: string) => void;
  Password: string; setPassword: (v: string) => void;
  ConfirmPassword: string; setConfirmPassword: (v: string) => void;
};

export default function BasicInfoFields({
  isEdit, firstInputRef,
  FullName, setFullName,
  UserName, setUserName,
  Email, setEmail,
  PhoneNum, setPhoneNum,
  Password, setPassword,
  ConfirmPassword, setConfirmPassword,
}: Props) {
  const pathName = useLocation() ; 
  const isEditPage = pathName.pathname.includes("edit")
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  return (
    <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)", lg: "repeat(3, 1fr)" }} gap={6}>
      <GridItem>
        <FieldRow label="الاسم كامل">
          <FieldInput
            ref={firstInputRef}
            placeholder="برجاء كتابة الاسم كامل"
            value={FullName}
            onChange={(e) => {
              const value = e.target.value.replace(/[^a-zA-Z\u0600-\u06FF\s]/g, "");
              setFullName(value);
            }}
          />
        </FieldRow>
      </GridItem>

      <GridItem>
        <FieldRow label="اسم المستخدم">
          <FieldInput
            placeholder="برجاء كتابة اسم المستخدم"
            value={UserName}
            onChange={(e) => setUserName(e.target.value)}
          />
        </FieldRow>
      </GridItem>

      <GridItem>
        <FieldRow label="البريد الالكتروني">
          <FieldInput
            placeholder="example@email.com"
            type="email"
            value={Email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </FieldRow>
      </GridItem>

      <GridItem>
        <FieldRow label="رقم الهاتف">
          <FieldInput
            placeholder="091xxxxxxx أو +21891xxxxxxx"
            value={PhoneNum}
            onChange={(e) => setPhoneNum(e.target.value)}
            inputMode="tel"
            maxLength={16}
          />
        </FieldRow>
      </GridItem>

      {
        !isEditPage &&(
          <>
              <GridItem>
                <FieldRow label="كلمة المرور">
                <InputGroup>
                  <InputLeftElement>
                    <IconButton
                      aria-label="toggle password"
                      variant="ghost"
                      size="sm"
                      icon={showPassword ? <ViewOffIcon /> : <ViewIcon />}
                      onClick={() => setShowPassword(!showPassword)}
                    />
                  </InputLeftElement>
                  <FieldInput
                    placeholder="8+ أحرف: كبير/صغير/رقم/رمز"
                    type={showPassword ? "text" : "password"}
                    value={Password}
                    onChange={(e) => setPassword(e.target.value)}
                  />

                </InputGroup>
              </FieldRow>
              </GridItem>

              <GridItem>
                <FieldRow label="تأكيد كلمة المرور">
                  <InputGroup>
                    <FieldInput
                      placeholder="برجاء تأكيد كلمة المرور"
                      type={showConfirmPassword ? "text" : "password"}
                      value={ConfirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                    />

                    <InputLeftElement>
                      <IconButton
                        aria-label="toggle confirm password"
                        variant="ghost"
                        size="sm"
                        icon={showConfirmPassword ? <ViewOffIcon /> : <ViewIcon />}
                        onClick={() =>
                          setShowConfirmPassword(!showConfirmPassword)
                        }
                      />
                    </InputLeftElement>
                  </InputGroup>
                </FieldRow>

              </GridItem>
            </>
          )
      }
    </Grid>
  );
}
