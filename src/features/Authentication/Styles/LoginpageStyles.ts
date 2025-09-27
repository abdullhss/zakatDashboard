import { chakra } from "@chakra-ui/react";

// MAINNNNN
export const StyledPage = chakra("div", {
  baseStyle: {
    minH: "100vh",
    display: "grid",
    gridTemplateColumns: { base: "1fr", lg: "720px 1fr" }, // ← بدل "1fr 720px"
    gridTemplateAreas: { base: `"main"`, lg: `"sidebar main"` }, // ← بدل "main sidebar"
    bg: "#f7f9fb",
   
  },
});

/** عمود الفورم */
export const StyledMain = chakra("main", {
  baseStyle: {
    gridArea: "main",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    px: { base: 4, md: 8 },
    py: { base: 8, md: 10 },
    bg: "white",
  },
});
//  لفورم كارد نفسهاس
export const StyledFormCard = chakra("section", {
  baseStyle: {
    w: "full",
    maxW: "520px",
    bg: "white",
    // border: "1px solid",
    borderColor: "gray.200",
    rounded: "8px",
    px: "16px",
    py: "16px",
    display: "grid",
    gap: "40px",
    boxShadow: "sm",
  },
});

/** اللوجو ديزاين ****************/
export const HeaderStack = chakra("div", {
  baseStyle: {
    display: "grid",
    justifyItems: "center",
    gap: "10px",
  },
});

/** فيلد اسم المستخدم والباسورد */
export const FieldsStack = chakra("div", {
  baseStyle: {

    display: "grid",
    gap: "20px",
    
  },
});

/** زر الدخول ارتفاع 45px عرض الكارد */
export const SubmitBtn = chakra("button", {
  baseStyle: {
    height: "45px",
    width: "100%",
    rounded: "8px",
    bg: "brand.900",
    color: "white",
    fontWeight: "700",
    border: "1px solid",
    borderColor: "rgba(0,0,0,0.15)", // حد خفيف مثل فيجما
    // _hover: { bg: "brand.800" },
    _active: { bg: "brand.700" },
    marginTop:"16px",
    marginBottom:"16px",
    
  },
});

/** عمود اليمين (الصورة + الجراديانت) */
export const StyledSideBar = chakra("aside", {
  baseStyle: {
    gridArea: "sidebar",
    width: "720px",
    bg: "white",
    color: "gray.700",
    position: "sticky",
    top: 0,
    alignSelf: "stretch",
    overflowY: "auto",
    display: { base: "none", lg: "flex" },
  },
});

/** خلفية اليمين بالصورة والجراديانت المحددين بالألوان من فيجما */
export const SideBackground = chakra("div", {
  baseStyle: {
      h: "100vh",        // تأكد إن العمود ياخد طول الشاشة
    w: "100%",
    bgPos: "center",
    bgSize: "cover",
    bgRepeat: "no-repeat",

    _before: {
      content: '""',
      pos: "absolute",
      inset: 0,
      bgPos: "center",
      bgSize: "cover",
      bgRepeat: "no-repeat",
      // سنمرر bgImage من الصفحة
    },
    _after: {
      content: '""',
      pos: "absolute",
      inset: 0,
     
    },
  },
});

/** مكان الآية */
export const AyahWrap = chakra("div", {
  baseStyle: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
});
