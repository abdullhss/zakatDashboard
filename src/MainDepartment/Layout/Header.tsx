import {
  chakra,
  Flex,
  Text,
  Input,
  InputGroup,
  InputLeftElement,
  Icon,
  Avatar,
  Box,
} from "@chakra-ui/react";
import { FiSearch } from "react-icons/fi"; // يمكنك استخدام أي أيقونة بحث تفضلها

// مُكوّن مُخصص لمنطقة الهيدر
const StyledHeader = chakra(Flex, {
  baseStyle: {
    gridArea: "header",
    bg: "white",
    h: "72px",
    alignItems: "center",
    justifyContent: "space-between",
    px: 6, // مسافة داخلية أفقية
    borderBottom: "1px solid",
    borderColor: "gray.200",
    position: "sticky", // لتثبيت الهيدر في الأعلى عند التمرير
    top: 0,
    zIndex: "sticky", // لضمان ظهوره فوق المحتوى
  },
});

export default function Header() {
  // العناصر الموجودة في الهيدر (كما يظهر في الصورة)
  return (
    <StyledHeader>
      {/* 1. حقل البحث على اليسار */}
      <InputGroup maxW="300px">
        <InputLeftElement pointerEvents="none">
          <Icon as={FiSearch} color="gray.400" />
        </InputLeftElement>
        {/* بما أن التصميم عربي، قد تحتاج لضبط اتجاه النص هنا */}
        <Input type="text" placeholder="البحث..." dir="rtl" />
      </InputGroup>

      {/* 2. اسم المستخدم والأفاتار على اليمين */}
      <Flex alignItems="center" gap={4}>
        <Box textAlign="right">
          <Text fontSize="sm" fontWeight="bold">
            اسم المستخدم
          </Text>
          <Text fontSize="xs" color="gray.500">
            مدير النظام
          </Text>
        </Box>
        <Avatar
          name="اسم المستخدم"
          src="مسار_صورة_البروفايل.jpg"
          size="md"
        />
      </Flex>
    </StyledHeader>
  );
}