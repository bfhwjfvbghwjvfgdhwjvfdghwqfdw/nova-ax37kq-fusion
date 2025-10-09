import { createSlice, PayloadAction } from '@reduxjs/toolkit'

interface Favorite {
  path: string
  name: string
}

interface FavoritesState {
  items: Favorite[]
}

const initialState: FavoritesState = {
  items: []
}

export const favoritesSlice = createSlice({
  name: 'favorites',
  initialState,
  reducers: {
    addFavorite: (state, action: PayloadAction<Favorite>) => {
      if (!state.items.find(item => item.path === action.payload.path)) {
        state.items.push(action.payload)
      }
    },
    removeFavorite: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter(item => item.path !== action.payload)
    },
    clearFavorites: (state) => {
      state.items = []
    }
  }
})

export const { addFavorite, removeFavorite, clearFavorites } = favoritesSlice.actions
export default favoritesSlice.reducer