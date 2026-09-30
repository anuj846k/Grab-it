export type Category = 
  | 'All'
  | 'Furniture'
  | 'Electronics'
  | 'Clothing & Shoes'
  | 'Books & Media'
  | 'Home & Kitchen'
  | 'Plants & Garden'
  | 'Toys & Games'
  | 'Other';

export interface Listing {
  id: string;
  title: string;
  distance: string;
  price: string;
  imageUrl: string;
  imageUrls?: string[];
  category: Category;
  isFeatured?: boolean;
  description?: string;
  condition?: string;
  owner?: {
    name: string;
    avatarUrl: string;
    rating: number;
    reviewsCount: number;
  };
  tags?: string[];
  pickupLocation?: {
    text: string;
    neighborhood: string;
    locationUrl?: string | null;
  };
  availability?: string[];
  postedAt?: string;
}
