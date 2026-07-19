import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence, useAnimate } from 'motion/react'
import { PencilSimple, Check } from '@phosphor-icons/react'
import './BloomPicker.css'

// --- hex helpers for lightness mixing ---
function hexToRgb(h) {
  h = h.replace('#', '')
  if (h.length === 3) h = h.split('').map((c) => c + c).join('')
  const n = parseInt(h, 16)
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255]
}
function rgbToHex(r, g, b) {
  return '#' + [r, g, b].map((v) => Math.round(v).toString(16).padStart(2, '0')).join('')
}
function mixHex(hex, target, t) {
  const a = hexToRgb(hex)
  const b = hexToRgb(target)
  return rgbToHex(a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t)
}
// pos 0 = lightest (white), 0.5 = pure, 1 = darkest (black)
function shadeOf(base, pos) {
  if (pos <= 0.5) return mixHex(base, '#ffffff', (0.5 - pos) / 0.5)
  return mixHex(base, '#000000', (pos - 0.5) / 0.5)
}

function hexToHsl(hex) {
  const [r, g, b] = hexToRgb(hex).map((v) => v / 255)
  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  const l = (max + min) / 2
  let h = 0
  let s = 0
  if (max !== min) {
    const d = max - min
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
    if (max === r) h = (g - b) / d + (g < b ? 6 : 0)
    else if (max === g) h = (b - r) / d + 2
    else h = (r - g) / d + 4
    h *= 60
  }
  return [h, s, l]
}

function hslToHex(h, s, l) {
  h /= 360
  let r
  let g
  let b
  if (s === 0) {
    r = g = b = l
  } else {
    const hue2rgb = (p, q, t) => {
      if (t < 0) t += 1
      if (t > 1) t -= 1
      if (t < 1 / 6) return p + (q - p) * 6 * t
      if (t < 1 / 2) return q
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6
      return p
    }
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s
    const p = 2 * l - q
    r = hue2rgb(p, q, h + 1 / 3)
    g = hue2rgb(p, q, h)
    b = hue2rgb(p, q, h - 1 / 3)
  }
  return rgbToHex(r * 255, g * 255, b * 255)
}

const TAU = Math.PI * 2
const PETAL_SIZE = 54
const OUTER_RADIUS = 78
const INNER_RADIUS = 42

// Curated warm color wheel (hex), clockwise from the top.
const OUTER = [
  '#F7C13F', // yellow (top)
  '#F2A23C', // amber
  '#EE8440', // orange
  '#E96544', // coral
  '#E84C3F', // red
  '#E03E66', // rose
  '#D23C92', // magenta (bottom)
  '#A24FC8', // purple
  '#7B5FD4', // violet
  '#4E72D6', // blue
  '#3DA1B8', // teal
  '#5FB95B', // green
]

// Pastel inner ring (hex), clockwise from the top.
const INNER = [
  '#F6E6A4', // pale yellow (top)
  '#F4D0B0', // pale peach
  '#F1C1C4', // pale red/pink
  '#E3C4DE', // pale magenta
  '#CCC9EC', // pale violet/blue
  '#C6E0C9', // pale teal/green
]

function buildPetals() {
  const petals = []

  // Outer ring first so inner petals overlap on top.
  OUTER.forEach((color, i) => {
    const angle = (i / OUTER.length) * TAU - Math.PI / 2
    petals.push({
      key: `o${i}`,
      x: Math.cos(angle) * OUTER_RADIUS,
      y: Math.sin(angle) * OUTER_RADIUS,
      color,
      radius: OUTER_RADIUS,
      angleNorm: i / OUTER.length,
    })
  })

  INNER.forEach((color, i) => {
    const angle = (i / INNER.length) * TAU - Math.PI / 2
    petals.push({
      key: `i${i}`,
      x: Math.cos(angle) * INNER_RADIUS,
      y: Math.sin(angle) * INNER_RADIUS,
      color,
      radius: INNER_RADIUS,
      angleNorm: i / INNER.length,
    })
  })

  // White center on top
  petals.push({ key: 'center', x: 0, y: 0, color: '#ffffff', radius: 0, angleNorm: 0 })

  // Spiral reveal order: radius + angle so it winds outward (rings interleave)
  petals
    .map((p) => ({ p, m: p.radius / OUTER_RADIUS + p.angleNorm }))
    .sort((a, b) => a.m - b.m)
    .forEach((e, idx) => {
      e.p.order = idx
    })

  return petals
}

