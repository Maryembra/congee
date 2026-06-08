import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import type { Direction } from '@/features/admin/adminTypes'
import * as adminApi from '@/features/admin/adminApi'

type DirectionsState = {
  items: Direction[]
  status: 'idle' | 'loading' | 'succeeded' | 'failed'
  error: string | null
}

const initialState: DirectionsState = {
  items: [],
  status: 'idle',
  error: null,
}

export const fetchDirections = createAsyncThunk<Direction[]>(
  'admin/directions/fetch',
  async (_, { rejectWithValue }) => {
    try {
      return await adminApi.fetchDirections()
    } catch {
      return rejectWithValue('Impossible de charger les directions')
    }
  },
)

export const createDirection = createAsyncThunk<Direction, { code: string; name: string; signataireId?: number | null }>(
  'admin/directions/create',
  async (payload, { rejectWithValue }) => {
    try {
      return await adminApi.createDirection(payload)
    } catch {
      return rejectWithValue('Creation de direction impossible')
    }
  },
)

export const updateDirection = createAsyncThunk<Direction, { id: number; payload: { code: string; name: string; signataireId?: number | null } }>(
  'admin/directions/update',
  async ({ id, payload }, { rejectWithValue }) => {
    try {
      return await adminApi.updateDirection(id, payload)
    } catch {
      return rejectWithValue('Mise a jour de direction impossible')
    }
  },
)

export const deleteDirection = createAsyncThunk<number, number>(
  'admin/directions/delete',
  async (id, { rejectWithValue }) => {
    try {
      await adminApi.deleteDirection(id)
      return id
    } catch {
      return rejectWithValue('Suppression de direction impossible') as unknown as number
    }
  },
)

const directionsSlice = createSlice({
  name: 'directions',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchDirections.pending, (state) => {
        state.status = 'loading'
        state.error = null
      })
      .addCase(fetchDirections.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.items = action.payload
      })
      .addCase(fetchDirections.rejected, (state, action) => {
        state.status = 'failed'
        state.error = (action.payload as string) ?? 'Erreur'
      })
      .addCase(createDirection.fulfilled, (state, action) => {
        state.items.unshift(action.payload)
      })
      .addCase(updateDirection.fulfilled, (state, action) => {
        state.items = state.items.map((item) => (item.id === action.payload.id ? action.payload : item))
      })
      .addCase(deleteDirection.fulfilled, (state, action) => {
        state.items = state.items.filter((item) => item.id !== action.payload)
      })
  },
})

export default directionsSlice.reducer
