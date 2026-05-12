'use client'

import { motion } from 'framer-motion'
import type { MascotMood } from '@/mascot/types'

interface MascotCharacterProps {
  mood?: MascotMood
  size?: number
  className?: string
  /** Gentle continuous floating animation */
  bobbing?: boolean
  /** Wiggle on mount */
  wiggle?: boolean
}

const C = {
  body:          '#EFE4CE',   // warm beige
  bodyShade:     '#D9CDB6',   // slightly deeper for shadow/ears
  bodyHighlight: '#F8F2E6',   // soft highlight
  white:         '#FFFEF8',
  pupil:         '#2E2A27',   // soft dark brown, not pure black
  blush:         '#D9A2A2',   // muted rose from the design palette
  tongue:        '#C98F8F',
  gold:          '#E7D39C',   // warm yellow from palette (celebrating state)
}

// ─── Per-mood face elements ───────────────────────────────────────────────────

function FaceHappy() {
  return (
    <>
      <path d="M 35 43 Q 43 38 50 42" stroke={C.pupil} strokeWidth="2.4" fill="none" strokeLinecap="round" />
      <path d="M 70 42 Q 77 38 85 43" stroke={C.pupil} strokeWidth="2.4" fill="none" strokeLinecap="round" />
      <circle cx="43" cy="56" r="6.5" fill={C.pupil} />
      <circle cx="77" cy="56" r="6.5" fill={C.pupil} />
      <circle cx="46" cy="53" r="2.2" fill={C.white} />
      <circle cx="80" cy="53" r="2.2" fill={C.white} />
      <path d="M 47 72 Q 60 83 73 72" stroke={C.pupil} strokeWidth="2.8" fill="none" strokeLinecap="round" />
    </>
  )
}

function FaceExcited() {
  return (
    <>
      <path d="M 33 40 Q 43 34 51 39" stroke={C.pupil} strokeWidth="2.5" fill="none" strokeLinecap="round" />
      <path d="M 69 39 Q 77 34 87 40" stroke={C.pupil} strokeWidth="2.5" fill="none" strokeLinecap="round" />
      <circle cx="43" cy="54" r="7.5" fill={C.pupil} />
      <circle cx="77" cy="54" r="7.5" fill={C.pupil} />
      <circle cx="47" cy="50" r="2.8" fill={C.white} />
      <circle cx="81" cy="50" r="2.8" fill={C.white} />
      {/* Open grin */}
      <path d="M 45 70 Q 60 88 75 70 Z" fill={C.pupil} />
      <path d="M 45 70 Q 60 78 75 70" stroke={C.white} strokeWidth="1.8" fill="none" />
      <ellipse cx="60" cy="82" rx="8" ry="5" fill={C.tongue} />
    </>
  )
}

function FaceSleepy() {
  return (
    <>
      {/* Droopy brows */}
      <path d="M 35 47 Q 43 45 50 47" stroke={C.pupil} strokeWidth="2.4" fill="none" strokeLinecap="round" />
      <path d="M 70 47 Q 77 45 85 47" stroke={C.pupil} strokeWidth="2.4" fill="none" strokeLinecap="round" />
      {/* Pupils drooping */}
      <circle cx="43" cy="58" r="6" fill={C.pupil} />
      <circle cx="77" cy="58" r="6" fill={C.pupil} />
      <circle cx="46" cy="55" r="2" fill={C.white} />
      <circle cx="80" cy="55" r="2" fill={C.white} />
      {/* Upper eyelids covering top half */}
      <path d="M 31 55 A 12 12 0 0 0 55 55 Z" fill={C.body} />
      <path d="M 65 55 A 12 12 0 0 0 89 55 Z" fill={C.body} />
      {/* Tiny sleepy smile */}
      <path d="M 49 74 Q 60 80 71 74" stroke={C.pupil} strokeWidth="2.4" fill="none" strokeLinecap="round" />
    </>
  )
}

function FaceCurious() {
  return (
    <>
      {/* Left brow raised, right normal */}
      <path d="M 33 41 Q 43 35 51 40" stroke={C.pupil} strokeWidth="2.4" fill="none" strokeLinecap="round" />
      <path d="M 70 44 Q 77 41 84 44" stroke={C.pupil} strokeWidth="2.4" fill="none" strokeLinecap="round" />
      {/* Pupils - left looking up/side */}
      <circle cx="41" cy="55" r="6.5" fill={C.pupil} />
      <circle cx="77" cy="56" r="6.5" fill={C.pupil} />
      <circle cx="44" cy="52" r="2.2" fill={C.white} />
      <circle cx="80" cy="53" r="2.2" fill={C.white} />
      {/* Small "o" mouth */}
      <ellipse cx="60" cy="74" rx="5.5" ry="5" fill={C.pupil} />
      <ellipse cx="60" cy="73.5" rx="3" ry="2.5" fill={C.body} />
    </>
  )
}

function FaceEncouraging() {
  return (
    <>
      <path d="M 35 44 Q 43 40 50 43" stroke={C.pupil} strokeWidth="2.4" fill="none" strokeLinecap="round" />
      <path d="M 70 43 Q 77 40 85 44" stroke={C.pupil} strokeWidth="2.4" fill="none" strokeLinecap="round" />
      {/* Pupils slightly inward (warm attentive look) */}
      <circle cx="44" cy="56" r="6.5" fill={C.pupil} />
      <circle cx="76" cy="56" r="6.5" fill={C.pupil} />
      <circle cx="47" cy="53" r="2.2" fill={C.white} />
      <circle cx="79" cy="53" r="2.2" fill={C.white} />
      {/* Warm smile - wider than happy */}
      <path d="M 46 72 Q 60 84 74 72" stroke={C.pupil} strokeWidth="2.8" fill="none" strokeLinecap="round" />
    </>
  )
}

