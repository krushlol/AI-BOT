"use client"

import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { cars } from "@/lib/cars/data"

type TimeMode = "day" | "dusk" | "night"

// ── Scene geometry (world angles in radians, 0 = straight ahead) ──────────────
const BLDS = [
  {a:-.48,h:.46,w:.065},{a:-.22,h:.63,w:.050},{a:.02,h:.74,w:.055},
  {a:.26,h:.38,w:.085},{a:.48,h:.52,w:.062},{a:.70,h:.30,w:.095},
  {a:.88,h:.58,w:.055},{a:1.08,h:.40,w:.078},{a:1.28,h:.68,w:.048},
  {a:1.48,h:.28,w:.108},{a:1.68,h:.50,w:.065},{a:1.88,h:.60,w:.055},
  {a:2.08,h:.34,w:.088},{a:2.32,h:.54,w:.065},{a:2.55,h:.42,w:.080},
  {a:2.78,h:.62,w:.048},{a:3.00,h:.32,w:.095},{a:-3.00,h:.50,w:.065},
  {a:-2.75,h:.44,w:.080},{a:-2.50,h:.70,w:.048},{a:-2.26,h:.36,w:.090},
  {a:-2.02,h:.56,w:.058},{a:-1.80,h:.28,w:.108},{a:-1.60,h:.64,w:.048},
  {a:-1.40,h:.42,w:.078},{a:-1.20,h:.24,w:.115},{a:-1.00,h:.52,w:.065},
  {a:-0.80,h:.34,w:.090},{a:-0.62,h:.60,w:.055},
]
const TREES = [
  {a:-.62,h:.19},{a:-.38,h:.15},{a:.12,h:.21},{a:.54,h:.16},
  {a:.92,h:.18},{a:1.32,h:.13},{a:1.72,h:.17},{a:2.14,h:.19},
  {a:2.58,h:.14},{a:-2.60,h:.20},{a:-2.14,h:.15},{a:-1.68,h:.18},
  {a:-1.32,h:.14},{a:-.94,h:.17},
]

const THEMES = {
  day:{
    skyA:"#07162e",skyB:"#1a4e78",skyH:"#aad4ef",
    gndH:"#242218",gndN:"#111008",
    bldA:"#182030",bldB:"#202a38",
    road:"#1a1714",lane:"rgba(210,198,145,.42)",
    sun:null as number | null, stars:false,
    iR:22,iG:88,iB:158,
  },
  dusk:{
    skyA:"#060318",skyB:"#240a36",skyH:"#c83808",
    gndH:"#18100a",gndN:"#0c0808",
    bldA:"#0e0c18",bldB:"#1c0c08",
    road:"#141008",lane:"rgba(218,174,72,.42)",
    sun:0.06 as number | null, stars:false,
    iR:205,iG:100,iB:28,
  },
  night:{
    skyA:"#010108",skyB:"#02040e",skyH:"#03061a",
    gndH:"#0a0806",gndN:"#060508",
    bldA:"#0a0c16",bldB:"#0c0e1c",
    road:"#0c0b0a",lane:"rgba(198,178,95,.32)",
    sun:null as number | null, stars:true,
    iR:32,iG:100,iB:225,
  },
}

