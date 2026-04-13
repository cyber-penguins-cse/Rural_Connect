import { supabase } from '../lib/supabase';
import { EnquiryStatus } from '../types';

export const enquiriesService = {
  async create(buyerId: string, sellerId: string, productId: string, message: string) {
    return supabase
      .from('enquiries')
      .insert({ buyer_id: buyerId, seller_id: sellerId, product_id: productId, message })
      .select()
      .single();
  },

  async getBuyerEnquiries(buyerId: string) {
    return supabase
      .from('enquiries')
      .select('*, product:products(id,title,image_url,price), seller:profiles!enquiries_seller_id_fkey(id,full_name,email)')
      .eq('buyer_id', buyerId)
      .order('created_at', { ascending: false });
  },

  async getSellerEnquiries(sellerId: string) {
    return supabase
      .from('enquiries')
      .select('*, product:products(id,title,image_url,price), buyer:profiles!enquiries_buyer_id_fkey(id,full_name,email)')
      .eq('seller_id', sellerId)
      .order('created_at', { ascending: false });
  },

  async updateStatus(id: string, status: EnquiryStatus) {
    return supabase
      .from('enquiries')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', id);
  },
};
