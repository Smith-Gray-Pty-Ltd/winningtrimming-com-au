/**
 * Generate blog post hero images via Flux MCP server and link to posts.
 */

import * as fs from 'fs'
import * as os from 'os'
import * as path from 'path'

const API_URL = 'http://localhost:3010'
const MCP_URL = 'https://mcp.bfl.ai'
const TOKEN_FILE = path.join(os.homedir(), '.local/share/opencode/mcp-auth.json')

function getToken(): string {
  const data = JSON.parse(fs.readFileSync(TOKEN_FILE, 'utf-8'))
  return data.flux.tokens.accessToken
}

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
  for (const line of text.split('\n')) {
    if (line.startsWith('data: ')) {
      const data = JSON.parse(line.slice(6))
      if (data.id === id) return data.result || data.error
    }
  }
  throw new Error(`No response for ${method} (id=${id})`)
}

async function mcpCallTool(name: string, args: any): Promise<any> {
  return mcpCall('tools/call', { name, arguments: args })
}

async function payloadLogin(): Promise<string> {
  const res = await fetch(`${API_URL}/api/users/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@winningtrimming.com.au', password: 'Winning!Trimming2026' }),
  })
  const data = await res.json()
  return data.token
}

async function uploadMedia(token: string, imageData: Buffer, filename: string, alt: string): Promise<number> {
  const boundary = '----FormBoundary' + Date.now()
  const header = `--${boundary}\r\nContent-Disposition: form-data; name="file"; filename="${filename}"\r\nContent-Type: image/jpeg\r\n\r\n`
  const footer = `\r\n--${boundary}\r\nContent-Disposition: form-data; name="_payload"\r\n\r\n${JSON.stringify({ alt })}\r\n--${boundary}--\r\n`
  const body = Buffer.concat([Buffer.from(header), imageData, Buffer.from(footer)])
  const res = await fetch(`${API_URL}/api/media`, {
    method: 'POST',
    headers: { 'Content-Type': `multipart/form-data; boundary=${boundary}`, Authorization: `JWT ${token}` },
    body,
  })
  if (!res.ok) throw new Error(`Media upload failed: ${res.status}`)
  const data = await res.json()
  console.log(`  ✓ Uploaded: ${filename} (id: ${data.doc.id})`)
  return data.doc.id
}

async function linkToPost(token: string, postId: number, mediaId: number) {
  const res = await fetch(`${API_URL}/api/posts/${postId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', Authorization: `JWT ${token}` },
    body: JSON.stringify({ meta: { image: mediaId } }),
  })
  if (!res.ok) throw new Error(`Failed to link image: ${res.status}`)
  console.log(`  ✓ Linked media ${mediaId} to post ${postId}`)
}

const blogImages = [
  {
    slug: 'how-to-choose-the-right-bimini-top',
    prompt: 'A close-up of a custom stainless steel bimini top frame with cream canvas on a white boat at a marina, blue sky, golden hour lighting, professional photograph, realistic, high detail',
  },
  {
    slug: 'when-to-repair-vs-replace-marine-canvas',
    prompt: 'A marine trimmer\'s hands repairing a torn clear vinyl boat enclosure with a sewing machine, workshop background with rolls of canvas, warm work lighting, professional photograph, realistic, high detail',
  },
  {
    slug: 'caravan-cushion-upgrade-guide',
    prompt: 'Custom caravan cushions in navy blue upholstery fabric stacked neatly inside a campervan interior, natural light through a side window, professional photograph, realistic, high detail',
  },
  {
    slug: '5-signs-your-boat-seats-need-reupholstering',
    prompt: 'A boat seat with cracked and faded white vinyl upholstery on a vessel at a marina, bright daylight showing the UV damage, professional photograph, realistic, high detail',
  },
]

async function generateImage(prompt: string, width = 1600, height = 900): Promise<{ imageUrl: string }> {
  const result = await mcpCallTool('generate_image', {
    requests: [{ prompt, width, height, model: 'flux2_pro_preview' }],
  })
  const content = result?.content?.[0]?.text
  if (!content) throw new Error('No content in response')
  const data = JSON.parse(content)
  const item = data?.data?.items?.[0]
  if (!item) throw new Error('No items in response')
  if (item.status === 'ready') return { imageUrl: item.image_url }
  if (item.status === 'pending' && item.request_id) {
    console.log(`  Pending, polling...`)
    for (let i = 0; i < 60; i++) {
      await new Promise((r) => setTimeout(r, 5000))
      const pollResult = await mcpCallTool('get_result', { request_id: item.request_id })
      const pollContent = pollResult?.content?.[0]?.text
      if (!pollContent) continue
      const pollData = JSON.parse(pollContent)
      if (pollData?.data?.status === 'ready' || pollData?.data?.image_url) {
        return { imageUrl: pollData.data.image_url }
      }
      console.log(`  Still pending... (${i + 1}/60)`)
    }
    throw new Error('Timed out')
  }
  throw new Error(`Status: ${item.status}`)
}

async function run() {
  console.log('Generating blog post images via Flux\n')
  const token = await payloadLogin()
  console.log('Authenticated ✓\n')

  for (const blog of blogImages) {
    console.log(`=== ${blog.slug} ===`)
    try {
      // Find post by slug
      const postRes = await fetch(`${API_URL}/api/posts?where%5Bslug%5D%5Bequals%5D=${blog.slug}&depth=0&limit=1`)
      const postData = await postRes.json()
      const post = postData.docs?.[0]
      if (!post) {
        console.log(`  ⚠ Post not found`)
        continue
      }

      const { imageUrl } = await generateImage(blog.prompt)
      console.log(`  Generated`)
      const imageData = Buffer.from(await (await fetch(imageUrl)).arrayBuffer())
      const mediaId = await uploadMedia(token, imageData, `${blog.slug}-hero.jpg`, `Hero image for ${blog.slug}`)
      await linkToPost(token, post.id, mediaId)
    } catch (err: any) {
      console.error(`  ✗ Failed: ${err.message}`)
    }
  }
  console.log('\nDone.')
}

run().catch((err) => { console.error('Failed:', err); process.exit(1) })