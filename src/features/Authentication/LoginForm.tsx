// src/features/Authentication/LoginForm.tsx

import { useState } from "react";
import {
  FormControl,
  FormLabel,
  IconButton,
  Image,
  Input,
  InputGroup,
  InputLeftElement,
} from "@chakra-ui/react";
import { FieldsStack } from "./Styles/LoginpageStyles";

/** أيقونات من public/ */
const userIcon = "/assets/LoginIcons/profile.png";
const eyeIcon = "/assets/LoginIcons/eye.png";
const eyeOffIcon = "/assets/LoginIcons/eye-slash.png";

// ⬅️ تعريف الأنواع لـ Props
interface LoginFormProps {
    username: string;
    password: string;
    setUsername: (value: string) => void;
    setPassword: (value: string) => void;
    isDisabled: boolean;
}

export default function LoginForm({ username, password, setUsername, setPassword, isDisabled }: LoginFormProps) {
  const [show, setShow] = useState(false);

  return (
    <FieldsStack>
      {/* اسم المستخدم */}
      <FormControl isRequired>
        <FormLabel fontSize="sm" color="gray.700" mb={1}>
          اسم مستخدم 
        </FormLabel>
        <InputGroup>
          <InputLeftElement pointerEvents="none">
            <Image src={userIcon} alt="User" boxSize="18px" />
          </InputLeftElement>
          <Input
            type="text"
            placeholder="رجاء إدخال اسم المستخدم"
            bg="white"
            borderColor="gray.300"
            rounded="8px"
            h="45px"
            _focus={{
              borderColor: "brand.700",
              boxShadow: "0 0 0 1px var(--chakra-colors-brand-700)",
            }}
             // ⬅️ ربط القيمة ودالة التحديث
             value={username}
             onChange={(e) => setUsername(e.target.value)}
             isDisabled={isDisabled}
          />
        </InputGroup>
      </FormControl>

      {/* كلمة المرور */}
      <FormControl isRequired>
        <FormLabel fontSize="sm" color="gray.700" mb={1}>
          كلمة المرور 
        </FormLabel>
        <InputGroup>
          <Input
            type={show ? "text" : "password"}
            placeholder="رجاء إدخال كلمة المرور"
            bg="white"
            borderColor="gray.300"
            rounded="8px"
            h="45px"
            _focus={{
              borderColor: "brand.700",
              boxShadow: "0 0 0 1px var(--chakra-colors-brand-700)",
            }}
             // ⬅️ ربط القيمة ودالة التحديث
             value={password}
             onChange={(e) => setPassword(e.target.value)}
             isDisabled={isDisabled}
          />

          {/* زر العين (وضعناه في LeftElement) */}
          <InputLeftElement w="40px" h="100%">
            <IconButton
              aria-label="Toggle password"
              onClick={() => setShow(!show)}
              variant="ghost"
              size="sm"
              icon={
                <Image
                  src={show ? eyeOffIcon : eyeIcon}
                  alt="toggle password"
                  boxSize="18px"
                />
              }
            />
          </InputLeftElement>
        </InputGroup>
      </FormControl>
    </FieldsStack>
  );
}