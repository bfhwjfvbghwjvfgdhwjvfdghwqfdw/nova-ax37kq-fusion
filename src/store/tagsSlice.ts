import { createSlice, PayloadAction } from '@reduxjs/toolkit'

interface TagDialogState {
  isOpen: boolean
  paths: string[]
  tags: Record<string, string[]>
}

const initialState: TagDialogState = {
  isOpen: false,
  paths: [],
  tags: {}
}

export const tagsSlice = createSlice({
  name: 'tags',
  initialState,
  reducers: {
    openTagDialog: (state, action: PayloadAction<string[]>) => {
      state.isOpen = true
      state.paths = action.payload
    },
    closeTagDialog: (state) => {
      state.isOpen = false
      state.paths = []
    },
    addTags: (state, action: PayloadAction<{ path: string, tags: string[] }>) => {
      const { path, tags } = action.payload
      state.tags[path] = [...new Set([...(state.tags[path] || []), ...tags])]
    },
    removeTags: (state, action: PayloadAction<{ path: string, tags: string[] }>) => {
      const { path, tags } = action.payload
      if (state.tags[path]) {
        state.tags[path] = state.tags[path].filter(tag => !tags.includes(tag))
        if (state.tags[path].length === 0) {
          delete state.tags[path]
        }
      }
    },
    clearTags: (state, action: PayloadAction<string>) => {
      delete state.tags[action.payload]
    }
  }
})

export const { openTagDialog, closeTagDialog, addTags, removeTags, clearTags } = tagsSlice.actions
export default tagsSlice.reducer