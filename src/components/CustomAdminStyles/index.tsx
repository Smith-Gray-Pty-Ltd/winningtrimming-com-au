'use client'

import React from 'react'

/**
 * Injects custom CSS into the Payload admin panel.
 * Registered as an admin provider — MUST render children or the entire
 * admin React tree breaks (blank screen).
 *
 * Currently enlarges the media library thumbnails in the relationship
 * drawer / media picker so images are easier to see when selecting.
 */
const CustomAdminStyles: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  return (
    <>
      <style
        dangerouslySetInnerHTML={{
          __html: `
            /* ── Larger thumbnails in the media relationship picker ── */
            /* Thumbnail cells in the relationship table */
            .table-cell--thumb img,
            td[class*="thumb"] img,
            .cell--thumb img {
              width: 120px !important;
              height: 90px !important;
              object-fit: cover !important;
              border-radius: 6px !important;
            }

            /* Upload/relationship card thumbnails */
            [class*="UploadCard"] img,
            [class*="RelationshipTable"] img {
              max-height: 200px !important;
              object-fit: cover !important;
            }

            /* Make the relationship drawer wider so bigger thumbnails fit */
            [class*="ListDrawer"],
            [class*="DrawerWrapper"] {
              --drawer-width: min(1200px, 90vw) !important;
            }

            /* Relationship drawer — enlarge the thumbnail column */
            .row-list .cell-thumb,
            .row-list .cell--thumb,
            .list-controls + .table table td:first-child {
              min-width: 130px !important;
            }
          `,
        }}
      />
      {children}
    </>
  )
}

export default CustomAdminStyles