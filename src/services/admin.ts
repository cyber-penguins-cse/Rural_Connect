import { supabase } from '../lib/supabase';

export const adminService = {
  async getAllUsers() {
    return supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });
  },

  async suspendUser(userId: string, suspend: boolean) {
    return supabase
      .from('profiles')
      .update({ is_suspended: suspend })
      .eq('id', userId);
  },

  async getStats() {
    const [users, products, enquiries] = await Promise.all([
      supabase.from('profiles').select('id, role', { count: 'exact' }),
      supabase.from('products').select('id, status', { count: 'exact' }),
      supabase.from('enquiries').select('id, status', { count: 'exact' }),
    ]);
    return { users, products, enquiries };
  },
};
