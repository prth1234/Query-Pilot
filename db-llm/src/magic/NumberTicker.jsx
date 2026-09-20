import { useEffect, useRef } from 'react'
import { useInView, useMotionValue, useSpring } from 'motion/react'

/**
 * Magic UI–style Number Ticker: spring-animated counting number.
 * Mirrors Magic UI props: value, startValue, direction, delay, duration,
 * decimalPlaces. Glides smoothly whenever `value` changes, which makes it
 * ideal as a progress readout (e.g. connection test percentage).
 */
function NumberTicker({
    value = 100,
    startValue = 0,
    direction = 'up',
    delay = 0,
    duration = 2,
    decimalPlaces = 0,
    className = '',
}) {
    const ref = useRef(null)
    const motionValue = useMotionValue(direction === 'down' ? value : startValue)
    const springValue = useSpring(motionValue, { duration: duration * 1000, bounce: 0 })
    const isInView = useInView(ref, { once: true, margin: '0px' })

    useEffect(() => {
        if (isInView) {
            const t = setTimeout(() => {
                motionValue.set(direction === 'down' ? startValue : value)
            }, delay * 1000)
            return () => clearTimeout(t)
        }
    }, [motionValue, isInView, delay, value, direction, startValue])

    useEffect(() => {
        const unsub = springValue.on('change', (latest) => {
            if (ref.current) {
                ref.current.textContent = Intl.NumberFormat('en-US', {
                    minimumFractionDigits: decimalPlaces,
                    maximumFractionDigits: decimalPlaces,
                }).format(Number(latest.toFixed(decimalPlaces)))
            }
        })
        return () => unsub()
    }, [springValue, decimalPlaces])

    return (
        <span ref={ref} className={className}>
            {startValue}
        </span>
    )
}

export default NumberTicker
