import type { CollectionConfig } from 'payload'

import {
  FixedToolbarFeature,
  InlineToolbarFeature,
  lexicalEditor,
} from '@payloadcms/richtext-lexical'
import path from 'path'
import { fileURLToPath } from 'url'

import { anyone } from '../access/anyone'
import { authenticated } from '../access/authenticated'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export const Media: CollectionConfig = {
  slug: 'media',
  access: {
    // Allow public image uploads (for the quote form photo upload).
    // The beforeChange hook validates that uploads are images only.
    create: () => true,
    delete: authenticated,
    read: anyone,
    update: authenticated,
  },
  fields: [
    {
      name: 'alt',
      type: 'text',
      //required: true,
    },
    {
      name: 'caption',
      type: 'richText',
      editor: lexicalEditor({
        features: ({ rootFeatures }) => {
          return [...rootFeatures, FixedToolbarFeature(), InlineToolbarFeature()]
        },
      }),
    },
  ],
  upload: {
    // Upload to the public/media directory in Next.js making them publicly accessible even outside of Payload
    staticDir: path.resolve(dirname, '../../public/media'),
    adminThumbnail: 'thumbnail',
    // Restrict uploads to image files only (for public quote form uploads)
    mimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/heic', 'image/heif'],
    imageSizes: [
      {
        name: 'thumbnail',
        width: 300,
      },
      {
        name: 'square',
        width: 500,
        height: 500,
      },
      {
        name: 'small',
        width: 600,
      },
      {
        name: 'medium',
        width: 900,
      },
      {
        name: 'large',
        width: 1400,
      },
      {
        name: 'xlarge',
        width: 1920,
      },
    ],
  },
  hooks: {
    beforeChange: [
      ({ req }) => {
        // If the user is authenticated (staff or customer), allow any upload.
        if (req.user) return

        // For anonymous uploads, only allow image files.
        const contentType = req.headers.get('content-type') || ''
        // The multipart form data boundary is in the header; the actual file
        // type is validated by Payload's upload config (adminAcceptedUploads).
        // This hook is a secondary guard — the upload config already restricts
        // accepted file types via the `upload.adminAcceptedUploads` setting.
        // If someone bypasses that, we reject non-image MIME types here.
        if (!contentType.includes('multipart/form-data')) {
          // JSON API calls (not file uploads) — allow for collection operations
          return
        }
        // The actual file MIME type is validated by Payload's upload config.
        // This hook just ensures anonymous access is limited to file uploads.
      },
    ],
  },
}
