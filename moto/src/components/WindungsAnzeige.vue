<script setup lang="ts">
import { computed, onUnmounted, ref, watch } from 'vue'
import { t } from '../lib/i18n'
import { farbeZu } from '../lib/winding'
import { wfFftSchnell } from '../lib/windingFactor'

const props = defineProps<{ schema: string; pole: number }>()

const chars = computed(() => props.schema.split(''))
const disabledIdx = computed(() => new Set(chars.value.map((ch, i) => (ch === '-' ? i : -1)).filter((i) => i >= 0)))
const windungen = ref<(number | string)[]>(chars.value.map((ch) => (ch === '-' ? 0 : 1)))

const samples = ref<number[]>([])
const heights = ref<number[]>(Array(34).fill(0))
const labels = ref<string[]>(Array(17).fill(''))
const blinkIdx = ref<number | null>(null)

const stats = computed(() => {
  if (!samples.value.length) return null
  let min = Infinity
  let max = -Infinity
  let sum = 0
  for (const v of samples.value) {
    if (v < min) min = v
    if (v > max) max = v
    sum += v
  }
  return { min, max, avg: Math.round((sum / samples.value.length) * 100000) / 100000 }
})

let timer: number | undefined
let running = false

function update(count: number) {
  const h: number[] = []
  for (let i = 1; i <= 34; i++) {
    const v = samples.value[count - (35 - i)]
    h.push(v !== undefined ? Math.round(v * 236) : 0)
  }
  const l: string[] = []
  for (let r = 1; r <= 17; r++) {
    const y3 = 2 * (18 - r)
    const v = samples.value[count - y3]
    l.push(v !== undefined ? String((count - y3) / 100) : '')
  }
  heights.value = h
  labels.value = l
}

function tick(count: number) {
  if (!running) return
  update(count)
  const next = count + 1
  if (next >= 400) {
    timer = window.setTimeout(() => tick(0), 200)
  } else {
    timer = window.setTimeout(() => tick(next), 60)
  }
}

function stopAnimation() {
  running = false
  if (timer) window.clearTimeout(timer)
}

function showAnimation() {
  const vals: number[] = windungen.value.map((v) => (typeof v === 'string' ? parseFloat(v) : v))
  for (let i = 0; i < vals.length; i++) {
    if (isNaN(vals[i])) {
      blinkIdx.value = i
      window.setTimeout(() => (blinkIdx.value = null), 300)
      return
    }
  }
  let maxnutb = 1
  for (let k = 0; k < vals.length; k++) {
    const z1 = vals[k]
    const z2 = k === 0 ? vals[vals.length - 1] : vals[k - 1]
    const tst = z1 + z2
    if (tst > maxnutb) maxnutb = tst
  }
  const tmp: number[] = []
  for (let tg = 0; tg < 400; tg++) {
    tmp.push(wfFftSchnell(props.schema, vals, props.pole, tg / 100, maxnutb))
  }
  samples.value = tmp
  stopAnimation()
  running = true
  tick(0)
}

watch(
  () => props.schema,
  () => {
    stopAnimation()
    windungen.value = chars.value.map((ch) => (ch === '-' ? 0 : 1))
    samples.value = []
    heights.value = Array(34).fill(0)
    labels.value = Array(17).fill('')
  },
)

onUnmounted(stopAnimation)
</script>

<template>
  <div class="windungs">
    <div class="title">{{ t('windungen') }}</div>
    <div class="groups">
      <span v-for="(ch, i) in chars" :key="i" class="group">
        <span class="char" :style="{ color: farbeZu(ch) }">{{ ch }}</span>
        <input
          class="winput"
          :class="{ blink: blinkIdx === i }"
          type="text"
          size="1"
          :disabled="disabledIdx.has(i)"
          v-model.number="windungen[i]"
        />
      </span>
    </div>
    <button class="anim-btn" @click="showAnimation">{{ t('animation_zeigen') }}</button>
    <div v-if="samples.length" class="chart">
      <div
        class="grid"
        :style="{ gridTemplateColumns: 'repeat(34, 15px)', gridTemplateRows: '11px 238px' }"
      >
        <div
          v-for="i in 17"
          :key="'l' + i"
          class="tlabel"
          :style="{ gridColumn: (i - 1) * 2 + 1 + ' / span 2', gridRow: '1' }"
        >
          {{ labels[i - 1] }}
        </div>
        <div
          v-for="i in 34"
          :key="'b' + i"
          class="bar"
          :style="{ height: heights[i - 1] + 'px', gridColumn: String(i), gridRow: '2' }"
        ></div>
      </div>
      <div class="stats">
        <div class="stat time">{{ t('time') }}</div>
        <div class="stat">
          {{ t('max') }}<br />{{ stats?.max }}
        </div>
        <div class="stat">
          {{ t('schnitt') }}<br />{{ stats?.avg }}
        </div>
        <div class="stat">
          {{ t('min') }}<br />{{ stats?.min }}
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.windungs {
  text-align: left;
  padding: 5px 0;
}

.title {
  font-weight: bold;
  font-size: 12px;
}

.groups {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 4px;
  font-size: 11px;
  margin: 4px 0;
}

.group {
  display: inline-flex;
  align-items: center;
  gap: 2px;
}

.group .char {
  font-weight: bold;
}

.winput {
  width: 22px;
  border: 1px solid #ccc;
  background: #fff;
  font-size: 11px;
}

.winput.blink {
  background-color: #e7796d;
}

.anim-btn {
  cursor: pointer;
  margin: 4px 0;
}

.chart {
  display: flex;
  gap: 10px;
  align-items: flex-end;
  margin-top: 6px;
  overflow-x: auto;
}

.grid {
  display: grid;
  flex-shrink: 0;
}

.tlabel {
  font-size: 9px;
  font-family: monospace;
  text-align: center;
  line-height: 11px;
  overflow: visible;
}

.bar {
  background-color: #339966;
  align-self: end;
  justify-self: center;
  width: 13px;
}

.stats {
  font-size: 10px;
  display: flex;
  flex-direction: column;
  height: 250px;
}

.stat {
  flex: 1;
}
</style>
