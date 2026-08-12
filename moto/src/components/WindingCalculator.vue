<script setup lang="ts">
import { useCalculator } from '../composables/useCalculator'
import { languages } from '../lib/i18n'
import StatorCanvas from './StatorCanvas.vue'
import WfTable from './WfTable.vue'
import WindungsAnzeige from './WindungsAnzeige.vue'

const {
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
} = useCalculator()
</script>

<template>
  <div class="calculator">
    <ul class="lang-switch">
      <li v-for="l in languages" :key="l" :class="{ active: lang === l }" @click="setLang(l)">{{ l }}</li>
    </ul>

    <form class="inputs" @submit.prevent="advancedMode ? computeFromSchema() : compute()">
      <label for="nuten">{{ t('nuten') }}</label>
      <input
        id="nuten"
        v-model="nutenInput"
        class="num-input"
        :class="{ blink: blinkId === 'nuten' }"
        :size="advancedMode ? 35 : 3"
        :maxlength="advancedMode ? 99 : 2"
        name="Nuten"
      />
      <label for="pole">{{ t('pole') }}</label>
      <input
        id="pole"
        v-model="poleInput"
        class="num-input"
        :class="{ blink: blinkId === 'pole' }"
        size="3"
        maxlength="3"
        name="Pole"
      />
      <select v-if="showSps" v-model="istSPS" class="sps-select" name="SPSsel">
        <option :value="false">2 {{ t('schicht') }}</option>
        <option :value="true">1 {{ t('schicht') }}</option>
      </select>
      <template v-if="showShortening">
        <span class="shorten">{{ t('kuerzung') }}</span>
        <input v-model="verkuerzung" class="num-input" size="2" maxlength="1" name="verkuerzung" />
      </template>
      <select v-else-if="showSchaltung" v-model="schaltung" class="sps-select" name="schalt">
        <option value="D">D</option>
        <option value="Y">Y</option>
      </select>
      <button type="submit" class="compute-btn">{{ t('berechnen') }}</button>
      <span class="toggle-mode" @click="toggleAdvanced()">
        ⇐ {{ advancedMode ? t('einfach') : t('erweitert') }}
      </span>
    </form>

    <div v-if="advancedMode" class="schema-hint">
      <span>( - {{ t('hammer_leer') }})</span>
      <span>( / {{ t('teil_motor') }})</span>
    </div>

    <div v-if="kgv !== null && nutenx > 0" class="rasten">
      <div>
        {{ t('rastetn1') }} <b>{{ kgv }}</b> {{ t('rastetn2') }}.
        <span class="hint">{{ t('kgv') }}({{ nutenx }},{{ polex }})</span>
      </div>
      <div>
        {{ t('wickelfaktor') }} <b>{{ wFactor }}</b>
        <span class="advanced-toggle" @click="showAdvanced = !showAdvanced">
          <span class="arrow">{{ showAdvanced ? '⇑' : '⇓' }}</span>
          {{ showAdvanced ? t('einfach') : t('erweitert') }}
        </span>
      </div>
    </div>

    <div v-if="showAdvanced && nutenx > 0" class="advanced">
      <div class="adv-title">{{ t('WF_tabelle') }}</div>
      <div class="adv-row">
        <span class="adv-label">{{ t('nutfaktor') }}</span>
        <span>{{ t('stator_d') }}</span>
        <input
          v-model="statorD"
          class="num-input small"
          :class="{ blink: blinkId === 'statorD' }"
          size="3"
          name="statorD"
        />
        mm
        <span>{{ t('nut_B') }}</span>
        <input
          v-model="nutB"
          class="num-input small"
          :class="{ blink: blinkId === 'nutB' }"
          size="3"
          name="nutB"
        />
        mm
        <span>{{ t('inTabelle') }}</span>
        <input type="checkbox" :checked="slotFactorOn" @change="toggleSlotFactor" />
      </div>
      <div class="adv-row">
        <span class="adv-label">{{ t('schraegung1') }}</span>
        <span>{{ t('schraegung2') }}:</span>
        <input
          v-model="schraegung"
          class="num-input small"
          :class="{ blink: blinkId === 'schraegung' }"
          size="3"
          name="schraegung"
        />
        {{ t('nuten') }}
        <span>{{ t('inTabelle') }}</span>
        <input type="checkbox" :checked="skewOn" @change="toggleSkew" />
      </div>
      <WindungsAnzeige v-if="!verteilt" :schema="schemax" :pole="polex" />
      <WfTable v-if="wfTableData.length" :wf="wfTableData" :nuten="nutenx" />
    </div>

    <div v-if="displayChars.length" class="result">
      <span v-if="error" class="unbalanced">{{ error }}</span>
      <template v-if="error">( </template>
      <span
        v-for="(ch, i) in displayChars"
        :key="i"
        class="result-char"
        :class="{ active: ch.active }"
        :style="{ color: ch.color }"
        >{{ ch.ch }}</span
      >
      <template v-if="error"> )</template>
    </div>

    <div v-if="showSteps" class="steps">
      <span v-if="!stepMode" class="step-label" @click="startSteps()">{{ t('schritt_schritt') }}</span>
      <template v-else>
        <span class="step-nav" @click="stepBack()">&lt;- {{ t('schritt_zurueck') }}</span>
        <span class="sep">·</span>
        <span class="step-nav" @click="stepNext()">{{ t('schritt_vor') }} -&gt;</span>
      </template>
    </div>

    <StatorCanvas
      v-if="nutenx > 0"
      :nuten="nutenx"
      :schema="schemay"
      :schritt="stepMode ? actSchritt : null"
      :schaltung="schaltx"
      :polex="polex"
      :verteilt="verteilt"
      :verkuerzung="Number(verkuerzung) || 0"
      :has-error="fehlerV"
    />
  </div>
