import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getCart, setCart, removeCartItem } from '../handleApi';

const initialState = {
  items: [],
  status: 'idle',
};

// Load cart
export const loadCart = createAsyncThunk('cart/load', async (_, { rejectWithValue }) => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      return JSON.parse(localStorage.getItem('local_cart') || '[]');
    }
    const res = await getCart();
    return res.data.items.map(i => ({ item: i.item, qty: i.qty }));
  } catch (err) {
    return rejectWithValue(err.response?.data || err.message);
  }
});

// Save whole cart
export const saveCart = createAsyncThunk('cart/save', async (items, { rejectWithValue }) => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      localStorage.setItem(
        'local_cart',
        JSON.stringify(items.map(i => ({ itemId: i.item._id, qty: i.qty })))
      );
      return items;
    }
    await setCart(items.map(i => ({ itemId: i.item._id, qty: i.qty })));
    return items;
  } catch (err) {
    return rejectWithValue(err.response?.data || err.message);
  }
});

// Remove item
export const deleteItem = createAsyncThunk('cart/delete', async (id, { rejectWithValue }) => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      const local = JSON.parse(localStorage.getItem('local_cart') || '[]').filter(x => x.itemId !== id);
      localStorage.setItem('local_cart', JSON.stringify(local));
      return id;
    }
    await removeCartItem(id);
    return id;
  } catch (err) {
    return rejectWithValue(err.response?.data || err.message);
  }
});

// Update quantity
export const updateQuantity = createAsyncThunk(
  'cart/updateQuantity',
  async ({ id, qty }, { getState, rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      let updated;

      if (!token) {
        const local = JSON.parse(localStorage.getItem('local_cart') || '[]')
          .map(x => x.itemId === id ? { ...x, qty } : x);
        localStorage.setItem('local_cart', JSON.stringify(local));
        updated = getState().cart.items.map(x =>
          x.item._id === id ? { ...x, qty } : x
        );
      } else {
        const current = getState().cart.items.map(i => ({
          itemId: i.item._id,
          qty: i.item._id === id ? qty : i.qty
        }));
        await setCart(current);
        updated = getState().cart.items.map(x =>
          x.item._id === id ? { ...x, qty } : x
        );
      }

      return updated;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {},
  extraReducers: builder => {
    builder
      .addCase(loadCart.fulfilled, (state, action) => {
        state.items = action.payload;
        state.status = 'succeeded';
      })
      .addCase(saveCart.fulfilled, (state, action) => {
        state.items = action.payload;
      })
      .addCase(deleteItem.fulfilled, (state, action) => {
        state.items = state.items.filter(x => x.item._id !== action.payload);
      })
      .addCase(updateQuantity.fulfilled, (state, action) => {
        state.items = action.payload;
      });
  }
});

export default cartSlice.reducer;
