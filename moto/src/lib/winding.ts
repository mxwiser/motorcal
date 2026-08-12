export function farbeZu(ch: string): string {
  const c = ch.toLowerCase()
  if (c === 'a') return '#EA0000'
  if (c === 'b') return '#008AE6'
  if (c === 'c') return '#00CA00'
  if (c === '|' || c === '/' || c === '-') return '#000000'
  return '#00CA00'
}

export function computeKgV(a: number, b: number): number {
  let x = a
  let y = b
  while (x !== y) {
    if (x - y < 0) {
      x = x + a
    } else {
      y = y + b
    }
  }
  return x
}

export interface GeneratedSchema {
  schema: string
  schemaY: string
  verteilt: string | null
  unbalanced: boolean
}

function swapCase(s: string): string {
  return s
    .replace(/a/g, 'x')
    .replace(/b/g, 'y')
    .replace(/c/g, 'z')
    .replace(/A/g, 'a')
    .replace(/B/g, 'b')
    .replace(/C/g, 'c')
    .replace(/x/g, 'A')
    .replace(/y/g, 'B')
    .replace(/z/g, 'C')
}

function swapBC(s: string): string {
  return s
    .replace(/b/g, 'x')
    .replace(/c/g, 'y')
    .replace(/x/g, 'c')
    .replace(/y/g, 'b')
    .replace(/B/g, 'x')
    .replace(/C/g, 'y')
    .replace(/x/g, 'C')
    .replace(/y/g, 'B')
}

export function generateSchema(nuten: number, pole: number, sps: boolean): GeneratedSchema {
  const verteiltMode = nuten / 3 / pole >= 1
  const winkel = (180 * pole) / nuten
  let a = 0
  let b = 0
  let c = 0
  let A = 0
  let B = 0
  let C = 0
  let summe = 0
  let schema = ''

  for (let i = 0; i < nuten; i++) {
    if (!verteiltMode && i % 2 !== 0 && sps) {
      schema += '-'
      summe = (summe + winkel) % 360
      continue
    }
    if (summe >= 330 || summe < 30) {
      schema += 'A'
      A++
    }
    if (summe >= 30 && summe < 90) {
      schema += 'b'
      b++
    }
    if (summe >= 90 && summe < 150) {
      schema += 'C'
      C++
    }
    if (summe >= 150 && summe < 210) {
      schema += 'a'
      a++
    }
    if (summe >= 210 && summe < 270) {
      schema += 'B'
      B++
    }
    if (summe >= 270 && summe < 330) {
      schema += 'c'
      c++
    }
    schema += verteiltMode ? '|' : ''
    summe = (summe + winkel) % 360
  }

  const unbalanced = verteiltMode
    ? a !== A || b !== B || c !== C || a !== b || a !== c || A !== B || A !== C
    : a !== b || a !== c || A !== B || A !== C

  if (a === b && a === c && A === B && A === C && schema.includes('a') && schema.includes('A')) {
    while (schema.endsWith('a') || schema.endsWith('A')) {
      schema = schema[schema.length - 1] + schema.slice(0, -1)
    }
  }
  if (schema[0] === 'a') {
    schema = swapCase(schema)
  }
  if (schema.search(/[bB]/) > schema.search(/[cC]/)) {
    schema = swapBC(schema)
  }

  if (!verteiltMode) {
    return { schema, schemaY: schema, verteilt: null, unbalanced }
  }

  const verteilt = schema
  const nutcount = schema.split('|')
  let dashes = ''
  for (let i = 1; i < nutcount.length; i++) dashes += '-'
  return { schema: dashes, schemaY: dashes, verteilt, unbalanced }
}

export interface ParsedSchema {
  ok: true
  schema: string
  schemaY: string
  nuten: number
  verteilt: string | null
  sps: boolean
}

export interface SchemaError {
  ok: false
  errorKey: string
  field: 'nuten' | 'pole'
}

export type ParseResult = ParsedSchema | SchemaError

export function parseSchema(raw: string, pole: number): ParseResult {
  let schema = raw
    .replace(/ /g, '')
    .replace(/U/g, 'A')
    .replace(/u/g, 'a')
    .replace(/V/g, 'B')
    .replace(/v/g, 'b')
    .replace(/W/g, 'C')
    .replace(/w/g, 'c')
  let verteilt: string | null = null
  if (schema.includes('|')) {
    verteilt = schema
    const nutcount = schema.split('|')
    let dashes = ''
    for (let i = 0; i < nutcount.length; i++) dashes += '-'
    schema = dashes
  }
  const sps = schema.includes('-')
  if (schema[0] === '-' && schema[schema.length - 1] === '-') {
    schema = schema.substr(1)
  } else if (schema[0] !== '-' && schema[schema.length - 1] !== '-' && sps && schema.length % 3 !== 0) {
    schema += '-'
  }
  const schemaY = schema
  schema = schema.replace(/\//g, '')
  const nuten = schema.length
  if (nuten % 3 !== 0 || nuten < 3) return { ok: false, errorKey: 'nut_3_teilbar', field: 'nuten' }
  if (pole % 2 !== 0 || pole < 2) return { ok: false, errorKey: 'pol_grade', field: 'pole' }
  if (pole === nuten) return { ok: false, errorKey: 'nut_pol_ungleich', field: 'pole' }
  return { ok: true, schema, schemaY, nuten, verteilt, sps }
}

export function normalizeDistributed(raw: string, sps: boolean, vonHand: boolean): string {
  let ohnestator = raw.replace(/\|/g, '')
  for (let i = 0; i < ohnestator.length; i++) {
    if (ohnestator[0] === ohnestator[ohnestator.length - 1]) {
      const zwischen = ohnestator[ohnestator.length - 1]
      ohnestator = zwischen + ohnestator.substring(0, ohnestator.length - 1)
    } else {
      break
    }
  }
  let out = ''
  for (let i = 0; i < ohnestator.length; i++) out += ohnestator[i] + '|'
  if (!sps && !vonHand) {
    let doubled = ''
    for (let y = 0; y < out.length; y++) {
      const ch = out[y]
      if (ch !== '|' && ch !== '/' && ch !== '-') {
        doubled += ch + ch
      } else {
        doubled += ch
      }
    }
    out = doubled
  }
  return out
}

export function applyShortening(verteilt: string, um: number): string {
  const nutbelag = verteilt.split('|')
  let ersteSchicht = ''
  let zweiteSchicht = ''
  for (let i = 0; i < nutbelag.length - 1; i++) {
    ersteSchicht += nutbelag[i][1] ?? ''
    zweiteSchicht += nutbelag[i][0] ?? ''
  }
  for (let i = 0; i < um; i++) {
    ersteSchicht = ersteSchicht.substring(1) + (ersteSchicht[0] ?? '')
  }
  let out = ''
  for (let i = 0; i < nutbelag.length - 1; i++) {
    out += (ersteSchicht[i] ?? '') + (zweiteSchicht[i] ?? '') + '|'
  }
  return out
}
