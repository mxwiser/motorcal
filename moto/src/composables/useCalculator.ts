import { computed, ref } from 'vue'
import { lang, setLang, t } from '../lib/i18n'
import {
  applyShortening,
  computeKgV,
  farbeZu,
  generateSchema,
  normalizeDistributed,
  parseSchema,
} from '../lib/winding'
import { computeTable, wfFft } from '../lib/windingFactor'

export function useCalculator() {
  const nutenInput = ref('27')
  const poleInput = ref('28')
  const schaltung = ref<'D' | 'Y'>('Y')
  const istSPS = ref(false)
  const verkuerzung = ref('0')
  const advancedMode = ref(false)

  const nutenx = ref(0)
  const polex = ref(0)
  const schemax = ref('')
  const schemay = ref('')
  const verteilt = ref<string | null>(null)
  const error = ref<string | null>(null)
  const fehlerV = ref(false)
  const kgv = ref<number | null>(null)
  const wFactor = ref<number | string | null>(null)
  const wfBase = ref<number[][]>([])
  const schaltx = ref<'D' | 'Y'>('D')

  const showAdvanced = ref(false)
  const stepMode = ref(false)
  const actSchritt = ref(1)

  const slotFactorOn = ref(false)
  const skewOn = ref(false)
  const statorD = ref('')
  const nutB = ref('')
  const schraegung = ref('')

  const blinkId = ref<string | null>(null)
  let blinkTimer: number | undefined

  const nutenNum = computed(() => parseInt(nutenInput.value.replace(/ /g, ''), 10))
  const poleNum = computed(() => parseInt(poleInput.value.replace(/ /g, ''), 10))
  const lochzahl = computed(() => nutenNum.value / 3 / poleNum.value)

  const showSps = computed(() => !advancedMode.value && !isNaN(nutenNum.value) && nutenNum.value % 2 === 0)
  const showSchaltung = computed(() => !isNaN(lochzahl.value) && lochzahl.value < 1)
  const showShortening = computed(() => !istSPS.value && !isNaN(lochzahl.value) && lochzahl.value >= 1)
  const effectiveSchaltung = computed<'D' | 'Y'>(() => (showSchaltung.value ? schaltung.value : 'D'))
  const showSteps = computed(() => !verteilt.value && schemax.value.length > 0)

  const displayChars = computed(() => {
    const src = verteilt.value ?? schemay.value
    if (!src) return []
    return src.split('').map((ch, idx) => ({
      ch,
      color: farbeZu(ch),
      active: stepMode.value && !verteilt.value && idx + 1 === actSchritt.value,
    }))
  })

  const slotFactor = computed(() => {
    if (!slotFactorOn.value) return null
    const sd = parseFloat(statorD.value.replace(',', '.'))
    const sb = parseFloat(nutB.value.replace(',', '.'))
    if (isNaN(sd) || isNaN(sb) || sd === 0 || sb === 0) return null
    return { statorD: sd, slotB: sb }
  })

  const skew = computed(() => {
    if (!skewOn.value) return null
    const s = parseFloat(schraegung.value.replace(',', '.'))
    if (isNaN(s) || s === 0) return null
    return { slots: s }
  })

  const wfTableData = computed(() =>
    wfBase.value.length ? computeTable(wfBase.value, slotFactor.value, skew.value, nutenx.value) : [],
  )

  function blink(id: string) {
    blinkId.value = id
    window.clearTimeout(blinkTimer)
    blinkTimer = window.setTimeout(() => {
      blinkId.value = null
    }, 300)
  }

  function clearResults() {
    nutenx.value = 0
    polex.value = 0
    schemax.value = ''
    schemay.value = ''
    verteilt.value = null
    fehlerV.value = false
    kgv.value = null
    wFactor.value = null
    wfBase.value = []
    stepMode.value = false
    actSchritt.value = 1
  }

  function applyResult(
    nuten: number,
    pole: number,
    schema: string,
    schemaY: string,
    verteiltRaw: string | null,
    fehler: string | null,
    vonHand: boolean,
  ) {
    nutenx.value = nuten
    polex.value = pole
    schemax.value = schema
    schemay.value = schemaY
    error.value = fehler
    fehlerV.value = !!fehler
    stepMode.value = false
    actSchritt.value = 1

    let dist = verteiltRaw
    if (dist) {
      dist = normalizeDistributed(dist, istSPS.value, vonHand)
      if (!istSPS.value && !isNaN(lochzahl.value) && lochzahl.value >= 1) {
        const um = parseInt(verkuerzung.value, 10)
        if (!isNaN(um)) {
          dist = applyShortening(dist, um)
        }
      }
    }
    verteilt.value = dist

    kgv.value = computeKgV(nuten, pole)
    schaltx.value = effectiveSchaltung.value
    wfBase.value = wfFft(schema, dist)
    const idx = pole / 2 - 1
    const w0 = wfBase.value[0][idx]
    const w1 = wfBase.value[1][idx]
    wFactor.value = w0 !== undefined && w1 !== undefined && w0 === w1 ? w0 : t('Schwankend')
  }

  function fail(key: string, field: 'nuten' | 'pole') {
    clearResults()
    error.value = t(key)
    blink(field)
  }

  function compute() {
    const n = nutenNum.value
    const p = poleNum.value
    if (isNaN(n) || n % 3 !== 0 || n < 3) return fail('nut_3_teilbar', 'nuten')
    if (isNaN(p) || p % 2 !== 0 || p < 2) return fail('pol_grade', 'pole')
    if (n === p) return fail('nut_pol_ungleich', 'pole')
    const res = generateSchema(n, p, istSPS.value)
    applyResult(n, p, res.schema, res.schemaY, res.verteilt, res.unbalanced ? t('unausgewogen') : null, false)
  }

  function computeFromSchema() {
    const p = poleNum.value
    const parsed = parseSchema(nutenInput.value, p)
    if (!parsed.ok) return fail(parsed.errorKey, parsed.field)
    applyResult(parsed.nuten, p, parsed.schema, parsed.schemaY, parsed.verteilt, null, true)
  }

  function toggleAdvanced() {
    advancedMode.value = !advancedMode.value
    if (advancedMode.value) {
      if (nutenx.value > 0) nutenInput.value = verteilt.value ?? (schemax.value || String(nutenx.value))
    } else {
      if (nutenx.value > 0) nutenInput.value = String(nutenx.value)
    }
  }

  function startSteps() {
    stepMode.value = true
    actSchritt.value = 1
  }

  function stepBack() {
    if (actSchritt.value > 1) actSchritt.value--
  }

  function stepNext() {
    if (actSchritt.value < schemay.value.length) actSchritt.value++
  }

  function toggleSlotFactor(e: Event) {
    const checked = (e.target as HTMLInputElement).checked
    if (checked) {
      const sd = parseFloat(statorD.value.replace(',', '.'))
      const sb = parseFloat(nutB.value.replace(',', '.'))
      let ok = true
      if (isNaN(sd) || sd === 0) {
        statorD.value = '0'
        blink('statorD')
        ok = false
      }
      if (isNaN(sb) || sb === 0) {
        nutB.value = '0'
        blink('nutB')
        ok = false
      }
      if (!ok) {
        slotFactorOn.value = false
        return
      }
    }
    slotFactorOn.value = checked
  }

  function toggleSkew(e: Event) {
    const checked = (e.target as HTMLInputElement).checked
    if (checked) {
      const s = parseFloat(schraegung.value.replace(',', '.'))
      if (isNaN(s) || s === 0) {
        schraegung.value = '0'
        blink('schraegung')
        skewOn.value = false
        return
      }
    }
    skewOn.value = checked
  }

  function initFromQuery() {
    if (typeof window === 'undefined') return
    const params = new URLSearchParams(window.location.search)
    const pole = params.get('pole')
    if (!pole) return
    poleInput.value = pole
    const schema = params.get('schema')
    const nuten = params.get('nuten')
    if (schema && isNaN(Number(schema))) {
      nutenInput.value = schema
      advancedMode.value = true
      computeFromSchema()
    } else if (nuten && !isNaN(Number(nuten))) {
      nutenInput.value = nuten
      compute()
    }
  }

  initFromQuery()

  return {
    lang,
    t,
    setLang,
    nutenInput,
    poleInput,
    schaltung,
    istSPS,
    verkuerzung,
    advancedMode,
    nutenx,
    polex,
    schemax,
    schemay,
    verteilt,
    error,
    fehlerV,
    kgv,
    wFactor,
    schaltx,
    showAdvanced,
    stepMode,
    actSchritt,
    slotFactorOn,
    skewOn,
    statorD,
    nutB,
    schraegung,
    blinkId,
    showSps,
    showSchaltung,
    showShortening,
    showSteps,
    displayChars,
    wfTableData,
    compute,
    computeFromSchema,
    toggleAdvanced,
    startSteps,
    stepBack,
    stepNext,
    toggleSlotFactor,
    toggleSkew,
  }
}
