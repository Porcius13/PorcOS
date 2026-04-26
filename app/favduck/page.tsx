"use client";

import React, { useState, useEffect } from "react";
import { Search, Loader2, ArrowRight, TrendingDown, FolderHeart, TrendingUp, LayoutGrid, List, Filter, ChevronDown, CheckCircle2 } from "lucide-react";
import { ProductCard } from "@/components/favduck/ProductCard";
import type { Product, ScrapedData } from "@/lib/favduck/types";

export default function FavDuckPage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [urlInput, setUrlInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");
    const [isInitialized, setIsInitialized] = useState(false);
    
    // View States replicating the UI
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [filter, setFilter] = useState<'all' | 'in_stock' | 'deals'>('all');

    // Load from local storage
    useEffect(() => {
        const stored = localStorage.getItem("favduck-state");
        if (stored) {
            try {
                const parsed = JSON.parse(stored);
                setProducts(Array.isArray(parsed) ? parsed : []);
            } catch (e) {
                console.error("Local storage load failed", e);
            }
        }
        setIsInitialized(true);
    }, []);

    // Save to local storage
    useEffect(() => {
        if (isInitialized) {
            localStorage.setItem("favduck-state", JSON.stringify(products));
        }
    }, [products, isInitialized]);

    const handleScrape = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrorMsg("");

        let urlToScrape = urlInput.trim();
        if (!urlToScrape) return;

        if (!/^https?:\/\//i.test(urlToScrape)) {
            urlToScrape = "https://" + urlToScrape;
        }

        setIsLoading(true);

        try {
            const res = await fetch("/api/favduck/scrape", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ url: urlToScrape })
            });

            const result = await res.json();

            if (!res.ok || !result.success) {
                throw new Error(result.error || "Sunucu hatası");
            }

            const data: ScrapedData = result.data;

            const newProduct: Product = {
                id: crypto.randomUUID(),
                userId: "local",
                url: urlToScrape,
                title: data.title,
                image: data.image,
                price: data.price,
                currency: data.currency || "TRY",
                inStock: data.inStock,
                source: new URL(urlToScrape).hostname.replace('www.', ''),
                createdAt: new Date().toISOString()
            };

            setProducts([newProduct, ...products]);
            setUrlInput("");

        } catch (error: any) {
            console.error("Scrape error:", error);
            setErrorMsg(error.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = (id: string) => {
        setProducts(products.filter(p => p.id !== id));
    };

    const handleToggleFavorite = (id: string) => {
        setProducts(products.map(p => p.id === id ? { ...p, isFavorite: !p.isFavorite } : p));
    };

    return (
        <div className="min-h-screen bg-[#0E0E10] text-gray-100 font-sans relative overflow-x-hidden transition-colors duration-300">
            {/* Minimal Header Space to respect AppShell */}
            <div className="py-6 px-4 md:px-12 pb-0">
                {/* Input Bar (Centralized like in the navbar from the image) */}
                <form onSubmit={handleScrape} className="relative w-full max-w-3xl mb-12">
                     <span className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500 font-light">+</span>
                    <input 
                        type="url"
                        value={urlInput}
                        onChange={(e) => setUrlInput(e.target.value)}
                        placeholder="Paste a product link to track..."
                        className="w-full h-12 bg-[#18181B] border border-white/5 rounded-full pl-10 pr-24 text-sm font-medium text-white placeholder:text-neutral-500 outline-none focus:border-white/20 transition-all shadow-sm focus:bg-[#202024]"
                        disabled={isLoading}
                    />
                    <button 
                        type="submit"
                        disabled={isLoading || !urlInput.trim()}
                        className="absolute right-2 top-1.5 bottom-1.5 px-3 bg-[#27272A] text-neutral-300 rounded-[10px] text-[10px] font-bold tracking-widest uppercase border border-white/5 flex items-center justify-center hover:bg-white hover:text-black transition-colors disabled:opacity-50 disabled:hover:bg-[#27272A] disabled:hover:text-neutral-300"
                    >
                        {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Enter"}
                    </button>
                    {errorMsg && (
                        <p className="absolute -bottom-6 left-6 text-xs font-bold text-red-500">{errorMsg}</p>
                    )}
                </form>

                {/* Statistics Overview - Pill Shaped Boxes */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
                    {/* Kazanç Box - Dark Green Fill */}
                    <div className="bg-[#051A10] border border-[#0D3820] rounded-[32px] px-6 py-4 flex items-center justify-between transition-all">
                        <div>
                            <p className="text-[10px] font-bold text-green-500/70 mb-1 uppercase tracking-widest">Kazanç</p>
                            <p className="text-2xl font-black text-green-500 tracking-tight leading-none">
                                ₺0,00
                            </p>
                        </div>
                        <div className="w-10 h-10 rounded-full bg-[#0D3820]/50 flex items-center justify-center text-green-500">
                            <TrendingDown size={18} />
                        </div>
                    </div>

                    {/* Favoriler Box - Dark Pill */}
                    <div className="bg-[#121214] border border-white/10 rounded-[32px] px-6 py-4 flex items-center justify-between transition-all hover:border-white/20">
                        <div>
                            <p className="text-[10px] font-bold text-neutral-500 mb-1 uppercase tracking-widest">Favoriler</p>
                            <p className="text-2xl font-black text-white tracking-tight leading-none">
                                {products.filter(p => p.isFavorite).length}
                            </p>
                        </div>
                        <div className="w-10 h-10 rounded-full flex items-center justify-center text-neutral-400">
                            <FolderHeart size={18} />
                        </div>
                    </div>

                    {/* İndirimde Box - Dark Pill */}
                    <div className="bg-[#121214] border border-white/10 rounded-[32px] px-6 py-4 flex items-center justify-between transition-all hover:border-white/20">
                        <div>
                            <p className="text-[10px] font-bold text-neutral-500 mb-1 uppercase tracking-widest">İndirimde</p>
                            <p className="text-2xl font-black text-white tracking-tight leading-none">
                                0
                            </p>
                        </div>
                        <div className="w-10 h-10 rounded-full flex items-center justify-center text-neutral-400">
                            <TrendingUp size={18} />
                        </div>
                    </div>

                    {/* Toplam Box - Dark Pill */}
                    <div className="bg-[#121214] border border-white/10 rounded-[32px] px-6 py-4 flex items-center justify-between transition-all hover:border-white/20">
                        <div>
                            <p className="text-[10px] font-bold text-neutral-500 mb-1 uppercase tracking-widest">Toplam</p>
                            <p className="text-2xl font-black text-white tracking-tight leading-none">
                                {products.length}
                            </p>
                        </div>
                        <div className="w-10 h-10 rounded-full flex items-center justify-center text-neutral-400">
                            <LayoutGrid size={18} />
                        </div>
                    </div>
                </div>

                {/* Header Section & Mega Filter Bar */}
                <div className="mb-8">
                    <h2 className="text-[28px] font-black text-white tracking-tight leading-none mb-2">All Items</h2>
                    <p className="text-neutral-400 text-sm mb-6 max-w-sm">Track prices and stock status in real-time.</p>

                    {/* MEGA FILTER BAR (Matches the pill-in-pill exact UI) */}
                    <div className="w-full bg-[#121214] border border-white/5 rounded-[40px] flex flex-col xl:flex-row items-center justify-between p-2 gap-4">
                        
                        {/* Left Side: Layout Toggles + Filters */}
                        <div className="flex items-center gap-2 overflow-x-auto w-full xl:w-auto scrollbar-hide px-2">
                            {/* View Toggle Block */}
                            <div className="flex bg-[#1E1E22] rounded-full p-1 border border-white/5 shrink-0">
                                <button
                                    onClick={() => setViewMode('grid')}
                                    className={`p-2 rounded-full transition-all ${viewMode === 'grid' ? 'bg-white text-black shadow-sm' : 'text-neutral-500 hover:text-white'}`}
                                >
                                    <LayoutGrid size={16} />
                                </button>
                                <button
                                    onClick={() => setViewMode('list')}
                                    className={`p-2 rounded-full transition-all ${viewMode === 'list' ? 'bg-white text-black shadow-sm' : 'text-neutral-500 hover:text-white'}`}
                                >
                                    <List size={16} />
                                </button>
                            </div>

                            <div className="w-px h-6 bg-white/10 mx-2 shrink-0"></div>

                            {/* Status Filters */}
                            <div className="flex gap-2 shrink-0">
                                <button
                                    onClick={() => setFilter('all')}
                                    className={`px-5 py-2 rounded-full text-sm font-semibold transition-all ${filter === 'all'
                                        ? 'bg-[#C4A1FF] text-black' 
                                        : 'text-neutral-400 hover:bg-[#1E1E22] hover:text-white'}`}
                                >
                                    All
                                </button>
                                <button
                                    onClick={() => setFilter('in_stock')}
                                    className={`px-5 py-2 rounded-full text-sm font-semibold transition-all ${filter === 'in_stock'
                                        ? 'bg-[#C4A1FF] text-black'
                                        : 'text-neutral-400 hover:bg-[#1E1E22] hover:text-white'}`}
                                >
                                    In Stock
                                </button>
                                <button
                                    onClick={() => setFilter('deals')}
                                    className={`px-5 py-2 rounded-full text-sm font-semibold transition-all ${filter === 'deals'
                                        ? 'bg-[#C4A1FF] text-black'
                                        : 'text-neutral-400 hover:bg-[#1E1E22] hover:text-white'}`}
                                >
                                    Deals
                                </button>
                            </div>
                        </div>

                        {/* Right Side: Dropdowns */}
                        <div className="flex items-center gap-2 w-full xl:w-auto overflow-x-auto scrollbar-hide px-2">
                            <button className="flex items-center gap-2 px-4 py-2 rounded-full hover:bg-[#1E1E22] text-neutral-400 transition-colors whitespace-nowrap">
                                <FolderHeart size={16} />
                                <span className="text-sm font-medium">Kategori</span>
                                <ChevronDown size={14} className="opacity-50" />
                            </button>

                            <button className="flex items-center gap-2 px-4 py-2 rounded-full hover:bg-[#1E1E22] text-neutral-400 transition-colors whitespace-nowrap">
                                <TrendingUp size={16} />
                                <span className="text-sm font-medium">All Stores</span>
                                <ChevronDown size={14} className="opacity-50" />
                            </button>

                            <button className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#1E1E22] text-white transition-colors whitespace-nowrap ml-1 border border-white/5">
                                <Filter size={16} className="text-neutral-400" />
                                <span className="text-sm font-medium">Newest</span>
                            </button>
                            
                            <button className="ml-1 p-2 rounded-full border border-white/5 bg-[#1E1E22] text-neutral-400 hover:text-white shrink-0">
                                <TrendingDown size={16} />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Main Content Feed */}
                <main>
                    {!isInitialized ? (
                        <div className="flex flex-col items-center justify-center py-32">
                            <Loader2 className="w-12 h-12 text-emerald-500 animate-spin mb-4" />
                            <p className="text-neutral-500 font-medium animate-pulse">Veriler yükleniyor...</p>
                        </div>
                    ) : products.length === 0 ? (
                        <div className="text-center py-24 bg-[#121214] rounded-[40px] border border-dashed border-white/10 flex flex-col items-center justify-center mt-6">
                            <div className="w-16 h-16 bg-[#1E1E22] rounded-full flex items-center justify-center mb-4 text-neutral-500">
                                <Search size={32} />
                            </div>
                            <h3 className="text-xl font-bold text-white mb-2">Henüz Ürün Yok</h3>
                            <p className="text-neutral-400 max-w-sm mx-auto">
                                Tüm mağazaları tek bir yerden kontrol etmek için yukarıdaki arama çubuğuna bir ürün linki yapıştırın.
                            </p>
                        </div>
                    ) : (
                        <div className="columns-2 md:columns-3 lg:columns-4 xl:columns-5 space-y-6 gap-6">
                            {products.map((product) => (
                                <ProductCard 
                                    key={product.id} 
                                    product={product} 
                                    onDelete={handleDelete}
                                    onToggleFavorite={handleToggleFavorite}
                                />
                            ))}
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
}
