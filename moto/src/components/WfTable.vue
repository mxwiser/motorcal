<script setup lang="ts">
import { computed } from 'vue'
import { t } from '../lib/i18n'
import { T_VALUES } from '../lib/windingFactor'

const props = defineProps<{ wf: number[][]; nuten: number }>()

interface Row {
  pole: number
  time: number
  value: number | 'err'
  color: string
  width: number
}

const rows = computed<Row[]>(() => {
  const out: Row[] = []
  for (let i = 0; i < props.nuten * 2; i++) {
    const w0 = props.wf[0]?.[i]
    const w1 = props.wf[1]?.[i]
    for (let T = 0; T < 2; T++) {
      let val: number | 'err' = props.wf[T]?.[i] ?? 0
      if (val > 1) val = 'err'
      let color = '#CC0000'
      if (w0 !== undefined && w1 !== undefined) {
        if (w0 > 0 && w0 === w1) color = T === 0 ? '#339966' : '#55BB88'
        else if (w0 !== w1) color = T === 0 ? '#CC0000' : '#FF2222'
      }
      out.push({
        pole: (i + 1) * 2,
        time: T_VALUES[T],
        value: val,
        color,
        width: typeof val === 'number' ? Math.round(val * 520) : 0,
      })
    }
  }
  return out
})
</script>

<template>
  <div class="wf-table">
    <div class="wf-row head">
      <span class="pole">{{ t('pole') }}</span>
      <span class="time">{{ t('time') }}</span>
      <span class="wf">{{ t('WF') }}</span>
    </div>
    <div v-for="(r, idx) in rows" :key="idx" class="wf-row" :class="{ alt: idx % 4 >= 2 }">
      <span class="pole">{{ r.pole }}</span>
      <span class="time">{{ r.time }}</span>
      <span class="wf">
        <span class="bar" :style="{ width: r.width + 'px', background: r.color }"></span>
        <span class="val">{{ r.value }}</span>
      </span>
    </div>
  </div>
</template>

<style scoped>
.wf-table {
  width: 100%;
  overflow-x: auto;
  border-bottom: 1px solid #000;
  padding-bottom: 5px;
  padding-top: 5px;
  text-align: left;
}

.wf-row {
  display: flex;
  align-items: center;
  font-size: 10px;
}

.wf-row.alt {
  background: #eaeaea;
}

.wf-row.head {
  font-weight: bold;
}

.wf-row .pole,
.wf-row .time {
  width: 45px;
  border-right: 1px solid #ccc;
  padding-left: 2px;
  flex-shrink: 0;
}

.wf-row .wf {
  flex: 1;
  padding-left: 2px;
  white-space: nowrap;
}

.bar {
  display: inline-block;
  height: 12px;
  vertical-align: middle;
}

.val {
  vertical-align: middle;
}
</style>
