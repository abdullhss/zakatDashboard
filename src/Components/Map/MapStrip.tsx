import { Box, chakra, Spinner, Text } from "@chakra-ui/react";
import { useEffect, useState } from "react";

const Shell = chakra(Box, {
  baseStyle: {
    rounded: "10px",
    borderWidth: "1px",
    borderColor: "gray.200",
    overflow: "hidden",
    h: { base: "110px", md: "155px" },
    w: "100%",
    bg: "white",
  },
});

type LatLng = { lat: number; lng: number };

function useLeaflet() {
  const [loaded, setLoaded] = useState(false);
  const [mod, setMod] = useState<any>(null);
  useEffect(() => {
    let on = true;
    (async () => {
      try {
        const m = await import("react-leaflet");
        if (on) { setMod(m); setLoaded(true); }
      } catch { setLoaded(false); }
    })();
    return () => { on = false; };
  }, []);
  return { loaded, RL: mod };
}

/** شريط خريطة أسفل التفاصيل */
export default function MapStrip({ center, marker }: { center: LatLng; marker?: LatLng }) {
  const { loaded, RL } = useLeaflet();
  if (!loaded) {
    return (
      <Shell display="flex" alignItems="center" justifyContent="center" gap={2}>
        <Spinner size="sm" />
        <Text color="gray.500" fontSize="sm">تحميل الخريطة…</Text>
      </Shell>
    );
  }
  const { MapContainer, TileLayer, Marker, Popup } = RL;
  const m = marker ?? center;
  return (
    <Shell>
      <MapContainer
        center={[center.lat, center.lng]}
        zoom={13}
        style={{ width: "100%", height: "100%" }}
        scrollWheelZoom={false}
        attributionControl={false}
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <Marker position={[m.lat, m.lng]}>
          <Popup>{m.lat.toFixed(5)}, {m.lng.toFixed(5)}</Popup>
        </Marker>
      </MapContainer>
    </Shell>
  );
}
