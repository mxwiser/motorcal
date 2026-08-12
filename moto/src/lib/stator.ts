import { farbeZu } from './winding'

export interface StatorOptions {
  nuten: number
  schema: string
  schritt: number | null
  schaltung: 'D' | 'Y'
  polex: number
  verteilt: string | null
  verkuerzung: number
  text: (key: string) => string
}

export function poleDazu(ctx: CanvasRenderingContext2D, polex: number): void {
  const p1 = 'rgba(255,0,0,0.3)'
  const p2 = 'rgba(0,0,255,0.3)'
  for (let i = 0; i < polex; i++) {
    ctx.beginPath()
    ctx.lineWidth = 10
    ctx.arc(0, 0, 301, Math.PI / (polex / 2), -Math.PI / (polex / 2), true)
    ctx.strokeStyle = 'rgba(68,68,68,0.3)'
    ctx.stroke()

    ctx.beginPath()
    ctx.lineWidth = 18
    ctx.arc(0, 0, 287, (Math.PI / (polex / 2) / 200) * 67, (-Math.PI / (polex / 2) / 200) * 67, true)
    ctx.strokeStyle = i % 2 !== 0 ? p2 : p1
    ctx.stroke()

    ctx.rotate(Math.PI / (polex / 2))
  }
}

export function drawStator(ctx: CanvasRenderingContext2D, o: StatorOptions): void {
  const { nuten, polex } = o
  let schritt = o.schritt
  const xzx = o.schema.split('/').length - 1
  if (schritt == null) schritt = nuten + 1 + xzx
  if (o.schema[schritt - 1] === '/') schritt -= 1

  ctx.setTransform(1, 0, 0, 1, 0, 0)
  ctx.clearRect(0, 0, 700, 700)

  const hammerHeight = 255 - nuten / 3
  let hammerWidth = 950 / nuten
  if (nuten === 6) hammerWidth += 3
  else if (nuten === 3) hammerWidth -= 80

  ctx.fillStyle = '#111'
  ctx.beginPath()
  ctx.arc(350, 350, 148, 0, Math.PI * 2, true)
  ctx.closePath()
  ctx.fill()

  ctx.fillStyle = '#FFF'
  ctx.beginPath()
  ctx.arc(350, 350, 112, 0, Math.PI * 2, true)
  ctx.closePath()
  ctx.fill()

  let sBasis = 100
  if (nuten > 21 && nuten <= 36) sBasis += nuten / 3.8
  const ebene: Record<string, number> = {
    a1: 40 + sBasis,
    a2: 35 + sBasis,
    b1: 30 + sBasis,
    b2: 25 + sBasis,
    c1: 20 + sBasis,
    c2: 15 + sBasis,
  }

  ctx.translate(350, 350)
  ctx.rotate((270 * Math.PI) / 180)

  for (let i = 0; i < nuten; i++) {
    ctx.beginPath()
    ctx.moveTo(130, hammerWidth / 4)
    ctx.lineTo(Math.round(hammerHeight / 1.03), hammerWidth / 4)
    ctx.lineTo(Math.round(hammerHeight / 1.025), hammerWidth / 2)
    ctx.lineTo(hammerHeight, hammerWidth / 2)
    ctx.lineTo(hammerHeight + hammerWidth / 20, 0)
    ctx.lineTo(hammerHeight, -hammerWidth / 2)
    ctx.lineTo(Math.round(hammerHeight / 1.025), -hammerWidth / 2)
    ctx.lineTo(Math.round(hammerHeight / 1.03), -hammerWidth / 4)
    ctx.lineTo(130, -hammerWidth / 4)
    ctx.textBaseline = 'middle'
    ctx.fillStyle = '#111'
    ctx.fill()
    ctx.rotate(Math.PI / (nuten / 2))
  }

  poleDazu(ctx, polex)

  const Swikel = o.schema.substr(0, schritt).split('/')
  ctx.rotate(-(schritt - 1 - (Swikel.length - 1)) * (Math.PI / (nuten / 2)))
  const Sschemen = o.schema.split('/')
  const schemen: string[] = []
  for (let i = 0; i < Swikel.length; i++) schemen[i] = Sschemen[i]

  let gesamtlength = -1
  for (let zx = 0; zx < schemen.length; zx++) {
    const schema = schemen[zx]
    const f_u: Record<string, number | false> = { a: false, b: false, c: false }
    const ebenenVerlauf: Record<string, boolean> = { a1: false, a2: false, b1: false, b2: false, c1: false, c2: false }
    const enden: (number | string)[] = [0, '', '', 'abc']
    let dasNicht: boolean | 'mitte' = false
    let ersteFarbe = ''
    const abc = 'abc'

    for (let i = 0; i < schema.length; i++) {
      gesamtlength++
      if (gesamtlength + 1 + zx > schritt) continue

      const wireColor = farbeZu(schema[i])
      let richtung = 15
      if (schema[i].toLowerCase() === schema[i]) richtung = -15
      let schonBeschriftet = false

      for (let y = 0; y < 75; y += 15) {
        dasNicht = false
        if (schema[i].toLowerCase() === '-') continue
        ctx.beginPath()

        if (richtung === 15) {
          ctx.moveTo(156 + y, hammerWidth / 4 + 2)
          ctx.lineTo(156 + y + richtung, -(hammerWidth / 4) - 2)

          if (y === 0) {
            ctx.moveTo(156 + y, -(hammerWidth / 4) + 2)
            ctx.lineTo(156 + y, -(hammerWidth / 4) - 2)
            if (!f_u[schema[i].toLowerCase()]) {
              f_u[schema[i].toLowerCase()] = schema.toLowerCase().lastIndexOf(schema[i].toLowerCase())
              ctx.moveTo(156 + y, -(hammerWidth / 4) + 2)
              ctx.lineTo(156 + y, -(hammerWidth / 3.5) - 5)
              ctx.moveTo(154 + y, -(hammerWidth / 3.5) - 5)
              ctx.lineTo(300, -(hammerWidth / 3.5) - 5)
              ctx.font = "16px 'verdana'"
              if (nuten !== 3) ctx.fillText(o.text('anfang') + ' ' + schema[i].toUpperCase(), 275, 0)
              schonBeschriftet = true
              ebenenVerlauf[schema[i].toLowerCase() + '1'] = false
              ebenenVerlauf[schema[i].toLowerCase() + '2'] = false
            } else {
              let subE: string
              if (ebenenVerlauf[schema[i].toLowerCase() + '1']) subE = '1'
              else if (ebenenVerlauf[schema[i].toLowerCase() + '2']) subE = '2'
              else subE = '1'
              ebenenVerlauf[schema[i].toLowerCase() + subE] = true
              ctx.moveTo(156 + y, -(hammerWidth / 4.3) - 2)
              ctx.lineTo(ebene[schema[i].toLowerCase() + subE] - 18 / nuten, -(hammerWidth / 4.3) - 2)
              ctx.arc(0, 0, ebene[schema[i].toLowerCase() + subE], -Math.PI / nuten + 0.001, -Math.PI / nuten, true)
            }
          }
          if (y === 60) {
            ctx.moveTo(171 + y, hammerWidth / 4 + 2)
            ctx.lineTo(171 + y, hammerWidth / 4 - 2)
            if (i === f_u[schema[i].toLowerCase()]) {
              if (o.schaltung === 'D') {
                ctx.moveTo(171 + y, hammerWidth / 4 - 2)
                ctx.lineTo(300, hammerWidth / 4 - 2)
                ctx.font = "16px 'verdana'"
                if (!schonBeschriftet) ctx.fillText(o.text('ende') + ' ' + schema[i].toUpperCase(), 275, 0)
              } else if (o.schaltung === 'Y') {
                dasNicht = true
                ctx.moveTo(171 + y, hammerWidth / 4.5 - 2)
                ctx.lineTo(171 + y, hammerWidth / 4 + 5)
                ctx.moveTo(171 + y, hammerWidth / 4 + 5)
                ctx.lineTo(148, hammerWidth / 4 + 5)
                enden[1] = schema[i].toLowerCase()
                switch (enden[0]) {
                  case 0:
                    enden[0] = 1
                    ctx.arc(0, 0, 100, Math.PI / nuten, Math.PI / nuten + 0.001, false)
                    ersteFarbe = schema[i].toLowerCase()
                    break
                  case 1:
                    ctx.lineTo(100, 0)
                    enden[0] = 2
                    dasNicht = 'mitte'
                    ctx.moveTo(100, 0)
                    ctx.lineTo(90, 0)
                    break
                  case 2:
                    enden[0] = 3
                    ctx.arc(0, 0, 100, -Math.PI / nuten + 0.001, -Math.PI / nuten, true)
                    break
                }
              }
              ebenenVerlauf[schema[i].toLowerCase() + '1'] = false
              ebenenVerlauf[schema[i].toLowerCase() + '2'] = false
            } else {
              let subE: string
              if (!ebenenVerlauf[schema[i].toLowerCase() + '1']) {
                subE = '1'
                ebenenVerlauf[schema[i].toLowerCase() + '2'] = false
              } else if (!ebenenVerlauf[schema[i].toLowerCase() + '2']) {
                subE = '2'
                ebenenVerlauf[schema[i].toLowerCase() + '1'] = false
              } else {
                subE = '1'
              }
              ebenenVerlauf[schema[i].toLowerCase() + subE] = true
              ctx.moveTo(171 + y, hammerWidth / 4.5 - 2)
              ctx.lineTo(171 + y, hammerWidth / 4 + 5)
              ctx.moveTo(171 + y, hammerWidth / 4 + 5)
              ctx.lineTo(ebene[schema[i].toLowerCase() + subE] - 18 / nuten, hammerWidth / 4 + 5)
              ctx.arc(0, 0, ebene[schema[i].toLowerCase() + subE], Math.PI / nuten, Math.PI / nuten + 0.001, false)
            }
          }
        } else {
          ctx.moveTo(171 + y, hammerWidth / 4 + 2)
          ctx.lineTo(171 + y + richtung, -(hammerWidth / 4) - 2)

          if (y === 0) {
            ctx.moveTo(156 + y, hammerWidth / 4 + 2)
            ctx.lineTo(156 + y, hammerWidth / 4 - 2)
            if (!f_u[schema[i].toLowerCase()]) {
              f_u[schema[i].toLowerCase()] = schema.toLowerCase().lastIndexOf(schema[i].toLowerCase())
              ctx.moveTo(156 + y, hammerWidth / 4 + 2)
              ctx.lineTo(156 + y, hammerWidth / 3.5 + 5)
              ctx.moveTo(154 + y, hammerWidth / 3.5 + 5)
              ctx.lineTo(300, hammerWidth / 3.5 + 5)
              ctx.font = "16px 'verdana'"
              if (nuten !== 3) ctx.fillText(o.text('anfang') + ' ' + schema[i].toUpperCase(), 275, 0)
              schonBeschriftet = true
              ebenenVerlauf[schema[i].toLowerCase() + '1'] = false
              ebenenVerlauf[schema[i].toLowerCase() + '2'] = false
            } else {
              let subE: string
              if (ebenenVerlauf[schema[i].toLowerCase() + '1']) subE = '1'
              else if (ebenenVerlauf[schema[i].toLowerCase() + '2']) subE = '2'
              else subE = '1'
              ebenenVerlauf[schema[i].toLowerCase() + subE] = true
              ctx.moveTo(156 + y, hammerWidth / 4.5 + 3)
              ctx.lineTo(ebene[schema[i].toLowerCase() + subE] - 18 / nuten, hammerWidth / 4.5 + 2)
              ctx.lineTo(ebene[schema[i].toLowerCase() + subE], 0)
              ctx.arc(0, 0, ebene[schema[i].toLowerCase() + subE], 0, -Math.PI / nuten, true)
            }
          }
          if (y === 60) {
            ctx.moveTo(171 + y, -(hammerWidth / 4) + 2)
            ctx.lineTo(171 + y, -(hammerWidth / 4) - 2)
            if (i === f_u[schema[i].toLowerCase()]) {
              if (o.schaltung === 'D') {
                ctx.moveTo(171 + y, -(hammerWidth / 4))
                ctx.lineTo(300, -(hammerWidth / 4))
                ctx.font = "16px 'verdana'"
                if (!schonBeschriftet) ctx.fillText(o.text('ende') + ' ' + schema[i].toUpperCase(), 275, 0)
              } else if (o.schaltung === 'Y') {
                dasNicht = true
                ctx.moveTo(171 + y, -(hammerWidth / 4.5) + 2)
                ctx.lineTo(171 + y, -(hammerWidth / 4) - 5)
                ctx.moveTo(171 + y, -(hammerWidth / 4) - 5)
                ctx.lineTo(148, -(hammerWidth / 4) - 5)
                enden[1] = schema[i].toLowerCase()
                switch (enden[0]) {
                  case 0:
                    enden[0] = 1
                    ctx.arc(0, 0, 100, Math.PI / nuten, Math.PI / nuten + 0.001, false)
                    ersteFarbe = schema[i].toLowerCase()
                    break
                  case 1:
                    ctx.lineTo(100, 0)
                    enden[0] = 2
                    dasNicht = 'mitte'
                    ctx.moveTo(100, 0)
                    ctx.lineTo(90, 0)
                    break
                  case 2:
                    enden[0] = 3
                    ctx.arc(0, 0, 100, -Math.PI / nuten + 0.001, -Math.PI / nuten, true)
                    break
                }
              }
              ebenenVerlauf[schema[i].toLowerCase() + '1'] = false
              ebenenVerlauf[schema[i].toLowerCase() + '2'] = false
            } else {
              let subE: string
              if (!ebenenVerlauf[schema[i].toLowerCase() + '1']) {
                subE = '1'
                ebenenVerlauf[schema[i].toLowerCase() + '2'] = false
              } else if (!ebenenVerlauf[schema[i].toLowerCase() + '2']) {
                subE = '2'
                ebenenVerlauf[schema[i].toLowerCase() + '1'] = false
              } else {
                subE = '1'
              }
              ebenenVerlauf[schema[i].toLowerCase() + subE] = true
              ctx.moveTo(171 + y, -(hammerWidth / 4.5) + 2)
              ctx.lineTo(171 + y, -(hammerWidth / 4) - 5)
              ctx.moveTo(171 + y, -(hammerWidth / 4) - 5)
              ctx.lineTo(ebene[schema[i].toLowerCase() + subE] - 18 / nuten, -(hammerWidth / 4) - 5)
              ctx.moveTo(ebene[schema[i].toLowerCase() + subE] - 18 / nuten, -(hammerWidth / 4) - 5)
              ctx.lineTo(ebene[schema[i].toLowerCase() + subE], 0)
              ctx.arc(0, 0, ebene[schema[i].toLowerCase() + subE], 0, Math.PI / nuten + 0.001, false)
            }
          }
        }

        ctx.strokeStyle = wireColor
        ctx.lineWidth = nuten > 42 ? 2 : nuten > 24 ? 3 : 4
        ctx.stroke()
      }

      if (!dasNicht || dasNicht === 'mitte') {
        if (dasNicht !== 'mitte') {
          ctx.beginPath()
          switch (enden[0]) {
            case 1:
              ctx.arc(0, 0, 100, -Math.PI / nuten, Math.PI / nuten, false)
              ctx.strokeStyle = farbeZu(String(enden[1]))
              break
            case 2:
              ctx.arc(0, 0, 100, Math.PI / nuten, -Math.PI / nuten, true)
              ctx.strokeStyle = farbeZu(String(enden[3]))
              break
          }
          ctx.stroke()
          enden[3] = String(enden[3]).replace(String(enden[1]), '')
        } else {
          ctx.beginPath()
          ctx.arc(0, 0, 100, -Math.PI / nuten, 0, false)
          ctx.moveTo(100, -4)
          ctx.lineTo(90, -4)
          ctx.strokeStyle = farbeZu(ersteFarbe)
          ctx.stroke()

          ctx.beginPath()
          ctx.arc(0, 0, 100, Math.PI / nuten, 0, true)
          ctx.moveTo(100, 4)
          ctx.lineTo(90, 4)
          const farbe2 = abc.replace(ersteFarbe, '').replace(String(enden[1]), '')
          ctx.strokeStyle = farbeZu(farbe2)
          ctx.stroke()
          enden[3] = String(enden[3]).replace(String(enden[1]), '')
        }
      }

      for (let z = 1; z < 3; z++) {
        for (let x = 0; x < abc.length; x++) {
          if (ebenenVerlauf[abc[x] + z] && abc[x] !== schema[i].toLowerCase()) {
            ctx.beginPath()
            ctx.arc(0, 0, ebene[abc[x] + z], Math.PI / nuten, -Math.PI / nuten, true)
            ctx.strokeStyle = farbeZu(abc[x])
            ctx.stroke()
          }
        }
      }

      ctx.font = "12px 'verdana'"
      if (nuten <= 6) ctx.fillText(String(i + 1), hammerHeight + 14, 0)
      else ctx.fillText(String(i + 1), hammerHeight + 7, 0)
      ctx.rotate(Math.PI / (nuten / 2))
    }
  }

  if (o.verteilt) {
    drawDistributedWinding(ctx, o.verteilt, nuten)
  }
}

