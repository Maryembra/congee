import { combineReducers, configureStore } from '@reduxjs/toolkit'
import { clearAuth } from '@/features/auth/authSlice'
import authReducer from '@/features/auth/authSlice'
import directionsReducer from '@/features/admin/directionsSlice'
import divisionsReducer from '@/features/admin/divisionsSlice'
import servicesReducer from '@/features/admin/servicesSlice'
import fonctionnairesReducer from '@/features/admin/fonctionnairesSlice'
import joursFeriesReducer from '@/features/admin/joursFeriesSlice'
import demandesReducer from '@/features/demandes/demandesSlice'
import dashboardReducer from '@/features/dashboard/dashboardSlice'
import quotasReducer from '@/features/quotas/quotasSlice'
import usersReducer from '@/features/users/usersSlice'

const appReducer = combineReducers({
  auth: authReducer,
  directions: directionsReducer,
  divisions: divisionsReducer,
  services: servicesReducer,
  fonctionnaires: fonctionnairesReducer,
  joursFeries: joursFeriesReducer,
  demandes: demandesReducer,
  dashboard: dashboardReducer,
  quotas: quotasReducer,
  users: usersReducer,
})

const rootReducer = (state: ReturnType<typeof appReducer> | undefined, action: { type: string }) => {
  if (action.type === clearAuth.type) {
    const resetState = appReducer(undefined, action)
    return {
      ...resetState,
      auth: {
        ...resetState.auth,
        sessionChecked: true,
      },
    }
  }

  return appReducer(state, action)
}

export const store = configureStore({
  reducer: rootReducer,
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
