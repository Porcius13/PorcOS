"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useState, useEffect, useCallback, useMemo, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Map as MapIcon, Plus, Quote, Sun, BookOpen, Navigation, Maximize, Minimize, MapPin, Pencil, Trash2 } from "lucide-react";
import type { MapLocation } from "@/lib/maps-types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";

// Load the map component without SSR
const TurkeyMapFallback = () => (
  <div className="w-full h-[600px] bg-[#e8e8e5] flex flex-col items-center justify-center border border-neutral-200/50 animate-pulse rounded-none">
    <MapIcon className="w-12 h-12 text-neutral-400 mb-4" />
    <span className="text-neutral-500 font-label text-xs uppercase tracking-widest">Harita Yükleniyor...</span>
  </div>
);

const TurkeyMap = dynamic(() => import("@/components/maps/TurkeyMap"), {
  ssr: false,
  loading: TurkeyMapFallback,
});

function MapsPageContent() {
  const searchParams = useSearchParams();
  const [isExpanded, setIsExpanded] = useState(false);
  const [activePanel, setActivePanel] = useState<'planned' | 'visited'>('planned');
  const [mapLocations, setMapLocations] = useState<MapLocation[]>([]);
  const [listLoading, setListLoading] = useState(true);
  const [editingLocation, setEditingLocation] = useState<MapLocation | null>(null);
  const [editForm, setEditForm] = useState({
    name: "",
    description: "",
    lat: "",
    lng: "",
    status: "visited" as "visited" | "planned",
    image_url: "",
    category: "",
  });
  const [savingEdit, setSavingEdit] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const refreshLocations = useCallback(async () => {
    try {
      const res = await fetch("/api/locations");
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        setMapLocations(json.data);
      }
    } catch (e) {
      console.error("Locations fetch error:", e);
    } finally {
      setListLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshLocations();
  }, [refreshLocations]);

  useEffect(() => {
    const panel = searchParams.get("panel");
    if (panel === "visited" || panel === "planned") {
      setActivePanel(panel);
    }
  }, [searchParams]);

  const dashboardPlaces = useMemo(() => {
    return mapLocations.filter((loc) =>
      activePanel === "planned" ? loc.status !== "visited" : loc.status === "visited"
    );
  }, [mapLocations, activePanel]);

  const visitedCount = useMemo(
    () => mapLocations.filter((l) => l.status === "visited").length,
    [mapLocations]
  );

  useEffect(() => {
    if (!editingLocation) return;
    const plannedish = editingLocation.status === "visited" ? false : true;
    setEditForm({
      name: editingLocation.name,
      description: editingLocation.description || "",
      lat: String(editingLocation.lat),
      lng: String(editingLocation.lng),
      status: plannedish ? "planned" : "visited",
      image_url: editingLocation.image_url || "",
      category: editingLocation.category || "",
    });
  }, [editingLocation]);

  const handleSaveEdit = async () => {
    if (!editingLocation) return;
    const lat = parseFloat(editForm.lat.replace(",", "."));
    const lng = parseFloat(editForm.lng.replace(",", "."));
    if (!editForm.name.trim() || Number.isNaN(lat) || Number.isNaN(lng)) {
      alert("Yer adı ve geçerli koordinatlar gerekli.");
      return;
    }
    setSavingEdit(true);
    try {
      const res = await fetch("/api/locations", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: editingLocation.id,
          name: editForm.name.trim(),
          description: editForm.description,
          lat,
          lng,
          category: editForm.category.trim() || editingLocation.category || "general",
          min_zoom: editingLocation.min_zoom ?? 6,
          status: editForm.status === "visited" ? "visited" : "planned",
          image_url: editForm.image_url.trim(),
        }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        alert(typeof json.error === "string" ? json.error : "Kaydedilemedi.");
        return;
      }
      setEditingLocation(null);
      await refreshLocations();
    } catch (e) {
      console.error(e);
      alert("Kaydedilemedi.");
    } finally {
      setSavingEdit(false);
    }
  };

  const handleDeleteLocation = async (loc: MapLocation) => {
    if (!confirm(`“${loc.name}” silinsin mi? Bu işlem geri alınamaz.`)) return;
    setDeletingId(loc.id);
    try {
      const res = await fetch(`/api/locations?id=${loc.id}`, { method: "DELETE" });
      const json = await res.json();
      if (!res.ok || !json.success) {
        alert(typeof json.error === "string" ? json.error : "Silinemedi.");
        return;
      }
      if (editingLocation?.id === loc.id) setEditingLocation(null);
      await refreshLocations();
    } catch (e) {
      console.error(e);
      alert("Silinemedi.");
    } finally {
      setDeletingId(null);
    }
  };

  const placeholderImg =
    "https://placehold.co/640x400/476400/ddff9b?text=Anı";

  const btnActive = "bg-[#476400] hover:bg-[#304600] text-[#ddff9b] rounded-none px-8 py-6 font-label text-xs uppercase tracking-widest font-bold offset-card-shadow transition-all hover:-translate-y-1 hover:translate-x-1";
  const btnGhost = "bg-transparent text-[#476400] hover:bg-[#476400]/5 hover:text-[#304600] rounded-none px-8 py-6 font-label text-xs uppercase tracking-widest font-bold border border-transparent transition-all";

  return (
    <div className="min-h-screen bg-[#FAF9F6] text-[#2e2f2d] selection:bg-[#c8f17a] selection:text-[#3f5a00] grain-overlay pb-24">
      {/* Editorial Header / Hero */}
      <section className="px-4 md:px-8 py-16 lg:px-16 max-w-7xl mx-auto transition-all duration-700 ease-in-out">
        <div className={`flex flex-col lg:flex-row items-start transition-all duration-700 ease-in-out ${isExpanded ? 'gap-0' : 'gap-16'}`}>
          <div className={`transition-all duration-700 ease-in-out flex flex-col justify-center overflow-hidden ${isExpanded ? 'lg:w-0 lg:opacity-0 h-0 lg:h-auto m-0 p-0' : 'flex-1 space-y-8 opacity-100'}`}>
            <div className="flex items-center gap-3">
               <span className="w-12 h-[1px] bg-[#476400]"></span>
               <span className="font-label text-[#735700] uppercase tracking-[0.3em] text-[10px] font-bold">
                 {activePanel === 'planned' ? "Current Expedition" : "Experienced Journeys"}
               </span>
            </div>
            
            <h1 className="font-headline text-7xl lg:text-8xl font-extrabold text-[#2e2f2d] leading-[0.9] tracking-tighter">
              {activePanel === 'planned' ? (
                <>The Anatolian <br/> <span className="italic text-[#476400]">Chronicles</span></>
              ) : (
                <>The Anatolian <br/> <span className="italic text-[#873537]">Memories</span></>
              )}
            </h1>
            
            <p className="font-body text-xl text-neutral-600 max-w-xl leading-relaxed">
              {activePanel === 'planned' 
                ? "Tracing the silk routes through the heart of the Ottoman legacy. A visual diary of dust, limestone, and the eternal Aegean blue."
                : "A collection of moments frozen in time. Revisiting the footsteps of past expeditions and discoveries across the ancient lands."}
            </p>
            
            <div className="flex items-center gap-4 pt-4">
               <Button 
                onClick={() => setActivePanel('planned')} 
                className={activePanel === 'planned' ? btnActive : btnGhost}>
                  Gezilecek Yerler
               </Button>
               <Button 
                onClick={() => setActivePanel('visited')} 
                className={activePanel === 'visited' ? btnActive : btnGhost}>
                  Yaşanmış
               </Button>
            </div>
          </div>

          {/* Interactive Map Wrapper */}
          <div className={`transition-all duration-700 ease-in-out bg-[#e8e8e5] p-2 offset-card-shadow border border-neutral-200 overflow-hidden relative ${isExpanded ? 'w-full h-[700px]' : 'w-full lg:w-[600px] h-[500px]'}`}>
             <Button 
               variant="ghost" 
               size="icon"
               onClick={() => setIsExpanded(!isExpanded)}
               className="absolute bottom-4 left-4 z-[2000] bg-white border border-[#476400] text-[#476400] rounded-none hover:bg-[#e8e8e5] w-10 h-10 shadow-sm transition-transform hover:scale-110"
             >
               {isExpanded ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
             </Button>
            <div className="w-full h-full relative z-10 transition-all duration-700">
              <TurkeyMap
                activePanel={activePanel}
                locations={mapLocations}
                onLocationsRefresh={refreshLocations}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Dashboard: same filter as map (no zoom gate — list everything in this tab) */}
      <section className="px-4 md:px-8 py-16 lg:px-16 max-w-7xl mx-auto border-t border-[#476400]/15">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6 mb-12">
          <div>
            <span className="font-label text-[10px] uppercase tracking-[0.35em] text-[#735700] font-bold block mb-2">
              {activePanel === "planned" ? "Rota defteri" : "Anı panosu"}
            </span>
            <h2 className="font-headline text-3xl md:text-4xl font-bold text-[#2e2f2d] tracking-tight">
              {activePanel === "planned" ? "Gezilecek yerler" : "Yaşanmış anlar"}
            </h2>
            <p className="font-body text-sm text-neutral-600 mt-2 max-w-lg">
              Haritadaki işaretlerle aynı liste. Sekmeyi değiştirince içerik güncellenir.
            </p>
          </div>
          <div className="font-label text-xs uppercase tracking-widest text-[#476400] font-black tabular-nums">
            {listLoading ? "…" : `${dashboardPlaces.length} kayıt`}
          </div>
        </div>

        {listLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-72 bg-neutral-200/80 animate-pulse border border-neutral-200 rounded-none"
              />
            ))}
          </div>
        ) : dashboardPlaces.length === 0 ? (
          <div className="border border-dashed border-[#476400]/30 bg-[#FAF9F6] p-12 text-center">
            <MapPin className="w-10 h-10 text-[#476400]/40 mx-auto mb-4" />
            <p className="font-headline text-xl text-[#2e2f2d] mb-2">
              Henüz kayıt yok
            </p>
            <p className="font-body text-sm text-neutral-600 max-w-md mx-auto mb-6">
              {activePanel === "visited"
                ? "Yaşanmış bir anı eklemek için sağ alttaki + ile anı formunu aç."
                : "Haritadan yeni bir keşif ekleyin veya gezilecek olarak anı kaydedin."}
            </p>
            <Link
              href="/nomad"
              className="inline-flex items-center justify-center bg-[#476400] hover:bg-[#304600] text-[#ddff9b] rounded-none font-label text-[10px] uppercase tracking-widest px-6 py-3 transition-colors"
            >
              Anı ekle
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {dashboardPlaces.map((loc) => (
              <Card
                key={loc.id}
                className="group overflow-hidden rounded-none border border-[#476400]/20 bg-[#FAF9F6] shadow-[4px_4px_0_0_rgba(71,100,0,0.08)] transition-all hover:-translate-y-0.5 hover:shadow-[6px_6px_0_0_rgba(71,100,0,0.12)]"
              >
                <div className="relative aspect-[16/10] overflow-hidden bg-neutral-200">
                  <img
                    src={loc.image_url?.trim() || placeholderImg}
                    alt=""
                    className="h-full w-full object-cover grayscale-[0.15] sepia-[0.08] transition-transform duration-500 group-hover:scale-[1.03]"
                  />
                  <div className="absolute top-3 left-3">
                    <Badge
                      className={`rounded-none border-none font-label text-[8px] uppercase tracking-widest px-2 py-0.5 ${
                        loc.status === "visited"
                          ? "bg-[#873537] text-[#FAF9F6]"
                          : "bg-[#476400] text-[#ddff9b]"
                      }`}
                    >
                      {loc.status === "visited" ? "Yaşanmış" : "Plan"}
                    </Badge>
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="font-headline text-xl font-bold text-[#2e2f2d] mb-2 line-clamp-2">
                    {loc.name}
                  </h3>
                  {loc.description ? (
                    <p className="font-body text-sm text-neutral-600 leading-relaxed line-clamp-4 mb-4">
                      {loc.description}
                    </p>
                  ) : (
                    <p className="font-body text-sm text-neutral-400 italic mb-4">
                      Not eklenmemiş.
                    </p>
                  )}
                  <div className="flex gap-2 mb-4">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="flex-1 rounded-none border-[#476400]/35 text-[#476400] hover:bg-[#476400]/10 font-label text-[9px] uppercase tracking-widest h-9"
                      onClick={() => setEditingLocation(loc)}
                    >
                      <Pencil className="w-3.5 h-3.5 mr-1.5 shrink-0" />
                      Düzenle
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="rounded-none border-[#873537]/35 text-[#873537] hover:bg-[#873537]/10 font-label text-[9px] uppercase tracking-widest h-9 px-3"
                      onClick={() => handleDeleteLocation(loc)}
                      disabled={deletingId === loc.id}
                    >
                      <Trash2 className="w-3.5 h-3.5 mr-1.5 shrink-0" />
                      {deletingId === loc.id ? "…" : "Sil"}
                    </Button>
                  </div>
                  <div className="flex items-center justify-between gap-3 pt-2 border-t border-neutral-200/80">
                    <span className="font-label text-[9px] uppercase tracking-widest text-neutral-400 truncate">
                      {loc.lat.toFixed(3)}, {loc.lng.toFixed(3)}
                    </span>
                    {loc.category ? (
                      <span className="font-label text-[9px] uppercase tracking-widest text-[#476400] shrink-0">
                        {loc.category}
                      </span>
                    ) : null}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </section>

      {/* Manifesto Block */}
      <section className="px-4 md:px-8 py-16 lg:px-16 max-w-5xl mx-auto">
        <div className="bg-[#FAF9F6] p-16 lg:p-24 relative grain-overlay border border-neutral-200 shadow-sm overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-[#476400]"></div>
          <div className="max-w-2xl mx-auto text-center space-y-10">
            <Quote className="w-16 h-16 text-[#964042] mx-auto opacity-40 italic" fill="currentColor" />
            <blockquote className="font-headline text-5xl lg:text-6xl font-bold text-[#2e2f2d] leading-tight italic tracking-tight">
              "To travel is to discover that everyone is wrong about other countries."
            </blockquote>
            <p className="font-label text-[10px] uppercase tracking-[0.4em] text-[#873537] font-black">— Aldous Huxley, 1925 Travelogues</p>
          </div>
          <div className="absolute bottom-6 right-6 w-16 h-16 border-b-2 border-r-2 border-[#476400]/20"></div>
          <div className="absolute top-6 left-6 w-16 h-16 border-t-2 border-l-2 border-[#476400]/20"></div>
        </div>
      </section>

      {/* Bento Stats Grid */}
      <section className="px-4 md:px-8 py-8 lg:px-16 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 h-auto md:h-[500px]">
          {/* Ritual of Cay */}
          <div className="md:col-span-2 md:row-span-2 relative group overflow-hidden bg-neutral-200 offset-card-shadow border border-neutral-200">
             <img src="https://images.unsplash.com/photo-1540632742087-43ca6869408e?q=80&w=800" alt="Tea" className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110 grayscale-[0.3]" />
             <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
             <div className="absolute bottom-10 left-10 p-8 bg-white/95 backdrop-blur-md border border-neutral-200 max-w-[80%]">
                <h4 className="font-headline text-4xl font-bold mb-2">The Ritual of Çay</h4>
                <p className="font-body text-sm text-neutral-600 mb-5">Finding stillness in the bustle of the Grand Bazaar.</p>
                <span className="font-label text-[10px] uppercase tracking-widest text-[#476400] font-black border-b-2 border-[#476400] pb-1">Read Entry</span>
             </div>
          </div>

          {/* Next Destination */}
          <div className="md:col-span-2 bg-[#476400] p-12 flex flex-col justify-center text-center text-[#ddff9b] offset-card-shadow border border-[#304600]/20 relative overflow-hidden group">
             <div className="absolute -right-10 -top-10 opacity-10 group-hover:rotate-12 transition-transform duration-1000">
                <Navigation className="w-48 h-48" />
             </div>
             <h4 className="font-headline text-5xl font-bold italic mb-4">Next: Ephesus</h4>
             <p className="font-label text-xs uppercase tracking-[0.3em] font-black opacity-70">Estimated Arrival: 48 Hours</p>
          </div>

          {/* Weather */}
          <div className="bg-[#f1f1ee] p-8 flex flex-col items-center justify-center text-center border border-neutral-200 group hover:bg-[#ffca3f] transition-all duration-500 shadow-sm">
             <Sun className="w-12 h-12 text-[#476400] mb-4 group-hover:rotate-45 transition-transform duration-700" />
             <span className="font-headline text-4xl font-black">28°C</span>
             <span className="font-label text-[10px] uppercase tracking-widest text-neutral-400 group-hover:text-[#476400] font-bold">Istanbul Sky</span>
          </div>

          {/* Entries Logged */}
          <div className="bg-[#f1f1ee] p-8 flex flex-col items-center justify-center text-center border border-neutral-200 group hover:bg-[#964042] transition-all duration-500 shadow-sm">
             <BookOpen className="w-12 h-12 text-[#476400] mb-4 group-hover:text-white" />
             <span className="font-headline text-4xl font-black group-hover:text-white">{visitedCount}</span>
             <span className="font-label text-[10px] uppercase tracking-widest text-neutral-400 group-hover:text-white/60 font-bold">Entries Logged</span>
          </div>
        </div>
      </section>

      <Dialog
        open={editingLocation !== null}
        onOpenChange={(open) => {
          if (!open) setEditingLocation(null);
        }}
      >
        <DialogContent className="max-w-md rounded-none border-[#476400] bg-[#FAF9F6] p-0 gap-0 shadow-[8px_8px_0_0_rgba(71,100,0,0.12)]">
          <DialogClose onClose={() => setEditingLocation(null)} />
          <DialogHeader className="p-6 pb-4 border-b border-[#476400]/15">
            <DialogTitle className="font-headline text-xl text-[#2e2f2d]">
              Kaydı düzenle
            </DialogTitle>
            <p className="font-body text-sm text-neutral-600 font-normal pt-1">
              Yer adı, not, durum ve görsel adresini güncelleyebilirsin.
            </p>
          </DialogHeader>
          <div className="p-6 space-y-4 max-h-[min(70vh,520px)] overflow-y-auto">
            <div className="space-y-2">
              <Label className="font-label text-[10px] uppercase tracking-widest text-[#476400]">
                Yer adı
              </Label>
              <Input
                value={editForm.name}
                onChange={(e) => setEditForm((f) => ({ ...f, name: e.target.value }))}
                className="rounded-none border-[#476400]/25"
              />
            </div>
            <div className="space-y-2">
              <Label className="font-label text-[10px] uppercase tracking-widest text-[#476400]">
                Not
              </Label>
              <textarea
                value={editForm.description}
                onChange={(e) => setEditForm((f) => ({ ...f, description: e.target.value }))}
                rows={4}
                className="w-full resize-y border border-[#476400]/25 bg-transparent px-3 py-2 text-sm font-body rounded-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#476400]/30"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label className="font-label text-[10px] uppercase tracking-widest text-[#476400]">
                  Enlem
                </Label>
                <Input
                  value={editForm.lat}
                  onChange={(e) => setEditForm((f) => ({ ...f, lat: e.target.value }))}
                  className="rounded-none border-[#476400]/25 font-mono text-sm"
                />
              </div>
              <div className="space-y-2">
                <Label className="font-label text-[10px] uppercase tracking-widest text-[#476400]">
                  Boylam
                </Label>
                <Input
                  value={editForm.lng}
                  onChange={(e) => setEditForm((f) => ({ ...f, lng: e.target.value }))}
                  className="rounded-none border-[#476400]/25 font-mono text-sm"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="font-label text-[10px] uppercase tracking-widest text-[#476400]">
                Liste durumu
              </Label>
              <div className="flex border border-[#476400]/25 rounded-none p-0.5 bg-neutral-100/80">
                <button
                  type="button"
                  onClick={() => setEditForm((f) => ({ ...f, status: "visited" }))}
                  className={`flex-1 py-2 font-label text-[9px] uppercase tracking-widest transition-colors ${
                    editForm.status === "visited"
                      ? "bg-[#873537] text-[#FAF9F6]"
                      : "text-neutral-600 hover:bg-white/80"
                  }`}
                >
                  Yaşanmış
                </button>
                <button
                  type="button"
                  onClick={() => setEditForm((f) => ({ ...f, status: "planned" }))}
                  className={`flex-1 py-2 font-label text-[9px] uppercase tracking-widest transition-colors ${
                    editForm.status === "planned"
                      ? "bg-[#476400] text-[#ddff9b]"
                      : "text-neutral-600 hover:bg-white/80"
                  }`}
                >
                  Gezilecek
                </button>
              </div>
            </div>
            <div className="space-y-2">
              <Label className="font-label text-[10px] uppercase tracking-widest text-[#476400]">
                Kategori
              </Label>
              <Input
                value={editForm.category}
                onChange={(e) => setEditForm((f) => ({ ...f, category: e.target.value }))}
                placeholder="ör. historical, nomad-memory"
                className="rounded-none border-[#476400]/25 text-sm"
              />
            </div>
            <div className="space-y-2">
              <Label className="font-label text-[10px] uppercase tracking-widest text-[#476400]">
                Görsel URL
              </Label>
              <Input
                value={editForm.image_url}
                onChange={(e) => setEditForm((f) => ({ ...f, image_url: e.target.value }))}
                placeholder="https://…"
                className="rounded-none border-[#476400]/25 text-xs"
              />
              <p className="font-body text-[11px] text-neutral-500">
                Kırık görsel için geçerli bir adres yapıştırabilirsin.
              </p>
            </div>
          </div>
          <div className="flex gap-2 p-6 pt-0 border-t border-[#476400]/10">
            <Button
              type="button"
              variant="outline"
              className="flex-1 rounded-none border-neutral-300"
              onClick={() => setEditingLocation(null)}
              disabled={savingEdit}
            >
              Vazgeç
            </Button>
            <Button
              type="button"
              className="flex-1 rounded-none bg-[#476400] hover:bg-[#304600] text-[#ddff9b] font-label text-[10px] uppercase tracking-widest"
              onClick={handleSaveEdit}
              disabled={savingEdit}
            >
              {savingEdit ? "Kaydediliyor…" : "Kaydet"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Floating Add Button */}
      <div className="fixed bottom-6 right-6 md:bottom-12 md:right-12 z-[2000]">
         <Link href="/nomad">
           <Button className="w-16 h-16 bg-[#476400] text-[#ddff9b] rounded-none hover:-translate-y-1 hover:translate-x-1 transition-all duration-200 offset-card-shadow flex items-center justify-center p-0">
              <Plus className="w-8 h-8" />
           </Button>
         </Link>
      </div>

      <style jsx global>{`
        .maplibregl-map {
          border-radius: 0 !important;
        }
      `}</style>
    </div>
  );
}

export default function MapsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#FAF9F6] flex items-center justify-center font-label text-xs uppercase tracking-widest text-neutral-500">Harita yükleniyor…</div>}>
      <MapsPageContent />
    </Suspense>
  );
}
