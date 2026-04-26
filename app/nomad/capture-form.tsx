"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";

const TURKEY_CENTER_LAT = 38.9637;
const TURKEY_CENTER_LNG = 35.2433;

function isGenericTurkeyCenter(lat: number, lng: number): boolean {
  return (
    Math.abs(lat - TURKEY_CENTER_LAT) < 0.02 && Math.abs(lng - TURKEY_CENTER_LNG) < 0.02
  );
}

/** Yer adına göre Türkiye içinde arama (haritadaki arama ile aynı kaynak). */
async function geocodeLocationName(query: string): Promise<{ lat: number; lng: number } | null> {
  const q = query.trim();
  if (!q) return null;
  try {
    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q)}&format=json&limit=1&countrycodes=tr`;
    const res = await fetch(url, {
      headers: { Accept: "application/json" },
    });
    if (!res.ok) return null;
    const data = await res.json();
    if (!Array.isArray(data) || data.length === 0) return null;
    const lat = parseFloat(data[0].lat);
    const lng = parseFloat(data[0].lon);
    if (Number.isNaN(lat) || Number.isNaN(lng)) return null;
    return { lat, lng };
  } catch {
    return null;
  }
}

interface CaptureFormProps {
  initialLocation: string;
  lat: string | undefined;
  lng: string | undefined;
}

export default function CaptureForm({ initialLocation, lat, lng }: CaptureFormProps) {
  const router = useRouter();
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [status, setStatus] = useState<'visited' | 'planned'>('visited');
  const [locationName, setLocationName] = useState(initialLocation);
  const [dateOfVisit, setDateOfVisit] = useState("");
  const [notes, setNotes] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSave = async () => {
    if (!locationName) return alert("Location Name is required");
    setIsSaving(true);

    try {
      let imageUrl = "";

      // 1. Upload photo if exists
      if (imageFile) {
        const formData = new FormData();
        formData.append("file", imageFile);
        const uploadRes = await fetch("/api/upload", { method: "POST", body: formData });
        const uploadData = await uploadRes.json();
        if (uploadData.success && uploadData.url) {
          imageUrl = uploadData.url;
        }
      }

      // 2. Konum: önce yazdığın yer adından coğrafi kodlama; olmazsa haritadan gelen pin
      const geo = await geocodeLocationName(locationName);
      let parsedLat: number;
      let parsedLng: number;

      if (geo) {
        parsedLat = geo.lat;
        parsedLng = geo.lng;
      } else {
        const fromLat = lat != null && lat !== "" ? parseFloat(lat.replace(",", ".")) : NaN;
        const fromLng = lng != null && lng !== "" ? parseFloat(lng.replace(",", ".")) : NaN;
        if (
          !Number.isNaN(fromLat) &&
          !Number.isNaN(fromLng) &&
          !isGenericTurkeyCenter(fromLat, fromLng)
        ) {
          parsedLat = fromLat;
          parsedLng = fromLng;
        } else {
          alert(
            "Bu yer adıyla haritada eşleşme bulunamadı. Daha net bir yer adı yazın veya /maps sayfasında arayıp listeden seçerek anı ekleyin."
          );
          setIsSaving(false);
          return;
        }
      }

      const locationData = {
        name: locationName,
        description: notes,
        lat: parsedLat,
        lng: parsedLng,
        category: "nomad-memory",
        status: status,
        image_url: imageUrl,
        min_zoom: 6
      };

      // 3. Save to database
      const saveRes = await fetch("/api/locations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(locationData)
      });
      
      const saveData = await saveRes.json();
      if (saveData.success) {
        const panel = status === "visited" ? "visited" : "planned";
        router.push(`/maps?panel=${panel}`);
      } else {
        alert("Failed to save memory.");
      }
    } catch (err) {
      console.error(err);
      alert("An error occurred.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex-1 w-full flex flex-col lg:flex-row gap-16 items-start">
      
      {/* Left Column: Polaroid Uploader */}
      <div className="w-full lg:w-5/12 sticky top-32">
        <div 
          className="bg-nomad-surface-container-lowest polaroid-frame p-6 pt-6 pb-20 rounded-none relative transform -rotate-1 hover:rotate-0 transition-transform duration-500 cursor-pointer group"
          onClick={() => fileInputRef.current?.click()}
        >
          <input 
            type="file" 
            accept="image/*" 
            className="hidden" 
            ref={fileInputRef} 
            onChange={handleFileChange} 
          />
          <div className="aspect-[4/5] bg-nomad-surface-container overflow-hidden relative group-hover:bg-nomad-surface-container-low transition-colors">
            {imagePreview ? (
              <img alt="Polaroid Memory" className="w-full h-full object-cover grayscale-[0.2] sepia-[0.1]" src={imagePreview} />
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-nomad-outline-variant group-hover:scale-110 transition-transform duration-300">
                 <span className="material-symbols-outlined text-4xl mb-3" style={{fontVariationSettings: "'FILL' 0, 'wght' 300"}}>add_photo_alternate</span>
                 <span className="font-label text-[10px] uppercase tracking-[0.2em] font-bold">Add Photo</span>
              </div>
            )}
            <div className="absolute inset-0 bg-nomad-primary/5 mix-blend-overlay pointer-events-none"></div>
            <div className="absolute inset-0 opacity-[0.08] grain-overlay-nomad pointer-events-none"></div>
          </div>
          
          <div className="absolute bottom-6 left-6 right-6 flex justify-between items-end border-t border-dashed border-nomad-outline-variant/30 pt-4">
            {imagePreview ? (
              <p className="font-headline italic text-nomad-on-surface/80 text-lg">New Memory</p>
            ) : (
              <p className="font-headline italic text-nomad-on-surface-variant/40 text-lg">Click to select...</p>
            )}
            <span className="material-symbols-outlined text-nomad-outline-variant" style={{fontVariationSettings: "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24"}}>photo_camera</span>
          </div>
          
          <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-24 h-8 bg-[#c8f17a]/30 backdrop-blur-sm transform rotate-2"></div>
        </div>
      </div>

      {/* Right Column: Form Fields */}
      <div className="w-full lg:w-7/12 flex flex-col gap-12">
        <div className="group">
          <label className="font-label text-xs uppercase tracking-widest text-nomad-secondary mb-3 block">Hedef Durumu / List Status</label>
          <div className="flex bg-nomad-surface-container p-1 rounded-none w-full xl:w-fit border border-nomad-outline/20">
            <label className="relative cursor-pointer flex-1 text-center">
              <input type="radio" name="status" value="visited" className="peer sr-only" checked={status === 'visited'} onChange={() => setStatus('visited')} />
              <div className="px-8 py-3 font-label text-xs uppercase tracking-[0.2em] text-nomad-on-surface-variant peer-checked:bg-[#FAF9F6] peer-checked:shadow-[2px_2px_0px_0px_rgba(71,100,0,0.2)] peer-checked:text-nomad-primary peer-checked:font-bold transition-all border border-transparent peer-checked:border-nomad-primary/20">
                Yaşanmış
              </div>
            </label>
            <label className="relative cursor-pointer flex-1 text-center">
              <input type="radio" name="status" value="planned" className="peer sr-only" checked={status === 'planned'} onChange={() => setStatus('planned')} />
              <div className="px-8 py-3 font-label text-xs uppercase tracking-[0.2em] text-nomad-on-surface-variant peer-checked:bg-[#FAF9F6] peer-checked:shadow-[2px_2px_0px_0px_rgba(115,87,0,0.2)] peer-checked:text-nomad-secondary peer-checked:font-bold transition-all border border-transparent peer-checked:border-nomad-secondary/20">
                Gezilecek
              </div>
            </label>
          </div>
        </div>

        <div className="group">
          <label className="font-label text-xs uppercase tracking-widest text-nomad-secondary mb-2 block">Location Name / Yer Adı</label>
          <input 
            className="w-full bg-transparent border-b border-nomad-outline/30 py-4 font-headline text-3xl focus:outline-none focus:border-nomad-primary transition-all placeholder:text-nomad-surface-container-high" 
            placeholder="e.g., Göreme Open Air Museum" 
            type="text" 
            value={locationName} 
            onChange={e => setLocationName(e.target.value)} 
          />
          <p className="font-body text-sm text-nomad-on-surface-variant/70 mt-3 max-w-xl leading-relaxed">
            Kaydederken bu ad Türkiye içinde aranıp konum otomatik bulunur. İstersen önce{" "}
            <button
              type="button"
              className="text-nomad-primary underline underline-offset-2 font-medium hover:text-nomad-secondary"
              onClick={() => router.push("/maps")}
            >
              haritada ara
            </button>
            , sonuçtan tıklayıp bu sayfayı pinli açabilirsin.
          </p>
        </div>
        
        <div className="group">
          <label className="font-label text-xs uppercase tracking-widest text-nomad-secondary mb-2 block">Date of Visit / Ziyaret Tarihi</label>
          <div className="flex items-center gap-4 border-b border-nomad-outline/30 py-4">
            <span className="material-symbols-outlined text-nomad-primary" style={{fontVariationSettings: "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24"}}>calendar_today</span>
            <input 
              className="w-full bg-transparent border-none p-0 font-body text-xl focus:outline-none focus:ring-0 placeholder:text-nomad-surface-container-high" 
              placeholder="Select Date" 
              type="text" 
              value={dateOfVisit}
              onChange={e => setDateOfVisit(e.target.value)}
            />
          </div>
        </div>
        
        <div className="group p-8 bg-nomad-tertiary-container/10 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full grain-overlay-nomad opacity-[0.05]"></div>
          <label className="font-label text-xs uppercase tracking-widest text-nomad-secondary mb-4 block relative z-10">Memory Details / Anı Notları</label>
          <textarea 
            className="w-full bg-transparent border-none p-0 font-body text-lg leading-relaxed focus:outline-none focus:ring-0 placeholder:text-nomad-outline-variant/40 relative z-10 resize-none" 
            placeholder="How did the wind feel? What did the air smell like? Write down the details that photos can't capture..." 
            rows={8}
            value={notes}
            onChange={e => setNotes(e.target.value)}
          ></textarea>
          
          <div className="absolute bottom-0 right-0 w-12 h-12 bg-nomad-tertiary-container/20 flex items-center justify-center">
            <span className="material-symbols-outlined text-nomad-tertiary text-lg" style={{fontVariationSettings: "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24"}}>edit_note</span>
          </div>
        </div>
        
        <div className="pt-8 flex items-center gap-8">
          <button onClick={handleSave} disabled={isSaving} className="relative group disabled:opacity-50">
            <div className="absolute -inset-1 bg-nomad-secondary-container opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="relative bg-nomad-tertiary text-nomad-on-tertiary px-10 py-5 rounded-none font-label uppercase tracking-[0.2em] text-sm flex items-center gap-3 hover:translate-y-[-4px] hover:translate-x-[4px] transition-all shadow-[4px_4px_0px_#5e161a]">
              <span>{isSaving ? "Saving..." : "Save Memory / Anıyı Kaydet"}</span>
              <span className="material-symbols-outlined" style={{fontVariationSettings: "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24"}}>book_5</span>
            </div>
          </button>
          <button className="font-label text-xs uppercase tracking-widest text-nomad-outline-variant hover:text-nomad-on-surface transition-colors" onClick={() => router.push('/maps')}>
            Discard Draft
          </button>
        </div>
      </div>
    </div>
  );
}