function FaceCelebrating() {
  return (
    <>
      {/* Brows way up */}
      <path d="M 33 39 Q 43 32 51 38" stroke={C.pupil} strokeWidth="2.5" fill="none" strokeLinecap="round" />
      <path d="M 69 38 Q 77 32 87 39" stroke={C.pupil} strokeWidth="2.5" fill="none" strokeLinecap="round" />
      {/* Star/gold eyes */}
      <circle cx="43" cy="54" r="8" fill={C.gold} />
      <circle cx="77" cy="54" r="8" fill={C.gold} />
      {/* Cross glints to make star-like */}
      <line x1="43" y1="47" x2="43" y2="61" stroke={C.white} strokeWidth="2" strokeLinecap="round" />
      <line x1="36" y1="54" x2="50" y2="54" stroke={C.white} strokeWidth="2" strokeLinecap="round" />
      <line x1="77" y1="47" x2="77" y2="61" stroke={C.white} strokeWidth="2" strokeLinecap="round" />
      <line x1="70" y1="54" x2="84" y2="54" stroke={C.white} strokeWidth="2" strokeLinecap="round" />
      {/* Huge grin */}
      <path d="M 44 69 Q 60 89 76 69 Z" fill={C.pupil} />
      <path d="M 44 69 Q 60 77 76 69" stroke={C.white} strokeWidth="2" fill="none" />
      <ellipse cx="60" cy="82" rx="9" ry="6" fill={C.tongue} />
    </>
  )
}

function FaceConcerned() {
  return (
    <>
      {/* Worried brows — inner edges up */}
      <path d="M 36 45 Q 43 40 50 44" stroke={C.pupil} strokeWidth="2.4" fill="none" strokeLinecap="round" />
      <path d="M 70 44 Q 77 40 84 45" stroke={C.pupil} strokeWidth="2.4" fill="none" strokeLinecap="round" />
      {/* Pupils looking slightly down */}
      <circle cx="43" cy="57" r="6" fill={C.pupil} />
      <circle cx="77" cy="57" r="6" fill={C.pupil} />
      <circle cx="46" cy="54" r="2" fill={C.white} />
      <circle cx="80" cy="54" r="2" fill={C.white} />
      {/* Gentle frown */}
      <path d="M 49 75 Q 60 70 71 75" stroke={C.pupil} strokeWidth="2.5" fill="none" strokeLinecap="round" />
    </>
  )
}

function FaceNeutral() {
  return (
    <>
      {/* Flat brows */}
      <path d="M 36 44 L 50 43" stroke={C.pupil} strokeWidth="2.4" fill="none" strokeLinecap="round" />
      <path d="M 70 43 L 84 44" stroke={C.pupil} strokeWidth="2.4" fill="none" strokeLinecap="round" />
      <circle cx="43" cy="56" r="6" fill={C.pupil} />
      <circle cx="77" cy="56" r="6" fill={C.pupil} />
      <circle cx="46" cy="53" r="2" fill={C.white} />
      <circle cx="80" cy="53" r="2" fill={C.white} />
      {/* Flat-ish mouth */}
      <path d="M 49 73 Q 60 77 71 73" stroke={C.pupil} strokeWidth="2.4" fill="none" strokeLinecap="round" />
    </>
  )
}

const faceMap: Record<MascotMood, React.ReactNode> = {
  happy: <FaceHappy />,
  excited: <FaceExcited />,
  sleepy: <FaceSleepy />,
  curious: <FaceCurious />,
  encouraging: <FaceEncouraging />,
  celebrating: <FaceCelebrating />,
  concerned: <FaceConcerned />,
  neutral: <FaceNeutral />,
}

// ─── Component ────────────────────────────────────────────────────────────────

export function MascotCharacter({
  mood = 'happy',
  size = 120,
  className,
  bobbing = false,
  wiggle = false,
}: MascotCharacterProps) {
  return (
    <motion.div
      className={className}
      style={{ width: size, height: size, flexShrink: 0 }}
      animate={
        bobbing
          ? { y: [0, -5, 0] }
          : wiggle
          ? { rotate: [0, -8, 8, -6, 6, 0] }
          : undefined
      }
      transition={
        bobbing
          ? { duration: 2.8, repeat: Infinity, ease: 'easeInOut' }
          : wiggle
          ? { duration: 0.6, ease: 'easeInOut' }
          : undefined
      }
    >
      <svg
        viewBox="0 0 120 120"
        width={size}
        height={size}
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        {/* Ear nubs — behind body */}
        <ellipse cx="44" cy="30" rx="10" ry="9" fill={C.bodyShade} />
        <ellipse cx="76" cy="30" rx="10" ry="9" fill={C.bodyShade} />

        {/* Main body */}
        <ellipse cx="60" cy="68" rx="44" ry="41" fill={C.body} />

        {/* Subtle belly highlight */}
        <ellipse cx="60" cy="76" rx="26" ry="22" fill={C.white} opacity="0.10" />

        {/* Eye whites */}
        <circle cx="43" cy="55" r="12" fill={C.white} />
        <circle cx="77" cy="55" r="12" fill={C.white} />

        {/* Cheeks */}
        <ellipse cx="29" cy="64" rx="9" ry="7" fill={C.blush} opacity="0.28" />
        <ellipse cx="91" cy="64" rx="9" ry="7" fill={C.blush} opacity="0.28" />

        {/* Per-mood face */}
        {faceMap[mood]}
      </svg>
    </motion.div>
  )
}
