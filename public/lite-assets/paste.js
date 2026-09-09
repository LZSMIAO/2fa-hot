/* ES5 smart-paste adapter. Keep record boundaries; never join separate key rows. */
;(function (root) {
  'use strict'
  function parse(value) {
    try {
      return root.LiteOTP.parse(value)
    } catch (e) {
      return null
    }
  }
  function trim(value) {
    return value.replace(/^\s+|\s+$/g, '')
  }
  function email(value) {
    return /^[^\s@]+@[^\s@]+\.[a-z]{2,63}$/i.test(value)
  }
  function cell(value) {
    var rows = value
      .replace(/""/g, '"')
      .split(/\r\n?|\n/)
      .map(trim)
      .filter(Boolean)
    if (rows.length === 2 && email(rows[0]) && parse(rows[1])) return rows[0] + '\t' + rows[1]
    return value.replace(/""/g, '"')
  }
  function analyze(text) {
    if (text.length > 100000) throw new Error('limit')
    var cleaned = text
      .replace(/&#(?:x20|32);|&nbsp;/gi, ' ')
      .replace(/^[ \t]*\|[ :|-]+\|[ \t]*$/gm, '')
      .replace(/^[ \t]*\|(.+)\|[ \t]*$/gm, function (_, content) {
        return content
          .split('|')
          .map(function (v) {
            return cell(v.replace(/<br\s*\/?\s*>/gi, '\n').replace(/\\(?=@)/g, ''))
          })
          .join('\n')
      })
      .replace(/[\u200b\u200e\u200f\u202a-\u202e\u2060\u2066-\u2069\ufeff]/g, '')
      .replace(/\\(?=@)/g, '')
      .replace(/(^|[\t\n])"((?:[^"]|"")*)"(?=\t|\r?\n|$)/g, function (_, sep, value) {
        return sep + cell(value)
      })
      .replace(/<br\s*\/?\s*>/gi, '\n')
    var lines = [],
      candidates = [],
      uncertain = false,
      i,
      j,
      row,
      config,
      match,
      parts,
      groups,
      found,
      account = ''
    cleaned.split(/\r\n?|\n/).forEach(function (value) {
      value = value.replace(/\\\s*$/, '')
      var cells = value.split('\t')
      if (
        cells.length > 1 &&
        cells.every(function (v) {
          return !!parse(trim(v))
        })
      )
        lines = lines.concat(cells)
      else lines.push(value)
    })
    lines = lines.map(trim).filter(Boolean)
    if (lines.length > 100) throw new Error('limit')
    function add(c, label) {
      candidates.push({ config: c, label: label || '', source: row })
      if (candidates.length > 100) throw new Error('limit')
    }
    for (i = 0; i < lines.length; i++) {
      row = lines[i].replace(/^["“]|["”]$/g, '')
      if (email(row)) {
        account = row
        // Only exactly one remaining record before the next account is an explicit pair.
        j = i + 1
        while (j < lines.length && !email(lines[j])) j++
        if (j === i + 2 && (config = parse(lines[i + 1]))) {
          add(config, account)
          i++
          account = ''
        } else uncertain = true
        continue
      }
      if (/^(?:[a-z][\w+.-]*:\/\/|\/2fa|\/lite|#)/i.test(row)) {
        config = parse(row)
        if (config) add(config)
        else uncertain = true
        continue
      }
      // Explicit account + grouped secret, with no intervening password/prose.
      match = row.match(/^(.+?)((?:[a-z2-7]{4}[ \t]+){3,}[a-z2-7]{4}={0,6})$/i)
      if (match && !parse(row)) {
        var label = trim(match[1].replace(/[ \t:：|,;]+$/, ''))
        if (
          label.length <= 120 &&
          !/\s/.test(label) &&
          !parse(label) &&
          (config = parse(match[2]))
        ) {
          add(config, label)
          continue
        }
      }
      match = row.match(/^(.{1,120}?)[\t:：=][ \t]*(.+)$/) || row.match(/^(\S{1,120})[ ]+(\S+)$/)
      if (match && !/\s/.test(trim(match[1])) && !parse(match[1]) && (config = parse(match[2]))) {
        add(config, trim(match[1]))
        continue
      }
      parts = row.split(/[ \t]+/)
      found = []
      groups = []
      function flush() {
        var c = parse(groups.join(' '))
        if (c) found.push(c)
        groups = []
      }
      parts.forEach(function (part) {
        var c = parse(part)
        if (c) {
          flush()
          found.push(c)
        } else if (/^[a-z2-7]{4}$/i.test(part)) groups.push(part)
        else flush()
      })
      flush()
      if (found.length) {
        found.forEach(function (c) {
          add(c)
        })
        if (!parse(row) || found.length > 1 || account) uncertain = true
        continue
      }
      // Extract complete tokens only, preserving boundaries around Latin words and accounts.
      var re = /(^|[^A-Za-z0-9_=@.])[a-z2-7]{16,}={0,6}(?=$|[^A-Za-z0-9_=@.])/gi
      while ((match = re.exec(row))) {
        config = parse(match[0].replace(/^[^A-Za-z2-7]/, ''))
        if (config) add(config)
      }
      uncertain = true
    }
    return { candidates: candidates, review: uncertain }
  }
  root.LitePaste = { analyze: analyze }
})(window)
