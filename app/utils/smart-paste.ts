import { parseOtp, toOtpUri, defaults, identity, type BatchEntry, type OtpConfig } from './otp.ts'

export interface PasteCandidate {
  config: OtpConfig
  line: number
  source: string
  suggestedAccount?: string
}
export interface PasteAnalysis {
  kind: 'single' | 'multiple' | 'review' | 'none'
  candidates: PasteCandidate[]
  issue?: string
}
const tryParse = (value: string) => {
  try {
    return parseOtp(value)
  } catch {
    return null
  }
}

function decodeAccountCell(cell: string): string {
  const decoded = cell.replace(/""/g, '"')
  const rows = decoded
    .split(/\r\n?|\n/)
    .map((row) => row.trim())
    .filter(Boolean)
  // A cell is an explicit record boundary; only an unambiguous pair may be joined.
  if (rows.length === 2 && /^[^\s@]+@[^\s@]+\.[a-z]{2,63}$/i.test(rows[0]!) && tryParse(rows[1]!))
    return rows[0] + '\t' + rows[1]
  return decoded
}

export function normalizeClipboardText(text: string): string {
  const cleaned = text
    .replace(/^[ \t]*\|[ :|-]+\|[ \t]*$/gm, '')
    .replace(/^[ \t]*\|(.+)\|[ \t]*$/gm, (row, content: string) =>
      /<br\s*\/?\s*>/i.test(content)
        ? content
            .split('|')
            .map((cell) =>
              decodeAccountCell(cell.replace(/<br\s*\/?\s*>/gi, '\n').replace(/\\(?=@)/g, ''))
            )
            .join('\n')
        : row
    )
    .replace(/[\u200b\u200e\u200f\u202a-\u202e\u2060\u2066-\u2069\ufeff]/g, '')
    .replace(/\\(?=@)/g, '')
    .replace(
      /(^|[\t\n])"((?:[^"]|"")*)"(?=\t|\r?\n|$)/g,
      (_, separator: string, cell: string) => separator + decodeAccountCell(cell)
    )
  const lines = cleaned.split(/\r\n?|\n/).flatMap((line) => {
    const cells = line.replace(/\\\s*$/, '').split('\t')
    // Distinct spreadsheet cells containing complete keys are separate records.
    return cells.length > 1 && cells.every((cell) => tryParse(cell.trim()))
      ? cells
      : [line.replace(/\\\s*$/, '')]
  })
  for (let i = 0; i < lines.length - 1; i++) {
    const account = lines[i]!.trim().replace(/\\$/, '').trim()
    const parts = lines[i + 1]!.trim().split(/\s+/)
    const nextAccountOffset = lines
      .slice(i + 1)
      .findIndex((line) => /^[^\s@]+@[^\s@]+\.[a-z]{2,63}$/i.test(line.trim()))
    const blockEnd = nextAccountOffset < 0 ? lines.length : i + 1 + nextAccountOffset
    if (
      /^[^\s@]+@[^\s@]+\.[a-z]{2,63}$/i.test(account) &&
      (parts.length === 1 || parts.every((part) => /^[a-z2-7]{4}$/i.test(part))) &&
      tryParse(lines[i + 1]!.trim()) &&
      !lines.slice(i + 2, blockEnd).some((line) => line.trim())
    ) {
      lines[i] = account + '\t' + lines[i + 1]!.trim()
      lines[i + 1] = ''
    }
  }
  return lines.join('\n')
}

