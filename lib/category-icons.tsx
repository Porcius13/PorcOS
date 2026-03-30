import {
  ShoppingCart,
  Car,
  Film,
  Heart,
  BookOpen,
  Lightbulb,
  Shirt,
  Package,
  type LucideIcon,
} from "lucide-react";
import { Category } from "@/types";

export const CATEGORY_ICONS: Record<string, LucideIcon> = {
  market: ShoppingCart,
  ulasim: Car,
  eglence: Film,
  saglik: Heart,
  egitim: BookOpen,
  faturalar: Lightbulb,
  giyim: Shirt,
  diger: Package,
};

export function getCategoryIcon(categoryId: string): LucideIcon {
  return CATEGORY_ICONS[categoryId] || Package;
}
