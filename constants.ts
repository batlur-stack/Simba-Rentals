import { UserRole } from "./types";

export const KENYAN_CITIES = [
  "Nairobi",
  "Mombasa",
  "Kisumu",
  "Nakuru",
  "Eldoret",
  "Thika",
  "Malindi",
  "Kitale"
];

export const PROPERTY_TYPES = [
  "Bedsitter",
  "1 Bedroom",
  "2 Bedroom",
  "3 Bedroom",
  "Maisonette",
  "Villa",
  "Bungalow",
  "Office Space",
  "Shop"
];

export const COMMON_FEATURES = [
  "WiFi",
  "Parking",
  "Security",
  "Water",
  "CCTV",
  "Pool",
  "Gym",
  "Balcony",
  "Borehole"
];

export const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-KE', {
    style: 'currency',
    currency: 'KES',
    minimumFractionDigits: 0
  }).format(amount);
};

// Seed Data for "SQL" simulation
export const SEED_USERS = [
  {
    id: 'admin-1',
    name: 'Admin Juma',
    email: 'admin@simba.co.ke',
    role: UserRole.ADMIN,
    status: 'APPROVED',
    phone: '0700000000',
    joinedDate: '2023-01-01'
  },
  {
    id: 'landlord-1',
    name: 'Mama Ngina Properties',
    email: 'landlord@test.com',
    role: UserRole.LANDLORD,
    status: 'APPROVED',
    phone: '0711223344',
    joinedDate: '2023-02-15'
  },
  {
    id: 'tenant-1',
    name: 'John Kamau',
    email: 'tenant@test.com',
    role: UserRole.TENANT,
    status: 'APPROVED',
    phone: '0722334455',
    joinedDate: '2023-03-10'
  }
];

export const SEED_PROPERTIES = [
  {
    id: 'prop-1',
    landlordId: 'landlord-1',
    title: 'Modern 2 Bedroom Apartment',
    address: 'Waiyaki Way, Westlands',
    city: 'Nairobi',
    propertyType: '2 Bedroom',
    rentAmount: 45000,
    depositAmount: 45000,
    status: 'AVAILABLE',
    imageUrl: 'https://picsum.photos/800/600?random=1',
    features: ['Parking', 'Security', 'Water Backup']
  },
  {
    id: 'prop-2',
    landlordId: 'landlord-1',
    title: 'Beachfront Villa',
    address: 'Nyali Beach Road',
    city: 'Mombasa',
    propertyType: 'Villa',
    rentAmount: 120000,
    depositAmount: 240000,
    status: 'OCCUPIED',
    imageUrl: 'https://picsum.photos/800/600?random=2',
    features: ['Pool', 'Ocean View', 'Furnished']
  }
];