import axios from 'axios';

const BASE = import.meta.env.VITE_API_BASE || 'http://localhost:3001/api/v1';

export function setToken(token) {
  if (token) localStorage.setItem('token', token);
  else localStorage.removeItem('token');
}
export function getToken() {
  return localStorage.getItem('token');
}

export const client = axios.create({ baseURL: BASE });

client.interceptors.request.use(cfg => {
  const t = getToken();
  if (t) cfg.headers.Authorization = 'Bearer ' + t;
  return cfg;
});

// Auth
export async function signup(data) {
  return client.post('/user/signup', data);
}
export async function login(data) {
  return client.post('/user/login', data);
}

// Items
export async function fetchItems(q) {
  return client.get('/items', { params: q });
}
export async function fetchItemById(id) {   
  return client.get(`/items/${id}`);
}

// Cart
export async function getCart() {
  return client.get('/cart');
}
export async function setCart(items) {
  return client.post('/cart', { items });
}
export async function removeCartItem(itemId) {
  return client.delete('/cart/' + itemId);
}
