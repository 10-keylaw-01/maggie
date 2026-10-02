import { supabase } from './supabase';

// Every read goes through here so pages stay free of query details.
const unwrap = ({ data, error }) => { if (error) throw error; return data; };

export const getCategories = () =>
  supabase.from('categories').select('*').eq('is_active', true).order('sort_order').then(unwrap);

export const getProducts = () =>
  supabase.from('products').select('*').eq('is_active', true).order('id').then(unwrap);

export const getProduct = id =>
  supabase.from('products').select('*').eq('id', id).eq('is_active', true).maybeSingle().then(unwrap);

export const getPromotions = placement =>
  supabase.from('promotions').select('*').eq('placement', placement).eq('is_active', true).order('sort_order').then(unwrap);

export const getServices = () => supabase.from('services').select('*').eq('is_active', true).order('sort_order').then(unwrap);
export const getFaqs = () => supabase.from('faqs').select('*').eq('is_active', true).order('sort_order').then(unwrap);
export const getTeam = () => supabase.from('team_members').select('*').eq('is_active', true).order('sort_order').then(unwrap);

export const getSettings = async () => {
  const rows = await supabase.from('site_settings').select('key,value').then(unwrap);
  return Object.fromEntries(rows.map(r => [r.key, r.value]));
};

export const submitContact = msg => supabase.from('contact_messages').insert(msg).then(unwrap);

export async function uploadPrescription(file) {
  const ext = (file.name.split('.').pop() || 'bin').toLowerCase().replace(/[^a-z0-9]/g, '');
  const path = `${crypto.randomUUID()}/rx.${ext}`;
  const { error } = await supabase.storage.from('prescriptions').upload(path, file, { contentType: file.type });
  if (error) throw error;
  return path;
}

export const placeOrder = payload => supabase.rpc('place_order', { p: payload }).then(unwrap);
export const orderPaymentStatus = orderId => supabase.rpc('order_payment_status', { p_order_id: orderId }).then(unwrap);
export const trackOrder = (orderNumber, phone) => supabase.rpc('track_order', { p_order_number: orderNumber, p_phone: phone }).then(unwrap);

export async function startMpesa(orderId, phone) {
  const { data, error } = await supabase.functions.invoke('mpesa-stk-push', { body: { order_id: orderId, phone } });
  if (error) {
    // surface the function's own message when it sent one
    let msg = error.message;
    try { msg = (await error.context.json()).error || msg; } catch { /* keep default */ }
    throw new Error(msg);
  }
  return data;
}

export const getMyOrders = () =>
  supabase.from('orders').select('*, order_items(*)').order('created_at', { ascending: false }).then(unwrap);
