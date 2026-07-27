import Link from 'next/link'
import React from 'react'

import type { Project } from '@/payload-types'

import { Media } from '@/components/Media'
import { pillarLabel } from '@/fields/pillars'

export const ProjectCard: React.FC<{ project: Project; priority?: boolean }> = ({
  project,
  priority,
}) => {
  const featuredImage =
    typeof project.featuredImage === 'object' ? project.featuredImage : null

  return (
    <Link href={`/our-work/${project.slug}`} className="group block">
      <div className="relative overflow-hidden rounded-lg bg-muted">
        {featuredImage ? (
          <Media
            imgClassName="w-full aspect-[4/3] object-cover transition-transform duration-300 group-hover:scale-105"
            resource={featuredImage}
            priority={priority}
          />
        ) : (
          <div className="w-full aspect-[4/3]" />
        )}
        <span className="absolute top-3 left-3 bg-primary text-white text-xs font-medium px-3 py-1 rounded-full shadow-sm">
          {pillarLabel(project.pillar)}
        </span>
      </div>
      <div className="mt-4">
        <h3 className="text-lg font-medium text-foreground transition-colors group-hover:text-primary">
          {project.title}
        </h3>
        {project.location && (
          <p className="text-sm text-muted-foreground mt-1">{project.location}</p>
        )}
        <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
          {project.summary}
        </p>
      </div>
    </Link>
  )
}
