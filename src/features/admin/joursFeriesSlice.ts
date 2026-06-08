import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import type { JourFerie } from '@/features/admin/adminTypes'
import * as adminApi from '@/features/admin/adminApi'

type JoursFeriesState = {
  items: JourFerie[]
  status: 'idle' | 'loading' | 'succeeded' | 'failed'
  error: string | null
}

const initialState: JoursFeriesState = {
  items: [],
  status: 'idle',
  error: null,
}

export const fetchJoursFeries = createAsyncThunk<JourFerie[]>(
  'admin/joursFeries/fetch',
  async (_, { rejectWithValue }) => {
    try {
      return await adminApi.fetchJoursFeries()
    } catch {
      return rejectWithValue('Impossible de charger les jours feries')
    }
  },
)

export const createJourFerie = createAsyncThunk<JourFerie, { date: string; label: string }>(
  'admin/joursFeries/create',
  async (payload, { rejectWithValue }) => {
    try {
      return await adminApi.createJourFerie(payload)
    } catch {
      return rejectWithValue('Creation du jour ferie impossible')
    }
  },
)

export const updateJourFerie = createAsyncThunk<JourFerie, { id: number; payload: { date: string; label: string } }>(
  'admin/joursFeries/update',
  async ({ id, payload }, { rejectWithValue }) => {
    try {
      return await adminApi.updateJourFerie(id, payload)
    } catch {
      return rejectWithValue('Mise a jour du jour ferie impossible')
    }
  },
)

export const deleteJourFerie = createAsyncThunk<number, number>(
  'admin/joursFeries/delete',
  async (id, { rejectWithValue }) => {
    try {
      await adminApi.deleteJourFerie(id)
      return id
    } catch {
      return rejectWithValue('Suppression du jour ferie impossible') as unknown as number
    }
  },
)

export const importJoursFeries = createAsyncThunk<
  JourFerie[],
  { file: File }
>('admin/joursFeries/import', async ({ file }, { rejectWithValue }) => {
  try {
    return await adminApi.importJoursFeries({ file })
  } catch {
    return rejectWithValue('Import des jours feries impossible')
  }
})

const joursFeriesSlice = createSlice({
  name: 'joursFeries',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchJoursFeries.pending, (state) => {
        state.status = 'loading'
        state.error = null
      })
      .addCase(fetchJoursFeries.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.items = action.payload
      })
      .addCase(fetchJoursFeries.rejected, (state, action) => {
        state.status = 'failed'
        state.error = (action.payload as string) ?? 'Erreur'
      })
      .addCase(createJourFerie.fulfilled, (state, action) => {
        state.items = [...state.items, action.payload].sort((a, b) => a.date.localeCompare(b.date))
      })
      .addCase(updateJourFerie.fulfilled, (state, action) => {
        state.items = state.items
          .map((item) => (item.id === action.payload.id ? action.payload : item))
          .sort((a, b) => a.date.localeCompare(b.date))
      })
      .addCase(deleteJourFerie.fulfilled, (state, action) => {
        state.items = state.items.filter((item) => item.id !== action.payload)
      })
      .addCase(importJoursFeries.fulfilled, (state, action) => {
        const merged = new Map(state.items.map((item) => [item.id, item]))
        action.payload.forEach((item) => merged.set(item.id, item))
        state.items = Array.from(merged.values()).sort((a, b) => a.date.localeCompare(b.date))
      })
  },
})

export default joursFeriesSlice.reducer
