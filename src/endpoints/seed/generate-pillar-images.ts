/**
 * Generate category hero images for the 3 empty pillars via the Flux MCP server.
 *
 * Calls the BFL MCP server's `generate_image` tool through the HTTP transport,
 * polls for results, downloads the images, and uploads them to the Payload
 * media collection. Then links each image to the corresponding asset type.
 *
 * Usage:
 *   npx tsx src/endpoints/seed/generate-pillar-images.ts
 */

import * as fs from 'fs'
import * as path from 'path'
import * as os from 'os'

const API_URL = process.env.WT_API_URL || process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3010'
const MCP_URL = 'https://mcp.bfl.ai'
const TOKEN_FILE = path.join(os.homedir(), '.local/share/opencode/mcp-auth.json')

// ---------------------------------------------------------------------------
// Auth
// ---------------------------------------------------------------------------

function getToken(): string {
  const data = JSON.parse(fs.readFileSync(TOKEN_FILE, 'utf-8'))
  return data.flux.tokens.accessToken
}

// ---------------------------------------------------------------------------
// MCP helpers
// ---------------------------------------------------------------------------

let mcpRequestId = 0

async function mcpCall(method: string, params: any = {}): Promise<any> {
  const id = ++mcpRequestId
  const res = await fetch(MCP_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json, text/event-stream',
      'Authorization': `Bearer ${getToken()}`,
    },
    body: JSON.stringify({ jsonrpc: '2.0', id, method, params }),
  })

  const text = await res.text()
  // Parse SSE format — lines start with "event:" and "data:"
  const lines = text.split('\n')
  for (const line of lines) {
    if (line.startsWith('data: ')) {
      const data = JSON.parse(line.slice(6))
      if (data.id === id) {
        return data.result || data.error
      }
    }
  }
  throw new Error(`No response for ${method} (id=${id})`)
}

async function mcpCallTool(name: string, args: any): Promise<any> {
  return mcpCall('tools/call', { name, arguments: args })
}

// ---------------------------------------------------------------------------
// Payload helpers
// ---------------------------------------------------------------------------

async function payloadLogin(): Promise<string> {
  const res = await fetch(`${API_URL}/api/users/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: process.env.PAYLOAD_ADMIN_EMAIL || 'admin@winningtrimming.com.au',
      password: process.env.PAYLOAD_ADMIN_PASSWORD || 'Winning!Trimming2026',
    }),
  })
  const data = await res.json()
  return data.token
}

async function uploadMediaToPayload(token: string, imageData: Buffer, filename: string, alt: string): Promise<number> {
  // Upload to /api/media via multipart form-data
  // Node 18+ doesn't have native FormData/Blob in the same way as browsers,
  // so build the multipart body manually.
  const boundary = '----FormBoundary' + Date.now()
  const header = `--${boundary}\r\nContent-Disposition: form-data; name="file"; filename="${filename}"\r\nContent-Type: image/jpeg\r\n\r\n`
  const footer = `\r\n--${boundary}\r\nContent-Disposition: form-data; name="_payload"\r\n\r\n${JSON.stringify({ alt })}\r\n--${boundary}--\r\n`

  const body = Buffer.concat([
    Buffer.from(header),
    imageData,
    Buffer.from(footer),
  ])

  const res = await fetch(`${API_URL}/api/media`, {
    method: 'POST',
    headers: {
      'Content-Type': `multipart/form-data; boundary=${boundary}`,
      Authorization: `JWT ${token}`,
    },
    body,
  })

  if (!res.ok) {
    const errText = await res.text().catch(() => '')
    throw new Error(`Media upload failed: ${res.status} ${errText.slice(0, 200)}`)
  }

  const data = await res.json()
  console.log(`  ✓ Uploaded to media: ${filename} (id: ${data.doc.id})`)
  return data.doc.id
}

async function linkImageToAssetType(token: string, assetTypeId: number, mediaId: number) {
  const res = await fetch(`${API_URL}/api/asset-types/${assetTypeId}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `JWT ${token}`,
    },
    body: JSON.stringify({ heroImage: mediaId }),
  })

  if (!res.ok) {
    throw new Error(`Failed to link image: ${res.status}`)
  }

  console.log(`  ✓ Linked media ${mediaId} to asset type ${assetTypeId}`)
}

// ---------------------------------------------------------------------------
// Image prompts
// ---------------------------------------------------------------------------

type ImageTask = {
  assetTypeSlug: string
  title: string
  prompt: string
}

