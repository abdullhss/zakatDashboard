import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css"
import { ChakraProvider, ColorModeScript } from "@chakra-ui/react";
import { CacheProvider } from "@emotion/react";
import createCache from "@emotion/cache";
import stylisRTLPlugin from "stylis-plugin-rtl";
import App from "./App/App";
import theme from "./theme";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'; 
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'; 
import "leaflet/dist/leaflet.css";
import { ImagesPathProvider } from "./Context/ImagesPathProvider.js";
// 1. إعداد Cache لـ RTL (كما هو لديك)
const cacheRtl = createCache({ key: "chakra-rtl", stylisPlugins: [stylisRTLPlugin] });

// 2. إنشاء عميل الاستعلام (Query Client)
const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            refetchOnWindowFocus: false, 
        },
    },
});

ReactDOM.createRoot(document.getElementById("root")!).render(
    <React.StrictMode>
        <QueryClientProvider client={queryClient}>
            <CacheProvider value={cacheRtl}>
        <ChakraProvider theme={theme}>
        <ColorModeScript initialColorMode={theme.config.initialColorMode} />
        <ImagesPathProvider>
            <App />
        </ImagesPathProvider>
        </ChakraProvider>
        </CacheProvider>
            <ReactQueryDevtools initialIsOpen={false} />
        </QueryClientProvider>
    </React.StrictMode>
);