/** Only complete tokens are candidates. Never remove prose and concatenate fragments. */
export function analyzePaste(text: string): PasteAnalysis {
  const candidates: PasteCandidate[] = []
  if (new TextEncoder().encode(text).length > 100_000)
    return { kind: 'none', candidates, issue: '文本超过 100KB，请分批处理。' }
  // Excel uses TSV, wrapping cells in quotes and doubling embedded quotes.
  // Quoted cells may contain multiple secrets. Keep their row boundaries intact.
  const spreadsheetText = normalizeClipboardText(text)
  const lines = spreadsheetText
    .split(/\r\n?|\n/)
    .map((source, i) => ({ source: source.trim(), line: i + 1 }))
    .filter((x) => x.source)
  if (lines.length > 100)
    return { kind: 'none', candidates, issue: '每次最多 100 条，请分批处理。' }
  let allStructured = true
  for (const { source, line } of lines) {
    // Reject an invalid URI as a whole; its secret parameter is not a fallback key.
    if (/^[a-z][\w+.-]*:\/\//i.test(source) || source.startsWith('/2fa/')) {
      const config = tryParse(source)
      if (config) candidates.push({ config, line, source })
      else allStructured = false
      continue
    }
    if (source.includes('://')) {
      allStructured = false
      const remainder = source.replace(/[a-z][\w+.-]*:\/\/[^\s<>"'，。；）]+/gi, (value) => {
        const config = tryParse(value)
        if (config) candidates.push({ config, line, source: value })
        return ' '
      })
      for (const match of remainder.matchAll(
        /(?:(?<![\p{L}\p{N}_=])|(?<=\p{Script=Han}))[a-z2-7]{16,}={0,6}(?:(?![\p{L}\p{N}_=])|(?=\p{Script=Han}))/giu
      )) {
        const config = tryParse(match[0])
        if (config) candidates.push({ config, line, source: match[0] })
      }
      continue
    }
    const pieces = source.split(/[ \t]+/)
    const complete = pieces
      .map((value, index) => ({ config: tryParse(value), index }))
      .filter((item) => item.config)
    if (complete.length && pieces.some((value) => /^[a-z2-7]{4}$/i.test(value))) {
      const mixed: OtpConfig[] = []
      let groups: string[] = []
      const flush = () => {
        const config = tryParse(groups.join(' '))
        if (config) mixed.push(config)
        groups = []
      }
      for (const piece of pieces) {
        const config = tryParse(piece)
        if (config) {
          flush()
          mixed.push(config)
        } else if (/^[a-z2-7]{4}$/i.test(piece)) groups.push(piece)
        else flush()
      }
      flush()
      if (mixed.length > 1) {
        allStructured = false
        for (const config of mixed) candidates.push({ config, line, source })
        continue
      }
    }
    // Read grouped keys from the right so an adjacent account/domain stays intact.
    const unquoted = source.replace(/^["“]|["”]$/g, '')
    const accountKey = unquoted.match(/^(.+?)((?:[a-z2-7]{4}[ \t]+){3,}[a-z2-7]{4}={0,6})$/i)
    if (accountKey && !tryParse(unquoted) && !tryParse(accountKey[1]!.trim())) {
      const account = accountKey[1]!.replace(/[ \t:：|,;]+$/, '').replace(/\\(?=@)/g, '')
      if (
        /^[^\s@]+@[^\s@]+\.[a-z]{2,63}$/i.test(account) ||
        (/^[^\s]+$/.test(account) && /[ \t:：|,;]$/.test(accountKey[1]!))
      ) {
        const accountConfig = tryParse(accountKey[2]!)
        if (accountConfig && account.length <= 120) {
          accountConfig.label = account
          candidates.push({ config: accountConfig, line, source })
          continue
        }
      }
    }
    const tokens = [
      ...source.matchAll(
        /(?:(?<![\p{L}\p{N}_=])|(?<=\p{Script=Han}))[a-z2-7]{16,}={0,6}(?:(?![\p{L}\p{N}_=])|(?=\p{Script=Han}))/giu
      )
    ]
      .map((match) => ({ match, config: tryParse(match[0]) }))
      .filter((item) => item.config !== null)
    // Multiple complete keys on one line are ambiguous, even if whitespace is valid Base32.
    if (tokens.length > 1) {
      allStructured = false
      for (const { match, config } of tokens)
        candidates.push({ config: config!, line, source: match[0] })
      continue
    }
    const whole = !tokens.length || source === tokens[0]!.match[0] ? tryParse(source) : null
    if (whole) {
      candidates.push({ config: whole, line, source })
      continue
    }
    const named =
      source.match(/^(.{1,120}?)[\t:：=][ \t]*(.+)$/u) || source.match(/^(\S{1,120})[ ]+(\S+)$/u)
    if (
      named &&
      (!/\s/.test(named[1]!.trim()) || /[\t:：=]/.test(source)) &&
      (!/[.!?。！？/]/.test(named[1]!) || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(named[1]!))
    ) {
      const pieces = named[2]!.trim().split(/\s+/)
      const config =
        pieces.length === 1 || pieces.every((piece) => /^[a-z2-7]{4}$/i.test(piece))
          ? tryParse(named[2]!)
          : null
      if (config) {
        config.label ||= named[1]!.trim()
        candidates.push({ config, line, source })
        continue
      }
    }
    allStructured = false
    for (const { match, config } of tokens)
      candidates.push({ config: config!, line, source: match[0] })
  }
  // Standalone account lines do not establish ownership of nearby secrets.
  for (let i = 0; i < lines.length; i++) {
    const account = lines[i]!.source
    if (!/^[^\s@]+@[^\s@]+\.[a-z]{2,63}$/i.test(account)) continue
    const nextAccount = lines
      .slice(i + 1)
      .find((row) => /^[^\s@]+@[^\s@]+\.[a-z]{2,63}(?:[ \t]|$)/i.test(row.source))
    for (const candidate of candidates) {
      if (
        candidate.line > lines[i]!.line &&
        candidate.line < (nextAccount?.line ?? Infinity) &&
        !candidate.config.label
      ) {
        candidate.suggestedAccount = account
        allStructured = false
      }
    }
  }
  if (candidates.length > 100)
    return { kind: 'none', candidates: [], issue: '每次最多 100 条，请分批处理。' }
  return {
    kind: !candidates.length
      ? 'none'
      : candidates.length === 1
        ? 'single'
        : allStructured
          ? 'multiple'
          : 'review',
    candidates
  }
}

