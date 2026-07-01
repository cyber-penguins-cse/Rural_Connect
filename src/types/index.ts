export type UserRole = 'BUYER' | 'SELLER' | 'ADMIN';
export type ProductStatus = 'PENDING' | 'APPROVED' | 'REJECTED';
export type EnquiryStatus = 'PENDING' | 'ACCEPTED' | 'COMPLETED' | 'REJECTED';

export interface Profile {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  is_suspended: boolean;
  created_at: string;
}

export interface Category {
  id: string;
  name: string;
  description: string | null;
  created_at: string;
}

export interface Product {
  id: string;
  seller_id: string;
  category_id: string | null;
  title: string;
  description: string;
  price: number;
  image_url: string | null;
  status: ProductStatus;
  created_at: string;
  updated_at: string;
  seller?: Profile;
  category?: Category;
  reviews?: Review[];
}

export interface Enquiry {
  id: string;
  buyer_id: string;
  seller_id: string;
  product_id: string;
  message: string;
  status: EnquiryStatus;
  created_at: string;
  updated_at: string;
  buyer?: Profile;
  seller?: Profile;
  product?: Product;
}

export interface Review {
  id: string;
  buyer_id: string;
  seller_id: string;
  product_id: string;
  enquiry_id: string;
  rating: number;
  comment: string | null;
  created_at: string;
  buyer?: Profile;
}

export interface ProductFormData {
  title: string;
  description: string;
  price: number;
  category_id: string;
  image_url: string;
}
