import type { Direction, Division, Service } from '@/features/admin/adminTypes'

export type OrgTreeServiceNode = {
  id: number
  code: string
  name: string
  managerLastName?: string | null
  managerFirstName?: string | null
  agentCount: number
}

export type OrgTreeDivisionNode = {
  id: number
  code: string
  name: string
  services: OrgTreeServiceNode[]
  serviceCount: number
}

export type OrgTreeDirectionNode = {
  id: number
  code: string
  name: string
  signatoryLastName?: string | null
  signatoryFirstName?: string | null
  divisions: OrgTreeDivisionNode[]
  divisionCount: number
  serviceCount: number
}

export function buildOrgTree(
  directions: Direction[],
  divisions: Division[],
  services: Service[],
): OrgTreeDirectionNode[] {
  const directionMap = new Map<number, OrgTreeDirectionNode>()

  for (const direction of directions) {
    directionMap.set(direction.id, {
      id: direction.id,
      code: direction.code,
      name: direction.name,
      signatoryLastName: direction.signatoryLastName,
      signatoryFirstName: direction.signatoryFirstName,
      divisions: [],
      divisionCount: 0,
      serviceCount: 0,
    })
  }

  const divisionNodes = new Map<number, OrgTreeDivisionNode>()

  for (const division of divisions) {
    const divNode: OrgTreeDivisionNode = {
      id: division.id,
      code: division.code,
      name: division.name,
      services: [],
      serviceCount: 0,
    }
    divisionNodes.set(division.id, divNode)

    let dir = directionMap.get(division.directionId)
    if (!dir) {
      dir = {
        id: division.directionId,
        code: division.directionCode,
        name: division.directionName,
        divisions: [],
        divisionCount: 0,
        serviceCount: 0,
      }
      directionMap.set(division.directionId, dir)
    }
    dir.divisions.push(divNode)
    dir.divisionCount += 1
  }

  for (const service of services) {
    let div = divisionNodes.get(service.divisionId)
    if (!div) {
      div = {
        id: service.divisionId,
        code: service.divisionCode,
        name: service.divisionName,
        services: [],
        serviceCount: 0,
      }
      divisionNodes.set(service.divisionId, div)

      let dir = directionMap.get(service.directionId)
      if (!dir) {
        dir = {
          id: service.directionId,
          code: service.directionCode,
          name: service.directionName,
          divisions: [],
          divisionCount: 0,
          serviceCount: 0,
        }
        directionMap.set(service.directionId, dir)
      }
      if (!dir.divisions.some((d) => d.id === div!.id)) {
        dir.divisions.push(div)
        dir.divisionCount += 1
      }
    }

    div.services.push({
      id: service.id,
      code: service.code,
      name: service.name,
      managerLastName: service.managerLastName,
      managerFirstName: service.managerFirstName,
      agentCount: service.agentCount ?? 0,
    })
    div.serviceCount += 1

    const dir = directionMap.get(service.directionId)
    if (dir) dir.serviceCount += 1
  }

  for (const dir of directionMap.values()) {
    dir.divisions.sort((a, b) => a.name.localeCompare(b.name))
    for (const div of dir.divisions) {
      div.services.sort((a, b) => a.name.localeCompare(b.name))
    }
  }

  return [...directionMap.values()].sort((a, b) => a.name.localeCompare(b.name))
}

/** Arbre centré sur les divisions (directions déduites). */
export function buildDivisionTree(
  divisions: Division[],
  directions: Direction[],
  services: Service[],
): OrgTreeDirectionNode[] {
  const directionIds = new Set(divisions.map((d) => d.directionId))
  const filteredDirections = directions.filter((d) => directionIds.has(d.id))
  const divisionIds = new Set(divisions.map((d) => d.id))
  const filteredServices = services.filter((s) => divisionIds.has(s.divisionId))
  return buildOrgTree(filteredDirections, divisions, filteredServices)
}

/** Arbre centré sur les services. */
export function buildServiceTree(services: Service[]): OrgTreeDirectionNode[] {
  if (!services.length) return []

  const pseudoDirections: Direction[] = []
  const pseudoDivisions: Division[] = []
  const seenDir = new Set<number>()
  const seenDiv = new Set<number>()

  for (const s of services) {
    if (!seenDir.has(s.directionId)) {
      seenDir.add(s.directionId)
      pseudoDirections.push({
        id: s.directionId,
        code: s.directionCode,
        name: s.directionName,
      })
    }
    if (!seenDiv.has(s.divisionId)) {
      seenDiv.add(s.divisionId)
      pseudoDivisions.push({
        id: s.divisionId,
        code: s.divisionCode,
        name: s.divisionName,
        directionId: s.directionId,
        directionCode: s.directionCode,
        directionName: s.directionName,
      })
    }
  }

  return buildOrgTree(pseudoDirections, pseudoDivisions, services)
}
