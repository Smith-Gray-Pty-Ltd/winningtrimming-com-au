'use client'

import React from 'react'

/**
 * Injects custom CSS into the Payload admin panel.
 * Currently enlarges the media library thumbnails in the relationship
 * drawer / media picker so images are easier to see when selecting.
 */
const CustomAdminStyles: React.FC = () => {
  return (
    <style
      dangerouslySetInnerHTML={{
        __html: `
          /* ── Larger thumbnails in the media relationship picker ── */
          /* The media picker drawer shows small ~80px thumbnails by default.
             This enlarges them to ~160px for easier visual selection. */

          /* Upload/relationship card thumbnails in list view */
          .relationship-card .file-thumb,
          .upload-card .file-thumb,
          [class*="UploadCard"] img,
          [class*="RelationshipTable"] img {
            width: 100% !important;
            height: auto !important;
            max-height: 200px !important;
            object-fit: cover !important;
          }

          /* Thumbnail cells in the relationship table */
          .table-cell--thumb img,
          td[class*="thumb"] img,
          .cell--thumb img {
            width: 120px !important;
            height: 90px !important;
            object-fit: cover !important;
            border-radius: 6px !important;
          }

          /* Upload browser grid items */
          .upload-gallery .upload-gallery__item,
          [class*="FileDetails"] img,
          [class*="ListDrawer"] img {
            max-width: 100% !important;
          }

          /* Relationship drawer — enlarge the thumbnail column */
          .row-list .cell-thumb,
          .row-list .cell--thumb,
          .list-controls + .table table td:first-child {
            min-width: 130px !important;
          }

          /* Make the relationship drawer wider so bigger thumbnails fit */
          [class*="ListDrawer"],
          [class*="DrawerWrapper"] {
            --drawer-width: min(1200px, 90vw) !important;
          }
        `,
      }}
    />
  )
}

export default CustomAdminStyles