const PETALS = buildPetals()
const SHOW_PETALS = true

// --- Brightness arc (generated, concentric with the bloom) ---
const ARC_CANVAS = 360 // svg canvas, centered on the bloom
const ARC_C = ARC_CANVAS / 2 // arc circle center
const ARC_RADIUS = 170 // centerline radius from bloom center
const ARC_HALF_SPAN = 26 // degrees above & below 3 o'clock
const ARC_STROKE = 20 // band thickness

function arcPath() {
  const a0 = (-ARC_HALF_SPAN * Math.PI) / 180
  const a1 = (ARC_HALF_SPAN * Math.PI) / 180
  const x0 = ARC_C + ARC_RADIUS * Math.cos(a0)
  const y0 = ARC_C + ARC_RADIUS * Math.sin(a0)
  const x1 = ARC_C + ARC_RADIUS * Math.cos(a1)
  const y1 = ARC_C + ARC_RADIUS * Math.sin(a1)
  return `M${x0} ${y0} A ${ARC_RADIUS} ${ARC_RADIUS} 0 0 1 ${x1} ${y1}`
}

export default function BloomPicker() {
  const [color, setColor] = useState('#F5B81E') // sunflower yellow
  const [isOpen, setIsOpen] = useState(false)
  const [lightPos, setLightPos] = useState(0.5) // 0 = top (light), 1 = bottom (dark)
  const [dragging, setDragging] = useState(false)
  const [pressing, setPressing] = useState(false)
  const [closing, setClosing] = useState(false) // phase 1: circles collapse
  const [petalsHome, setPetalsHome] = useState(false) // phase 2: petals converge to center
  const [bloomed, setBloomed] = useState(false) // entrance finished -> drop the stagger delay
  const [hovered, setHovered] = useState(null)
  const [editing, setEditing] = useState(false)
  const [draftHex, setDraftHex] = useState('')
  const [hexScope, animateHex] = useAnimate()
  const svgRef = useRef(null)
  const containerRef = useRef(null)
  const dishRef = useRef(null)

  // Single source of truth for hover: pick the nearest petal under the pointer.
  // Avoids missed enter/leave events between overlapping petals.
  const handleDishMove = (e) => {
    if (!bloomed || !dishRef.current) return
    const rect = dishRef.current.getBoundingClientRect()
    const px = e.clientX - rect.left - rect.width / 2
    const py = e.clientY - rect.top - rect.height / 2
    let best = null
    let bestDist = (PETAL_SIZE / 2) ** 2
    for (const p of PETALS) {
      const d = (px - p.x) ** 2 + (py - p.y) ** 2
      if (d <= bestDist) {
        bestDist = d
        best = p.key
      }
    }
    setHovered(best)
  }

  // Once the spiral entrance is done, clear the delay so hover stays snappy
  useEffect(() => {
    if (isOpen && !closing) {
      const t = setTimeout(() => setBloomed(true), 1300)
      return () => clearTimeout(t)
    }
    setBloomed(false)
  }, [isOpen, closing])

  const openPicker = () => {
    setPressing(true)
    setTimeout(() => {
      setPressing(false)
      setIsOpen(true)
    }, 140)
  }

  // Apply a hex from the editable pill into the base color + knob (live, if valid)
  const onHexChange = (e) => {
    let v = e.target.value.toUpperCase()
    if (!v.startsWith('#')) v = '#' + v.replace(/#/g, '')
    setDraftHex(v)
    if (/^#[0-9A-F]{6}$/.test(v)) {
      const [h, s, l] = hexToHsl(v)
      setColor(hslToHex(h, s, 0.5))
      setLightPos(Math.min(1, Math.max(0, 1 - l)))
    }
  }

  const toggleEdit = () => {
    if (editing) {
      if (/^#[0-9A-F]{6}$/.test(draftHex.toUpperCase())) {
        setEditing(false) // valid -> commit
      } else {
        // invalid -> bouncy pulse + flash red as feedback, stay in edit
        animateHex(
          hexScope.current,
          { scale: [1, 1.13, 0.98, 1.03, 1], color: ['#1a1a1a', '#e8392a', '#1a1a1a'] },
          { duration: 0.45, ease: 'easeOut' }
        )
      }
    } else {
      setDraftHex(shadeOf(color, lightPos).toUpperCase())
      setEditing(true)
    }
  }

  // Two-phase close: circles collapse first, then petals converge to center
  const closePicker = () => {
    setClosing(true)
    setTimeout(() => setPetalsHome(true), 110)
    setTimeout(() => {
      setIsOpen(false)
      setClosing(false)
      setPetalsHome(false)
    }, 480)
  }

  // Close the bloom when clicking outside of it
  useEffect(() => {
    if (!isOpen) return
    const onDown = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        closePicker()
      }
    }
    document.addEventListener('pointerdown', onDown)
    return () => document.removeEventListener('pointerdown', onDown)
  }, [isOpen])

  // Lightness-adjusted shade of the chosen color
  const shade = shadeOf(color, lightPos)
  const ringColor = `color-mix(in srgb, color-mix(in srgb, ${shade}, #000 30%) 14%, transparent)`

  // Knob position along the arc
  const knobAngle = ((-ARC_HALF_SPAN + lightPos * 2 * ARC_HALF_SPAN) * Math.PI) / 180
  const knobX = ARC_C + ARC_RADIUS * Math.cos(knobAngle)
  const knobY = ARC_C + ARC_RADIUS * Math.sin(knobAngle)

  const updateFromPointer = (clientX, clientY) => {
    const rect = svgRef.current.getBoundingClientRect()
    const lx = (clientX - rect.left) * (ARC_CANVAS / rect.width)
    const ly = (clientY - rect.top) * (ARC_CANVAS / rect.height)
    let deg = (Math.atan2(ly - ARC_C, lx - ARC_C) * 180) / Math.PI
    deg = Math.max(-ARC_HALF_SPAN, Math.min(ARC_HALF_SPAN, deg))
    setLightPos((deg + ARC_HALF_SPAN) / (2 * ARC_HALF_SPAN))
  }

  const onKnobDown = (e) => {
    e.preventDefault()
    setDragging(true)
    updateFromPointer(e.clientX, e.clientY)
    const move = (ev) => updateFromPointer(ev.clientX, ev.clientY)
    const up = () => {
      setDragging(false)
      window.removeEventListener('pointermove', move)
      window.removeEventListener('pointerup', up)
    }
    window.addEventListener('pointermove', move)
    window.addEventListener('pointerup', up)
  }

  return (
    <div
      className="bloompicker"
      ref={containerRef}
      onPointerMove={handleDishMove}
      onPointerLeave={() => setHovered(null)}
    >
      {isOpen ? (
        <div className="bloompicker__slot">
        <motion.svg
          ref={svgRef}
          className="bloom__brightness"
          width={ARC_CANVAS}
          height={ARC_CANVAS}
          viewBox={`0 0 ${ARC_CANVAS} ${ARC_CANVAS}`}
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          initial={{ opacity: 0, scale: 0.3, filter: 'blur(8px)' }}
          animate={
            closing
              ? { opacity: 0, scale: 0.3, filter: 'blur(8px)' }
              : { opacity: 1, scale: 1, filter: 'blur(0px)' }
          }
          transition={
            closing
              ? { duration: 0.16, ease: 'easeIn' }
              : { delay: 0.28, type: 'spring', stiffness: 300, damping: 20 }
          }
        >
          <defs>
              <linearGradient
                id="lightnessGrad"
                gradientUnits="userSpaceOnUse"
                x1={ARC_C}
                y1={ARC_C - ARC_RADIUS * Math.sin((ARC_HALF_SPAN * Math.PI) / 180)}
                x2={ARC_C}
                y2={ARC_C + ARC_RADIUS * Math.sin((ARC_HALF_SPAN * Math.PI) / 180)}
              >
                <stop offset="0" stopColor="#ffffff" />
                <stop offset="0.35" stopColor={color} />
                <stop offset="0.65" stopColor={color} />
                <stop offset="1" stopColor="#000000" />
              </linearGradient>
            </defs>
            <path
              d={arcPath()}
              stroke={ringColor}
              strokeWidth={ARC_STROKE + 4}
              strokeLinecap="round"
            />
            <path
              d={arcPath()}
              stroke="url(#lightnessGrad)"
              strokeWidth={ARC_STROKE}
              strokeLinecap="round"
            />

            {/* Knob: selected shade with a white ring */}
            <g
              onPointerDown={onKnobDown}
              style={{ pointerEvents: 'auto', cursor: dragging ? 'grabbing' : 'grab' }}
            >
              <motion.circle
                cx={knobX}
                cy={knobY}
                fill="#fff"
                animate={{ r: dragging ? 16.5 : 14.5 }}
                transition={{ type: 'spring', stiffness: 400, damping: 22 }}
                style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.25))' }}
              />
              <motion.circle
                cx={knobX}
                cy={knobY}
                fill={shade}
                animate={{ r: dragging ? 13.5 : 11.5 }}
                transition={{ type: 'spring', stiffness: 400, damping: 22 }}
              />
            </g>
          </motion.svg>

        <motion.div
          layoutId="picker-circle"
          className="bloom"
          style={{
            background: shade,
            outline: `2px solid ${ringColor}`,
            outlineOffset: '-2px',
          }}
          initial={{ filter: 'blur(3px)' }}
          animate={{
            filter: closing ? 'blur(3px)' : 'blur(0px)',
            scale: closing ? 0.18 : 1,
            opacity: closing ? 0 : 1,
          }}
          transition={{
            layout: { type: 'spring', stiffness: 420, damping: 30 },
            filter: { duration: closing ? 0.22 : 0.26, ease: 'easeOut' },
            scale: { duration: 0.22, ease: 'easeIn' },
            opacity: { duration: 0.22, ease: 'easeIn' },
          }}
        >
          <motion.div
            ref={dishRef}
            className="bloom__dish"
            style={{ outline: `2px solid ${ringColor}`, outlineOffset: '-2px' }}
            initial={{ scale: 0.4, opacity: 0, filter: 'blur(8px)' }}
            animate={
              closing
                ? { scale: 1, opacity: 1, filter: 'blur(0px)' }
                : { scale: 1, opacity: 1, filter: 'blur(0px)' }
            }
            transition={{ type: 'spring', stiffness: 420, damping: 26, delay: 0.05 }}
          />
        </motion.div>

        {/* Petals — siblings of the bloom so they outlive the circle close */}
        {SHOW_PETALS &&
          PETALS.map((p) => (
            <motion.button
              key={p.key}
              className="bloom__petal"
              style={{
                width: PETAL_SIZE,
                height: PETAL_SIZE,
                marginLeft: -PETAL_SIZE / 2,
                marginTop: -PETAL_SIZE / 2,
                left: `calc(50% + ${p.x}px)`,
                top: `calc(50% + ${p.y}px)`,
                background: p.color,
                outline: `2px solid color-mix(in srgb, color-mix(in srgb, ${p.color}, #000 30%) 18%, transparent)`,
                outlineOffset: '-2px',
              }}
              initial={{ x: -p.x, y: -p.y, scale: 1.5, opacity: 0, filter: 'blur(12px)' }}
              animate={
                petalsHome
                  ? { x: -p.x, y: -p.y, scale: 1, opacity: 0, filter: 'blur(3px)' }
                  : { x: 0, y: 0, scale: hovered === p.key ? 1.18 : 1, opacity: 1, filter: 'blur(0px)' }
              }
              transition={
                petalsHome
                  ? { duration: 0.34, ease: 'easeInOut' }
                  : {
                      type: 'spring',
                      stiffness: 220,
                      damping: 22,
                      delay: bloomed ? 0 : 0.06 + p.order * 0.022,
                      scale: {
                        type: 'spring',
                        stiffness: bloomed ? 400 : 240,
                        damping: bloomed ? 18 : 20,
                        delay: bloomed ? 0 : 0.06 + p.order * 0.022,
                      },
                    }
              }
              whileTap={bloomed ? { scale: 0.95, transition: { duration: 0.1 } } : undefined}
              onClick={() => {
                const [h, s, l] = hexToHsl(p.color)
                setColor(hslToHex(h, s, 0.5))
                setLightPos(Math.min(1, Math.max(0, 1 - l)))
              }}
              aria-label={p.color}
            />
          ))}
        </div>
      ) : (
        <motion.button
          layoutId="picker-circle"
          className="bloompicker__swatch"
          onClick={() => !editing && openPicker()}
          aria-label="Pick a color"
          animate={{ scale: pressing ? 0.85 : 1, backgroundColor: shade }}
          transition={{
            layout: { type: 'spring', stiffness: 420, damping: 30 },
            scale: { type: 'spring', stiffness: 500, damping: 24 },
            backgroundColor: { duration: 0.25, ease: 'easeOut' },
          }}
        />
      )}

      <motion.div
        className="bloompicker__hex"
        style={{ pointerEvents: isOpen ? 'none' : 'auto' }}
        animate={{
          width: editing ? 196 : 138,
          paddingLeft: editing ? 14 : 18,
          paddingRight: editing ? 14 : 18,
          opacity: isOpen ? 0 : 1,
          filter: isOpen ? 'blur(6px)' : 'blur(0px)',
        }}
        transition={{
          width: { type: 'spring', stiffness: 300, damping: 18 },
          paddingLeft: { type: 'spring', stiffness: 300, damping: 18 },
          paddingRight: { type: 'spring', stiffness: 300, damping: 18 },
          opacity: { duration: 0.22, ease: 'easeOut' },
          filter: { duration: 0.22, ease: 'easeOut' },
        }}
      >
        {editing ? (
          <input
            ref={hexScope}
            className="bloompicker__hex-input"
            value={draftHex}
            onChange={onHexChange}
            spellCheck={false}
            maxLength={7}
            autoFocus
          />
        ) : (
          <span>{shade.toUpperCase()}</span>
        )}
        <button
          className="bloompicker__edit"
          onClick={toggleEdit}
          aria-label={editing ? 'Confirm hex' : 'Edit hex'}
        >
          <AnimatePresence mode="wait" initial={false}>
            {editing ? (
              <motion.span
                key="check"
                className="bloompicker__confirm-chip"
                initial={{ opacity: 0, filter: 'blur(4px)' }}
                animate={{ opacity: 1, filter: 'blur(0px)' }}
                exit={{ opacity: 0, filter: 'blur(4px)' }}
                transition={{ duration: 0.15 }}
              >
                <Check size={14} weight="bold" color="#fff" />
              </motion.span>
            ) : (
              <motion.span
                key="pencil"
                style={{ display: 'flex' }}
                initial={{ opacity: 0, filter: 'blur(4px)' }}
                animate={{ opacity: 1, filter: 'blur(0px)' }}
                exit={{ opacity: 0, filter: 'blur(4px)' }}
                transition={{ duration: 0.15 }}
              >
                <PencilSimple size={19} weight="fill" color="#9a9aa2" />
              </motion.span>
            )}
          </AnimatePresence>
        </button>
      </motion.div>
    </div>
  )
}