const tasks: ImageTask[] = [
  {
    assetTypeSlug: 'caf-s-restaurants',
    title: 'Cafés & Restaurants',
    prompt: 'A modern café interior with custom upholstered booth seating in dark green vinyl with visible double stitching, warm pendant lighting, wooden table, minimalist aesthetic, professional interior photograph, realistic, high detail',
  },
  {
    assetTypeSlug: 'offices',
    title: 'Offices',
    prompt: 'A modern office with reupholstered task chairs in blue fabric with chrome frames, clean white desk, natural light through floor-to-ceiling windows, plant on desk, professional interior photograph, realistic, high detail',
  },
  {
    assetTypeSlug: 'marine-auto-trade',
    title: 'Marine & Auto Trade',
    prompt: 'A professional trimming workshop interior with industrial sewing machines, rolls of marine vinyl and canvas on shelves, a workbench with a half-finished white boat cushion being stitched, warm overhead work lighting, professional photograph, realistic, high detail',
  },
]

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function generateImage(prompt: string, width = 1600, height = 1200): Promise<{ imageUrl: string; requestId: string }> {
  console.log(`  Submitting to Flux...`)
  const result = await mcpCallTool('generate_image', {
    requests: [{
      prompt,
      width,
      height,
      model: 'flux2_pro_preview',
    }],
  })

  // Parse the response — the tool returns content with text that contains JSON
  const content = result?.content?.[0]?.text
  if (!content) throw new Error('No content in generate_image response')

  const data = JSON.parse(content)
  const item = data?.data?.items?.[0]
  if (!item) throw new Error('No items in response')

  if (item.status === 'ready') {
    return { imageUrl: item.image_url, requestId: item.request_id }
  }

  // If pending, poll
  if (item.status === 'pending' && item.request_id) {
    console.log(`  Pending (request_id: ${item.request_id}), polling...`)
    for (let i = 0; i < 60; i++) {
      await new Promise((r) => setTimeout(r, 5000))
      const pollResult = await mcpCallTool('get_result', { request_id: item.request_id })
      const pollContent = pollResult?.content?.[0]?.text
      if (!pollContent) continue
      const pollData = JSON.parse(pollContent)
      if (pollData?.data?.status === 'ready' || pollData?.data?.image_url) {
        return { imageUrl: pollData.data.image_url, requestId: item.request_id }
      }
      if (pollData?.data?.status === 'failed') {
        throw new Error(`Generation failed: ${pollData?.data?.error?.message}`)
      }
      console.log(`  Still pending... (${i + 1}/60)`)
    }
    throw new Error('Timed out waiting for image')
  }

  throw new Error(`Unexpected status: ${item.status}`)
}

async function downloadImage(url: string): Promise<Buffer> {
  const res = await fetch(url)
  if (!res.ok) throw new Error(`Download failed: ${res.status}`)
  const arrayBuffer = await res.arrayBuffer()
  return Buffer.from(arrayBuffer)
}

async function runSeed() {
  console.log(`\nGenerating pillar images via Flux (API: ${MCP_URL})\n`)

  console.log('Logging in to Payload...')
  const token = await payloadLogin()
  console.log('Authenticated ✓')

  for (const task of tasks) {
    console.log(`\n=== ${task.title} ===`)

    try {
      // Generate
      const { imageUrl, requestId } = await generateImage(task.prompt)
      console.log(`  Generated (request_id: ${requestId})`)

      // Download
      console.log('  Downloading...')
      const imageData = await downloadImage(imageUrl)
      console.log(`  Downloaded (${(imageData.length / 1024).toFixed(0)} KB)`)

      // Upload to Payload
      const filename = `${task.assetTypeSlug}-hero.jpg`
      const mediaId = await uploadMediaToPayload(token, imageData, filename, `Hero image for ${task.title}`)

      // Find asset type by slug
      const assetRes = await fetch(`${API_URL}/api/asset-types?where[slug][equals]=${task.assetTypeSlug}&depth=0&limit=1`)
      const assetData = await assetRes.json()
      const assetType = assetData.docs?.[0]

      if (assetType) {
        await linkImageToAssetType(token, assetType.id, mediaId)
      } else {
        console.log(`  ⚠ Could not find asset type with slug "${task.assetTypeSlug}"`)
      }
    } catch (err: any) {
      console.error(`  ✗ Failed: ${err.message}`)
    }
  }

  console.log('\nDone.')
}

runSeed().catch((err) => {
  console.error('Failed:', err)
  process.exit(1)
})