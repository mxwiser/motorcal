export const T_VALUES = [0.25, 0.55]

function phaseValue(phase: string, tv: number): number {
  if (phase === 'a') return 1 * Math.sin(tv * 2 * Math.PI)
  if (phase === 'b') return 1 * Math.sin(tv * 2 * Math.PI + (2 * Math.PI) / 3)
  if (phase === 'c') return 1 * Math.sin(tv * 2 * Math.PI - (2 * Math.PI) / 3)
  return 0
}

export function wfFft(schema: string, verteilt: string | null, tValues: number[] = T_VALUES): number[][] {
  const nutzahl = schema.length
  const owMax = nutzahl * 6
  return tValues.map((tv) => {
    const strombelag: number[] = []
    if (!verteilt) {
      for (let i = 0; i < schema.length; i++) {
        const ch = schema[i]
        const lower = ch.toLowerCase()
        let wert1 = phaseValue(lower, tv)
        if (lower === ch) wert1 = -wert1
        let wert2: number
        if (i === 0) {
          const last = schema[schema.length - 1]
          const lastLower = last.toLowerCase()
          wert2 = phaseValue(lastLower, tv)
          if (lastLower !== last) wert2 = -wert2
        } else {
          const prev = schema[i - 1]
          const prevLower = prev.toLowerCase()
          wert2 = phaseValue(prevLower, tv)
          if (prevLower !== prev) wert2 = -wert2
        }
        strombelag[i] = wert1 + wert2
        if (wert1 !== 0 && wert2 !== 0) {
          strombelag[i] = (wert1 + wert2) / 2
        }
      }
    } else {
      const nutBelag = verteilt.split('|')
      for (let i = 0; i < nutBelag.length - 1; i++) {
        const ch0 = nutBelag[i][0]
        const lower0 = ch0.toLowerCase()
        let wert1 = phaseValue(lower0, tv)
        if (lower0 === ch0) wert1 = -wert1
        let wert2 = 0
        const ch1 = nutBelag[i][1]
        if (ch1) {
          const lower1 = ch1.toLowerCase()
          wert2 = phaseValue(lower1, tv)
          if (lower1 === ch1) wert2 = -wert2
          strombelag[i] = (wert1 + wert2) / 2
        } else {
          strombelag[i] = wert1
        }
      }
    }

    const row: number[] = []
    for (let n = 1; n <= owMax; n++) {
      let zw = 0
      for (let x = 0; x < nutzahl; x++) {
        zw += (strombelag[x] / nutzahl) * Math.sin((n * 2 * Math.PI * x) / nutzahl)
      }
      const ckRe = zw * 2
      zw = 0
      for (let x = 0; x < nutzahl; x++) {
        zw += (strombelag[x] / nutzahl) * Math.cos((n * 2 * Math.PI * x) / nutzahl)
      }
      const ckIm = zw * 2
      row[n - 1] = Math.round(Math.sqrt(ckIm * ckIm + ckRe * ckRe) * 100000) / 100000
    }
    return row
  })
}

export function wfFftSchnell(schema: string, gruppen: number[], pole: number, zeit: number, maxnut: number): number {
  const nutzahl = schema.length
  const strombelag: number[] = []
  for (let i = 0; i < schema.length; i++) {
    const ch = schema[i]
    const lower = ch.toLowerCase()
    let wert1 = phaseValue(lower, zeit)
    if (lower === ch) wert1 = -wert1
    wert1 = wert1 * gruppen[i]
    let wert2: number
    if (i === 0) {
      const last = schema[schema.length - 1]
      const lastLower = last.toLowerCase()
      wert2 = phaseValue(lastLower, zeit)
      if (lastLower !== last) wert2 = -wert2
      wert2 = wert2 * gruppen[schema.length - 1]
    } else {
      const prev = schema[i - 1]
      const prevLower = prev.toLowerCase()
      wert2 = phaseValue(prevLower, zeit)
      if (prevLower !== prev) wert2 = -wert2
      wert2 = wert2 * gruppen[i - 1]
    }
    strombelag[i] = (wert1 + wert2) / maxnut
  }

  let zw = 0
  for (let x = 0; x < nutzahl; x++) {
    zw += (strombelag[x] / nutzahl) * Math.sin((pole * Math.PI * x) / nutzahl)
  }
  const ckRe = zw * 2
  zw = 0
  for (let x = 0; x < nutzahl; x++) {
    zw += (strombelag[x] / nutzahl) * Math.cos((pole * Math.PI * x) / nutzahl)
  }
  const ckIm = zw * 2
  return Math.round(Math.sqrt(ckIm * ckIm + ckRe * ckRe) * 100000) / 100000
}

export interface SlotFactorInput {
  statorD: number
  slotB: number
}

export interface SkewInput {
  slots: number
}

export function computeTable(base: number[][], slot: SlotFactorInput | null, skew: SkewInput | null, nuten: number): number[][] {
  return base.map((row) =>
    row.map((v, y) => {
      let f = 1
      if (slot) {
        const s = (slot.slotB * (y + 1)) / slot.statorD
        f *= Math.sin(s) / s
      }
      if (skew) {
        const s = (skew.slots * Math.PI * (y + 1)) / nuten
        f *= Math.sin(s) / s
      }
      return Math.round(v * f * 100000) / 100000
    }),
  )
}
