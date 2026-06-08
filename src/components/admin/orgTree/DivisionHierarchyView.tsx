import { DeleteOutline, Edit } from '@mui/icons-material'
import { IconButton, Stack, Tooltip } from '@mui/material'
import { useMemo } from 'react'
import type { Direction, Division, Service } from '@/features/admin/adminTypes'
import { buildDivisionTree } from '@/features/admin/buildOrgTree'
import {
  OrgTreeDirectionBlock,
  OrgTreeDivisionBlock,
  OrgTreeEmpty,
  OrgTreeRoot,
  OrgTreeServiceRow,
} from '@/components/admin/orgTree/OrgTreePrimitives'

type Props = {
  divisions: Division[]
  directions: Direction[]
  services: Service[]
  onEdit: (division: Division) => void
  onDelete: (division: Division) => void
}

export default function DivisionHierarchyView({
  divisions,
  directions,
  services,
  onEdit,
  onDelete,
}: Props) {
  const tree = useMemo(
    () => buildDivisionTree(divisions, directions, services),
    [divisions, directions, services],
  )

  const divisionById = useMemo(() => new Map(divisions.map((d) => [d.id, d])), [divisions])

  if (!tree.length) {
    return <OrgTreeEmpty message="Aucune division à afficher. Créez une division rattachée à une direction." />
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
          {dir.divisions.map((div) => {
            const division = divisionById.get(div.id)
            return (
              <OrgTreeDivisionBlock
                key={div.id}
                code={div.code}
                name={div.name}
                serviceCount={div.serviceCount}
                showServices={div.services.length > 0}
                defaultExpanded={div.services.length <= 5}
                actions={
                  division ? (
                    <Stack direction="row" spacing={0.25}>
                      <Tooltip title="Modifier">
                        <IconButton size="small" color="info" onClick={() => onEdit(division)}>
                          <Edit fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Supprimer">
                        <IconButton size="small" color="error" onClick={() => onDelete(division)}>
                          <DeleteOutline fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Stack>
                  ) : null
                }
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
            )
          })}
        </OrgTreeDirectionBlock>
      ))}
    </OrgTreeRoot>
  )
}
