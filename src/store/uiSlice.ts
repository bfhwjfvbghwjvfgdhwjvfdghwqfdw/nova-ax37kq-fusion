import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { type ViewOptions } from '@/types/api'

export type ThemeMode = 'dark' | 'light'

interface UIState {
  theme: ThemeMode
  viewOptions: ViewOptions
}

const defaultViewOptions: ViewOptions = {
  layout: 'details',
  iconSize: 'small',
  showItemCheckboxes: true
}

// Try to load saved view options from localStorage
const savedViewOptions = (() => {
  try {
    const saved = localStorage.getItem('xvser-view-options')
    if (saved) {
      const parsed = JSON.parse(saved)
      return {
        ...defaultViewOptions,
        ...parsed
      }
    }
  } catch {}
  return defaultViewOptions
})()

const initialState: UIState = {
  theme: (localStorage.getItem('xvser:theme') as ThemeMode) || 'dark',
  viewOptions: savedViewOptions
}

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    setTheme(state, action: PayloadAction<ThemeMode>) {
      state.theme = action.payload
      localStorage.setItem('xvser:theme', state.theme)
    },
    toggleTheme(state) {
      state.theme = state.theme === 'dark' ? 'light' : 'dark'
      localStorage.setItem('xvser:theme', state.theme)
    },
    setViewOptions(state, action: PayloadAction<Partial<ViewOptions>>) {
      state.viewOptions = {
        ...state.viewOptions,
        ...action.payload
      }
      localStorage.setItem('xvser-view-options', JSON.stringify(state.viewOptions))
    }
  },
})

export const { setTheme, toggleTheme, setViewOptions } = uiSlice.actions
export default uiSlice.reducer
