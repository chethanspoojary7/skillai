import { useCallback, useEffect, useRef, useState } from 'react'
import type { CSSProperties, PointerEvent as ReactPointerEvent, ReactNode } from 'react'
import { animate, motion, useMotionValue, useReducedMotion } from 'framer-motion'
import { X } from 'lucide-react'
import styles from './SwipeToast.module.css'

export type SwipeToastCloseReason = 'timeout' | 'swipe' | 'action' | 'close' | 'escape' | 'programmatic'
type Phase = 'open' | 'closing' | 'gone'
type FusePosition = 'bottom' | 'top' | 'none'

export interface SwipeToastProps {
  title?: ReactNode
  description?: ReactNode
  icon?: ReactNode
  actionLabel?: ReactNode
  onAction?: () => void
  open?: boolean
  onClose?: (reason: SwipeToastCloseReason) => void
  background?: string
  color?: string
  fuseColor?: string
  width?: number
  radius?: number
  slideMs?: number
  settleBounce?: number
  swipeDistance?: number
  duration?: number
  fuse?: FusePosition
  pauseOnHover?: boolean
  closeButton?: boolean
  inline?: boolean
  dismissible?: boolean
  className?: string
}

const EASE_OUT: [number, number, number, number] = [0.23, 1, 0.32, 1]
const FLICK = 0.11
const DEAD_ZONE = 3
const RESIST_PX = 24
const COLLAPSE_MS = 200
const EXIT = 0.7
const BURN = [{ transform: 'scaleX(1)' }, { transform: 'scaleX(0)' }]

type DragState = {
  id: number
  startY: number
  grab: number | null
  moved: boolean
  history: Array<[number, number]>
}

const rubberband = (over: number, dim: number, c = 0.55) => (over * dim * c) / (dim + c * Math.abs(over))
const velocityOf = (history: Array<[number, number]>) => {
  if (history.length < 2) return 0
  const [firstTime, firstY] = history[0]
  const [lastTime, lastY] = history[history.length - 1]
  if (performance.now() - lastTime > 100) return 0
  return (lastY - firstY) / Math.max(1, lastTime - firstTime)
}

