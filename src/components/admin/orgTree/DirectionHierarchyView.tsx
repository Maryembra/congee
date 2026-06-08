import { DeleteOutline, Edit } from '@mui/icons-material'
import { IconButton, Stack, Tooltip, Typography } from '@mui/material'
import { useMemo } from 'react'
import type { Direction, Division, Service } from '@/features/admin/adminTypes'
import { buildOrgTree } from '@/features/admin/buildOrgTree'
import {
  OrgTreeDirectionBlock,
  OrgTreeDivisionBlock,
  OrgTreeEmpty,
  OrgTreeRoot,
  OrgTreeServiceRow,
} from '@/components/admin/orgTree/OrgTreePrimitives'

type Props = {
  directions: Direction[]
  divisions: Division[]
  services: Service[]
  onEdit: (direction: Direction) => void
  onDelete: (direction: Direction) => void
}

export default function DirectionHierarchyView({
  directions,
  divisions,
  services,
  onEdit,
  onDelete,
}: Props) {
  const tree = useMemo(() => buildOrgTree(directions, divisions, services), [directions, divisions, services])

  const directionById = useMemo(() => new Map(directions.map((d) => [d.id, d])), [directions])

  if (!tree.length) {
    return <OrgTreeEmpty message="Aucune direction à afficher. Créez une direction pour démarrer l'organigramme." />
  }

  return (
    <OrgTreeRoot>
      {tree.map((dir) => {
        const direction = directionById.get(dir.id)
        const signataireLabel = dir.signatoryLastName
          ? `${dir.signatoryFirstName ?? ''} ${dir.signatoryLastName}`.trim()
          : null

        return (
          <OrgTreeDirectionBlock
            key={dir.id}
            code={dir.code}
            name={dir.name}
            divisionCount={dir.divisionCount}
            serviceCount={dir.serviceCount}
            signataireLabel={signataireLabel}
            actions={
              direction ? (
                <Stack direction="row" spacing={0.25}>
                  <Tooltip title="Modifier">
                    <IconButton
                      size="small"
                      onClick={() => onEdit(direction)}
                      sx={{ color: 'inherit', bgcolor: 'rgba(255,255,255,0.12)' }}
                    >
                      <Edit fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Supprimer">
                    <IconButton
                      size="small"
                      onClick={() => onDelete(direction)}
                      sx={{ color: 'inherit', bgcolor: 'rgba(255,255,255,0.12)' }}
                    >
                      <DeleteOutline fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Stack>
              ) : null
            }
          >
            {dir.divisions.length === 0 ? (
              <Typography variant="body2" color="text.secondary" sx={{ pl: 1, fontStyle: 'italic' }}>
                Aucune division rattachée
              </Typography>
            ) : (
              dir.divisions.map((div) => (
                <OrgTreeDivisionBlock
                  key={div.id}
                  code={div.code}
                  name={div.name}
                  serviceCount={div.serviceCount}
                  showServices={div.services.length > 0}
                  defaultExpanded={div.services.length <= 4}
                >
                  {div.services.map((svc) => (
                    <OrgTreeServiceRow
                      key={svc.id}
                      code={svc.code}
                      name={svc.name}
                      managerLabel={
                        svc.managerLastName
                          ? `${svc.managerFirstName ?? ''} ${svc.managerLastName}`.trim()
                          : 'Non assigné'
                      }
                      agentCount={svc.agentCount}
                    />
                  ))}
                </OrgTreeDivisionBlock>
              ))
            )}
          </OrgTreeDirectionBlock>
        )
      })}
    </OrgTreeRoot>
  )
}
