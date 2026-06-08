import { DeleteOutline, Edit } from '@mui/icons-material'
import { IconButton, Stack, Tooltip } from '@mui/material'
import { useMemo } from 'react'
import type { Service } from '@/features/admin/adminTypes'
import { buildServiceTree } from '@/features/admin/buildOrgTree'
import {
  OrgTreeDirectionBlock,
  OrgTreeDivisionBlock,
  OrgTreeEmpty,
  OrgTreeRoot,
  OrgTreeServiceRow,
} from '@/components/admin/orgTree/OrgTreePrimitives'

type Props = {
  services: Service[]
  onEdit: (service: Service) => void
  onDelete: (service: Service) => void
}

export default function ServiceHierarchyView({ services, onEdit, onDelete }: Props) {
  const tree = useMemo(() => buildServiceTree(services), [services])

  const serviceById = useMemo(() => new Map(services.map((s) => [s.id, s])), [services])

  if (!tree.length) {
    return <OrgTreeEmpty message="Aucun service à afficher. Créez un service rattaché à une division." />
  }

  return (
    <OrgTreeRoot>
      {tree.map((dir) => (
        <OrgTreeDirectionBlock
          key={dir.id}
          code={dir.code}
          name={dir.name}
          divisionCount={dir.divisionCount}
          serviceCount={dir.serviceCount}
          defaultExpanded
        >
          {dir.divisions.map((div) => (
            <OrgTreeDivisionBlock
              key={div.id}
              code={div.code}
              name={div.name}
              serviceCount={div.serviceCount}
              showServices
              defaultExpanded
            >
              {div.services.map((svc) => {
                const service = serviceById.get(svc.id)
                return (
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
                    actions={
                      service ? (
                        <Stack direction="row" spacing={0.25}>
                          <Tooltip title="Modifier">
                            <IconButton size="small" color="primary" onClick={() => onEdit(service)}>
                              <Edit fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Supprimer">
                            <IconButton size="small" color="error" onClick={() => onDelete(service)}>
                              <DeleteOutline fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Stack>
                      ) : null
                    }
                  />
                )
              })}
            </OrgTreeDivisionBlock>
          ))}
        </OrgTreeDirectionBlock>
      ))}
    </OrgTreeRoot>
  )
}
