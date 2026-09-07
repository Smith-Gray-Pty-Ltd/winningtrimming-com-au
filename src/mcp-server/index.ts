#!/usr/bin/env node

/**
 * Winning Trimming — MCP Server
 *
 * Exposes 3 tools so AI assistants (ChatGPT, Grok, Claude, etc.) can submit
 * quote requests directly into the Payload CMS:
 *
 *   1. list-pillars        — returns the 5 service areas (marine, automotive, etc.)
 *   2. list-service-types  — returns available services for a given pillar
 *   3. submit-quote        — creates a quote request via the Payload REST API
 *
 * Usage:
 *   npx tsx src/mcp-server/index.ts
 *
 * Or add to an MCP client config:
 *   {
 *     "mcpServers": {
 *       "winning-trimming": {
 *         "command": "npx",
 *         "args": ["tsx", "src/mcp-server/index.ts"],
 *         "env": { "WT_API_URL": "http://localhost:3010" }
 *       }
 *     }
 *   }
 *
 * Environment:
 *   WT_API_URL  — Payload server URL (default: http://localhost:3010)
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js'
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js'
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js'
import { z } from 'zod'

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

const API_URL = process.env.WT_API_URL || process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3010'

// ---------------------------------------------------------------------------
// Pillar definitions (mirrors src/fields/pillars.ts)
// ---------------------------------------------------------------------------

const PILLARS = [
  { value: 'marine', label: 'Marine', description: 'Boats and watercraft — biminis, dodgers, enclosures, sail covers, cushions and full refits.' },
  { value: 'automotive', label: 'Automotive', description: 'Cars, vans, 4x4s and motorcycles — tonneaus, seats, trims and repairs.' },
  { value: 'caravan-and-rv', label: 'Caravan & RV', description: 'Caravans, motorhomes and campervans — annexes, cushions, mattresses and trim.' },
  { value: 'trade-and-industrial', label: 'Trade & Industrial', description: 'Utes, plant and machinery — covers, canopies and operator trim built tough.' },
  { value: 'commercial', label: 'Commercial', description: 'Commercial upholstery for furniture, hospitality, office and contract work.' },
] as const

// ---------------------------------------------------------------------------
// Tool schemas
// ---------------------------------------------------------------------------

const submitQuoteSchema = z.object({
  contactName: z.string().describe('Customer name, e.g. "John Smith"'),
  contactEmail: z.string().email().describe('Customer email address'),
  contactPhone: z.string().describe('Customer phone number, e.g. "0400 123 456"'),
  pillar: z.enum([
    'marine',
    'automotive',
    'caravan-and-rv',
    'trade-and-industrial',
    'commercial',
  ]).describe('Service area — one of: marine, automotive, caravan-and-rv, trade-and-industrial, commercial'),
  subject: z.string().describe('What the quote is for, e.g. "Bayliner 175 bowrider" or "CAT 320 excavator seat"'),
  description: z.string().describe('Detailed description of the job — what needs doing, materials, etc.'),
  serviceTypeIds: z.array(z.string()).optional().describe('Array of service type IDs (from list-service-types). Optional.'),
  location: z.string().optional().describe('Customer location, e.g. "Toronto, Lake Macquarie"'),
  preferredDates: z.string().optional().describe('Preferred timing, e.g. "Before October"'),
  subjectDetails: z.string().optional().describe('Additional details — length, model, storage, colour preferences, etc.'),
})

// ---------------------------------------------------------------------------
// API helpers
// ---------------------------------------------------------------------------

async function fetchServiceTypes(pillar?: string) {
  const params = new URLSearchParams({ limit: '200', depth: '0', sort: 'title' })
  if (pillar) params.set('where[pillar][equals]', pillar)
  const res = await fetch(`${API_URL}/api/service-types?${params}`)
  if (!res.ok) throw new Error(`Failed to fetch service types: ${res.status}`)
  const data = await res.json()
  return data.docs || []
}

async function submitQuote(input: z.infer<typeof submitQuoteSchema>) {
  const title = `${input.contactName} — ${input.subject}`

  const body = {
    title,
    contactName: input.contactName,
    contactEmail: input.contactEmail,
    contactPhone: input.contactPhone,
    pillar: input.pillar,
    subject: input.subject,
    subjectDetails: input.subjectDetails || '',
    description: input.description,
    location: input.location || '',
    preferredDates: input.preferredDates || '',
    serviceTypes: input.serviceTypeIds || [],
    status: 'requested',
  }

  const res = await fetch(`${API_URL}/api/quotes`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })

  const data = await res.json()

  if (!res.ok) {
    const msg = data.message || data.errors?.[0]?.message || 'Quote submission failed'
    throw new Error(msg)
  }

  return data
}

// ---------------------------------------------------------------------------
// MCP Server
// ---------------------------------------------------------------------------

const server = new Server(
  { name: 'winning-trimming', version: '1.0.0' },
  { capabilities: { tools: {} } },
)

// -- List tools --------------------------------------------------------------

server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: 'list-pillars',
        description:
          'List the 5 service areas (pillars) offered by Winning Trimming. ' +
          'Returns each pillar\'s value, label and description. ' +
          'Use this first to understand what services are available before calling submit-quote.',
        inputSchema: { type: 'object', properties: {} },
      },
      {
        name: 'list-service-types',
        description:
          'List available service types for a given pillar. ' +
          'Returns each service type\'s ID, title, workType (custom or repair) and intro. ' +
          'Call list-pillars first to get the pillar values.',
        inputSchema: {
          type: 'object',
          properties: {
            pillar: {
              type: 'string',
              enum: ['marine', 'automotive', 'caravan-and-rv', 'trade-and-industrial', 'commercial'],
              description: 'The service area to list types for. If omitted, returns all service types.',
            },
          },
        },
      },
      {
        name: 'submit-quote',
        description:
          'Submit a quote request to Winning Trimming. ' +
          'This creates a new quote in the system with status "requested" — staff will review and respond. ' +
          'The customer will receive an email confirmation. ' +
          'Required: contactName, contactEmail, contactPhone, pillar, subject, description. ' +
          'Optional: serviceTypeIds (from list-service-types), location, preferredDates, subjectDetails.',
        inputSchema: {
          type: 'object',
          properties: {
            contactName: { type: 'string', description: 'Customer name, e.g. "John Smith"' },
            contactEmail: { type: 'string', description: 'Customer email address' },
            contactPhone: { type: 'string', description: 'Customer phone number, e.g. "0400 123 456"' },
            pillar: {
              type: 'string',
              enum: ['marine', 'automotive', 'caravan-and-rv', 'trade-and-industrial', 'commercial'],
              description: 'Service area',
            },
            subject: { type: 'string', description: 'What the quote is for, e.g. "Bayliner 175 bowrider"' },
            description: { type: 'string', description: 'Detailed description of the job' },
            serviceTypeIds: {
              type: 'array',
              items: { type: 'string' },
              description: 'Service type IDs from list-service-types (optional)',
            },
            location: { type: 'string', description: 'Customer location (optional)' },
            preferredDates: { type: 'string', description: 'Preferred timing (optional)' },
            subjectDetails: { type: 'string', description: 'Additional details (optional)' },
          },
          required: ['contactName', 'contactEmail', 'contactPhone', 'pillar', 'subject', 'description'],
        },
      },
    ],
  }
})

// -- Call tools --------------------------------------------------------------

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params

  try {
    switch (name) {
      // -- list-pillars --------------------------------------------------------
      case 'list-pillars': {
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(
                PILLARS.map((p) => ({
                  value: p.value,
                  label: p.label,
                  description: p.description,
                })),
                null,
                2,
              ),
            },
          ],
        }
      }

      // -- list-service-types -------------------------------------------------
      case 'list-service-types': {
        const pillar = (args as { pillar?: string })?.pillar
        const types = await fetchServiceTypes(pillar)

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(
                types.map((t: { id: number; title: string; workType?: string; intro?: string; pillar: string }) => ({
                  id: String(t.id),
                  title: t.title,
                  workType: t.workType || 'custom',
                  pillar: t.pillar,
                  intro: t.intro || '',
                })),
                null,
                2,
              ),
            },
          ],
        }
      }

      // -- submit-quote --------------------------------------------------------
      case 'submit-quote': {
        const parsed = submitQuoteSchema.safeParse(args)
        if (!parsed.success) {
          return {
            content: [
              {
                type: 'text',
                text: `Validation error: ${parsed.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join(', ')}`,
              },
            ],
            isError: true,
          }
        }

        const result = await submitQuote(parsed.data)

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(
                {
                  success: true,
                  quoteId: result.doc?.id || result.id,
                  title: result.doc?.title || result.title,
                  status: result.doc?.status || result.status,
                  message: 'Quote submitted successfully. Staff will review and respond via email.',
                },
                null,
                2,
              ),
            },
          ],
        }
      }

      default:
        return {
          content: [{ type: 'text', text: `Unknown tool: ${name}` }],
          isError: true,
        }
    }
  } catch (error: any) {
    return {
      content: [{ type: 'text', text: `Error: ${error.message}` }],
      isError: true,
    }
  }
})

// ---------------------------------------------------------------------------
// Start
// ---------------------------------------------------------------------------

async function main() {
  const transport = new StdioServerTransport()
  await server.connect(transport)
  console.error(`Winning Trimming MCP server running (API: ${API_URL})`)
}

main().catch((err) => {
  console.error('Failed to start MCP server:', err)
  process.exit(1)
})