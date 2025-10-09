import { configureStore } from '@reduxjs/toolkit'
import ui from './uiSlice'
import favorites from './favoritesSlice'
import tags from './tagsSlice'

export const store = configureStore({
  reducer: {
    ui,
    favorites,
    tags,
  },
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