export default function ExplorePage() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [timeMode, setTimeMode] = useState<TimeMode>("dusk")
  const [carIdx, setCarIdx] = useState(0)
  const timeModeRef = useRef<TimeMode>("dusk")
  const hintRef = useRef<HTMLDivElement>(null)

  useEffect(() => { timeModeRef.current = timeMode }, [timeMode])

  useEffect(() => {
    const canvas = canvasRef.current!
    const g = canvas.getContext("2d") as CanvasRenderingContext2D

    let W = 0, H = 0
    let yaw = 0, pitch = 0.06
    let tYaw = 0, tPitch = 0.06
    let vYaw = 0, vPitch = 0
    let drag = false, mx = 0, my = 0
    let animT = 0
    let hintFaded = false

    // Stars cache
    let STARS: Array<{a:number,pf:number,sz:number,br:number}> | null = null
    function genStars() {
      STARS = []
      let s = 42
      const r = () => { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646 }
      for (let i = 0; i < 300; i++) STARS.push({a:(r()-.5)*Math.PI*2, pf:.07+r()*.55, sz:.5+r()*1.9, br:.3+r()*.7})
    }

    const FOV = 1.82
    const wrap = (a: number) => { while (a > Math.PI) a -= Math.PI*2; while (a < -Math.PI) a += Math.PI*2; return a }
    const clamp = (v: number, lo: number, hi: number) => v < lo ? lo : v > hi ? hi : v
    const wx = (a: number) => W * (0.5 + wrap(a - yaw) / FOV)
    const getHY = () => H * (0.40 + pitch * 0.44)

    function resize() {
      W = canvas.width = window.innerWidth
      H = canvas.height = window.innerHeight
      STARS = null
    }

    // Rounded rect
    function rr(x:number,y:number,w:number,h:number,r:number) {
      g.beginPath()
      g.moveTo(x+r,y); g.lineTo(x+w-r,y); g.arcTo(x+w,y,x+w,y+r,r)
      g.lineTo(x+w,y+h-r); g.arcTo(x+w,y+h,x+w-r,y+h,r)
      g.lineTo(x+r,y+h); g.arcTo(x,y+h,x,y+h-r,r)
      g.lineTo(x,y+r); g.arcTo(x,y,x+r,y,r)
      g.closePath()
    }

    // ── Exterior ──────────────────────────────────────────────────────────────
    function drawWindows(bx:number,by:number,bw:number,bh:number,angle:number,mode:string) {
      const isLit = mode !== "day"
      const cols = Math.max(2, bw/10|0), rows = Math.max(2, bh/12|0)
      const wx2 = bw/(cols+1), wy2 = bh/(rows+1)
      let si = (Math.abs(angle*10000)|0) % 99991
      const rn = () => { si = (si*1664525+1013904223)&0x7fffffff; return si/0x7fffffff }
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          if (rn() > .32) {
            const lit = rn() > .28
            if (isLit && lit) {
              const br = 0.45 + rn()*.32
              g.fillStyle = mode === "dusk" ? `rgba(255,218,115,${br})` : `rgba(198,218,255,${br})`
            } else if (!isLit) {
              g.fillStyle = `rgba(175,200,220,${0.06+rn()*.07})`
            } else {
              g.fillStyle = "rgba(18,28,50,.42)"
            }
            g.fillRect(bx+c*wx2+2, by+r*wy2+3, wx2-3, wy2-4)
          }
        }
      }
    }

    function drawRoad(hy0:number, alpha:number, t:typeof THEMES.dusk) {
      g.save(); g.globalAlpha = alpha
      const vx = W/2

      g.fillStyle = t.road
      g.beginPath(); g.moveTo(vx-3,hy0+1); g.lineTo(vx+3,hy0+1)
      g.lineTo(W*.89,H); g.lineTo(W*.11,H); g.closePath(); g.fill()

      const dashOff = -animT * 16
      g.strokeStyle = t.lane; g.lineWidth = 2; g.setLineDash([22,28])
      ;[-0.19, 0, 0.19].forEach(off => {
        g.lineDashOffset = dashOff
        g.beginPath(); g.moveTo(vx+off*6,hy0+2); g.lineTo(W*(0.5+off*.54),H); g.stroke()
      })
      g.setLineDash([])
      g.strokeStyle = t.lane; g.lineWidth = 2.5; g.globalAlpha = alpha*.65
      g.beginPath()
      g.moveTo(vx-4,hy0+1); g.lineTo(W*.095,H)
      g.moveTo(vx+4,hy0+1); g.lineTo(W*.905,H)
      g.stroke()
      g.restore()
    }

    function drawExterior(mode: TimeMode) {
      const t = THEMES[mode]
      const hy0 = getHY()

      const sg = g.createLinearGradient(0,0,0,hy0)
      sg.addColorStop(0,t.skyA); sg.addColorStop(.62,t.skyB); sg.addColorStop(1,t.skyH)
      g.fillStyle = sg; g.fillRect(0,0,W,Math.max(1,hy0))

      const gg = g.createLinearGradient(0,hy0,0,H)
      gg.addColorStop(0,t.gndH); gg.addColorStop(1,t.gndN)
      g.fillStyle = gg; g.fillRect(0,Math.max(1,hy0),W,H)

      if (t.sun !== null) {
        const sx = wx(t.sun)
        if (sx > -W*.6 && sx < W*1.6) {
          const sg2 = g.createRadialGradient(sx,hy0,0,sx,hy0,W*.58)
          sg2.addColorStop(0,"rgba(255,148,22,.30)")
          sg2.addColorStop(.32,"rgba(210,60,12,.14)")
          sg2.addColorStop(1,"rgba(0,0,0,0)")
          g.fillStyle = sg2; g.fillRect(0,0,W,hy0+70)
        }
      }

      if (t.stars) {
        if (!STARS) genStars()
        g.fillStyle = "#fff"
        STARS!.forEach(s => {
          const sx = wx(s.a); if (sx < -12 || sx > W+12) return
          const sy = hy0*(1-s.pf*1.08); if (sy < 0 || sy > hy0) return
          g.globalAlpha = s.br*.88
          g.beginPath(); g.arc(sx,sy,s.sz,0,Math.PI*2); g.fill()
        })
        g.globalAlpha = 1
      }

      BLDS.forEach(b => {
        for (let w2 = -1; w2 <= 1; w2++) {
          const sx = wx(b.a + w2*Math.PI*2)
          if (sx < -W*.28 || sx > W*1.28) continue
          const bw = W*b.w, bh = hy0*b.h, bx = sx-bw/2, by = hy0-bh
          const bg = g.createLinearGradient(bx,by,bx,hy0)
          bg.addColorStop(0,t.bldA); bg.addColorStop(1,t.bldB)
          g.fillStyle = bg; g.fillRect(bx,by,bw,bh)
          drawWindows(bx,by,bw,bh,b.a,mode)
        }
      })

      TREES.forEach(tr => {
        for (let w2 = -1; w2 <= 1; w2++) {
          const sx = wx(tr.a + w2*Math.PI*2)
          if (sx < -65 || sx > W+65) continue
          const th = hy0*tr.h
          g.fillStyle = mode === "day" ? "#1a3012" : "#0a1808"
          g.beginPath(); g.moveTo(sx,hy0-th); g.lineTo(sx-th*.38,hy0); g.lineTo(sx+th*.38,hy0); g.closePath(); g.fill()
          g.fillStyle = mode === "day" ? "#271a0e" : "#0d0c08"
          g.fillRect(sx-2,hy0-th*.2,4,th*.2)
        }
      })

      const fa = Math.abs(wrap(yaw))
      const ra = clamp(1-fa/1.08,0,1)
      if (ra > .015) drawRoad(hy0,ra,t)
      const ra2 = clamp(1-Math.abs(wrap(yaw-Math.PI))/0.95,0,1)*.5
      if (ra2 > .015) drawRoad(hy0,ra2,t)
    }

    // ── Interior ──────────────────────────────────────────────────────────────
    function drawMirror(iR:number,iG:number,iB:number) {
      const mx2=W/2, my=H*.066, mw=W*.138, mh=H*.038
      g.fillStyle="#0c0a14"; g.fillRect(mx2-4,my-H*.018,8,H*.02)
      g.fillStyle="#100e1c"; rr(mx2-mw/2,my,mw,mh,3); g.fill()
      const mg=g.createLinearGradient(mx2-mw/2+3,my+3,mx2+mw/2-3,my+mh-3)
      mg.addColorStop(0,"#0e1a28"); mg.addColorStop(1,"#080c16")
      g.fillStyle=mg; rr(mx2-mw/2+3,my+3,mw-6,mh-4,2); g.fill()
      g.strokeStyle=`rgba(${iR},${iG},${iB},.22)`; g.lineWidth=1
      rr(mx2-mw/2,my,mw,mh,3); g.stroke()
    }

    function drawGauge(gx:number,gy:number,r:number,val:number,iR:number,iG:number,iB:number) {
      g.beginPath(); g.arc(gx,gy,r,0,Math.PI*2); g.fillStyle="#050310"; g.fill()
      g.strokeStyle=`rgba(${iR},${iG},${iB},.10)`; g.lineWidth=1; g.stroke()
      for (let i=0;i<=10;i++){
        const a=Math.PI*.75+(i/10)*Math.PI*1.5
        const inner=i%5===0?r*.73:r*.83
        g.strokeStyle=`rgba(${iR},${iG},${iB},${i%5===0?.28:.14})`; g.lineWidth=i%5===0?1.5:1
        g.beginPath(); g.moveTo(gx+Math.cos(a)*inner,gy+Math.sin(a)*inner); g.lineTo(gx+Math.cos(a)*(r*.94),gy+Math.sin(a)*(r*.94)); g.stroke()
      }
      const s0=Math.PI*.75, se=s0+(val/100)*Math.PI*1.5
      g.beginPath(); g.arc(gx,gy,r*.79,s0,se)
      g.strokeStyle=`rgba(${iR},${iG},${iB},.72)`; g.lineWidth=2.5; g.stroke()
      const na=s0+(val/100)*Math.PI*1.5
      g.beginPath(); g.moveTo(gx+Math.cos(na+Math.PI)*r*.14,gy+Math.sin(na+Math.PI)*r*.14); g.lineTo(gx+Math.cos(na)*r*.73,gy+Math.sin(na)*r*.73)
      g.strokeStyle="#ff6820"; g.lineWidth=1.5; g.stroke()
      g.beginPath(); g.arc(gx,gy,r*.09,0,Math.PI*2); g.fillStyle="#ff6820"; g.fill()
    }

    function drawCluster(bx:number,by:number,bw:number,bh:number,iR:number,iG:number,iB:number) {
      g.fillStyle="#07050f"; rr(bx,by,bw,bh,5); g.fill()
      const r=bh*.40
      drawGauge(bx+bw*.28,by+bh*.58,r,76,iR,iG,iB)
      drawGauge(bx+bw*.72,by+bh*.58,r,24,iR,iG,iB)
      g.fillStyle=`rgba(${iR},${iG},${iB},.78)`
      g.font=`bold ${bh*.26}px 'Courier New',monospace`; g.textAlign="center"
      g.fillText("65",bx+bw*.5,by+bh*.44)
      g.font=`${bh*.15}px 'Courier New',monospace`
      g.fillStyle=`rgba(${iR},${iG},${iB},.35)`
      g.fillText("MPH",bx+bw*.5,by+bh*.60)
    }

    function drawScreen(sx:number,sy:number,sw:number,sh:number,iR:number,iG:number,iB:number) {
      const sg=g.createLinearGradient(sx,sy,sx,sy+sh)
      sg.addColorStop(0,"#07121e"); sg.addColorStop(1,"#030810")
      g.fillStyle=sg; rr(sx,sy,sw,sh,3); g.fill()
      g.strokeStyle=`rgba(${iR},${iG},${iB},.18)`; g.lineWidth=1; rr(sx,sy,sw,sh,3); g.stroke()
      g.strokeStyle=`rgba(${iR},${iG},${iB},.12)`; g.lineWidth=.8
      ;[.2,.5,.76].forEach(f=>{ g.beginPath(); g.moveTo(sx+5,sy+sh*f); g.lineTo(sx+sw-5,sy+sh*f); g.stroke() })
      g.strokeStyle=`rgba(${iR},${iG},${iB},.40)`; g.lineWidth=1.5
      g.beginPath(); g.moveTo(sx+sw*.50,sy+sh); g.lineTo(sx+sw*.50,sy+sh*.52); g.lineTo(sx+sw*.70,sy+sh*.22); g.stroke()
      g.beginPath(); g.arc(sx+sw*.50,sy+sh*.52,2.5,0,Math.PI*2); g.fillStyle=`rgba(${iR},${iG},${iB},.82)`; g.fill()
      g.fillStyle=`rgba(${iR},${iG},${iB},.44)`
      g.font=`${sh*.17}px 'Courier New',monospace`; g.textAlign="center"
      g.fillText("9:42 AM",sx+sw/2,sy+sh*.92)
    }

    function drawDash(iR:number,iG:number,iB:number) {
      const dy=H*.618
      const dg=g.createLinearGradient(0,dy,0,H)
      dg.addColorStop(0,"#0e0c1a"); dg.addColorStop(.18,"#0a0814"); dg.addColorStop(1,"#050408")
      g.fillStyle=dg
      g.beginPath(); g.moveTo(0,H*.728); g.lineTo(W*.258,dy)
      g.bezierCurveTo(W*.40,dy-H*.022,W*.60,dy-H*.022,W*.742,dy)
      g.lineTo(W,H*.728); g.lineTo(W,H); g.lineTo(0,H); g.closePath(); g.fill()
      g.strokeStyle=`rgba(${iR},${iG},${iB},.32)`; g.lineWidth=1.5
      g.beginPath(); g.moveTo(W*.258,dy)
      g.bezierCurveTo(W*.40,dy-H*.022,W*.60,dy-H*.022,W*.742,dy); g.stroke()
      const ag=g.createLinearGradient(0,dy-H*.042,0,dy+H*.04)
      ag.addColorStop(0,"rgba(0,0,0,0)"); ag.addColorStop(.5,`rgba(${iR},${iG},${iB},.055)`); ag.addColorStop(1,"rgba(0,0,0,0)")
      g.fillStyle=ag; g.fillRect(W*.1,dy-H*.042,W*.8,H*.082)
      drawCluster(W*.22,dy-H*.015,W*.24,H*.095,iR,iG,iB)
      drawScreen(W*.50-W*.0875,dy-H*.082*.38,W*.175,H*.082,iR,iG,iB)
      const ccg=g.createLinearGradient(W*.43,dy+H*.05,W*.57,dy+H*.05)
      ccg.addColorStop(0,"#0c0a14"); ccg.addColorStop(.5,"#110f1c"); ccg.addColorStop(1,"#0c0a14")
      g.fillStyle=ccg; g.fillRect(W*.43,dy+H*.062,W*.14,H*.19)
      g.fillStyle="#1c1a28"; g.beginPath(); g.arc(W*.50,dy+H*.115,W*.018,0,Math.PI*2); g.fill()
      g.strokeStyle=`rgba(${iR},${iG},${iB},.18)`; g.lineWidth=1; g.stroke()
    }

    function drawWheel(iR:number,iG:number,iB:number) {
      const wx2=W*.385, wy2=H*.806
      const or=Math.min(W*.114,H*.142)
      g.save(); g.globalAlpha=.22; g.fillStyle="#000"
      g.beginPath(); g.arc(wx2,wy2+6,or*.9,.3,Math.PI-.3); g.fillStyle="rgba(0,0,0,.2)"; g.fill()
      g.restore()
      g.beginPath(); g.arc(wx2,wy2,or,0,Math.PI*2); g.strokeStyle="#1e1a2c"; g.lineWidth=or*.21; g.stroke()
      g.beginPath(); g.arc(wx2,wy2,or,Math.PI*1.08,Math.PI*1.92)
      g.strokeStyle=`rgba(${iR},${iG},${iB},.15)`; g.lineWidth=or*.21; g.stroke()
      const sas=[-Math.PI/2, Math.PI/6, Math.PI*5/6]
      sas.forEach(a=>{
        g.beginPath(); g.moveTo(wx2+Math.cos(a)*or*.22,wy2+Math.sin(a)*or*.22); g.lineTo(wx2+Math.cos(a)*or*.88,wy2+Math.sin(a)*or*.88)
        g.strokeStyle="#1c1828"; g.lineWidth=or*.17; g.stroke()
        g.strokeStyle=`rgba(${iR},${iG},${iB},.10)`; g.lineWidth=.8; g.stroke()
      })
      g.beginPath(); g.arc(wx2,wy2,or*.20,0,Math.PI*2); g.fillStyle="#1c1828"; g.fill()
      g.strokeStyle=`rgba(${iR},${iG},${iB},.18)`; g.lineWidth=1; g.stroke()
    }

    function drawDoor(lookR:boolean,alpha:number,iR:number,iG:number,iB:number) {
      g.save(); g.globalAlpha=alpha
      const pw=W*.30, x=lookR?0:W-pw
      const dg=g.createLinearGradient(x,0,x+pw,0)
      dg.addColorStop(lookR?0:1,"rgba(10,8,16,.96)")
      dg.addColorStop(lookR?1:0,"rgba(0,0,0,0)")
      g.fillStyle=dg; g.fillRect(x,0,pw,H)
      const px=lookR?W*.28:W*.72
      g.fillStyle="rgba(10,8,16,.82)"; g.fillRect(px-7,H*.05,14,H*.55)
      g.strokeStyle=`rgba(${iR},${iG},${iB},.15)`; g.lineWidth=1
      const tx=lookR?W*.04:W*.96
      g.beginPath(); g.moveTo(tx,H*.55); g.lineTo(tx,H*.80); g.stroke()
      g.restore()
    }

    function drawInterior(mode: TimeMode) {
      const t = THEMES[mode]
      const {iR,iG,iB} = t
      const ic = "#0a0810"

      const hlg=g.createLinearGradient(0,0,0,H*.058)
      hlg.addColorStop(0,"#0e0c18"); hlg.addColorStop(1,"#08060e")
      g.fillStyle=hlg; g.fillRect(0,0,W,H*.058)
      const dlg=g.createRadialGradient(W/2,H*.01,0,W/2,H*.01,W*.18)
      dlg.addColorStop(0,`rgba(${iR},${iG},${iB},.09)`); dlg.addColorStop(1,"rgba(0,0,0,0)")
      g.fillStyle=dlg; g.fillRect(0,0,W,H*.10)

      drawMirror(iR,iG,iB)

      g.fillStyle=ic
      g.beginPath(); g.moveTo(0,0); g.lineTo(W*.148,0); g.lineTo(W*.258,H*.635); g.lineTo(0,H*.715); g.closePath(); g.fill()
      g.strokeStyle=`rgba(${iR},${iG},${iB},.07)`; g.lineWidth=1.5
      g.beginPath(); g.moveTo(W*.148,0); g.lineTo(W*.258,H*.635); g.stroke()

      g.fillStyle=ic
      g.beginPath(); g.moveTo(W,0); g.lineTo(W*.852,0); g.lineTo(W*.742,H*.635); g.lineTo(W,H*.715); g.closePath(); g.fill()
      g.strokeStyle=`rgba(${iR},${iG},${iB},.07)`; g.lineWidth=1.5
      g.beginPath(); g.moveTo(W*.852,0); g.lineTo(W*.742,H*.635); g.stroke()

      const absYaw=Math.abs(wrap(yaw))
      if (absYaw > 0.88) {
        const a=clamp((absYaw-0.88)/.80,0,1)
        drawDoor(wrap(yaw)>0,a,iR,iG,iB)
      }

      drawDash(iR,iG,iB)
      drawWheel(iR,iG,iB)

      const vg=g.createRadialGradient(W/2,H*.38,H*.16,W/2,H*.38,H*.72)
      vg.addColorStop(0,"rgba(0,0,0,0)"); vg.addColorStop(1,"rgba(0,0,0,.52)")
      g.fillStyle=vg; g.fillRect(0,0,W,H)
      const el=g.createLinearGradient(0,0,W*.22,0)
      el.addColorStop(0,"rgba(0,0,0,.38)"); el.addColorStop(1,"rgba(0,0,0,0)")
      g.fillStyle=el; g.fillRect(0,0,W*.22,H)
      const er=g.createLinearGradient(W,0,W*.78,0)
      er.addColorStop(0,"rgba(0,0,0,.38)"); er.addColorStop(1,"rgba(0,0,0,0)")
      g.fillStyle=er; g.fillRect(W*.78,0,W*.22,H)
    }

    // ── Animation loop ─────────────────────────────────────────────────────────
    let rafId = 0, last = 0, errCount = 0
    function frame(ts: number) {
      try {
        const dt = Math.min((ts-last)/1000,.05); last=ts
        animT += dt
        if (!drag) { vYaw*=.88; vPitch*=.88; tYaw+=vYaw; tPitch+=vPitch }
        tPitch = clamp(tPitch,-.28,.38)
        yaw += wrap(tYaw-yaw)*.14
        pitch += (tPitch-pitch)*.14
        g.clearRect(0,0,W,H)
        const mode = timeModeRef.current
        drawExterior(mode)
        drawInterior(mode)
      } catch(e) {
        if (errCount++ < 3) console.error("explore frame:", e)
      }
      rafId = requestAnimationFrame(frame)
    }

    // ── Input ──────────────────────────────────────────────────────────────────
    const onDown = (x:number,y:number) => {
      drag=true; mx=x; my=y; canvas.style.cursor="grabbing"
      if (!hintFaded && hintRef.current) { hintRef.current.style.opacity="0"; hintFaded=true }
    }
    const onMove = (x:number,y:number) => {
      if (!drag) return
      const dx=x-mx, dy=y-my
      vYaw=dx*.0072; vPitch=-dy*.0048
      tYaw+=dx*.0072; tPitch-=dy*.0048
      mx=x; my=y
    }
    const onUp = () => { drag=false; canvas.style.cursor="grab" }

    const onMouseDown = (e:MouseEvent) => onDown(e.clientX,e.clientY)
    const onMouseMove = (e:MouseEvent) => onMove(e.clientX,e.clientY)
    const onMouseUp = () => onUp()
    const onTouchStart = (e:TouchEvent) => { if(e.touches.length===1) onDown(e.touches[0].clientX,e.touches[0].clientY); e.preventDefault() }
    const onTouchMove = (e:TouchEvent) => { if(e.touches.length===1) onMove(e.touches[0].clientX,e.touches[0].clientY); e.preventDefault() }
    const onTouchEnd = () => onUp()

    canvas.addEventListener("mousedown", onMouseDown)
    window.addEventListener("mousemove", onMouseMove)
    window.addEventListener("mouseup", onMouseUp)
    canvas.addEventListener("touchstart", onTouchStart, {passive:false})
    canvas.addEventListener("touchmove", onTouchMove, {passive:false})
    canvas.addEventListener("touchend", onTouchEnd)
    window.addEventListener("resize", resize)
    resize()
    rafId = requestAnimationFrame(frame)

    return () => {
      cancelAnimationFrame(rafId)
      canvas.removeEventListener("mousedown", onMouseDown)
      window.removeEventListener("mousemove", onMouseMove)
      window.removeEventListener("mouseup", onMouseUp)
      canvas.removeEventListener("touchstart", onTouchStart)
      canvas.removeEventListener("touchmove", onTouchMove)
      canvas.removeEventListener("touchend", onTouchEnd)
      window.removeEventListener("resize", resize)
    }
  }, [])

  const selectedCar = cars[carIdx]

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 50, background: "#000", cursor: "grab" }}>
      <canvas
        ref={canvasRef}
        style={{ position: "absolute", inset: 0, display: "block", touchAction: "none" }}
      />

      {/* Back button */}
      <Link
        href="/"
        className="absolute top-4 left-4 z-10 flex items-center gap-1.5 text-xs font-mono tracking-widest uppercase text-white/30 hover:text-white/60 transition-colors"
        style={{ letterSpacing: "0.18em" }}
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        Back
      </Link>

      {/* HUD */}
      <div
        className="absolute top-4 left-1/2 z-10 flex items-center gap-3"
        style={{ transform: "translateX(-50%)", backdropFilter: "blur(14px)", WebkitBackdropFilter: "blur(14px)", background: "rgba(8,6,15,.72)", border: "1px solid rgba(210,160,60,.16)", padding: "7px 18px", fontFamily: "'Courier New', monospace", whiteSpace: "nowrap" }}
      >
        {/* Car selector */}
        <select
          value={carIdx}
          onChange={e => setCarIdx(Number(e.target.value))}
          className="text-xs tracking-widest uppercase bg-transparent border-none outline-none"
          style={{ color: "rgba(220,165,65,.82)", fontFamily: "inherit", cursor: "pointer", fontSize: "10.5px", fontWeight: 700, letterSpacing: "0.22em" }}
        >
          {cars.map((c, i) => (
            <option key={c.id} value={i} style={{ background: "#0a0810", color: "#e8c878" }}>
              {c.brand} {c.model} {c.year}
            </option>
          ))}
        </select>

        <span style={{ width: 1, height: 13, background: "rgba(210,160,60,.18)", display: "inline-block", flexShrink: 0 }} />

        {/* Time of day */}
        <div className="flex gap-1">
          {(["day","dusk","night"] as const).map(t => (
            <button
              key={t}
              onClick={() => setTimeMode(t)}
              style={{
                background: timeMode===t ? "rgba(210,160,60,.08)" : "none",
                border: `1px solid ${timeMode===t ? "rgba(210,160,60,.55)" : "rgba(210,160,60,.18)"}`,
                color: timeMode===t ? "rgba(225,178,72,.92)" : "rgba(210,160,60,.38)",
                padding: "2px 11px",
                fontFamily: "'Courier New', monospace",
                fontSize: "8.5px",
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                cursor: "pointer",
                transition: "all .18s",
              }}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Hint */}
      <div
        ref={hintRef}
        className="absolute bottom-6 left-1/2 z-10 pointer-events-none"
        style={{ transform: "translateX(-50%)", fontFamily: "'Courier New', monospace", fontSize: "9px", letterSpacing: "0.2em", textTransform: "uppercase", color: "rgba(255,255,255,.18)", transition: "opacity 1.5s" }}
      >
        Drag to look around
      </div>
    </div>
  )
}
