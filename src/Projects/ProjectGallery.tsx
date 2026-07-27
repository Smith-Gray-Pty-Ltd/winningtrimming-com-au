'use client'

import Link from 'next/link'
import React, { useMemo, useState } from 'react'

import type { Project, ServiceType } from '@/payload-types'

import { ProjectCard } from './ProjectCard'
import { pillarLabel, pillarOptions } from '@/fields/pillars'
import { cn } from 'src/utilities/cn'

type Args = {
  projects: Project[]
  serviceTypes: ServiceType[]
}

const FilterButton: React.FC<{
  active: boolean
  onClick: () => void
  children: React.ReactNode
}> = ({ active, onClick, children }) => (
  <button
    type="button"
    onClick={onClick}
    className={cn(
      'rounded-full border px-4 py-1.5 text-sm font-medium transition-colors',
      active
        ? 'border-primary bg-primary text-white'
        : 'border-border bg-white text-foreground hover:border-primary hover:text-primary',
    )}
  >
    {children}
  </button>
)

export const ProjectGallery: React.FC<Args> = ({ projects, serviceTypes }) => {
  const [pillar, setPillar] = useState<string>('all')
  const [type, setType] = useState<string>('all')

  const availablePillars = useMemo(
    () =>
      pillarOptions
        .map((o) => o.value)
        .filter((v) => projects.some((p) => p.pillar === v)),
    [projects],
  )

  const availableTypes = useMemo(
    () =>
      serviceTypes.filter((t) =>
        projects.some((p) =>
          (p.serviceTypes ?? []).some((s) => typeof s === 'object' && s.id === t.id),
        ),
      ),
    [projects, serviceTypes],
  )

  const filtered = useMemo(
    () =>
      projects.filter((p) => {
        if (pillar !== 'all' && p.pillar !== pillar) return false
        if (type !== 'all') {
          const ids = (p.serviceTypes ?? [])
            .filter((s) => typeof s === 'object')
            .map((s) => s.id)
          if (!ids.includes(type)) return false
        }
        return true
      }),
    [projects, pillar, type],
  )

  if (projects.length === 0) {
    return (
      <p className="text-muted-foreground">
        Projects will appear here soon. In the meantime,{' '}
        <Link href="/contact" className="text-primary underline">
          request a quote
        </Link>{' '}
        and we can share examples relevant to your project.
      </p>
    )
  }

  return (
    <div>
      {/* Pillar filter */}
      {availablePillars.length > 1 && (
        <div className="flex flex-wrap gap-2 mb-3">
          <FilterButton active={pillar === 'all'} onClick={() => setPillar('all')}>
            All work
          </FilterButton>
          {availablePillars.map((v) => (
            <FilterButton key={v} active={pillar === v} onClick={() => setPillar(v)}>
              {pillarLabel(v)}
            </FilterButton>
          ))}
        </div>
      )}

      {/* Service-type filter */}
      {availableTypes.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-10">
          <FilterButton active={type === 'all'} onClick={() => setType('all')}>
            All types
          </FilterButton>
          {availableTypes.map((t) => (
            <FilterButton key={t.id} active={type === t.id} onClick={() => setType(t.id)}>
              {t.title}
            </FilterButton>
          ))}
        </div>
      )}

      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12">
          {filtered.map((project, i) => (
            <ProjectCard key={project.id} project={project} priority={i < 3} />
          ))}
        </div>
      ) : (
        <p className="text-muted-foreground">No projects match this filter yet.</p>
      )}
    </div>
  )
}
