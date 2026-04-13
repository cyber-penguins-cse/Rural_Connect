import { supabase } from '../lib/supabase';

export const reviewsService = {
  async create(buyerId: string, sellerId: string, productId: string, enquiryId: string, rating: number, comment: string) {
    return supabase
      .from('reviews')
      .insert({ buyer_id: buyerId, seller_id: sellerId, product_id: productId, enquiry_id: enquiryId, rating, comment })
      .select()
      .single();
  },

  async getByProduct(productId: string) {
    return supabase
      .from('reviews')
      .select('*, buyer:profiles(full_name)')
      .eq('product_id', productId)
      .order('created_at', { ascending: false });
  },

  async getByEnquiry(enquiryId: string) {
    return supabase
      .from('reviews')
      .select('*')
      .eq('enquiry_id', enquiryId)
      .maybeSingle();
  },
};