/** Keep common batch input readable; use a URI when metadata/settings require it. */
export function pastedBatchText(configs: OtpConfig[]): string {
  return configs
    .map((config) => {
      if (
        config.algorithm === defaults.algorithm &&
        config.digits === defaults.digits &&
        config.period === defaults.period &&
        !config.issuer &&
        !/[\r\n\t]/.test(config.label)
      )
        return config.label ? `${config.label}\t${config.secret}` : config.secret
      const uri = new URL(toOtpUri(config))
      if (!config.label)
        uri.pathname = config.issuer ? '/' + encodeURIComponent(config.issuer + ':') : '/'
      return uri.toString()
    })
    .join('\n')
}

export function pastedInputText(
  current: string,
  pasted: string,
  start: number,
  end: number
): string {
  // A complete clipboard entry replaces an existing key, even with a collapsed selection.
  if (analyzePaste(pasted).candidates.length || /[\r\n]/.test(pasted)) return pasted
  return current.slice(0, start) + pasted + current.slice(end)
}

/** Formatting a valid key/link is not the same as discarding surrounding prose. */
export function extractedSurroundingText(source: string): boolean {
  return !!source.trim() && !tryParse(source) && analyzePaste(source).candidates.length === 1
}

/** Batch uses the same recognition rules, but preserves rejected rows instead of dropping them. */
export function parseSmartBatch(text: string): BatchEntry[] {
  if (new TextEncoder().encode(text).length > 100_000)
    throw new Error('文本超过 100KB，请分批处理。')
  const lines = normalizeClipboardText(text)
    .split(/\r?\n/)
    .map((value, index) => ({ value, line: index + 1 }))
    .filter((row) => row.value.trim())
  if (lines.length > 100) throw new Error('每次最多 100 条，请分批处理。')
  const seen = new Set<string>()
  return lines.map(({ value, line }) => {
    const result = analyzePaste(value)
    if (result.candidates.length !== 1)
      return { line, error: result.issue || '密钥格式不正确，请检查是否包含多余字符。' }
    const config = result.candidates[0]!.config
    const key = identity(config),
      duplicate = seen.has(key)
    seen.add(key)
    return { line, config, duplicate }
  })
}
