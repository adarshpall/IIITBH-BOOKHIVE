import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  theme: "dark",
}

export const themeSlice = createSlice({
  name: 'theme',
  initialState,
  reducers: {
    toggleTheme: (state) => {
        state.theme = state.theme=="dark" ? "light" : "dark";
    },
  },
})

// Action creators are generated for each case reducer function
export const {toggleTheme } = themeSlice.actions

export default themeSlice.reducer