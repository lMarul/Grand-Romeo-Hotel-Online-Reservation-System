// Rich room type metadata for the Grand Romeo Hotel
// Maps database room_type values to detailed descriptions, amenities, and display info

import {
  Wifi,
  Tv,
  Wind,
  Coffee,
  Bath,
  Shirt,
  Phone,
  Lock,
  Utensils,
  Wine,
  Sofa,
  Music,
  Car,
  Crown,
  Sparkles,
  Users,
  Maximize,
  BedDouble,
  type LucideIcon,
} from 'lucide-react';

export interface RoomTypeInfo {
  type: string;
  tagline: string;
  description: string;
  longDescription: string;
  bedType: string;
  floorArea: string;
  maxOccupancy: string;
  view: string;
  amenities: { icon: LucideIcon; label: string }[];
  highlights: string[];
  priceRange: string;
  gradient: string;
  accentColor: string;
  badgeColor: string;
}

export const ROOM_TYPE_DATA: Record<string, RoomTypeInfo> = {
  Standard: {
    type: 'Standard',
    tagline: 'Comfort & Elegance',
    description:
      'Thoughtfully designed rooms offering essential comforts for a relaxing stay in the heart of the city.',
    longDescription:
      'Our Standard Rooms offer a serene retreat with contemporary furnishings, plush bedding, and all the essential amenities for a comfortable stay. Each room features a well-appointed bathroom with premium toiletries, a work area, and modern entertainment options. Perfect for business travelers and weekend getaways.',
    bedType: 'Queen Bed or Twin Beds',
    floorArea: '28 sqm',
    maxOccupancy: '2 Adults',
    view: 'City View',
    amenities: [
      { icon: Wifi, label: 'High-Speed WiFi' },
      { icon: Tv, label: '40" Smart LED TV' },
      { icon: Wind, label: 'Climate Control' },
      { icon: Bath, label: 'Rain Shower' },
      { icon: Lock, label: 'In-Room Safe' },
      { icon: Phone, label: 'Direct Dial Phone' },
      { icon: Coffee, label: 'Coffee & Tea Maker' },
      { icon: Shirt, label: 'Daily Housekeeping' },
    ],
    highlights: [
      'Complimentary bottled water',
      'Premium bath amenities',
      'Blackout curtains',
      'USB charging ports',
    ],
    priceRange: '₱2,500',
    gradient: 'from-slate-600 to-slate-800',
    accentColor: 'text-slate-600',
    badgeColor: 'bg-slate-100 text-slate-700 border-slate-200',
  },
  Deluxe: {
    type: 'Deluxe',
    tagline: 'Refined Luxury',
    description:
      'Spacious and elegantly appointed rooms with premium amenities, designed for discerning guests who appreciate the finer things.',
    longDescription:
      'Step into refined elegance with our Deluxe Rooms. Featuring a king-size bed with premium linens, a generous living space, and a marble-accented bathroom with both rain shower and bathtub. Enjoy your morning coffee from the Nespresso machine while taking in the city skyline from your private seating area.',
    bedType: 'King Bed',
    floorArea: '42 sqm',
    maxOccupancy: '2 Adults, 1 Child',
    view: 'City Skyline View',
    amenities: [
      { icon: Wifi, label: 'High-Speed WiFi' },
      { icon: Tv, label: '50" Smart 4K TV' },
      { icon: Wind, label: 'Climate Control' },
      { icon: Bath, label: 'Rain Shower & Bathtub' },
      { icon: Coffee, label: 'Nespresso Machine' },
      { icon: Shirt, label: 'Bathrobe & Slippers' },
      { icon: Lock, label: 'In-Room Safe' },
      { icon: Utensils, label: 'Mini Refrigerator' },
    ],
    highlights: [
      'Executive work desk with ergonomic chair',
      'Turndown service',
      'Pillow menu selection',
      'Complimentary minibar (soft drinks)',
    ],
    priceRange: '₱4,500',
    gradient: 'from-blue-600 to-indigo-800',
    accentColor: 'text-blue-600',
    badgeColor: 'bg-blue-50 text-blue-700 border-blue-200',
  },
  Suite: {
    type: 'Suite',
    tagline: 'Unparalleled Sophistication',
    description:
      'Luxurious suites featuring separate living and sleeping areas, offering an elevated experience with premium services.',
    longDescription:
      'Our Suites redefine luxury with a separate living room and bedroom, creating a personal sanctuary of comfort and style. The spacious layout features designer furnishings, a dining area for intimate meals, and a marble bathroom with a deep soaking tub. Enjoy dedicated butler service and exclusive access to the Executive Lounge.',
    bedType: 'King Bed + Sofa Bed',
    floorArea: '65 sqm',
    maxOccupancy: '3 Adults or 2 Adults, 2 Children',
    view: 'Panoramic City View',
    amenities: [
      { icon: Wifi, label: 'High-Speed WiFi' },
      { icon: Tv, label: '55" Smart 4K TV (x2)' },
      { icon: Sofa, label: 'Separate Living Room' },
      { icon: Utensils, label: 'Dining Area' },
      { icon: Wine, label: 'Premium Minibar' },
      { icon: Music, label: 'Bose Bluetooth Speaker' },
      { icon: Coffee, label: 'Nespresso Machine' },
      { icon: Bath, label: 'Deep Soaking Tub' },
    ],
    highlights: [
      'Dedicated butler service',
      'Executive Lounge access',
      'Evening canapes & cocktails',
      'Priority restaurant reservations',
    ],
    priceRange: '₱8,000',
    gradient: 'from-red-600 to-red-800',
    accentColor: 'text-red-600',
    badgeColor: 'bg-red-50 text-red-700 border-red-200',
  },
  Presidential: {
    type: 'Presidential',
    tagline: 'The Pinnacle of Grandeur',
    description:
      'The ultimate expression of luxury — a palatial retreat with bespoke services, offering an experience reserved for the most distinguished guests.',
    longDescription:
      'The Presidential Suite is the crown jewel of Grand Romeo Hotel. This palatial retreat spans 120 square meters and features a grand living room, private dining room, master bedroom with walk-in closet, and a spa-inspired bathroom with Jacuzzi. Every detail has been curated for an unparalleled experience, from the curated art collection to the personalized butler service available around the clock.',
    bedType: 'King Bed + Living Room',
    floorArea: '120 sqm',
    maxOccupancy: '4 Adults or 2 Adults, 3 Children',
    view: 'Premium Panoramic View',
    amenities: [
      { icon: Wifi, label: 'High-Speed WiFi' },
      { icon: Tv, label: '65" OLED Smart TV (x3)' },
      { icon: Sofa, label: 'Grand Living Room' },
      { icon: Utensils, label: 'Private Dining Room' },
      { icon: Wine, label: 'Curated Minibar & Wine' },
      { icon: Sparkles, label: 'Jacuzzi' },
      { icon: Car, label: 'Airport Transfer' },
      { icon: Crown, label: '24/7 Private Butler' },
    ],
    highlights: [
      'Complimentary airport limousine transfer',
      'Exclusive lounge & pool access',
      'Personalized welcome amenities',
      'In-suite check-in & check-out',
    ],
    priceRange: '₱15,000',
    gradient: 'from-red-600 via-red-500 to-red-700',
    accentColor: 'text-red-600',
    badgeColor: 'bg-red-50 text-red-700 border-red-200',
  },
};

export const ROOM_TYPES_ORDER = ['Standard', 'Deluxe', 'Suite', 'Presidential'] as const;

export function getRoomTypeInfo(roomType: string): RoomTypeInfo {
  return ROOM_TYPE_DATA[roomType] || ROOM_TYPE_DATA['Standard'];
}
