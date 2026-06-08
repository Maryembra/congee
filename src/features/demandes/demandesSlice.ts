import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { getApiErrorMessage } from '@/services/apiError'
import * as demandesApi from '@/features/demandes/demandesApi'
import type { DemandeConge, DemandeHistory, DemandePayload, DocumentConge, TypeDocument } from '@/features/demandes/demandeTypes'

type DemandState = {
  items: DemandeConge[]
  selectedHistory: DemandeHistory | null
  documentsByDemande: Record<number, DocumentConge[]>
  status: 'idle' | 'loading' | 'succeeded' | 'failed'
  actionStatus: 'idle' | 'loading' | 'failed'
  error: string | null
}

const initialState: DemandState = {
  items: [],
  selectedHistory: null,
  documentsByDemande: {},
  status: 'idle',
  actionStatus: 'idle',
  error: null,
}

export const fetchDemandes = createAsyncThunk<DemandeConge[], demandesApi.DemandeScope>(
  'demandes/fetch',
  async (scope, { rejectWithValue }) => {
    try {
      return await demandesApi.fetchDemandes(scope)
    } catch (error) {
      return rejectWithValue(getApiErrorMessage(error, 'Impossible de charger les demandes'))
    }
  },
)

export const createDemande = createAsyncThunk<DemandeConge, DemandePayload>(
  'demandes/create',
  async (payload, { rejectWithValue }) => {
    try {
      return await demandesApi.createDemande(payload)
    } catch (error) {
      return rejectWithValue(getApiErrorMessage(error, 'Creation de demande impossible'))
    }
  },
)

export const updateDemande = createAsyncThunk<DemandeConge, { id: number; payload: DemandePayload }>(
  'demandes/update',
  async ({ id, payload }, { rejectWithValue }) => {
    try {
      return await demandesApi.updateDemande(id, payload)
    } catch (error) {
      return rejectWithValue(getApiErrorMessage(error, 'Modification de demande impossible'))
    }
  },
)

export const fetchDemandeHistory = createAsyncThunk<DemandeHistory, number>(
  'demandes/history',
  async (id, { rejectWithValue }) => {
    try {
      return await demandesApi.fetchDemandeHistory(id)
    } catch (error) {
      return rejectWithValue(getApiErrorMessage(error, "Impossible de charger l'historique"))
    }
  },
)

export const submitDemande = createAsyncThunk<DemandeConge, number>('demandes/submit', async (id, { rejectWithValue }) => {
  try {
    return await demandesApi.submitDemande(id)
  } catch (error) {
    return rejectWithValue(getApiErrorMessage(error, 'Soumission impossible'))
  }
})

export const validateChef = createAsyncThunk<DemandeConge, number>('demandes/validateChef', async (id, { rejectWithValue }) => {
  try {
    return await demandesApi.validateChef(id)
  } catch (error) {
    return rejectWithValue(getApiErrorMessage(error, 'Validation impossible'))
  }
})

export const signDemande = createAsyncThunk<DemandeConge, number>('demandes/sign', async (id, { rejectWithValue }) => {
  try {
    return await demandesApi.signDemande(id)
  } catch (error) {
    return rejectWithValue(getApiErrorMessage(error, 'Signature impossible'))
  }
})

export const cancelDemande = createAsyncThunk<DemandeConge, number>('demandes/cancel', async (id, { rejectWithValue }) => {
  try {
    return await demandesApi.cancelDemande(id)
  } catch (error) {
    return rejectWithValue(getApiErrorMessage(error, 'Annulation impossible'))
  }
})

export const rejectChef = createAsyncThunk<DemandeConge, { id: number; commentaire: string }>(
  'demandes/rejectChef',
  async ({ id, commentaire }, { rejectWithValue }) => {
    try {
      return await demandesApi.rejectChef(id, commentaire)
    } catch (error) {
      return rejectWithValue(getApiErrorMessage(error, 'Rejet impossible'))
    }
  },
)

export const rejectDirecteur = createAsyncThunk<DemandeConge, { id: number; commentaire: string }>(
  'demandes/rejectDirecteur',
  async ({ id, commentaire }, { rejectWithValue }) => {
    try {
      return await demandesApi.rejectDirecteur(id, commentaire)
    } catch (error) {
      return rejectWithValue(getApiErrorMessage(error, 'Rejet impossible'))
    }
  },
)

