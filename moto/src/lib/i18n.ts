import { ref } from 'vue'

export type Lang = 'cn' | 'de' | 'en'

export const languages: Lang[] = ['cn', 'de', 'en']

export const lang = ref<Lang>('cn')

const dict: Record<string, { cn: string; de: string; en: string }> = {
  nuten: { cn: '槽数', de: 'Nuten', en: 'Slots' },
  pole: { cn: '磁极', de: 'Pole', en: 'Magnetpoles' },
  berechnen: { cn: '计算', de: 'Berechnen', en: 'Compute' },
  kgv: { cn: '最小公倍数', de: 'KgV', en: 'LCM' },
  rastetn1: { cn: '该槽/磁极组合预计每转出现', de: 'Diese Nut/Pol kombination rastet voraussichtlich', en: 'This slot/magnetpole combination will have' },
  rastetn2: { cn: '次齿槽转矩', de: 'mal pro Umdrehung', en: 'cogging steps per turn' },
  nut_3_teilbar: { cn: '槽数必须能被 3 整除！', de: 'Nutanzahl muss durch 3 teilbar sein!', en: 'Slot number must be divisible by 3!' },
  pol_grade: { cn: '磁极数必须是偶数！', de: 'Polanzahl muss gerade sein!', en: 'Magnetpole number must be divisible by 2!' },
  nut_pol_ungleich: { cn: '磁极数不能等于槽数！', de: 'Polanzahl muss ungleich Nutanzahl sein!', en: 'Magnetpole number and slot number must be different!' },
  unausgewogen: { cn: '方案不平衡！', de: 'Lösung unausgewogen!', en: 'Unbalanced solution!' },
  schritt_schritt: { cn: '逐步显示', de: 'Schritt für Schritt', en: 'Step by step' },
  schritt_zurueck: { cn: '上一步', de: 'Schritt zurück', en: 'Step back' },
  schritt_vor: { cn: '下一步', de: 'Nächster Schritt', en: 'Next step' },
  anfang: { cn: '起始', de: 'Anfang', en: 'Start' },
  ende: { cn: '结束', de: 'Ende', en: 'End' },
  wickelfaktor: { cn: '绕组系数为：', de: 'Und hat einen Wickelfaktor von: ', en: 'And its windingfactor is: ' },
  erweitert: { cn: '高级', de: 'erweitert', en: 'advanced' },
  einfach: { cn: '简单', de: 'einfach', en: 'simple' },
  schema: { cn: '方案', de: 'Schema', en: 'Scheme' },
  hammer_leer: { cn: '空锤', de: 'für leeren Hammer', en: 'for empty hammers' },
  teil_motor: { cn: '分离子电机', de: 'um einen Teilmotor abzutrennen', en: 'to seperate a part motor' },
  WF_tabelle: { cn: '此绕组方案的绕组系数', de: 'Wickelfaktoren für dieses Bewicklungschema', en: 'Windingfactors for this windingscheme' },
  WF: { cn: '绕组系数', de: 'Wickelfaktor', en: 'Windingfactor' },
  Schwankend: { cn: '不平衡！', de: 'Unausgewogen!', en: 'Unbalanced!' },
  inTabelle: { cn: '加入表格', de: 'in die Tabelle', en: 'into the table' },
  schraegung1: { cn: '槽斜槽', de: 'Schrägung der Nuten', en: 'Skewed slots' },
  schraegung2: { cn: '斜槽数为', de: 'Um wieviel Nuten wurde geschrägt', en: 'By how many slotes is the skewing' },
  kuerzung: { cn: '缩短', de: 'Verkürzung', en: 'Shortening' },
  schicht: { cn: '层', de: 'schicht', en: 'layer' },
  stator_d: { cn: '定子直径：', de: 'Stator Durchmesser:', en: 'Stator diameter:' },
  nut_B: { cn: '槽口宽：', de: 'Nut Öffnung:', en: 'Slot opening:' },
  nutfaktor: { cn: '考虑槽因数', de: 'Nutungsfaktor einbeziehen', en: 'Involving the slotfactor' },
  windungen: { cn: '匝数：', de: 'Windungen:', en: 'Windings:' },
  animation_zeigen: { cn: '显示动画', de: 'Animation zeigen', en: 'Show animation' },
  time: { cn: '时间', de: 'Zeit', en: 'time' },
  max: { cn: '最大值：', de: 'max:', en: 'max:' },
  schnitt: { cn: '平均值：', de: 'schnitt:', en: 'avg:' },
  min: { cn: '最小值：', de: 'min:', en: 'min:' },
}

export function t(key: string): string {
  return dict[key]?.[lang.value] ?? key
}

export function setLang(l: Lang): void {
  lang.value = l
}