export default function SwipeToast({
  title = 'File archived',
  description = '',
  icon,
  actionLabel = '',
  onAction,
  open = true,
  onClose,
  background = '#27272a',
  color = '#f5f5f5',
  fuseColor = '#f5a524',
  width = 356,
  radius = 12,
  slideMs = 400,
  settleBounce = 0.2,
  swipeDistance = 40,
  duration = 4000,
  fuse = 'bottom',
  pauseOnHover = true,
  closeButton = false,
  inline = false,
  dismissible = true,
  className = '',
}: SwipeToastProps) {
  const reduceMotion = useReducedMotion()
  const [phase, setPhase] = useState<Phase>('open')
  const [instant, setInstant] = useState(false)
  const [mounted, setMounted] = useState(false)
  const cardRef = useRef<HTMLDivElement>(null)
  const fuseRef = useRef<HTMLElement>(null)
  const animationRef = useRef<Animation | null>(null)
  const dragRef = useRef<DragState | null>(null)
  const flagsRef = useRef({ hover: false, interacting: false, focus: false, hidden: false })
  const lastInputRef = useRef<'pointer' | 'keyboard'>('pointer')
  const pendingCloseRef = useRef<SwipeToastCloseReason | null>(null)
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const suppressClickUntilRef = useRef(0)
  const leavingRef = useRef(false)
  const phaseRef = useRef<Phase>(phase)
  const latestRef = useRef({ onClose, onAction, slideMs, inline })
  phaseRef.current = phase
  latestRef.current = { onClose, onAction, slideMs, inline }

  const y = useMotionValue(0)
  const opacity = useMotionValue(1)

  const syncFuse = useCallback(() => {
    const animation = animationRef.current
    if (!animation) return
    const flags = flagsRef.current
    if (flags.hover || flags.interacting || flags.focus || flags.hidden) animation.pause()
    else if (animation.playState === 'paused') animation.play()
  }, [])

  const finish = useCallback((reason: SwipeToastCloseReason) => {
    setPhase('gone')
    phaseRef.current = 'gone'
    leavingRef.current = false
    if (latestRef.current.inline) {
      closeTimerRef.current = setTimeout(() => latestRef.current.onClose?.(reason), COLLAPSE_MS)
    } else {
      latestRef.current.onClose?.(reason)
    }
  }, [])

  const close = useCallback((reason: SwipeToastCloseReason) => {
    if (phaseRef.current !== 'open' || leavingRef.current) return
    if (dragRef.current) {
      pendingCloseRef.current = reason
      return
    }
    animationRef.current?.pause()
    phaseRef.current = 'closing'
    setInstant(reason === 'escape' || ((reason === 'action' || reason === 'close') && lastInputRef.current === 'keyboard'))
    setPhase('closing')
    if (closeTimerRef.current) clearTimeout(closeTimerRef.current)
    const immediate = reason === 'escape' || ((reason === 'action' || reason === 'close') && lastInputRef.current === 'keyboard')
    closeTimerRef.current = setTimeout(() => finish(reason), immediate ? 0 : latestRef.current.slideMs * EXIT + 60)
  }, [finish])

  const rescue = useCallback(() => {
    if (closeTimerRef.current) clearTimeout(closeTimerRef.current)
    setInstant(false)
    y.set(0)
    opacity.set(1)
    leavingRef.current = false
    phaseRef.current = 'open'
    setPhase('open')
  }, [opacity, y])

  useEffect(() => {
    if (!open) close('programmatic')
    else if (phaseRef.current !== 'open') rescue()
  }, [open, close, rescue])

  useEffect(() => {
    const frame = requestAnimationFrame(() => setMounted(true))
    return () => cancelAnimationFrame(frame)
  }, [])

  useEffect(() => {
    if (phase !== 'open' || duration <= 0 || !fuseRef.current) return undefined
    animationRef.current?.cancel()
    const animation = fuseRef.current.animate(BURN, { duration, easing: 'linear', fill: 'forwards' })
    animation.onfinish = () => close('timeout')
    animationRef.current = animation
    syncFuse()
    return () => {
      animation.onfinish = null
      animation.pause()
    }
  }, [phase, duration, close, syncFuse])

  useEffect(() => {
    if (pauseOnHover) return
    flagsRef.current.hover = false
    syncFuse()
  }, [pauseOnHover, syncFuse])

  useEffect(() => {
    const onVisibilityChange = () => {
      flagsRef.current.hidden = document.hidden
      syncFuse()
    }
    document.addEventListener('visibilitychange', onVisibilityChange)
    return () => {
      document.removeEventListener('visibilitychange', onVisibilityChange)
      if (closeTimerRef.current) clearTimeout(closeTimerRef.current)
      animationRef.current?.cancel()
    }
  }, [syncFuse])

  const swipeOut = (distance: number, velocity: number) => {
    animationRef.current?.pause()
    leavingRef.current = true
    pendingCloseRef.current = null
    if (!reduceMotion && cardRef.current) {
      animate(y, distance + cardRef.current.offsetHeight, { type: 'spring', duration: 0.3, bounce: 0, velocity: velocity * 1000 })
    }
    animate(opacity, 0, { duration: 0.2, ease: EASE_OUT }).then(() => finish('swipe'))
  }

  const onPointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    lastInputRef.current = 'pointer'
    if (event.button !== 0 || !dismissible || dragRef.current || leavingRef.current || (event.target as HTMLElement).closest('button')) return
    if (phaseRef.current === 'closing') rescue()
    try { event.currentTarget.setPointerCapture(event.pointerId) } catch {}
    y.stop()
    dragRef.current = {
      id: event.pointerId,
      startY: event.clientY,
      grab: null,
      moved: false,
      history: [[performance.now(), y.get()]],
    }
    flagsRef.current.interacting = true
    syncFuse()
  }

  const onPointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current
    if (!drag || drag.id !== event.pointerId) return
    if (drag.grab === null) {
      if (Math.abs(event.clientY - drag.startY) < DEAD_ZONE) return
      drag.grab = event.clientY - y.get()
      if (cardRef.current) cardRef.current.dataset.swiping = ''
    }
    const raw = event.clientY - drag.grab
    y.set(raw >= 0 ? raw : rubberband(raw, RESIST_PX))
    drag.moved = true
    drag.history.push([performance.now(), y.get()])
    if (drag.history.length > 4) drag.history.shift()
  }

  const onPointerUp = (event: ReactPointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current
    if (!drag || drag.id !== event.pointerId) return
    dragRef.current = null
    if (cardRef.current) delete cardRef.current.dataset.swiping
    try { event.currentTarget.releasePointerCapture(event.pointerId) } catch {}
    flagsRef.current.interacting = false
    if (drag.moved) suppressClickUntilRef.current = performance.now() + 300
    const distance = y.get()
    const velocity = velocityOf(drag.history)
    if (distance > 0 && (velocity > FLICK || (distance >= swipeDistance && velocity >= 0))) {
      swipeOut(distance, velocity)
      return
    }
    if (drag.moved) {
      animate(y, 0, reduceMotion
        ? { duration: 0.2, ease: EASE_OUT }
        : { type: 'spring', duration: 0.5, bounce: settleBounce, velocity: velocity * 1000 })
    }
    const pending = pendingCloseRef.current
    pendingCloseRef.current = null
    if (pending) close(pending)
    else syncFuse()
  }

  const stylesForToast = {
    '--swipe-toast-bg': background,
    '--swipe-toast-color': color,
    '--swipe-toast-fuse': fuseColor,
    '--swipe-toast-width': `${width}px`,
    '--swipe-toast-radius': `${radius}px`,
    '--swipe-toast-slide': `${slideMs}ms`,
  } as CSSProperties

  return (
    <div
      className={`${styles.root} ${className}`.trim()}
      data-phase={phase}
      data-inline={inline}
      data-fuse={duration > 0 ? fuse : 'none'}
      data-dismissible={dismissible}
      data-instant={instant || undefined}
      data-mounted={mounted}
      style={stylesForToast}
    >
      <div className={styles.gate}>
        <div className={styles.lift}>
          <motion.div
            ref={cardRef}
            className={styles.card}
            role="status"
            aria-live="polite"
            aria-atomic="true"
            tabIndex={0}
            style={{ y, opacity }}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerCancel={onPointerUp}
            onClick={event => {
              if (performance.now() < suppressClickUntilRef.current) { suppressClickUntilRef.current = 0; return }
              if (!(event.target as HTMLElement).closest('button')) close('close')
            }}
            onPointerEnter={event => {
              if (pauseOnHover && event.pointerType === 'mouse') {
                flagsRef.current.hover = true
                syncFuse()
              }
            }}
            onPointerLeave={event => {
              if (event.pointerType === 'mouse') {
                flagsRef.current.hover = false
                syncFuse()
              }
            }}
            onFocus={() => { flagsRef.current.focus = true; syncFuse() }}
            onBlur={event => {
              if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
                flagsRef.current.focus = false
                syncFuse()
              }
            }}
            onKeyDown={event => {
              if (event.key === 'Enter' || event.key === ' ') lastInputRef.current = 'keyboard'
              if (event.key === 'Escape' && dismissible) {
                event.stopPropagation()
                close('escape')
              }
            }}
          >
            {icon && <span className={styles.icon} aria-hidden="true">{icon}</span>}
            <span className={styles.body}>
              <span className={styles.title}>{title}</span>
              {description && <span className={styles.description}>{description}</span>}
            </span>
            {actionLabel && <button type="button" className={styles.action} onClick={() => { latestRef.current.onAction?.(); close('action') }}>{actionLabel}</button>}
            {closeButton && <button type="button" className={styles.close} aria-label="Close" onClick={() => close('close')}><X size={13} /></button>}
            <i ref={fuseRef} className={styles.fuse} aria-hidden="true" />
          </motion.div>
        </div>
      </div>
    </div>
  )
}
