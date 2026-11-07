import { useCallback, useEffect, useId, useLayoutEffect, useRef, useState } from 'react'
import type { CSSProperties, KeyboardEvent, ReactNode } from 'react'
import styles from './AnimatedList.module.css'

export type AnimatedListAnimation = 'pop' | 'slide' | 'fade' | 'none'

export interface AnimatedListRenderState {
  selected: boolean
}

export interface AnimatedListProps<T> {
  items: T[]
  onItemSelect?: (item: T, index: number) => void
  onItemActivate?: (item: T, index: number) => void
  renderItem: (item: T, index: number, state: AnimatedListRenderState) => ReactNode
  getItemLabel?: (item: T, index: number) => string
  initialSelectedIndex?: number
  selectOnHover?: boolean
  enableArrowNavigation?: boolean
  loop?: boolean
  animation?: AnimatedListAnimation
  animateOnce?: boolean
  stagger?: number
  showGradients?: boolean
  fadeSize?: number | string
  displayScrollbar?: boolean
  frame?: boolean
  accentColor?: string
  radius?: number | string
  gap?: number | string
  width?: CSSProperties['width']
  maxHeight?: CSSProperties['maxHeight']
  className?: string
  itemClassName?: string
  style?: CSSProperties
  ariaLabel?: string
  id?: string
  listRole?: 'listbox' | 'list'
  itemRole?: 'option' | 'listitem'
  activateOnClick?: boolean
  selectOnClick?: boolean
}

const cssLength = (value: number | string | undefined) => typeof value === 'number' ? `${value}px` : value