</template>

<style scoped>
.calculator {
  width: 720px;
  max-width: 100%;
  margin: 0 auto;
  border: 1px solid #000;
  background: #fff;
  font-family: Verdana, sans-serif;
  font-size: 12px;
  text-align: center;
  padding-top: 10px;
}

.lang-switch {
  list-style: none;
  margin: 0;
  padding: 0 0 15px;
  display: flex;
  justify-content: center;
  gap: 8px;
}

.lang-switch li {
  padding: 4px;
  cursor: pointer;
  border-bottom: 1px solid #000;
}

.lang-switch li.active {
  color: #0000ff;
  font-weight: bold;
}

.inputs {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  flex-wrap: wrap;
  margin: 0 auto;
}

.num-input {
  border: 1px solid #ccc;
  background: #fff;
  font-size: 12px;
  padding: 2px 4px;
}

.num-input.small {
  font-size: 10px;
  padding: 1px 3px;
}

.num-input.blink {
  background-color: #e7796d;
}

.sps-select {
  border: 1px solid #ccc;
  background: #fff;
  font-size: 12px;
}

.shorten {
  font-size: 12px;
}

.compute-btn {
  cursor: pointer;
  font-weight: bold;
  font-size: 12px;
}

.compute-btn:hover {
  color: #0000ff;
}

.toggle-mode {
  color: #999;
  font-size: 12px;
  cursor: pointer;
}

.toggle-mode:hover {
  color: #0000ff;
}

.schema-hint {
  color: #999;
  font-size: 9px;
  margin-top: 4px;
  display: flex;
  justify-content: center;
  gap: 12px;
}

.rasten {
  margin-top: 10px;
  font-size: 14px;
  padding-top: 5px;
  padding-bottom: 5px;
  border-bottom: 1px solid #000;
}

.hint {
  font-size: 10px;
  color: #999;
  font-style: italic;
}

.advanced-toggle {
  color: #999;
  font-size: 10px;
  cursor: pointer;
}

.advanced-toggle:hover {
  color: #0000ff;
}

.result {
  margin-top: 10px;
  font-weight: bold;
  font-size: 14px;
  padding: 5px;
  overflow-x: auto;
  white-space: nowrap;
}

.result-char {
  display: inline-block;
}

.result-char.active {
  background-color: #333;
}

.unbalanced {
  color: #cc0000;
}

.steps {
  margin-top: 5px;
}

.step-label,
.step-nav {
  cursor: pointer;
}

.step-label:hover,
.step-nav:hover {
  color: #0000ff;
}

.sep {
  margin: 0 8px;
}

.advanced {
  margin-top: 10px;
  padding-top: 5px;
  text-align: left;
}

.adv-title {
  margin-bottom: 5px;
  font-weight: bold;
}

.adv-row {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
  background: #eaeaea;
  padding: 3px;
  font-size: 10px;
}

.adv-label {
  font-weight: bold;
}
</style>
