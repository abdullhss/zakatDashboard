import React from "react";
import ReactDOM from "react-dom/client";
import { ChakraProvider, ColorModeScript } from "@chakra-ui/react";
import { CacheProvider } from "@emotion/react";
import createCache from "@emotion/cache";
import stylisRTLPlugin from "stylis-plugin-rtl";
import App from "./App/App";
import { theme } from "./theme";

// ⬅️ استيراد مكونات React Query
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'; 
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'; 


// 1. إعداد Cache لـ RTL (كما هو لديك)
const cacheRtl = createCache({ key: "chakra-rtl", stylisPlugins: [stylisRTLPlugin] });

// 2. إنشاء عميل الاستعلام (Query Client)
const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            // لمنع إعادة الجلب في كل مرة يتم فيها التركيز على النافذة (اختياري لكن يُنصح به)
            refetchOnWindowFocus: false, 
        },
    },
});

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    {/* ⬅️ 3. تغليف التطبيق بالـ QueryClientProvider */}
    <QueryClientProvider client={queryClient}>
        <CacheProvider value={cacheRtl}>
          <ChakraProvider theme={theme}>
            <ColorModeScript initialColorMode={theme.config.initialColorMode} />
            <App />
          </ChakraProvider>
        </CacheProvider>
        {/* ⬅️ 4. أدوات مطور React Query (مفيدة جدًا لتصحيح الـ APIs) */}
        <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  </React.StrictMode>
);