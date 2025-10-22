// import {
//   HStack, Text, Icon, Input, Box, chakra, Spinner, Tooltip, Link, useToast
// } from "@chakra-ui/react";
// import { AttachmentIcon, CloseIcon } from "@chakra-ui/icons";
// import { useRef, useState } from "react";
// import { HandelFile } from "../../utils/HandleFile";

// type Props = {
//   label?: string;
//   required?: boolean;
//   sessionId: string;
//   onUploaded: (fileId: string, name: string) => void;
//   onDeleted?: () => void;
//   defaultFileName?: string;
//   defaultFileId?: string;
// };

// const brandColor = "#B27C2D";

// const UploadField = ({
//   label = "تحميل ملف",
//   required,
//   sessionId,
//   onUploaded,
//   onDeleted,
//   defaultFileId,
//   defaultFileName,
// }: Props) => {
//   const inputRef = useRef<HTMLInputElement>(null);
//   const toast = useToast();
//   const [uploading, setUploading] = useState(false);
//   const [fileName, setFileName] = useState<string | undefined>(defaultFileName);
//   const [fileId, setFileId] = useState<string | undefined>(defaultFileId);

//   const handlePick = () => inputRef.current?.click();

//   const handleChange: React.ChangeEventHandler<HTMLInputElement> = async (e) => {
//     const file = e.target.files?.[0];
//     if (!file) return;

//     try {
//       setUploading(true);
//       const api = new HandelFile();
//       const res = await api.UploadFileWebSite({
//         action: "Insert",            // ✅ مهم: Insert مش Upload
//         file,
//         SessionID: sessionId,
//       });

//       if (String(res.status) === "200" && res.id) {
//         setFileId(String(res.id));
//         setFileName(file.name);
//         onUploaded(String(res.id), file.name);
//         toast({ title: "تم رفع الملف بنجاح.", status: "success" });
//       } else {
//         toast({ title: "تعذر رفع الملف.", description: res.error || "", status: "error" });
//       }
//     } catch (err: any) {
//       toast({ title: "خطأ أثناء الرفع.", description: err?.message, status: "error" });
//     } finally {
//       setUploading(false);
//       if (inputRef.current) inputRef.current.value = "";
//     }
//   };

//   const handleDelete = async () => {
//     if (!fileId) return;
//     try {
//       setUploading(true);
//       const api = new HandelFile();
//       const res = await api.DeleteFile({ fileId, SessionID: sessionId });
//       if (String(res.status) === "200") {
//         setFileId(undefined);
//         setFileName(undefined);
//         onDeleted?.();
//         toast({ title: "تم حذف الملف.", status: "info" });
//       } else {
//         toast({ title: "تعذر حذف الملف.", description: res.error || "", status: "error" });
//       }
//     } finally {
//       setUploading(false);
//     }
//   };

//   return (
//     <Box dir="rtl">
//       <HStack
//         as="button"
//         type="button"
//         onClick={handlePick}
//         spacing={2}
//         color={brandColor}
//         _hover={{ textDecoration: "underline" }}
//         disabled={uploading}
//       >
//         <Text as="span" fontWeight="700">
//           {label}
//           {required && <Text as="span" color="red.500" ms="1">*</Text>}
//         </Text>
//         <Icon as={AttachmentIcon} boxSize="18px" />
//       </HStack>

//       <Input
//         ref={inputRef}
//         type="file"
//         accept="image/*"
//         display="none"
//         onChange={handleChange}
//       />

//       <HStack mt={2} spacing={3}>
//         {uploading && (
//           <HStack color="gray.600" spacing={2}>
//             <Spinner size="sm" />
//             <Text fontSize="sm">جاري الرفع…</Text>
//           </HStack>
//         )}

//         {!uploading && fileName && (
//           <HStack spacing={2}>
//             <Tooltip label={fileName}>
//               <Text fontSize="sm" maxW="280px" noOfLines={1}>{fileName}</Text>
//             </Tooltip>
//             <Link as="button" color="red.500" onClick={handleDelete} title="حذف">
//               <CloseIcon boxSize="10px" />
//             </Link>
//           </HStack>
//         )}
//       </HStack>
//     </Box>
//   );
// };

// export default UploadField;
