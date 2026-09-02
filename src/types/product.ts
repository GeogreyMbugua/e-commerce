export type Product = {
  slug?: string;
  title: string;
  reviews: number;
  price: number;
  discountedPrice: number;
  id: number;
  isAvailable?: boolean;
  conditionGrade?: string;
  categorySlug?: string;
  primaryImageUrl?: string;
  imageAlt?: string;
  imgs?: {
    thumbnails: string[];
    previews: string[];
    alts?: string[];
  };
};
