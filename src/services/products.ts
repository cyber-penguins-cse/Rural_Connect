import { supabase } from '../lib/supabase';
import { Product, ProductFormData, ProductStatus } from '../types';

export const productsService = {
  async getApproved(page = 1, limit = 12, categoryId?: string, search?: string) {
    let query = supabase
      .from('products')
      .select('*, seller:profiles(id,full_name,email), category:categories(id,name)', { count: 'exact' })
      .eq('status', 'APPROVED')
      .order('created_at', { ascending: false })
      .range((page - 1) * limit, page * limit - 1);

    if (categoryId) query = query.eq('category_id', categoryId);
    if (search) query = query.ilike('title', `%${search}%`);

    return query;
  },

  async getById(id: string) {
    return supabase
      .from('products')
      .select('*, seller:profiles(id,full_name,email), category:categories(id,name), reviews(id,rating,comment,created_at,buyer:profiles(full_name))')
      .eq('id', id)
      .maybeSingle();
  },

  async getSellerProducts(sellerId: string) {
    return supabase
      .from('products')
      .select('*, category:categories(id,name)')
      .eq('seller_id', sellerId)
      .order('created_at', { ascending: false });
  },

  async getAllForAdmin() {
    return supabase
      .from('products')
      .select('*, seller:profiles(id,full_name,email), category:categories(id,name)')
      .order('created_at', { ascending: false });
  },

  async create(sellerId: string, data: ProductFormData): Promise<{ data: Product | null; error: Error | null }> {
    const { data: product, error } = await supabase
      .from('products')
      .insert({ ...data, seller_id: sellerId })
      .select()
      .single();
    return { data: product, error: error as Error | null };
  },

  async update(id: string, data: Partial<ProductFormData>): Promise<{ error: Error | null }> {
    const { error } = await supabase
      .from('products')
      .update({ ...data, updated_at: new Date().toISOString() })
      .eq('id', id);
    return { error: error as Error | null };
  },

  async updateStatus(id: string, status: ProductStatus): Promise<{ error: Error | null }> {
    const { error } = await supabase
      .from('products')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', id);
    return { error: error as Error | null };
  },

  async delete(id: string): Promise<{ error: Error | null }> {
    const { error } = await supabase.from('products').delete().eq('id', id);
    return { error: error as Error | null };
  },
};
