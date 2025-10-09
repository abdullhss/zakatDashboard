// src/Components/Map/MapPicker.tsx
import { Box, chakra, Spinner, Text } from "@chakra-ui/react";
import { useEffect, useMemo, useState } from "react";

let patched = false;
async function patchLeafletIcons() {
  if (patched) return;
  const L = (await import("leaflet")).default;
  const DefaultIcon = L.icon({
    iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
    iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
    shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
  });
  // @ts-ignore
  L.Marker.prototype.options.icon = DefaultIcon;
  patched = true;
}

const Shell = chakra(Box, {
  baseStyle: {
    rounded: "10px",
    borderWidth: "1px",
    borderColor: "gray.200",
    overflow: "hidden",
    w: "100%",
    bg: "white",
  },
});

export type LatLng = { lat: number; lng: number };

type Props = {
  value: LatLng;                     // الإحداثيات الحالية
  onChange?: (next: LatLng) => void; // يُستدعى عند التحريك/الكليك
  height?: number;
  zoom?: number;
  readOnly?: boolean;
};

function useLeaflet() {
  const [loaded, setLoaded] = useState(false);
  const [mod, setMod] = useState<any>(null);
  useEffect(() => {
    let on = true;
    (async () => {
      try {
        const m = await import("react-leaflet");
        await patchLeafletIcons();
        if (on) { setMod(m); setLoaded(true); }
      } catch (e) {
        console.error("[MapPicker] react-leaflet load failed:", e);
        setLoaded(false);
      }
    })();
    return () => { on = false; };
  }, []);
  return { loaded, RL: mod };
}

export default function MapPicker({
  value,
  onChange,
  height = 320,
  zoom = 13,
  readOnly = false,
}: Props) {
  const { loaded, RL } = useLeaflet();

  const center = useMemo(() => {
    const latOk = Number.isFinite(Number(value?.lat));
    const lngOk = Number.isFinite(Number(value?.lng));
    return {
      lat: latOk ? Number(value.lat) : 32.885353, // default: طرابلس
      lng: lngOk ? Number(value.lng) : 13.180161,
    };
  }, [value?.lat, value?.lng]);

  if (!loaded) {
    return (
      <Shell h={`${height}px`} display="flex" alignItems="center" justifyContent="center" gap={2}>
        <Spinner size="sm" />
        <Text color="gray.500" fontSize="sm">تحميل الخريطة…</Text>
      </Shell>
    );
  }

  const { MapContainer, TileLayer, Marker, Popup, useMapEvents } = RL;

  function ClickHandler() {
    useMapEvents({
      click(e: any) {
        if (readOnly) return;
        onChange?.({ lat: e.latlng.lat, lng: e.latlng.lng });
      },
    });
    return null;
  }

  return (
    <Shell h={`${height}px`}>
      <MapContainer
        key={`${center.lat.toFixed(5)},${center.lng.toFixed(5)}`}
        center={[center.lat, center.lng]}
        zoom={zoom}
        style={{ width: "100%", height: "100%" }}
        scrollWheelZoom={false}
        attributionControl={false}
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <ClickHandler />
        <Marker
          position={[center.lat, center.lng]}
          draggable={!readOnly}
          eventHandlers={
            readOnly
              ? undefined
              : {
                  dragend: (e: any) => {
                    const p = e.target.getLatLng();
                    onChange?.({ lat: p.lat, lng: p.lng });
                  },
                }
          }
        >
          <Popup>{center.lat.toFixed(5)}, {center.lng.toFixed(5)}</Popup>
        </Marker>
      </MapContainer>
    </Shell>
  );
}
