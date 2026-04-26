import Link from 'next/link';
import { Compass, BookOpen, Map, Settings, Image as ImageIcon, MapPin, Calendar, User, Edit } from 'lucide-react';

export default function NomadLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-nomad-background text-nomad-on-surface font-body selection:bg-nomad-secondary-container selection:text-nomad-on-secondary-container relative w-full h-full min-h-screen">
      {/* Grain Overlay */}
      <div className="fixed inset-0 grain-overlay-nomad opacity-[0.03] z-[100] pointer-events-none"></div>

      {/* Navigation Shell: TopNavBar */}
      <header className="flex justify-between items-center w-full px-8 py-4 sticky top-0 z-50 bg-[#f7f6f3] dark:bg-stone-900 border-b border-[#2e2f2d]/20">
        <div className="flex items-center gap-8">
          <span className="text-2xl font-black text-[#476400] dark:text-[#8ea64b] font-headline uppercase tracking-tight">Nomad</span>
          <nav className="hidden md:flex items-center gap-6">
            <Link className="text-[#2e2f2d]/60 dark:text-stone-400 pb-1 font-headline uppercase tracking-tight hover:text-[#735700] transition-colors duration-200" href="/nomad">Explore</Link>
            <Link className="text-[#476400] dark:text-[#8ea64b] font-bold border-b-2 border-[#476400] pb-1 font-headline uppercase tracking-tight hover:text-[#735700] transition-colors duration-200" href="/nomad">Journal</Link>
            <Link className="text-[#2e2f2d]/60 dark:text-stone-400 pb-1 font-headline uppercase tracking-tight hover:text-[#735700] transition-colors duration-200" href="/nomad">Map</Link>
          </nav>
        </div>
        <div className="flex items-center gap-4">
          <User className="text-[#476400] dark:text-[#8ea64b] cursor-pointer h-6 w-6" />
        </div>
      </header>

      <div className="flex min-h-screen">
        {/* Navigation Shell: SideNavBar */}
        <aside className="fixed left-0 top-0 h-full flex-col p-6 z-40 bg-[#f7f6f3] dark:bg-stone-950 w-64 border-r border-[#2e2f2d]/20 hidden md:flex pt-24">
          <div className="mb-12">
            <p className="text-xl font-bold text-[#476400] dark:text-[#8ea64b] font-headline mb-1">The Nomad</p>
            <p className="font-body font-medium uppercase text-[10px] tracking-widest text-[#2e2f2d]/50">Turkey Expedition</p>
          </div>
          
          <nav className="flex flex-col gap-6">
            <Link href="/nomad" className="flex items-center gap-3 text-[#2e2f2d]/50 dark:text-stone-500 font-body font-medium uppercase text-xs tracking-widest hover:bg-[#735700]/10 hover:text-[#735700] transition-all cursor-pointer p-2">
              <MapPin className="h-5 w-5" />
              <span>Destinations</span>
            </Link>
            <Link href="/nomad" className="flex items-center gap-3 text-[#2e2f2d]/50 dark:text-stone-500 font-body font-medium uppercase text-xs tracking-widest hover:bg-[#735700]/10 hover:text-[#735700] transition-all cursor-pointer p-2">
              <Calendar className="h-5 w-5" />
              <span>Itinerary</span>
            </Link>
            <Link href="/nomad" className="flex items-center gap-3 text-[#476400] dark:text-[#8ea64b] font-black underline decoration-2 underline-offset-4 font-body font-medium uppercase text-xs tracking-widest p-2">
              <BookOpen className="h-5 w-5" />
              <span>Journal</span>
            </Link>
            <Link href="/nomad" className="flex items-center gap-3 text-[#2e2f2d]/50 dark:text-stone-500 font-body font-medium uppercase text-xs tracking-widest hover:bg-[#735700]/10 hover:text-[#735700] transition-all cursor-pointer p-2">
              <ImageIcon className="h-5 w-5" />
              <span>Gallery</span>
            </Link>
            <Link href="/nomad" className="flex items-center gap-3 text-[#2e2f2d]/50 dark:text-stone-500 font-body font-medium uppercase text-xs tracking-widest hover:bg-[#735700]/10 hover:text-[#735700] transition-all cursor-pointer p-2 mt-12">
              <Settings className="h-5 w-5" />
              <span>Settings</span>
            </Link>
          </nav>
          
          <button className="mt-auto bg-nomad-primary text-nomad-on-primary rounded-none px-6 py-3 font-label uppercase tracking-widest text-xs hover:translate-x-1 hover:translate-y-[-2px] transition-all active:translate-y-0.5">
            New Entry
          </button>
        </aside>

        {/* Main Content Area */}
        {children}
      </div>

      {/* Mobile Bottom Navigation */}
      <footer className="md:hidden fixed bottom-0 left-0 right-0 bg-[#f7f6f3] border-t border-[#2e2f2d]/10 px-6 py-4 flex justify-between items-center z-50">
        <div className="flex flex-col items-center gap-1 text-[#476400]">
          <Compass className="h-5 w-5" />
          <span className="text-[10px] font-label uppercase">Explore</span>
        </div>
        <div className="flex flex-col items-center gap-1 text-[#476400] font-bold">
          <Edit className="h-5 w-5" />
          <span className="text-[10px] font-label uppercase border-b border-nomad-primary">Capture</span>
        </div>
        <div className="flex flex-col items-center gap-1 text-[#2e2f2d]/60">
          <Map className="h-5 w-5" />
          <span className="text-[10px] font-label uppercase">Map</span>
        </div>
        <div className="flex flex-col items-center gap-1 text-[#2e2f2d]/60">
          <User className="h-5 w-5" />
          <span className="text-[10px] font-label uppercase">Profile</span>
        </div>
      </footer>
    </div>
  );
}
