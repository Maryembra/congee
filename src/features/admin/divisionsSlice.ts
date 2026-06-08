import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import type { Division } from '@/features/admin/adminTypes'
import * as adminApi from '@/features/admin/adminApi'

type DivisionsState = {
  items: Division[]
  status: 'idle' | 'loading' | 'succeeded' | 'failed'
  error: string | null
}

const initialState: DivisionsState = {
  items: [],
  status: 'idle',
  error: null,
}

export const fetchDivisions = createAsyncThunk<Division[]>(
  'admin/divisions/fetch',
  async (_, { rejectWithValue }) => {
    try {
      return await adminApi.fetchDivisions()
    } catch {
      return rejectWithValue('Impossible de charger les divisions')
    }
  },
)

export const createDivision = createAsyncThunk<Division, { code: string; name: string; directionId: number }>(
  'admin/divisions/create',
  async (payload, { rejectWithValue }) => {
    try {
      return await adminApi.createDivision(payload)
    } catch {
      return rejectWithValue('Creation de division impossible')
    }
  },
)

export const updateDivision = createAsyncThunk<Division, { id: number; payload: { code: string; name: string; directionId: number } }>(
  'admin/divisions/update',
  async ({ id, payload }, { rejectWithValue }) => {
    try {
      return await adminApi.updateDivision(id, payload)
    } catch {
      return rejectWithValue('Mise a jour de division impossible')
    }
  },
)

export const deleteDivision = createAsyncThunk<number, number>(
  'admin/divisions/delete',
  async (id, { rejectWithValue }) => {
    try {
      await adminApi.deleteDivision(id)
      return id
    } catch {
      return rejectWithValue('Suppression de division impossible') as unknown as number
    }
  },
)

const divisionsSlice = createSlice({
  name: 'divisions',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchDivisions.pending, (state) => {
        state.status = 'loading'
        state.error = null
      })
      .addCase(fetchDivisions.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.items = action.payload
      })
      .addCase(fetchDivisions.rejected, (state, action) => {
        state.status = 'failed'
        state.error = (action.payload as string) ?? 'Erreur'
      })
      .addCase(createDivision.fulfilled, (state, action) => {
        state.items.unshift(action.payload)
      })
      .addCase(updateDivision.fulfilled, (state, action) => {
        state.items = state.items.map((item) => (item.id === action.payload.id ? action.payload : item))
      })
      .addCase(deleteDivision.fulfilled, (state, action) => {
        state.items = state.items.filter((item) => item.id !== action.payload)
      })
  },
})

export default divisionsSlice.reducer
