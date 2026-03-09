import dotenv from 'dotenv'
import { spawn } from 'node:child_process'

dotenv.config()

function isEnabled(name: string, fallback = false): boolean {
  const value = String(process.env[name] ?? '').trim().toLowerCase()
  if (!value) return fallback
  return value === '1' || value === 'true' || value === 'yes' || value === 'on'
}

function parseList(value: string): string[] {
  return String(value || '')
    .split(',')
    .map((entry) => entry.trim())
    .filter(Boolean)
}

function toAbsoluteUrl(pathOrUrl: string, siteUrl: string): string {
  if (/^https?:\/\//i.test(pathOrUrl)) return pathOrUrl
  const normalizedBase = siteUrl.replace(/\/+$/, '')
  const normalizedPath = pathOrUrl.startsWith('/') ? pathOrUrl : `/${pathOrUrl}`
  return `${normalizedBase}${normalizedPath}`
}

async function runCommand(command: string, args: string[]): Promise<void> {
  await new Promise<void>((resolve, reject) => {
    const child = spawn(command, args, {
      stdio: 'inherit',
      shell: process.platform === 'win32',
      env: process.env,
    })

    child.on('error', reject)
    child.on('exit', (code) => {
      if (code === 0) resolve()
      else reject(new Error(`${command} ${args.join(' ')} failed with exit code ${code ?? 'unknown'}`))
    })
  })
}

async function warmUrl(url: string, timeoutMs: number): Promise<void> {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)
  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: { 'user-agent': 'postdeploy-warmup/1.0' },
      signal: controller.signal,
    })
    if (!response.ok) {
      throw new Error(`Warmup request failed for ${url}: HTTP ${response.status}`)
    }
  } finally {
    clearTimeout(timer)
  }
}

async function run() {
  console.log('[postdeploy] Starting post-deploy workflow...')

  const runRichTextMigration = isEnabled('POSTDEPLOY_RUN_RICHTEXT_MIGRATION', false)
  const runWarmup = isEnabled('POSTDEPLOY_RUN_WARMUP', false)
  const failOnMigrationError = isEnabled('POSTDEPLOY_FAIL_ON_MIGRATION_ERROR', true)
  const failOnWarmupError = isEnabled('POSTDEPLOY_FAIL_ON_WARMUP_ERROR', false)
  const includeDefaultWarmupRoutes = isEnabled('POSTDEPLOY_WARMUP_DEFAULT_ROUTES', true)
  const warmupTimeoutMs = Number(process.env.POSTDEPLOY_WARMUP_TIMEOUT_MS || 10000)
  const siteUrl = String(process.env.SITE_URL || process.env.PAYLOAD_PUBLIC_SERVER_URL || '').trim()

  if (runRichTextMigration) {
    console.log('[postdeploy] Running rich-text migration...')
    try {
      await runCommand('npm', ['run', 'migrate:richtext'])
      console.log('[postdeploy] Rich-text migration completed.')
    } catch (error) {
      console.error('[postdeploy] Rich-text migration failed:', error)
      if (failOnMigrationError) throw error
    }
  } else {
    console.log('[postdeploy] Skipping rich-text migration (POSTDEPLOY_RUN_RICHTEXT_MIGRATION != 1).')
  }

  if (runWarmup) {
    if (!siteUrl) {
      const message = 'POSTDEPLOY_RUN_WARMUP=1 requires SITE_URL or PAYLOAD_PUBLIC_SERVER_URL.'
      if (failOnWarmupError) throw new Error(message)
      console.warn(`[postdeploy] ${message} Skipping warmup.`)
    } else {
      const defaultRoutes = includeDefaultWarmupRoutes ? ['/', '/blog', '/api/blog-posts?limit=1'] : []
      const extraRoutes = parseList(String(process.env.POSTDEPLOY_WARMUP_URLS || ''))
      const urls = [...defaultRoutes, ...extraRoutes].map((entry) => toAbsoluteUrl(entry, siteUrl))
      const uniqueUrls = Array.from(new Set(urls))

      if (!uniqueUrls.length) {
        console.log('[postdeploy] No warmup URLs configured.')
      } else {
        console.log(`[postdeploy] Warming ${uniqueUrls.length} URL(s)...`)
        for (const url of uniqueUrls) {
          try {
            await warmUrl(url, warmupTimeoutMs)
            console.log(`[postdeploy] Warmed: ${url}`)
          } catch (error) {
            console.error(`[postdeploy] Warmup failed: ${url}`, error)
            if (failOnWarmupError) throw error
          }
        }
      }
    }
  } else {
    console.log('[postdeploy] Skipping warmup (POSTDEPLOY_RUN_WARMUP != 1).')
  }

  console.log('[postdeploy] Post-deploy workflow complete.')
}

void run().catch((error) => {
  console.error('[postdeploy] Failed:', error)
  process.exit(1)
})
