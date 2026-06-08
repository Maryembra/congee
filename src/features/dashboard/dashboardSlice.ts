import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import * as dashboardApi from '@/features/dashboard/dashboardApi'
import type { DashboardComplete } from '@/features/dashboard/dashboardTypes'

type DashboardState = {
  data: DashboardComplete | null
  status: 'idle' | 'loading' | 'succeeded' | 'failed'
  error: string | null
}

const initialState: DashboardState = {
  data: null,
  status: 'idle',
  error: null,
}

export const fetchDashboard = createAsyncThunk<DashboardComplete, { annee: number }>(
  'dashboard/fetch',
  async ({ annee }, { rejectWithValue }) => {
    try {
      return await dashboardApi.fetchDashboard(annee)
    } catch {
      return rejectWithValue('Impossible de charger les statistiques')
    }
  },
)

const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchDashboard.pending, (state) => {
        state.status = 'loading'
        state.error = null
      })
      .addCase(fetchDashboard.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.data = action.payload
      })
      .addCase(fetchDashboard.rejected, (state, action) => {
        state.status = 'failed'
        state.error = (action.payload as string) ?? 'Erreur'
      })
  },
})

export default dashboardSlice.reducer
