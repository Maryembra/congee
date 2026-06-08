import type { Fonctionnaire } from '@/features/admin/adminTypes'

export type RoleCode = 'ADMIN' | 'FONCTIONNAIRE' | 'CHEF_HIERARCHIE' | 'SIGNATAIRE'

export type CurrentUser = {
  id: number
  username: string
  email: string
  enabled: boolean
  accountActivated: boolean
  roles: RoleCode[]
  fonctionnaire?: Fonctionnaire | null
}

export type AuthTokens = {
  accessToken: string
  tokenType?: string
}
