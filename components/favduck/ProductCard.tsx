import React from 'react';
import Image from 'next/image';
import { ExternalLink, TrendingDown, Trash2, CheckCircle2, Heart, Bell, FolderPlus } from 'lucide-react';
import type { Product } from '@/lib/favduck/types';

interface ProductCardProps {
    product: Product;
    onDelete: (id: string) => void;
    onToggleFavorite: (id: string) => void;
}

export function ProductCard({ product, onDelete, onToggleFavorite }: ProductCardProps) {
    const numericPrice = typeof product.price === 'string'
        ? parseFloat(product.price.replace(/[^0-9,.-]/g, '').replace(',', '.'))
        : product.price;

    const formattedPrice = typeof numericPrice === 'number'
        ? numericPrice.toLocaleString('tr-TR', { style: 'currency', currency: product.currency || 'TRY' })
        : product.price;

    const isTargetMet = product.targetPrice && numericPrice && numericPrice <= product.targetPrice;

    const btnClass = "p-3 rounded-full shadow-lg transition-all duration-300 hover:scale-110 pointer-events-auto flex items-center justify-center transform translate-y-8 group-hover:translate-y-0";

    return (
        <div className="group relative flex flex-col mb-6 break-inside-avoid">
            {/* Image Container */}
            <div className="relative overflow-hidden rounded-xl bg-card shadow-sm transition-all duration-500 group-hover:shadow-xl group-hover:shadow-emerald-500/10 w-full aspect-[3/4]">
                <a href={product.url} target="_blank" rel="noopener noreferrer" className="block h-full cursor-pointer relative">
                    <Image
                        alt={product.title || "Product image"}
                        className={`object-cover transition-transform duration-700 group-hover:scale-105 ${!product.inStock ? 'grayscale opacity-60' : ''}`}
                        src={product.image || "https://placehold.co/600x800"}
                        fill
                        unoptimized={true}
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                </a>

                {/* Overlay & Actions */}
                <div className="absolute inset-0 bg-black/40 transition-opacity duration-300 flex items-center justify-center gap-3 backdrop-blur-[2px] pointer-events-none opacity-0 group-hover:opacity-100">
                    {product.inStock ? (
                        <a
                            href={product.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`${btnClass} bg-card text-foreground hover:bg-emerald-500 hover:text-white delay-75`}
                            title="Mağazaya Git"
                        >
                            <ExternalLink size={20} />
                        </a>
                    ) : (
                        <button
                            className={`${btnClass} bg-muted text-foreground hover:bg-red-500 hover:text-white delay-75`}
                            title="Alarm Kur"
                        >
                            <Bell size={20} />
                        </button>
                    )}

                    <button
                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); onDelete(product.id); }}
                        className={`${btnClass} bg-black/50 backdrop-blur-md text-white border border-white/10 hover:bg-red-500 hover:border-red-500 delay-300`}
                        title="Sil"
                    >
                        <Trash2 size={20} />
                    </button>
                </div>

                <button
                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); onToggleFavorite(product.id); }}
                    className={`absolute bottom-4 right-4 p-3 rounded-full shadow-lg transition-all duration-300 pointer-events-auto flex items-center justify-center z-10 ${product.isFavorite ? 'text-red-500 bg-red-500/10 hover:bg-red-500/20' : 'text-foreground bg-card hover:text-red-500 hover:bg-red-500/10'}`}
                    title="Favoriler"
                >
                    <Heart size={18} fill={product.isFavorite ? "currentColor" : "none"} />
                </button>

                {/* Status Badges */}
                <div className="absolute top-3 left-3 flex flex-col gap-2 items-start pointer-events-none">
                    {!product.inStock && (
                        <span className="bg-red-500/10 backdrop-blur border border-red-500/20 text-red-500 text-[10px] font-bold px-2.5 py-1 rounded-lg uppercase tracking-wide">
                            Tükendi
                        </span>
                    )}

                    {isTargetMet && (
                        <span className="bg-emerald-500/90 backdrop-blur text-white text-[10px] font-bold px-2.5 py-1 rounded-lg uppercase tracking-wide flex items-center gap-1 shadow-lg shadow-emerald-500/30 animate-pulse">
                            <CheckCircle2 size={12} className="stroke-[3px]" />
                            Fırsat
                        </span>
                    )}

                    <div className="bg-card/80 backdrop-blur px-3 py-1.5 rounded-lg border border-border">
                        <span className={`text-sm font-bold ${isTargetMet ? 'text-emerald-500 font-black' : 'text-foreground'}`}>
                            {formattedPrice}
                        </span>
                    </div>
                </div>
            </div>

            {/* Meta Info */}
            <div className="mt-3 px-1">
                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">
                    {product.source || "WEB"}
                </p>
                <h3 className="text-sm font-bold leading-snug text-foreground line-clamp-2 group-hover:text-emerald-500 transition-colors">
                    {product.title}
                </h3>
            </div>
        </div>
    );
}
