import { Download } from '@mui/icons-material'

import {

  Alert,

  Box,

  Button,

  TextField,

  Typography,

} from '@mui/material'

import FormDialog from '@/components/organisms/FormDialog'

import FileUploadButton from '@/components/molecules/FileUploadButton'

import { typeCongeLabel } from '@/features/demandes/demandeLabels'

import { requiresMedicalPdfJustificatif, validateGenuinePdfClient } from '@/features/demandes/demandeRules'

import type { DemandeConge } from '@/features/demandes/demandeTypes'



type RejectProps = {

  open: boolean

  commentaire: string

  onCommentaireChange: (value: string) => void

  onClose: () => void

  onConfirm: () => void

}



export function DemandeRejectDialog({ open, commentaire, onCommentaireChange, onClose, onConfirm }: RejectProps) {

  return (

    <FormDialog

      open={open}

      title="Commentaire de rejet"

      onClose={onClose}

      onSave={onConfirm}

      saveLabel="Rejeter"
      saveColor="error"
      cancelLabel="Annuler"

      contentSx={{ pt: 2 }}

    >

      <TextField

        fullWidth

        multiline

        minRows={4}

        value={commentaire}

        onChange={(e) => onCommentaireChange(e.target.value)}

        label="Commentaire obligatoire"

      />

    </FormDialog>

  )

}



type SubmitProps = {

  target: DemandeConge | null

  justificatifFile: File | null

  justificatifError: string

  submitting: boolean

  onClose: () => void

  onFileChange: (file: File | null) => void

  onFileError: (message: string) => void

  onConfirm: () => void

}



export function DemandeSubmitDialog({

  target,

  justificatifFile,

  justificatifError,

  submitting,

  onClose,

  onFileChange,

  onFileError,

  onConfirm,

}: SubmitProps) {

  const handleFileChange = async (file: File | null) => {

    if (file && target && requiresMedicalPdfJustificatif(target.leaveType)) {

      const pdfError = await validateGenuinePdfClient(file)

      if (pdfError) {

        onFileError(pdfError)

        onFileChange(null)

        return

      }

    }

    onFileChange(file)

    onFileError('')

  }



  return (

    <FormDialog

      open={Boolean(target)}

      title="Justificatif manquant"

      onClose={onClose}

      onSave={onConfirm}

      saveLabel={submitting ? 'Soumission…' : 'Ajouter et soumettre'}

      loading={submitting}

      saveDisabled={!justificatifFile}

      contentSx={{ pt: 2 }}

    >

      <Alert severity="warning">

        {target && requiresMedicalPdfJustificatif(target.leaveType)

          ? 'Aucun certificat n’est encore associe. Ajoutez un PDF authentique (controle Apache Tika) pour soumettre la demande.'

          : 'Ajoutez un justificatif avant de soumettre la demande.'}

      </Alert>

      {target ? (

        <Box sx={{ p: 2, borderRadius: 2, bgcolor: 'background.default' }}>

          <Typography fontWeight={700}>{target.reference}</Typography>

          <Typography variant="body2" color="text.secondary">

            {typeCongeLabel[target.leaveType]} - {target.leaveStartDate} au {target.leaveEndDate}

          </Typography>

        </Box>

      ) : null}

      {justificatifError ? <Alert severity="error">{justificatifError}</Alert> : null}

      <FileUploadButton

        file={justificatifFile}

        onChange={(file) => void handleFileChange(file)}

        accept={target && requiresMedicalPdfJustificatif(target.leaveType) ? 'application/pdf,.pdf' : '.pdf,image/*'}

        label="Choisir le justificatif"

      />

    </FormDialog>

  )

}



type SignatureProps = {

  target: DemandeConge | null

  signatureFile: File | null

  signatureError: string

  signatureSubmitting: boolean

  hasExistingDocument: boolean

  onClose: () => void

  onFileChange: (file: File | null) => void

  onFileError: (message: string) => void

  onDownloadTemplate: () => void

  onConfirm: () => void

}



export function DemandeSignatureDialog({

  target,

  signatureFile,

  signatureError,

  signatureSubmitting,

  hasExistingDocument,

  onClose,

  onFileChange,

  onFileError,

  onDownloadTemplate,

  onConfirm,

}: SignatureProps) {

  const handleFileChange = async (file: File | null) => {

    if (file) {

      const pdfError = await validateGenuinePdfClient(file)

      if (pdfError) {

        onFileError(pdfError)

        onFileChange(null)

        return

      }

    }

    onFileChange(file)

    onFileError('')

  }



  return (

    <FormDialog

      open={Boolean(target)}

      title="Signer la demande"

      onClose={onClose}

      onSave={onConfirm}

      saveLabel={

        signatureSubmitting

          ? 'Signature…'

          : hasExistingDocument && !signatureFile

            ? 'Confirmer la signature'

            : 'Uploader et signer'

      }

      loading={signatureSubmitting}

      saveDisabled={!signatureFile && !hasExistingDocument}

      contentSx={{ pt: 2 }}

    >

      <Alert severity="info">

        Le document signe doit etre un fichier PDF authentique. Les fichiers renommes en .pdf ne seront pas acceptes.

      </Alert>

      <Button variant="outlined" startIcon={<Download />} onClick={onDownloadTemplate} sx={{ justifyContent: 'flex-start' }}>

        Telecharger le modele

      </Button>

      {target ? (

        <Box sx={{ p: 2, borderRadius: 2, bgcolor: 'background.default' }}>

          <Typography fontWeight={700}>{target.reference}</Typography>

          <Typography variant="body2" color="text.secondary">

            {target.applicant?.firstName} {target.applicant?.lastName} - {target.leaveStartDate} au {target.leaveEndDate}

          </Typography>

        </Box>

      ) : null}

      {hasExistingDocument ? (

        <Alert severity="success">

          Un document signe est deja associe a cette demande. Vous pouvez confirmer la signature.

        </Alert>

      ) : null}

      {signatureError ? <Alert severity="error">{signatureError}</Alert> : null}

      <FileUploadButton

        file={signatureFile}

        onChange={(file) => void handleFileChange(file)}

        accept="application/pdf,.pdf"

        label="Choisir le document signe (PDF uniquement)"

      />

    </FormDialog>

  )

}

