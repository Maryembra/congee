export type DirectionFormValues = {
  code: string
  name: string
}

export const emptyDirectionForm: DirectionFormValues = {
  code: '',
  name: '',
}

export type DivisionFormValues = {
  code: string
  name: string
  directionId: string
}

export const emptyDivisionForm: DivisionFormValues = {
  code: '',
  name: '',
  directionId: '',
}

export type ServiceFormValues = {
  code: string
  name: string
  divisionId: string
}

export const emptyServiceForm: ServiceFormValues = {
  code: '',
  name: '',
  divisionId: '',
}

export type JourFerieFormValues = {
  date: string
  label: string
}

export const emptyJourFerieForm: JourFerieFormValues = {
  date: '',
  label: '',
}