export function drawDistributedWinding(ctx: CanvasRenderingContext2D, verteilt: string, nuten: number): void {
  const Nutbelag = verteilt.split('|')
  const NutCount = Nutbelag.length - 1

  ctx.rotate((270 * Math.PI) / 180 - Math.PI / (NutCount / 2))

  for (let y = 0; y < 2; y++) {
    if (Nutbelag[0][y]) {
      ctx.rotate(Math.PI / (NutCount / 2) / 2)
      for (let i = 0; i < nuten; i++) {
        const belag = Nutbelag[i]?.[y]
        if (!belag) continue
        ctx.beginPath()
        ctx.lineWidth = 4
        let radiusx: number
        if (y === 0) radiusx = Nutbelag[0][1] ? 170 : 200
        else radiusx = 222
        ctx.arc(0, radiusx, 10, 0.001, 0, false)
        ctx.strokeStyle = farbeZu(belag.toLowerCase())
        ctx.font = "20px 'verdana'"
        if (belag === belag.toLowerCase()) ctx.fillText('-', -4, radiusx - 2)
        else ctx.fillText('+', -8, radiusx - 2)
        ctx.stroke()
        ctx.rotate(Math.PI / (NutCount / 2))
      }
      ctx.rotate(-(Math.PI / (NutCount / 2)) / 2)
    }
  }
}

