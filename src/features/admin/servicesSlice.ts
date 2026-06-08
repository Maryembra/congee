import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import type { Service } from '@/features/admin/adminTypes'
import * as adminApi from '@/features/admin/adminApi'
import { getApiErrorMessage } from '@/services/apiError'

type ServicesState = {
  items: Service[]
  status: 'idle' | 'loading' | 'succeeded' | 'failed'
  error: string | null
}

const initialState: ServicesState = {
  items: [],
  status: 'idle',
  error: null,
}

export const fetchServices = createAsyncThunk<Service[]>(
  'admin/services/fetch',
  async (_, { rejectWithValue }) => {
    try {
      return await adminApi.fetchServices()
    } catch {
      return rejectWithValue('Impossible de charger les services')
    }
  },
)

export const createService = createAsyncThunk<Service, { code: string; name: string; divisionId: number; managerId?: number | null }>(
  'admin/services/create',
  async (payload, { rejectWithValue }) => {
    try {
      return await adminApi.createService(payload)
    } catch (error) {
      return rejectWithValue(getApiErrorMessage(error, 'Creation de service impossible'))
    }
  },
)

export const updateService = createAsyncThunk<Service, { id: number; payload: { code: string; name: string; divisionId: number; managerId?: number | null } }>(
  'admin/services/update',
  async ({ id, payload }, { rejectWithValue }) => {
    try {
      return await adminApi.updateService(id, payload)
    } catch (error) {
      return rejectWithValue(getApiErrorMessage(error, 'Mise a jour de service impossible'))
    }
  },
)

export const deleteService = createAsyncThunk<number, number>(
  'admin/services/delete',
  async (id, { rejectWithValue }) => {
    try {
      await adminApi.deleteService(id)
      return id
    } catch {
      return rejectWithValue('Suppression de service impossible') as unknown as number
    }
  },
)

const servicesSlice = createSlice({
  name: 'services',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchServices.pending, (state) => {
        state.status = 'loading'
        state.error = null
      })
      .addCase(fetchServices.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.items = action.payload
      })
      .addCase(fetchServices.rejected, (state, action) => {
        state.status = 'failed'
        state.error = (action.payload as string) ?? 'Erreur'
      })
      .addCase(createService.fulfilled, (state, action) => {
        state.items.unshift(action.payload)
      })
      .addCase(updateService.fulfilled, (state, action) => {
        state.items = state.items.map((item) => (item.id === action.payload.id ? action.payload : item))
      })
      .addCase(deleteService.fulfilled, (state, action) => {
        state.items = state.items.filter((item) => item.id !== action.payload)
      })
  },
})

export default servicesSlice.reducer