export const fetchDocuments = createAsyncThunk<DocumentConge[], number>(
  'demandes/documents',
  async (demandeId, { rejectWithValue }) => {
    try {
      return await demandesApi.fetchDocuments(demandeId)
    } catch (error) {
      return rejectWithValue(getApiErrorMessage(error, 'Impossible de charger les documents'))
    }
  },
)

export const uploadDocument = createAsyncThunk<DocumentConge, { demandeId: number; typeDocument: TypeDocument; file: File }>(
  'demandes/uploadDocument',
  async ({ demandeId, typeDocument, file }, { rejectWithValue }) => {
    try {
      return await demandesApi.uploadDocument(demandeId, typeDocument, file)
    } catch (error) {
      return rejectWithValue(getApiErrorMessage(error, 'Envoi du document impossible'))
    }
  },
)

export const deleteDocument = createAsyncThunk<{ demandeId: number; documentId: number }, { demandeId: number; documentId: number }>(
  'demandes/deleteDocument',
  async ({ demandeId, documentId }, { rejectWithValue }) => {
    try {
      await demandesApi.deleteDocument(documentId)
      return { demandeId, documentId }
    } catch (error) {
      return rejectWithValue(getApiErrorMessage(error, 'Suppression du document impossible'))
    }
  },
)

const upsertDemande = (items: DemandeConge[], demande: DemandeConge) => {
  const exists = items.some((item) => item.id === demande.id)
  return exists ? items.map((item) => (item.id === demande.id ? demande : item)) : [demande, ...items]
}

const demandesSlice = createSlice({
  name: 'demandes',
  initialState,
  reducers: {
    clearDemandesError: (state) => {
      state.error = null
    },
    clearSelectedHistory: (state) => {
      state.selectedHistory = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchDemandes.pending, (state) => {
        state.status = 'loading'
        state.error = null
      })
      .addCase(fetchDemandes.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.items = action.payload
      })
      .addCase(fetchDemandes.rejected, (state, action) => {
        state.status = 'failed'
        state.items = []
        state.error = (action.payload as string) ?? 'Impossible de charger les demandes'
      })
      .addCase(createDemande.fulfilled, (state, action) => {
        state.actionStatus = 'idle'
        state.items = upsertDemande(state.items, action.payload)
      })
      .addCase(updateDemande.fulfilled, (state, action) => {
        state.actionStatus = 'idle'
        state.items = upsertDemande(state.items, action.payload)
      })
      .addCase(fetchDemandeHistory.fulfilled, (state, action) => {
        state.selectedHistory = action.payload
      })
      .addCase(fetchDocuments.fulfilled, (state, action) => {
        const demandeId = action.meta.arg
        state.documentsByDemande[demandeId] = action.payload
      })
      .addCase(uploadDocument.fulfilled, (state, action) => {
        const demandeId = action.meta.arg.demandeId
        state.documentsByDemande[demandeId] = [action.payload, ...(state.documentsByDemande[demandeId] ?? [])]
      })
      .addCase(deleteDocument.fulfilled, (state, action) => {
        const { demandeId, documentId } = action.payload
        state.documentsByDemande[demandeId] = (state.documentsByDemande[demandeId] ?? []).filter(
          (document) => document.id !== documentId,
        )
      })
      .addMatcher(
        (action) =>
          action.type.startsWith('demandes/') &&
          action.type.endsWith('/pending') &&
          !action.type.includes('/fetch'),
        (state) => {
          state.actionStatus = 'loading'
          state.error = null
        },
      )
      .addMatcher(
        (action) =>
          action.type.startsWith('demandes/') &&
          action.type.endsWith('/fulfilled') &&
          ['submit', 'validateChef', 'sign', 'cancel', 'rejectChef', 'rejectDirecteur'].some((name) =>
            action.type.includes(name),
          ),
        (state, action: { payload: DemandeConge }) => {
          state.actionStatus = 'idle'
          state.items = upsertDemande(state.items, action.payload)
        },
      )
      .addMatcher(
        (action) => action.type.startsWith('demandes/') && action.type.endsWith('/rejected'),
        (state, action: { type: string; payload?: string; error?: { message?: string } }) => {
          state.actionStatus = 'failed'
          if (!action.type.includes('/fetch')) {
            state.error = action.payload ?? action.error?.message ?? 'Operation impossible'
          }
        },
      )
  },
})

export const { clearDemandesError, clearSelectedHistory } = demandesSlice.actions
export default demandesSlice.reducer
