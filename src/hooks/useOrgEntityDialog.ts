import { useState } from 'react'
import {
  useForm,
  type DefaultValues,
  type FieldValues,
  type UseFormReturn,
} from 'react-hook-form'
import { getApiErrorMessage } from '@/services/apiError'

type Options<TValues extends FieldValues, TEntity> = {
  defaultValues: DefaultValues<TValues>
  toFormValues: (entity: TEntity) => TValues
  onSave: (values: TValues, editing: TEntity | null) => Promise<void>
  onSuccess?: (isEdit: boolean) => void
}

export type OrgEntityDialogState<TValues extends FieldValues, TEntity> = {
  open: boolean
  editing: TEntity | null
  apiError: string | null
  form: UseFormReturn<TValues>
  isSubmitting: boolean
  openCreate: () => void
  openEdit: (entity: TEntity) => void
  close: () => void
  submit: () => void
}

export function useOrgEntityDialog<TValues extends FieldValues, TEntity>(
  options: Options<TValues, TEntity>,
): OrgEntityDialogState<TValues, TEntity> {
  const { defaultValues, toFormValues, onSave, onSuccess } = options
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<TEntity | null>(null)
  const [apiError, setApiError] = useState<string | null>(null)

  const form = useForm<TValues>({ defaultValues })

  const openCreate = () => {
    setEditing(null)
    setApiError(null)
    form.reset(defaultValues)
    setOpen(true)
  }

  const openEdit = (entity: TEntity) => {
    setEditing(entity)
    setApiError(null)
    form.reset(toFormValues(entity))
    setOpen(true)
  }

  const close = () => {
    if (form.formState.isSubmitting) return
    setOpen(false)
    setEditing(null)
    setApiError(null)
  }

  const submit = form.handleSubmit(async (values) => {
    setApiError(null)
    try {
      await onSave(values, editing)
      onSuccess?.(Boolean(editing))
      setOpen(false)
      setEditing(null)
    } catch (err) {
      setApiError(getApiErrorMessage(err, 'Operation impossible'))
    }
  })

  return {
    open,
    editing,
    apiError,
    form,
    isSubmitting: form.formState.isSubmitting,
    openCreate,
    openEdit,
    close,
    submit,
  }
}