export function switchBoardHeight(verteilt: string): number {
  return Math.max(50, 50 * verteilt.split('|').length - 2)
}

export function drawSwitchBoard(
  ctx: CanvasRenderingContext2D,
  verteilt: string,
  nuten: number,
  polex: number,
  verkuerzung: number,
): void {
  const xzBelag = verteilt.split('|')
  let startposTop = 50
  const startposLeft = 325

  let abstand = nuten / polex - verkuerzung
  let schaltbreite = abstand * 40
  if (schaltbreite > 350) schaltbreite = 350
  if (schaltbreite < 100) schaltbreite = 100

  const einschichtrichtung = nuten / polex / 3
  if (!xzBelag[0][1] && einschichtrichtung % 2 === 0 && einschichtrichtung !== 1) {
    abstand = abstand - einschichtrichtung / 2
  }

  const EinCount: Record<string, number> = { a: 0, b: 0, c: 0 }

  for (let i = 0; i < xzBelag.length - 1; i++) {
    ctx.fillStyle = 'rgb(0, 0, 0)'
    ctx.fillRect(startposLeft, startposTop, 50, 25)
    ctx.fillStyle = 'rgb(255, 255, 255)'
    ctx.font = "16px 'verdana'"
    if (i > 8) ctx.fillText(String(i + 1), startposLeft + 15, startposTop + 18)
    else ctx.fillText(String(i + 1), startposLeft + 20, startposTop + 18)

    for (let z = 0; z < 2; z++) {
      if (xzBelag[i][z]) {
        let topposV: number
        if (z === 0) topposV = xzBelag[i][1] ? startposTop - 17 : startposTop - 12
        else topposV = startposTop - 8

        ctx.lineWidth = 3
        ctx.beginPath()
        ctx.moveTo(startposLeft, topposV)
        ctx.lineTo(startposLeft + 50, topposV)
        if (xzBelag[i][z] !== xzBelag[i][z].toLowerCase()) {
          ctx.moveTo(startposLeft + 32, topposV - 4)
          ctx.lineTo(startposLeft + 38, topposV)
          ctx.moveTo(startposLeft + 32, topposV + 4)
          ctx.lineTo(startposLeft + 38, topposV)
        } else {
          ctx.moveTo(startposLeft + 18, topposV - 4)
          ctx.lineTo(startposLeft + 12, topposV)
          ctx.moveTo(startposLeft + 18, topposV + 4)
          ctx.lineTo(startposLeft + 12, topposV)
        }
        if (xzBelag[i][1]) {
          if (z === 0) {
            ctx.moveTo(startposLeft + 50, topposV)
            ctx.lineTo(startposLeft + schaltbreite, topposV - ((abstand * 50 - 9) / 2))
            ctx.moveTo(startposLeft, topposV)
            ctx.lineTo(startposLeft - schaltbreite + 50, topposV - ((abstand * 50 - 9) / 2))
          } else {
            ctx.moveTo(startposLeft + 50, topposV)
            ctx.lineTo(startposLeft + schaltbreite, topposV + ((abstand * 50 - 9) / 2))
            ctx.moveTo(startposLeft, topposV)
            ctx.lineTo(startposLeft - schaltbreite + 50, topposV + ((abstand * 50 - 9) / 2))
          }
        } else {
          if (einschichtrichtung % 2 === 0 && einschichtrichtung !== 1) {
            if (EinCount[xzBelag[i][z].toLowerCase()] >= einschichtrichtung / 2) {
              ctx.moveTo(startposLeft + 50, topposV)
              ctx.lineTo(startposLeft + schaltbreite, topposV + ((abstand * 50) / 2))
              ctx.moveTo(startposLeft, topposV)
              ctx.lineTo(startposLeft - schaltbreite + 50, topposV + ((abstand * 50) / 2))
            } else {
              ctx.moveTo(startposLeft + 50, topposV)
              ctx.lineTo(startposLeft + schaltbreite, topposV - ((abstand * 50) / 2))
              ctx.moveTo(startposLeft, topposV)
              ctx.lineTo(startposLeft - schaltbreite + 50, topposV - ((abstand * 50) / 2))
            }
            EinCount[xzBelag[i][z].toLowerCase()]++
            if (EinCount[xzBelag[i][z].toLowerCase()] === einschichtrichtung) {
              EinCount[xzBelag[i][z].toLowerCase()] = 0
            }
          } else {
            if (xzBelag[i][z] !== xzBelag[i][z].toLowerCase()) {
              ctx.moveTo(startposLeft + 50, topposV)
              ctx.lineTo(startposLeft + schaltbreite, topposV + ((abstand * 50) / 2))
              ctx.moveTo(startposLeft, topposV)
              ctx.lineTo(startposLeft - schaltbreite + 50, topposV + ((abstand * 50) / 2))
            } else {
              ctx.moveTo(startposLeft + 50, topposV)
              ctx.lineTo(startposLeft + schaltbreite, topposV - ((abstand * 50) / 2))
              ctx.moveTo(startposLeft, topposV)
              ctx.lineTo(startposLeft - schaltbreite + 50, topposV - ((abstand * 50) / 2))
            }
          }
        }

        ctx.strokeStyle = farbeZu(xzBelag[i][z].toLowerCase())
        ctx.stroke()
      }
    }
    startposTop = startposTop + 50
  }
}
