import { Category, Listing } from '@/types/listing';

export const CATEGORIES: Category[] = [
  'All',
  'Furniture',
  'Electronics',
  'Clothing & Shoes',
  'Books & Media',
  'Home & Kitchen',
  'Plants & Garden',
  'Toys & Games',
  'Other',
];

export const FEATURED_LISTINGS: Listing[] = [
  {
    id: 'f1',
    title: 'Wooden Study Table',
    distance: '2 km  away',
    price: 'Free',
    imageUrl:
      'https://images.unsplash.com/photo-1592078615290-033ee584e267?w=500&q=80',
    category: 'Furniture',
    isFeatured: true,
    description:
      "Good condition, minor scratches on the back left corner but completely solid. Perfect for a home office or student room. It's fully assembled so you'll need a suitable vehicle to pick it up. First to claim gets it!",
    owner: {
      name: 'John D.',
      avatarUrl:
        'https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=100&q=80',
      rating: 4.8,
      reviewsCount: 42,
    },
    tags: ['Furniture', 'Study', 'Wood'],
    pickupLocation: {
      text: 'Pickup Location',
      neighborhood: 'Approx. location in Capitol Hill',
    },
    availability: ['Weekdays after 6 PM', 'Weekends anytime'],
    postedAt: 'Posted 2h ago',
  },
  {
    id: 'f2',
    title: 'Assorted Design Books',
    distance: '5 km away',
    price: 'Free',
    imageUrl:
      'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=500&q=80',
    category: 'Books & Media',
    isFeatured: true,
  },
];

export const RECENT_LISTINGS: Listing[] = [
  {
    id: 'r1',
    title: 'Wooden Study Table',
    distance: '2 km',
    price: 'Free',
    imageUrl:
      'https://images.unsplash.com/photo-1592078615290-033ee584e267?w=500&q=80',
    category: 'Furniture',
  },
  {
    id: 'r2',
    title: 'Design Books',
    distance: '5 km',
    price: 'Free',
    imageUrl:
      'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=500&q=80',
    category: 'Books & Media',
  },
  {
    id: 'r3',
    title: 'Stack of Books',
    distance: '5 km',
    price: 'Free',
    imageUrl:
      'https://images.unsplash.com/photo-1495446815901-a7297e633e8d?w=500&q=80',
    category: 'Books & Media',
  },
  {
    id: 'r4',
    title: 'Small Desk',
    distance: '2 km',
    price: 'Free',
    imageUrl:
      'https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?w=500&q=80',
    category: 'Furniture',
  },
];

export const NEARBY_LISTINGS: Listing[] = [
  {
    id: 'n1',
    title: 'Study Table',
    distance: '0.5 km',
    price: 'Free',
    imageUrl:
      'https://images.unsplash.com/photo-1505843490538-5133c6c7d0e1?w=500&q=80',
    category: 'Furniture',
  },
  {
    id: 'n2',
    title: 'Design Books',
    distance: '1.2 km',
    price: 'Free',
    imageUrl:
      'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?w=500&q=80',
    category: 'Books & Media',
  },
  {
    id: 'n3',
    title: 'Wooden Table',
    distance: '2.0 km',
    price: 'Free',
    imageUrl:
      'https://images.unsplash.com/photo-1533090481720-856c6e3c1fdc?w=500&q=80',
    category: 'Furniture',
  },
];
