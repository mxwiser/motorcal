<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { t } from '../lib/i18n'
import { drawStator, drawSwitchBoard, switchBoardHeight } from '../lib/stator'

const props = defineProps<{
  nuten: number
  schema: string
  schritt: number | null
  schaltung: 'D' | 'Y'
  polex: number
  verteilt: string | null
  verkuerzung: number
  hasError: boolean
}>()

const canvasRef = ref<HTMLCanvasElement | null>(null)
const canvas2Ref = ref<HTMLCanvasElement | null>(null)

const switchHeight = computed(() => (props.verteilt ? switchBoardHeight(props.verteilt) : 0))

function redraw() {
  if (!canvasRef.value || props.nuten <= 0) return
  const ctx = canvasRef.value.getContext('2d')
  if (!ctx) return
  drawStator(ctx, {
    nuten: props.nuten,
    schema: props.schema,
    schritt: props.schritt,
    schaltung: props.schaltung,
    polex: props.polex,
    verteilt: props.verteilt,
    verkuerzung: props.verkuerzung,
    text: t,
  })
  if (props.verteilt && !props.hasError && canvas2Ref.value) {
    const ctx2 = canvas2Ref.value.getContext('2d')
    if (ctx2) {
      ctx2.setTransform(1, 0, 0, 1, 0, 0)
      ctx2.clearRect(0, 0, 700, switchHeight.value)
      drawSwitchBoard(ctx2, props.verteilt, props.nuten, props.polex, props.verkuerzung)
    }
  }
}

watch(
  () => [
    props.nuten,
    props.schema,
    props.schritt,
    props.schaltung,
    props.polex,
    props.verteilt,
    props.verkuerzung,
  ],
  redraw,
)
watch(() => props.hasError, redraw)

onMounted(redraw)
</script>

<template>
  <div class="canvases">
    <canvas ref="canvasRef" width="700" height="700" class="stator-canvas"></canvas>
    <canvas
      v-if="verteilt && !hasError"
      ref="canvas2Ref"
      width="700"
      :height="switchHeight"
      class="switch-canvas"
    ></canvas>
  </div>
</template>

<style scoped>
.canvases {
  margin: 10px auto 0;
  width: 700px;
  max-width: 100%;
  overflow-x: auto;
}

.stator-canvas {
  display: block;
  width: 100%;
  height: auto;
}

.switch-canvas {
  display: block;
  width: 100%;
  height: auto;
  margin-top: 10px;
}
</style>
