import { Product, Category } from '../types';

export const CATEGORIES_DATA: Category[] = [
  {
    id: 'cat-womens',
    slug: 'womens-collection',
    name: "WOMEN'S COLLECTION",
    tagline: 'Timeless Pakistani couture & ready-to-wear statements',
    image: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?q=80&w=1000&auto=format&fit=crop',
    itemCount: 0,
  },
  {
    id: 'cat-suits',
    slug: 'suits',
    name: 'SUITS',
    tagline: 'Embroidered 3-piece luxury formals & unstitched collections',
    image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=1000&auto=format&fit=crop',
    itemCount: 0,
  },
  {
    id: 'cat-handbags',
    slug: 'handbags',
    name: 'HANDBAGS',
    tagline: 'Structured totes, evening clutches & artisan satchels',
    image: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?q=80&w=1000&auto=format&fit=crop',
    itemCount: 0,
  },
  {
    id: 'cat-new',
    slug: 'new-arrivals',
    name: 'NEW ARRIVALS',
    tagline: 'Fresh season releases crafted with exquisite precision',
    image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=1000&auto=format&fit=crop',
    itemCount: 0,
  },
  {
    id: 'cat-accessories',
    slug: 'accessories',
    name: 'ACCESSORIES',
    tagline: 'Silk dupattas, embellished shawls & bespoke jewelry',
    image: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?q=80&w=1000&auto=format&fit=crop',
    itemCount: 0,
  },
];

// Completely clean empty product catalog - Real products are added solely via Admin Panel
export const INITIAL_PRODUCTS: Product[] = [];
