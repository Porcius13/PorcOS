"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Map, { Marker, Popup, NavigationControl, type MapRef } from "react-map-gl/maplibre";
import Supercluster from "supercluster";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, X, Loader2, MapPin } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import type { MapLocation } from "@/lib/maps-types";

import "maplibre-gl/dist/maplibre-gl.css";

/** Ücretsiz vektör harita (API anahtarı gerekmez). İstersen .env: NEXT_PUBLIC_MAPLIBRE_STYLE */
const DEFAULT_MAP_STYLE =
  process.env.NEXT_PUBLIC_MAPLIBRE_STYLE ??
  "https://tiles.openfreemap.org/styles/liberty";

interface SearchResult {
  place_id: number;
  display_name: string;
  lat: string;
  lon: string;
}

type ClusterPointFeature = GeoJSON.Feature<
  GeoJSON.Point,
  { loc: MapLocation } | Record<string, unknown>
>;

interface TurkeyMapProps {
  activePanel: "planned" | "visited";
  locations: MapLocation[];
  onLocationsRefresh: () => void;
}

export default function TurkeyMap({ activePanel, locations, onLocationsRefresh }: TurkeyMapProps) {
  const router = useRouter();
  const mapRef = useRef<MapRef>(null);
  const [zoomLevel, setZoomLevel] = useState(6);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [newLocation, setNewLocation] = useState<[number, number] | null>(null);
  const [saveForm, setSaveForm] = useState({ name: "", description: "" });
  const [selectedPinId, setSelectedPinId] = useState<number | null>(null);
  const [clusters, setClusters] = useState<ClusterPointFeature[]>([]);

  const visibleLocations = useMemo(() => {
    return locations.filter((loc) => {
      if (zoomLevel < loc.min_zoom) return false;
      if (activePanel === "planned") return loc.status !== "visited";
      return loc.status === "visited";
    });
  }, [locations, zoomLevel, activePanel]);

  const clusterIndex = useMemo(() => {
    const index = new Supercluster({ radius: 45, maxZoom: 14 });
    const points: GeoJSON.Feature<GeoJSON.Point, { loc: MapLocation }>[] =
      visibleLocations.map((loc) => ({
        type: "Feature",
        properties: { loc },
        geometry: { type: "Point", coordinates: [loc.lng, loc.lat] },
      }));
    index.load(points);
    return index;
  }, [visibleLocations]);

  const rebuildClusters = useCallback(() => {
    const map = mapRef.current?.getMap();
    if (!map) return;
    const b = map.getBounds();
    const bbox: [number, number, number, number] = [
      b.getWest(),
      b.getSouth(),
      b.getEast(),
      b.getNorth(),
    ];
    const z = Math.floor(map.getZoom());
    setClusters(clusterIndex.getClusters(bbox, z) as ClusterPointFeature[]);
  }, [clusterIndex]);

  useEffect(() => {
    rebuildClusters();
  }, [rebuildClusters]);

  useEffect(() => {
    if (!newLocation || !mapRef.current) return;
    const [lat, lng] = newLocation;
    mapRef.current.flyTo({ center: [lng, lat], zoom: 14, duration: 1500 });
  }, [newLocation]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query) return;
    setIsSearching(true);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=5&countrycodes=tr`
      );
      const data = await res.json();
      setResults(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSearching(false);
    }
  };

  const selectResult = (res: SearchResult) => {
    const locName = res.display_name.split(",")[0];
    router.push(`/nomad?location=${encodeURIComponent(locName)}&lat=${res.lat}&lng=${res.lon}`);
    setResults([]);
    setQuery("");
  };

  const saveLocation = async () => {
    if (!newLocation || !saveForm.name) return;
    const [lat, lng] = newLocation;
    try {
      const res = await fetch("/api/locations", {
        method: "POST",
        body: JSON.stringify({
          name: saveForm.name,
          description: saveForm.description,
          lat,
          lng,
          category: "discovery",
          status: "not-visited",
          min_zoom: 6,
          image_url:
            "https://images.unsplash.com/photo-1541185933-ef5d8ed016c2?q=80&w=800",
        }),
      });
      if (res.ok) {
        setNewLocation(null);
        setSaveForm({ name: "", description: "" });
        onLocationsRefresh();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleClusterClick = (clusterId: number, lng: number, lat: number) => {
    const map = mapRef.current?.getMap();
    if (!map) return;
    const expansion = clusterIndex.getClusterExpansionZoom(clusterId);
    const z = Math.min(expansion, 18);
    map.easeTo({ center: [lng, lat], zoom: z, duration: 500 });
  };

  const photoSrc = (url: string) =>
    url?.trim() || "https://placehold.co/100x100/476400/ddff9b?text=📍";

  return (
    <div className="relative w-full h-full bg-[#e8e8e5] rounded-none overflow-hidden grain-overlay">
      <div className="absolute top-4 left-4 z-[1001] w-full max-w-[280px]">
        <form onSubmit={handleSearch} className="relative group">
          <div className="flex items-center bg-[#FAF9F6] border border-[#476400] shadow-[4px_4px_0_0_rgba(71,100,0,0.1)] rounded-none p-1 transition-all">
            <div className="px-2 text-[#476400]">
              {isSearching ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Search className="w-4 h-4" />
              )}
            </div>
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="SEARCH LOCATION"
              className="border-none bg-transparent shadow-none focus-visible:ring-0 text-[#2e2f2d] placeholder:text-neutral-400 font-label text-[10px] uppercase tracking-widest h-8"
            />
          </div>

          {results.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-[#FAF9F6] border border-[#476400] shadow-xl rounded-none overflow-hidden py-0">
              {results.map((res) => (
                <button
                  key={res.place_id}
                  type="button"
                  onClick={() => selectResult(res)}
                  className="w-full text-left px-3 py-2 hover:bg-[#c8f17a]/30 flex items-start gap-2 transition-colors border-b border-[#476400]/10 last:border-0"
                >
                  <MapPin className="w-3 h-3 mt-1 text-[#476400] shrink-0" />
                  <div>
                    <div className="text-[10px] font-black text-[#2e2f2d] uppercase tracking-wider line-clamp-1">
                      {res.display_name.split(",")[0]}
                    </div>
                    <div className="text-[8px] text-neutral-400 uppercase tracking-widest line-clamp-1 font-label">
                      {res.display_name.split(",").slice(1).join(",")}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </form>
      </div>

      <Map
        ref={mapRef}
        mapStyle={DEFAULT_MAP_STYLE}
        initialViewState={{
          longitude: 35.3,
          latitude: 39.1,
          zoom: 6,
        }}
        style={{ width: "100%", height: "100%" }}
        cursor="crosshair"
        reuseMaps
        onClick={(e) => {
          setSelectedPinId(null);
          const ll = e.lngLat;
          if (!ll) return;
          setNewLocation([ll.lat, ll.lng]);
        }}
        onLoad={rebuildClusters}
        onMoveEnd={(e) => {
          setZoomLevel(e.viewState.zoom);
          rebuildClusters();
        }}
      >
        <NavigationControl position="bottom-right" showCompass={false} />

        {newLocation && (
          <>
            <Marker
              longitude={newLocation[1]}
              latitude={newLocation[0]}
              anchor="center"
              onClick={(ev) => ev.originalEvent.stopPropagation()}
            >
              <div
                className="h-4 w-4 rounded-full border-2 border-white shadow-md"
                style={{ background: "#476400" }}
              />
            </Marker>
            <Popup
              longitude={newLocation[1]}
              latitude={newLocation[0]}
              anchor="bottom"
              offset={12}
              closeButton={false}
              closeOnClick={false}
              className="maplibre-popup-editorial"
              onClose={() => {}}
            >
              <div
                className="p-4 bg-[#FAF9F6] min-w-[240px]"
                onClick={(ev) => ev.stopPropagation()}
              >
                <div className="font-label text-[8px] font-black text-[#476400] uppercase tracking-[0.3em] mb-4">
                  Discovery: New Entry
                </div>
                <Input
                  value={saveForm.name}
                  onChange={(e) => setSaveForm({ ...saveForm, name: e.target.value })}
                  placeholder="LOCATION NAME"
                  className="mb-4 border-[#476400]/20 focus:border-[#476400] rounded-none font-headline font-bold text-lg h-10 px-0 border-x-0 border-t-0 shadow-none"
                />
                <Input
                  value={saveForm.description}
                  onChange={(e) =>
                    setSaveForm({ ...saveForm, description: e.target.value })
                  }
                  placeholder="Notes on history, atmosphere, rituals..."
                  className="mb-6 font-body text-xs border-[#476400]/20 focus:border-[#476400] rounded-none min-h-[60px] p-0 border-none shadow-none"
                />
                <div className="flex gap-2">
                  <Button
                    onClick={saveLocation}
                    className="flex-1 bg-[#476400] hover:bg-[#304600] text-[#ddff9b] rounded-none h-10 font-label text-[10px] uppercase tracking-widest font-black"
                  >
                    KAYDET
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={() => setNewLocation(null)}
                    className="rounded-none h-10 text-neutral-400 hover:text-neutral-600 px-3"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </Popup>
          </>
        )}

        {clusters.map((feature) => {
          const coords = feature.geometry as GeoJSON.Point;
          const [lng, lat] = coords.coordinates;
          const props = feature.properties as Record<string, unknown> | null;
          if (!props) return null;

          if (props.cluster) {
            const clusterId = props.cluster_id as number;
            const count = props.point_count as number;
            return (
              <Marker
                key={`cluster-${clusterId}`}
                longitude={lng}
                latitude={lat}
                onClick={(ev) => {
                  ev.originalEvent.stopPropagation();
                  handleClusterClick(clusterId, lng, lat);
                }}
              >
                <div className="cluster-marker-editorial cursor-pointer">
                  <span>{count}</span>
                </div>
              </Marker>
            );
          }

          const loc = props.loc as MapLocation;
          if (!loc) return null;

          return (
            <Marker
              key={loc.id}
              longitude={loc.lng}
              latitude={loc.lat}
              anchor="center"
              onClick={(ev) => {
                ev.originalEvent.stopPropagation();
                setSelectedPinId((id) => (id === loc.id ? null : loc.id));
              }}
            >
              <div className="photo-marker-editorial">
                <div className="photo-frame-editorial">
                  <img
                    src={photoSrc(loc.image_url)}
                    alt=""
                    className="photo-img"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        "https://placehold.co/100x100?text=🗺️";
                    }}
                  />
                </div>
              </div>
              {selectedPinId === loc.id && (
                <Popup
                  longitude={loc.lng}
                  latitude={loc.lat}
                  anchor="bottom"
                  offset={36}
                  onClose={() => setSelectedPinId(null)}
                  closeOnClick={false}
                  className="maplibre-popup-editorial"
                  maxWidth="320px"
                >
                  <div className="bg-[#FAF9F6] border-none">
                    <div className="relative h-48 w-full grayscale-[0.3] sepia-[0.1] border-b border-[#476400]/10">
                      <img
                        src={
                          loc.image_url?.trim() ||
                          "https://placehold.co/800x400/476400/ddff9b?text=Anı"
                        }
                        alt={loc.name}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-2 left-2">
                        <Badge className="bg-[#476400] text-[#ddff9b] rounded-none border-none font-label text-[8px] uppercase tracking-widest px-2 py-0.5">
                          {loc.status === "visited" ? "LOGGED" : "PLANNED"}
                        </Badge>
                      </div>
                    </div>
                    <div className="p-6">
                      <h3 className="font-headline text-3xl font-bold text-[#2e2f2d] mb-2">
                        {loc.name}
                      </h3>
                      <p className="font-body text-xs text-neutral-600 mb-6 leading-relaxed line-clamp-3">
                        {loc.description}
                      </p>
                      <button
                        type="button"
                        className="w-full py-4 border border-[#476400] text-[#476400] font-label text-[9px] uppercase tracking-[0.3em] font-black hover:bg-[#476400] hover:text-[#ddff9b] transition-all duration-300"
                      >
                        OPEN TRAVEL LOG
                      </button>
                    </div>
                  </div>
                </Popup>
              )}
            </Marker>
          );
        })}
      </Map>

      <div className="absolute top-4 right-4 z-[1000] pointer-events-none">
        <Card className="p-4 bg-[#FAF9F6]/90 backdrop-blur-md border border-[#476400]/20 rounded-none text-[#2e2f2d] shadow-[4px_4px_0_0_rgba(71,100,0,0.1)] flex flex-col items-center min-w-[120px]">
          <div className="flex items-center gap-2 text-[8px] font-black text-[#476400] uppercase tracking-[0.3em] mb-1 opacity-80">
            DISCOVERED
          </div>
          <div className="font-headline text-4xl font-black italic">{visibleLocations.length}</div>
          <div className="h-[1px] w-full bg-neutral-200 mt-2" />
          <div className="font-label text-[8px] uppercase tracking-widest text-neutral-400 mt-1 font-bold">
            Of {locations.length} Sites
          </div>
        </Card>
      </div>

      <style jsx global>{`
        .photo-marker-editorial {
          padding: 4px;
          background: #faf9f6;
          border: 1px solid rgba(71, 100, 0, 0.1);
          border-radius: 0;
          box-shadow: 4px 4px 0 0 rgba(71, 100, 0, 0.1);
          transition: transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }
        .photo-marker-editorial:hover {
          transform: scale(1.1) rotate(-2deg);
          box-shadow: 8px 8px 0 0 rgba(150, 64, 66, 0.1);
        }
        .photo-frame-editorial {
          width: 52px;
          height: 52px;
          overflow: hidden;
          background: #e8e8e5;
        }
        .photo-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          filter: grayscale(0.2) sepia(0.1);
        }
        .cluster-marker-editorial {
          width: 40px;
          height: 40px;
          background: #faf9f6;
          border: 1px solid #476400;
          color: #476400;
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: system-ui, sans-serif;
          font-weight: 800;
          font-size: 14px;
          box-shadow: 4px 4px 0 0 rgba(71, 100, 0, 0.1);
        }
        .maplibre-popup-editorial .maplibregl-popup-content {
          padding: 0 !important;
          border-radius: 0 !important;
          background: #faf9f6 !important;
          border: 1px solid #476400 !important;
          box-shadow: 12px 12px 0 0 rgba(0, 0, 0, 0.05) !important;
        }
        .maplibre-popup-editorial .maplibregl-popup-close-button {
          color: #476400;
          font-size: 20px;
          padding: 4px 8px;
        }
        .maplibre-popup-editorial .maplibregl-popup-tip {
          border-top-color: #476400 !important;
        }
        .maplibregl-map {
          font-family: inherit;
        }
        .maplibregl-ctrl-bottom-right .maplibregl-ctrl {
          margin-bottom: 12px;
          margin-right: 12px;
        }
      `}</style>
    </div>
  );
}
