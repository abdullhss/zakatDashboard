// import { chakra, Icon } from "@chakra-ui/react";
// import { NavLink } from "react-router-dom";
// // استيراد أيقونات إضافية لتطابق التصميم
// import { FiHome, FiFolder, FiUsers, FiCalendar, FiBookOpen } from "react-icons/fi"; 

// const NavList = chakra("nav", { baseStyle: { display: "flex", flexDirection: "column", mt: 4 , fontsize:"18px", fontWeight:"bold.700" ,lineHeight:"120%" },
// });

// const LinkItem = chakra(NavLink, {
//      baseStyle: {
//     display: "flex",
//     alignItems: "center",
//     gap: 6,
//     h: "56px", // ارتفاع أصغر
//     paddingInline: 6, // مسافة داخلية جانبية أقل
//     width: "100%",
//     color: "gray.500", 
//     fontWeight: 800,

//     transition: "all .2s ease",
//     _hover: { bg: "gray.50", color: "gray.700" }, // تأثير خفيف عند المرور
    
    

//     "&.active, &[aria-current='page']": {
//       color: "black", // اللون الأزرق الرئيسي للنص والأيقونة
//       bg: "grey.800", // خلفية زرقاء فاتحة
//       fontWeight: 600,

      
//       // الشريط الأزرق السميك على الجانب الأيمن (RTL)
//       position: "relative",
//       _before: {
//         content: `""`,
//         position: "absolute",
//         left: 0, // وضعه على اليمين
//         top: 0,
//         bottom: 0,
//         width: "4px", // سُمك الشريط
//         bg: "#17343B", // اللون الأزرق
//         borderRadius: "4px 0 0 4px", // حواف دائرية على اليمين
//       }
//     },
//   },
// });

// export default function MainNavBarOfficeDepartment() {
//   return (
//     <NavList>
//       {/* الرئيسية = index داخل officedashboard */}
//       <LinkItem to="." end>
//         <Icon as={FiHome} boxSize={5} />
//         الصفحة الرئيسية
//       </LinkItem>
//       <LinkItem to="users">
//         <Icon as={FiUsers} boxSize={5} />
//         المستخدمون
//       </LinkItem>

//       <LinkItem to="dates">
//         <Icon as={FiCalendar} boxSize={5} />
//         التواريخ
//       </LinkItem>

//       <LinkItem to="loan-requests">
//         <Icon as={FiBookOpen} boxSize={5} />
//         مراجعة طلب الإعارة
//       </LinkItem>

//       <LinkItem to="bank-transfers">
//         <Icon as={FiFolder} boxSize={5} />
//         مراجعة تحويلات مصرفية
//       </LinkItem>
//     </NavList>
//   );
// }


import { chakra, Icon } from "@chakra-ui/react";
import { NavLink } from "react-router-dom";

// أيقونات مناسبة لكل عنصر
import { FiHome, FiMapPin, FiCreditCard, FiUsers } from "react-icons/fi";
import { HiOutlineBuildingOffice } from "react-icons/hi2";
import {
  RiShieldKeyholeLine,
  RiHandCoinLine,
  RiHandHeartLine,
  RiServiceLine,
} from "react-icons/ri";
import { TbCategory2 } from "react-icons/tb";
import { GiSheep } from "react-icons/gi";
import { MdOutlineAssignmentTurnedIn } from "react-icons/md";
import { AiOutlineCalculator } from "react-icons/ai";

// ✅ قائمة الناف بار
const NavList = chakra("nav", {
  baseStyle: {
    display: "flex",
    flexDirection: "column",
    mt: 4,
    fontSize: "18px",
    fontWeight: "bold",
    lineHeight: "120%",
  },
});

const LinkItem = chakra(NavLink, {
  baseStyle: {
    display: "flex",
    alignItems: "center",
    gap: 6,
    h: "56px",
    paddingInline: 6,
    width: "100%",
    color: "gray.500",
    fontWeight: 800,
    transition: "all .2s ease",
    _hover: { bg: "gray.200", color: "gray.700" },

    "&.active, &[aria-current='page']": {
      color: "black",
      bg: "gray.100",
      fontWeight: 600,
      position: "relative",
      _before: {
        content: `""`,
        position: "absolute",
        left: 0,
        top: 0,
        bottom: 0,
        width: "4px",
        bg: "#17343B",
        borderRadius: "4px 0 0 4px",
      },
    },
  },
});

export default function MainNavBarOfficeDepartment() {
  return (
    <NavList>
      {/* الرئيسية */}
      <LinkItem to="." end>
        <Icon as={FiHome} boxSize={5} />
        الصفحة الرئيسية
      </LinkItem>



   

 
      {/* المستخدمين */}
      <LinkItem to="usersOffice">
        <Icon as={FiUsers} boxSize={5} />
        المستخدمين
      </LinkItem>

      {/* حاسبة الزكاة */}
      <LinkItem to="privelgesOffice">
        <Icon as={AiOutlineCalculator} boxSize={5} />
        الصلاحيات
      </LinkItem>
      <LinkItem to="campaignOffice">
        <Icon as={AiOutlineCalculator} boxSize={5} />
        الخدمات
      </LinkItem>

      {/* أنواع الأضحيات */}
      <LinkItem to="sacirificeTypes">
        <Icon as={GiSheep} boxSize={5} />
        أنواع الأضحيات
      </LinkItem>

      {/* مراجعة طلب الإعانة */}
      <LinkItem to="assistanceData">
        <Icon as={MdOutlineAssignmentTurnedIn} boxSize={5} />
        مراجعة طلب الإعانة
      </LinkItem>

      {/* الخدمات */}
      <LinkItem to="campaign">
        <Icon as={RiServiceLine} boxSize={5} />
        الخدمات
      </LinkItem>
    </NavList>
  );
}
