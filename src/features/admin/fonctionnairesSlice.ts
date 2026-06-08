import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import type { FonctionnaireOption } from '@/features/admin/adminTypes'
import * as adminApi from '@/features/admin/adminApi'

type FonctionnairesState = {
  interimaires: FonctionnaireOption[]
  status: 'idle' | 'loading' | 'succeeded' | 'failed'
  error: string | null
}

const initialState: FonctionnairesState = {
  interimaires: [],
  status: 'idle',
  error: null,
}

export const fetchInterimaires = createAsyncThunk<FonctionnaireOption[]>(
  'admin/interimaires/fetch',
  async (_, { rejectWithValue }) => {
    try {
      return await adminApi.fetchInterimaires()
    } catch {
      return rejectWithValue('Impossible de charger les interimaires')
    }
  },
)

const fonctionnairesSlice = createSlice({
  name: 'fonctionnaires',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchInterimaires.pending, (state) => {
        state.status = 'loading'
        state.error = null
      })
      .addCase(fetchInterimaires.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.interimaires = action.payload
      })
      .addCase(fetchInterimaires.rejected, (state, action) => {
        state.status = 'failed'
        state.error = (action.payload as string) ?? 'Erreur'
      })
  },
})

export default fonctionnairesSlice.reducer
