import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import type { AuthTokens, CurrentUser, RoleCode } from '@/features/auth/authTypes'
import { clearTokens, loadTokens, saveTokens, setAutoRefreshSuppressed } from '@/features/auth/authStorage'
import * as authApi from '@/services/authApi'
import { cancelPendingRefresh } from '@/services/sessionRefresh'
import { getApiErrorMessage } from '@/services/apiError'

const allowedRoles: RoleCode[] = ['ADMIN', 'FONCTIONNAIRE', 'CHEF_HIERARCHIE', 'SIGNATAIRE']

type JwtPayload = {
  roles?: string[]
}

const decodeJwtPayload = (token: string): JwtPayload | null => {
  try {
    const payloadPart = token.split('.')[1]
    if (!payloadPart) return null
    const normalized = payloadPart.replace(/-/g, '+').replace(/_/g, '/')
    const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, '=')
    return JSON.parse(atob(padded)) as JwtPayload
  } catch {
    return null
  }
}

const getRolesFromToken = (token: string | null): RoleCode[] => {
  if (!token) return []
  const payload = decodeJwtPayload(token)
  if (!payload?.roles) return []
  return payload.roles.filter((role): role is RoleCode => allowedRoles.includes(role as RoleCode))
}

type AuthState = {
  accessToken: string | null
  tokenType: string
  user: CurrentUser | null
  roles: RoleCode[]
  status: 'idle' | 'loading' | 'authenticated' | 'error'
  sessionChecked: boolean
  error: string | null
}

const stored = loadTokens()

const initialState: AuthState = {
  accessToken: stored?.accessToken ?? null,
  tokenType: stored?.tokenType ?? 'Bearer',
  user: null,
  roles: getRolesFromToken(stored?.accessToken ?? null),
  status: stored?.accessToken ? 'authenticated' : 'idle',
  sessionChecked: false,
  error: null,
}

export const login = createAsyncThunk<AuthTokens, { login: string; password: string }>(
  'auth/login',
  async (payload, { rejectWithValue }) => {
    try {
      return await authApi.login(payload)
    } catch (error) {
      return rejectWithValue(getApiErrorMessage(error, 'Identifiants invalides'))
    }
  },
)

export const refreshSession = createAsyncThunk<AuthTokens, void>(
  'auth/refresh',
  async (_, { rejectWithValue }) => {
    try {
      return await authApi.refresh()
    } catch {
      clearTokens()
      return rejectWithValue('Session expiree')
    }
  },
)

export const logout = createAsyncThunk<void, void>(
  'auth/logout',
  async (_, { dispatch }) => {
    setAutoRefreshSuppressed(true)
    cancelPendingRefresh()
    try {
      await authApi.logout()
    } catch {
      // Ignore logout errors, local cleanup will still happen.
    }
    dispatch(clearAuth())
  },
)

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setTokens: (state, action) => {
      const tokens = action.payload as AuthTokens
      state.accessToken = tokens.accessToken
      state.tokenType = tokens.tokenType ?? 'Bearer'
      state.user = null
      state.roles = getRolesFromToken(tokens.accessToken)
      state.status = 'authenticated'
      state.error = null
      saveTokens(tokens)
    },
    clearAuth: (state) => {
      state.accessToken = null
      state.tokenType = 'Bearer'
      state.user = null
      state.roles = []
      state.status = 'idle'
      state.error = null
      clearTokens()
    },
    setCurrentUser: (state, action) => {
      const user = action.payload as CurrentUser
      state.user = user
      state.roles = user.roles
    },
    setSessionChecked: (state) => {
      state.sessionChecked = true
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.status = 'loading'
        state.error = null
      })
      .addCase(login.fulfilled, (state, action) => {
        state.accessToken = action.payload.accessToken
        state.tokenType = action.payload.tokenType ?? 'Bearer'
        state.user = null
        state.roles = getRolesFromToken(action.payload.accessToken)
        state.status = 'authenticated'
        state.error = null
        saveTokens(action.payload)
      })
      .addCase(login.rejected, (state, action) => {
        state.status = 'error'
        state.error = (action.payload as string) ?? 'Erreur de connexion'
      })
      .addCase(refreshSession.fulfilled, (state, action) => {
        state.accessToken = action.payload.accessToken
        state.tokenType = action.payload.tokenType ?? 'Bearer'
        state.roles = getRolesFromToken(action.payload.accessToken)
        state.status = 'authenticated'
        saveTokens(action.payload)
      })
      .addCase(refreshSession.rejected, (state) => {
        state.accessToken = null
        state.tokenType = 'Bearer'
        state.user = null
        state.roles = []
        state.status = 'idle'
      })
  },
})

export const { setTokens, clearAuth, setCurrentUser, setSessionChecked } = authSlice.actions
export default authSlice.reducer
