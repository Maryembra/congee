import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import type { CurrentUser } from '@/features/auth/authTypes'
import * as usersApi from '@/features/users/usersApi'
import type { FetchUsersParams, UserPayload, UserUpdatePayload } from '@/features/users/usersApi'

type UsersState = {
  items: CurrentUser[]
  page: number
  size: number
  totalElements: number
  totalPages: number
  activeCount: number
  inactiveCount: number
  pendingCount: number
  status: 'idle' | 'loading' | 'succeeded' | 'failed'
  error: string | null
}

const initialState: UsersState = {
  items: [],
  page: 0,
  size: 10,
  totalElements: 0,
  totalPages: 0,
  activeCount: 0,
  inactiveCount: 0,
  pendingCount: 0,
  status: 'idle',
  error: null,
}

export const fetchUsersPage = createAsyncThunk<usersApi.UserPageResponse, FetchUsersParams>(
  'users/fetchPage',
  async (params, { rejectWithValue }) => {
    try {
      return await usersApi.fetchUsersPage(params)
    } catch {
      return rejectWithValue('Impossible de charger les comptes')
    }
  },
)

export const createUser = createAsyncThunk<CurrentUser, UserPayload>('users/create', usersApi.createUser)
export const updateUser = createAsyncThunk<CurrentUser, { id: number; payload: UserUpdatePayload }>(
  'users/update',
  ({ id, payload }) => usersApi.updateUser(id, payload),
)
export const deactivateUser = createAsyncThunk<CurrentUser, number>('users/deactivate', usersApi.deactivateUser)

export const resendActivation = createAsyncThunk<number, number>('users/resendActivation', async (id) => {
  await usersApi.resendActivation(id)
  return id
})
export const fetchProfile = createAsyncThunk<CurrentUser>('users/profile/fetch', usersApi.fetchProfile)

const usersSlice = createSlice({
  name: 'users',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchUsersPage.pending, (state) => {
        state.status = 'loading'
        state.error = null
      })
      .addCase(fetchUsersPage.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.items = action.payload.content
        state.page = action.payload.page
        state.size = action.payload.size
        state.totalElements = action.payload.totalElements
        state.totalPages = action.payload.totalPages
        state.activeCount = action.payload.activeCount
        state.inactiveCount = action.payload.inactiveCount
        state.pendingCount = action.payload.pendingCount
      })
      .addCase(fetchUsersPage.rejected, (state, action) => {
        state.status = 'failed'
        state.error = (action.payload as string) ?? 'Erreur'
      })
      .addCase(createUser.fulfilled, (state, action) => {
        state.items.unshift(action.payload)
        state.totalElements += 1
        if (!(action.payload.accountActivated ?? true)) {
          state.pendingCount += 1
        } else if (action.payload.enabled) {
          state.activeCount += 1
        }
      })
      .addCase(updateUser.fulfilled, (state, action) => {
        state.items = state.items.map((item) => (item.id === action.payload.id ? action.payload : item))
      })
      .addCase(deactivateUser.fulfilled, (state, action) => {
        state.items = state.items.map((item) => (item.id === action.payload.id ? action.payload : item))
      })
  },
})

export default usersSlice.reducer