export default function AnimatedList<T>({
  items,
  onItemSelect,
  onItemActivate,
  renderItem,
  getItemLabel,
  initialSelectedIndex = -1,
  selectOnHover = true,
  enableArrowNavigation = true,
  loop = false,
  animation = 'pop',
  animateOnce = true,
  stagger = 0.05,
  showGradients = false,
  fadeSize = 24,
  displayScrollbar = true,
  frame = false,
  accentColor = 'var(--purple, currentColor)',
  radius = 9,
  gap = 0,
  width = '100%',
  maxHeight,
  className = '',
  itemClassName = '',
  style,
  ariaLabel = 'Animated list',
  id,
  listRole = 'listbox',
  itemRole = 'option',
  activateOnClick = false,
  selectOnClick = true,
}: AnimatedListProps<T>) {
  const generatedId = useId().replace(/:/g, '')
  const listRef = useRef<HTMLDivElement>(null)
  const itemRefs = useRef<Array<HTMLDivElement | null>>([])
  const [selectedIndex, setSelectedIndex] = useState(() => initialSelectedIndex >= 0 && initialSelectedIndex < items.length ? initialSelectedIndex : -1)
  const [itemStates, setItemStates] = useState<Record<number, 'above' | 'below' | 'in'>>({})
  const [itemDelays, setItemDelays] = useState<Record<number, number>>({})
  const [indicator, setIndicator] = useState<{ top: number; height: number } | null>(null)

  useEffect(() => {
    setSelectedIndex(current => current >= items.length ? items.length - 1 : current)
    itemRefs.current.length = items.length
  }, [items.length])

  const select = useCallback((index: number) => {
    if (index < 0 || index >= items.length) return
    setSelectedIndex(index)
    onItemSelect?.(items[index], index)
  }, [items, onItemSelect])

  const activate = useCallback((index: number) => {
    if (index < 0 || index >= items.length) return
    onItemActivate?.(items[index], index)
  }, [items, onItemActivate])

  const measureIndicator = useCallback(() => {
    const list = listRef.current
    const selectedItem = selectedIndex >= 0 ? itemRefs.current[selectedIndex] : null
    if (!list || !selectedItem) {
      setIndicator(null)
      return
    }
    setIndicator({ top: selectedItem.offsetTop, height: selectedItem.offsetHeight })
  }, [selectedIndex, items.length])

  useLayoutEffect(() => {
    measureIndicator()
    const list = listRef.current
    const selectedItem = selectedIndex >= 0 ? itemRefs.current[selectedIndex] : null
    if (!list || typeof ResizeObserver === 'undefined') return
    const observer = new ResizeObserver(measureIndicator)
    observer.observe(list)
    if (selectedItem) observer.observe(selectedItem)
    return () => observer.disconnect()
  }, [measureIndicator, selectedIndex, items.length])

  useEffect(() => {
    if (animation === 'none' || items.length === 0) {
      setItemStates(Object.fromEntries(items.map((_, index) => [index, 'in'])))
      setItemDelays({})
      return
    }
    if (typeof IntersectionObserver === 'undefined') {
      setItemStates(Object.fromEntries(items.map((_, index) => [index, 'in'])))
      setItemDelays({})
      return
    }
    const list = listRef.current
    if (!list) return

    setItemStates(Object.fromEntries(items.map((_, index) => [index, 'below'])))
    setItemDelays({})
    let itemObserver: IntersectionObserver | null = null
    let entered = false
    let entrancePending = true
    const reveal = (entries: IntersectionObserverEntry[]) => {
      const visible = entries.filter(entry => entry.isIntersecting).sort((a, b) => Number((a.target as HTMLElement).dataset.index) - Number((b.target as HTMLElement).dataset.index))
      const hidden = entries.filter(entry => !entry.isIntersecting)
      if (hidden.length && !animateOnce) {
        setItemStates(current => {
          const next = { ...current }
          hidden.forEach(entry => {
            const index = Number((entry.target as HTMLElement).dataset.index)
            const rootTop = entry.rootBounds?.top ?? list.getBoundingClientRect().top
            const itemMiddle = entry.boundingClientRect.top + entry.boundingClientRect.height / 2
            next[index] = itemMiddle < rootTop + list.clientHeight / 2 ? 'above' : 'below'
          })
          return next
        })
        setItemDelays(current => {
          const next = { ...current }
          hidden.forEach(entry => { next[Number((entry.target as HTMLElement).dataset.index)] = 0 })
          return next
        })
      }
      if (!visible.length) return
      const delays: Record<number, number> = {}
      visible.forEach((entry, order) => {
        const index = Number((entry.target as HTMLElement).dataset.index)
        delays[index] = entrancePending ? Math.max(0, stagger) * order : 0
        if (animateOnce) itemObserver?.unobserve(entry.target)
      })
      entrancePending = false
      setItemStates(current => {
        const next = { ...current }
        visible.forEach(entry => { next[Number((entry.target as HTMLElement).dataset.index)] = 'in' })
        return next
      })
      setItemDelays(current => ({ ...current, ...delays }))
    }
    const enterList = () => {
      if (entered) return
      entered = true
      itemObserver = new IntersectionObserver(reveal, { root: list, threshold: 0.08 })
      itemRefs.current.forEach(item => { if (item) itemObserver?.observe(item) })
    }
    const gate = new IntersectionObserver(entries => {
      if (entries.some(entry => entry.isIntersecting)) {
        gate.disconnect()
        enterList()
      }
    }, { rootMargin: '0px 0px -10% 0px' })
    gate.observe(list)
    return () => {
      gate.disconnect()
      itemObserver?.disconnect()
    }
  }, [animation, animateOnce, items, stagger])

  useEffect(() => {
    const list = listRef.current
    if (!list) return
    const updateFades = () => {
      const overflow = list.scrollHeight > list.clientHeight
      const top = showGradients && overflow ? Math.min(Number.parseFloat(cssLength(fadeSize) || '0'), list.scrollTop) : 0
      const bottom = showGradients && overflow
        ? Math.min(Number.parseFloat(cssLength(fadeSize) || '0'), list.scrollHeight - list.clientHeight - list.scrollTop)
        : 0
      list.style.setProperty('--animated-list-fade-top', `${Math.max(0, top)}px`)
      list.style.setProperty('--animated-list-fade-bottom', `${Math.max(0, bottom)}px`)
    }
    const resizeObserver = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(updateFades)
    resizeObserver?.observe(list)
    list.addEventListener('scroll', updateFades, { passive: true })
    updateFades()
    return () => {
      resizeObserver?.disconnect()
      list.removeEventListener('scroll', updateFades)
    }
  }, [showGradients, fadeSize, items.length])

  const moveSelection = (nextIndex: number) => {
    if (!items.length) return
    let index = nextIndex
    if (loop) index = (nextIndex + items.length) % items.length
    else index = Math.max(0, Math.min(items.length - 1, nextIndex))
    select(index)
    const reduceMotion = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
    itemRefs.current[index]?.scrollIntoView({ block: 'nearest', behavior: reduceMotion ? 'auto' : 'smooth' })
  }

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.defaultPrevented || !enableArrowNavigation || items.length === 0) return
    if (event.key === 'ArrowDown') {
      event.preventDefault()
      moveSelection(selectedIndex < 0 ? 0 : selectedIndex + 1)
    } else if (event.key === 'ArrowUp') {
      event.preventDefault()
      moveSelection(selectedIndex < 0 ? items.length - 1 : selectedIndex - 1)
    } else if (event.key === 'Home') {
      event.preventDefault()
      moveSelection(0)
    } else if (event.key === 'End') {
      event.preventDefault()
      moveSelection(items.length - 1)
    } else if ((event.key === 'Enter' || event.key === ' ') && selectedIndex >= 0) {
      event.preventDefault()
      if (onItemActivate) activate(selectedIndex)
      else onItemSelect?.(items[selectedIndex], selectedIndex)
    }
  }

  const listStyle = {
    ...style,
    '--animated-list-accent': accentColor,
    '--animated-list-radius': cssLength(radius),
    '--animated-list-gap': cssLength(gap),
    '--animated-list-width': cssLength(width),
    '--animated-list-max-height': cssLength(maxHeight) || 'none',
    '--animated-list-fade-size': cssLength(fadeSize),
  } as CSSProperties

  return (
    <div
      ref={listRef}
      id={id || `${generatedId}-list`}
      role={listRole}
      aria-label={ariaLabel}
      aria-orientation={listRole === 'listbox' ? 'vertical' : undefined}
      aria-activedescendant={listRole === 'listbox' && selectedIndex >= 0 ? `${generatedId}-option-${selectedIndex}` : undefined}
      tabIndex={listRole === 'listbox' ? 0 : -1}
      onKeyDown={handleKeyDown}
      data-animation={animation}
      data-fades={showGradients || undefined}
      data-scrollbar={displayScrollbar ? 'visible' : 'hidden'}
      className={`${styles.list} ${frame ? styles.frame : ''} ${className}`}
      style={listStyle}
    >
      {indicator && <span aria-hidden="true" data-state={itemStates[selectedIndex] || 'below'} className={styles.selectionIndicator} style={{ height: indicator.height, transform: `translateY(${indicator.top}px)` }} />}
      {items.map((item, index) => (
        <div
          key={(item as { id?: string; key?: string })?.id || (item as { key?: string })?.key || index}
          ref={element => { itemRefs.current[index] = element }}
          id={`${generatedId}-option-${index}`}
          role={itemRole}
          aria-selected={listRole === 'listbox' ? selectedIndex === index : undefined}
          aria-label={getItemLabel?.(item, index)}
          data-index={index}
          data-state={itemStates[index] || (animation === 'none' ? 'in' : 'below')}
          className={`${styles.item} ${itemClassName}`}
          style={{ '--animated-list-delay': `${itemDelays[index] || 0}s` } as CSSProperties}
          onClick={() => {
            if (selectOnClick) select(index)
            if (listRole === 'listbox') listRef.current?.focus({ preventScroll: true })
            if (activateOnClick) activate(index)
          }}
          onPointerEnter={() => { if (selectOnHover) select(index) }}
          onDoubleClick={event => {
            if ((event.target as HTMLElement).closest('button, a, input, select, textarea')) return
            activate(index)
          }}
        >
          {renderItem(item, index, { selected: selectedIndex === index })}
        </div>
      ))}
    </div>
  )
}
