import { ref } from 'vue'

export type Lang = 'de' | 'en'

export const lang = ref<Lang>('de')

const dict: Record<string, { de: string; en: string }> = {
  nuten: { de: 'Nuten', en: 'Slots' },
  pole: { de: 'Pole', en: 'Magnetpoles' },
  berechnen: { de: 'Berechnen', en: 'Compute' },
  kgv: { de: 'KgV', en: 'LCM' },
  rastetn1: { de: 'Diese Nut/Pol kombination rastet voraussichtlich', en: 'This slot/magnetpole combination will have' },
  rastetn2: { de: 'mal pro Umdrehung', en: 'cogging steps per turn' },
  nut_3_teilbar: { de: 'Nutanzahl muss durch 3 teilbar sein!', en: 'Slot number must be divisible by 3!' },
  pol_grade: { de: 'Polanzahl muss gerade sein!', en: 'Magnetpole number must be divisible by 2!' },
  nut_pol_ungleich: { de: 'Polanzahl muss ungleich Nutanzahl sein!', en: 'Magnetpole number and slot number must be different!' },
  unausgewogen: { de: 'Lösung unausgewogen!', en: 'Unbalanced solution!' },
  schritt_schritt: { de: 'Schritt für Schritt', en: 'Step by step' },
  schritt_zurueck: { de: 'Schritt zurück', en: 'Step back' },
  schritt_vor: { de: 'Nächster Schritt', en: 'Next step' },
  anfang: { de: 'Anfang', en: 'Start' },
  ende: { de: 'Ende', en: 'End' },
  wickelfaktor: { de: 'Und hat einen Wickelfaktor von: ', en: 'And its windingfactor is: ' },
  erweitert: { de: 'erweitert', en: 'advanced' },
  einfach: { de: 'einfach', en: 'simple' },
  schema: { de: 'Schema', en: 'Scheme' },
  hammer_leer: { de: 'für leeren Hammer', en: 'for empty hammers' },
  teil_motor: { de: 'um einen Teilmotor abzutrennen', en: 'to seperate a part motor' },
  WF_tabelle: { de: 'Wickelfaktoren für dieses Bewicklungschema', en: 'Windingfactors for this windingscheme' },
  WF: { de: 'Wickelfaktor', en: 'Windingfactor' },
  Schwankend: { de: 'Unausgewogen!', en: 'Unbalanced!' },
  inTabelle: { de: 'in die Tabelle', en: 'into the table' },
  schraegung1: { de: 'Schrägung der Nuten', en: 'Skewed slots' },
  schraegung2: { de: 'Um wieviel Nuten wurde geschrägt', en: 'By how many slotes is the skewing' },
  kuerzung: { de: 'Verkürzung', en: 'Shortening' },
  schicht: { de: 'schicht', en: 'layer' },
  stator_d: { de: 'Stator Durchmesser:', en: 'Stator diameter:' },
  nut_B: { de: 'Nut Öffnung:', en: 'Slot opening:' },
  nutfaktor: { de: 'Nutungsfaktor einbeziehen', en: 'Involving the slotfactor' },
  windungen: { de: 'Windungen:', en: 'Windings:' },
  animation_zeigen: { de: 'Animation zeigen', en: 'Show animation' },
  time: { de: 'Zeit', en: 'time' },
  max: { de: 'max:', en: 'max:' },
  schnitt: { de: 'schnitt:', en: 'avg:' },
  min: { de: 'min:', en: 'min:' },
}

export function t(key: string): string {
  return dict[key]?.[lang.value] ?? key
}

export function setLang(l: Lang): void {
  lang.value = l
}

export function initLang(): void {
  if (typeof navigator !== 'undefined') {
    const nl = navigator.language.toLowerCase()
    if (nl.includes('en')) lang.value = 'en'
  }
}
