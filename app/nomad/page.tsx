import React from 'react';
import CaptureForm from './capture-form';

export default async function CaptureMemoryPage({ searchParams }: { searchParams: Promise<{ location?: string, lat?: string, lng?: string }> }) {
  const { location, lat, lng } = await searchParams;
  
  return (
    <main className="flex-1 md:ml-64 bg-nomad-background min-h-screen">
      <section className="max-w-7xl mx-auto px-8 md:px-16 py-12 md:py-20">
        
        {/* Editorial Header */}
        <div className="mb-16">
          <div className="flex items-center gap-4 mb-2">
            <span className="font-label text-nomad-secondary text-sm tracking-widest uppercase">Turkey Journal</span>
            <div className="h-[1px] flex-1 bg-nomad-outline-variant/20"></div>
          </div>
          <h1 className="font-headline text-6xl md:text-8xl text-nomad-on-surface leading-none tracking-tight font-black mb-4">Anı Yakala</h1>
          <p className="font-body text-lg text-nomad-on-surface-variant max-w-xl">
            Document the sights, sounds, and feelings of your journey. Turn a fleeting moment into a permanent artifact of your expedition.
          </p>
        </div>

        {/* Scrapbook Layout + Sidebar Module */}
        <div className="flex flex-col xl:flex-row gap-16 items-start">
          
          {/* Content Column (Functional Form) */}
          <CaptureForm initialLocation={location || ''} lat={lat} lng={lng} />

          {/* New Sidebar Module: Destinations to Visit */}
          <div className="w-full xl:w-80 flex flex-col gap-8 shrink-0">
            <div className="bg-nomad-surface-container-low border border-nomad-outline-variant/30 p-8 relative">
              <div className="absolute top-0 left-0 w-full h-full grain-overlay-nomad opacity-[0.02]"></div>
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-8 border-b border-nomad-outline/20 pb-4">
                  <h3 className="font-label text-xs uppercase tracking-[0.2em] text-nomad-secondary font-bold">Destinations to Visit</h3>
                  <span className="material-symbols-outlined text-nomad-secondary/40 text-sm" style={{fontVariationSettings: "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24"}}>push_pin</span>
                </div>
                
                <div className="space-y-8">
                  <div className="group cursor-pointer">
                    <div className="flex items-start justify-between mb-1">
                      <h4 className="font-headline text-2xl group-hover:text-nomad-primary transition-colors">Bodrum Peninsula</h4>
                      <span className="font-label text-[10px] text-nomad-outline-variant">UPCOMING</span>
                    </div>
                    <p className="font-body text-xs text-nomad-on-surface-variant/70 uppercase tracking-widest mb-3">Gidilecek Yerler</p>
                    <div className="flex items-center gap-2 text-nomad-outline-variant group-hover:text-nomad-secondary transition-colors">
                      <span className="material-symbols-outlined text-base" style={{fontVariationSettings: "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24"}}>schedule</span>
                      <span className="font-label text-[10px] tracking-wider italic">Week of Oct 12th</span>
                    </div>
                  </div>
                  
                  <div className="group cursor-pointer">
                    <div className="flex items-start justify-between mb-1">
                      <h4 className="font-headline text-2xl group-hover:text-nomad-primary transition-colors">Antalya Old Town</h4>
                      <span className="font-label text-[10px] text-nomad-outline-variant">PLANNED</span>
                    </div>
                    <p className="font-body text-xs text-nomad-on-surface-variant/70 uppercase tracking-widest mb-3">Kaleiçi</p>
                    <div className="flex items-center gap-2 text-nomad-outline-variant group-hover:text-nomad-secondary transition-colors">
                      <span className="material-symbols-outlined text-base" style={{fontVariationSettings: "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24"}}>schedule</span>
                      <span className="font-label text-[10px] tracking-wider italic">Week of Oct 20th</span>
                    </div>
                  </div>
                  
                  <div className="group cursor-pointer">
                    <div className="flex items-start justify-between mb-1 border-b border-dashed border-nomad-outline-variant/30 pb-4 w-full">
                      <h4 className="font-headline text-2xl text-nomad-outline-variant italic">Add Destination...</h4>
                      <span className="material-symbols-outlined text-nomad-outline-variant" style={{fontVariationSettings: "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24"}}>add_circle</span>
                    </div>
                  </div>
                </div>

                {/* Planner Aesthetic Element */}
                <div className="mt-12 pt-8 border-t border-nomad-outline-variant/20 flex flex-col gap-4">
                  <div className="flex items-center justify-between">
                    <span className="font-label text-[9px] uppercase tracking-widest text-nomad-outline-variant">Journal ID: 0924-TR</span>
                    <div className="w-2 h-2 rounded-full bg-nomad-primary/20"></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Notes / Planner Clip */}
            <div className="bg-[#ffca3f]/10 p-6 relative">
              <div className="absolute -top-3 left-6 w-8 h-8 bg-nomad-secondary-container rounded-sm transform rotate-12 flex items-center justify-center shadow-sm">
                <span className="material-symbols-outlined text-nomad-on-secondary-container text-sm" style={{fontVariationSettings: "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24"}}>sticky_note_2</span>
              </div>
              <p className="font-headline italic text-nomad-on-surface-variant/80 text-sm mt-2">
                "Don't forget to check the local market in Selçuk for the antique textiles."
              </p>
            </div>
          </div>
        </div>

        {/* Manifesto Block / Pull Quote */}
        <div className="mt-32 pt-20 border-t border-nomad-outline-variant/20">
          <div className="max-w-3xl mx-auto text-center">
            <span className="material-symbols-outlined text-4xl text-nomad-tertiary/40 mb-6" style={{fontVariationSettings: "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24"}}>format_quote</span>
            <blockquote className="font-headline text-4xl md:text-5xl text-nomad-on-surface italic leading-tight">
              "A memory is not what happened, but how we felt while it was happening."
            </blockquote>
            <div className="mt-8 flex items-center justify-center gap-4">
              <div className="w-12 h-[1px] bg-nomad-secondary"></div>
              <cite className="font-label text-xs uppercase tracking-[0.3em] text-nomad-secondary not-italic">The Traveler's Manifesto</cite>
              <div className="w-12 h-[1px] bg-nomad-secondary"></div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
