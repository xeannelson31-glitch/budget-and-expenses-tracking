import { 
  Coffee, 
  LayoutGrid, 
  ShoppingBag, 
  ShoppingCart, 
  Target, 
  GraduationCap, 
  Utensils, 
  Theater, 
  Laptop, 
  Wallet,
  type LucideIcon 
} from "lucide-react";

export function getIcon(name?: string): LucideIcon {
  switch (name) {
    case "ShoppingCart": return ShoppingCart;
    case "GraduationCap": return GraduationCap;
    case "LayoutGrid": return LayoutGrid;
    case "Utensils": return Utensils;
    case "Theater": return Theater;
    case "Coffee": return Coffee;
    case "Laptop": return Laptop;
    case "Wallet": return Wallet;
    case "Target": return Target;
    default: return ShoppingBag;
  }
}
