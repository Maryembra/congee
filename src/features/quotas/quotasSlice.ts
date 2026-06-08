import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { getApiErrorMessage } from '@/services/apiError'
import * as quotasApi from '@/features/quotas/quotasApi'
import type { QuotaConge, QuotaPayload } from '@/features/quotas/quotasTypes'

type QuotasState = {
  items: QuotaConge[]
  status: 'idle' | 'loading' | 'succeeded' | 'failed'
  error: string | null
}

const initialState: QuotasState = {
  items: [],
  status: 'idle',
  error: null,
}

export const fetchQuotas = createAsyncThunk<QuotaConge[], { admin: boolean; annee?: number }>(
  'quotas/fetch',
  async ({ admin, annee }, { rejectWithValue }) => {
    try {
      return admin ? await quotasApi.fetchAllQuotas() : await quotasApi.fetchMyQuotas(annee)
    } catch {
      return rejectWithValue('Impossible de charger les quotas')
    }
  },
)

export const saveQuota = createAsyncThunk<QuotaConge, QuotaPayload>(
  'quotas/save',
  async (payload, { rejectWithValue }) => {
    try {
      return await quotasApi.saveQuota(payload)
    } catch (error) {
      return rejectWithValue(getApiErrorMessage(error, 'Enregistrement du quota impossible'))
    }
  },
)
export const updateQuota = createAsyncThunk<QuotaConge, { id: number; payload: QuotaPayload }>(
  'quotas/update',
  ({ id, payload }) => quotasApi.updateQuota(id, payload),
)
export const applyQuotaToAll = createAsyncThunk<QuotaConge[], QuotaPayload>(
  'quotas/applyAll',
  async (payload, { rejectWithValue }) => {
    try {
      return await quotasApi.applyQuotaToAll({
        leaveType: payload.leaveType,
        year: payload.year,
        initialQuota: payload.initialQuota,
      })
    } catch (error) {
      return rejectWithValue(getApiErrorMessage(error, 'Application du quota a tous impossible'))
    }
  },
)
export const deleteQuota = createAsyncThunk<number, number>('quotas/delete', async (id) => {
  await quotasApi.deleteQuota(id)
  return id
})

const quotasSlice = createSlice({
  name: 'quotas',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchQuotas.pending, (state) => {
        state.status = 'loading'
        state.error = null
      })
      .addCase(fetchQuotas.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.items = action.payload
      })
      .addCase(fetchQuotas.rejected, (state, action) => {
        state.status = 'failed'
        state.error = (action.payload as string) ?? 'Erreur'
      })
      .addCase(saveQuota.fulfilled, (state, action) => {
        state.items = [action.payload, ...state.items.filter((item) => item.id !== action.payload.id)]
      })
      .addCase(updateQuota.fulfilled, (state, action) => {
        state.items = state.items.map((item) => (item.id === action.payload.id ? action.payload : item))
      })
      .addCase(applyQuotaToAll.pending, (state) => {
        state.status = 'loading'
        state.error = null
      })
      .addCase(applyQuotaToAll.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.items = action.payload
        state.error = null
      })
      .addCase(applyQuotaToAll.rejected, (state, action) => {
        state.status = 'failed'
        state.error = (action.payload as string) ?? 'Erreur'
      })
      .addCase(saveQuota.rejected, (state, action) => {
        state.error = (action.payload as string) ?? 'Erreur'
      })
      .addCase(deleteQuota.fulfilled, (state, action) => {
        state.items = state.items.filter((item) => item.id !== action.payload)
      })
  },
})

export default quotasSlice.reducer
