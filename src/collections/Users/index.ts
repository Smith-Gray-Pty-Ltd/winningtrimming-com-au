import type { CollectionConfig } from 'payload'

import { authenticated } from '../../access/authenticated'

export const Users: CollectionConfig = {
  slug: 'users',
  access: {
    admin: authenticated,
    create: authenticated,
    delete: authenticated,
    read: authenticated,
    update: authenticated,
  },
  admin: {
    defaultColumns: ['name', 'email'],
    useAsTitle: 'name',
  },
  auth: {
    /**
     * Enable Payload API key authentication so internal automation (the
     * Messenger-to-quote marketing agent) can authenticate via the
     * `Authorization: users API-Key <key>` header instead of a session
     * cookie. This bypasses the quote rate limiter for authenticated
     * requests — see the system-api-key feature spec.
     */
    useAPIKey: true,
  },
  fields: [
    {
      name: 'name',
      type: 'text',
    },
  ],
  timestamps: true,
}
