import { useState, useEffect, useRef } from 'react'

const LINES: { text: string; color: string; speed: number; pauseAfter: number }[] = [
    { text: '> init exoplanet-archive connection...', color: '#38bdf8',  speed: 35, pauseAfter: 420 },
    { text: '> ERROR: host unreachable — connection timed out', color: '#f87171', speed: 44, pauseAfter: 860 },
    { text: '> fallback: solar-system cache loaded [8 objects]', color: '#4ade80', speed: 38, pauseAfter: 360 },
    { text: '> navigating to Sol...',                           color: '#94a3b8', speed: 65, pauseAfter: 0   },
]

const FONT = "'Share Tech Mono', 'Courier New', monospace"

export const ArchiveTerminal = () => {
    // revealed[i] = chars shown so far on line i
    const [revealed, setRevealed] = useState<string[]>([''])
    const [done, setDone]         = useState(false)
    const [cursorOn, setCursorOn] = useState(true)

    // cursor blink — independent of typing state
    useEffect(() => {
        const id = setInterval(() => setCursorOn(v => !v), 530)
        return () => clearInterval(id)
    }, [])

    useEffect(() => {
        const lineIdx = { current: 0 }
        const charIdx = { current: 0 }
        let timerId: ReturnType<typeof setTimeout>

        const typeNext = () => {
            const li   = lineIdx.current
            const line = LINES[li]
            const ci   = charIdx.current

            if (ci < line.text.length) {
                charIdx.current = ci + 1
                setRevealed(prev => {
                    const next = [...prev]
                    next[li]   = line.text.slice(0, charIdx.current)
                    return next
                })
                // natural typing variation: ±20 ms around the line's base speed
                const jitter = (Math.random() - 0.5) * 40
                timerId = setTimeout(typeNext, Math.max(12, line.speed + jitter))
            } else if (li < LINES.length - 1) {
                // end of line — pause, then start the next one
                timerId = setTimeout(() => {
                    lineIdx.current++
                    charIdx.current = 0
                    setRevealed(prev => [...prev, ''])
                    typeNext()
                }, line.pauseAfter)
            } else {
                setDone(true)
            }
        }

        timerId = setTimeout(typeNext, 420)
        return () => clearTimeout(timerId)
    }, [])

    const activeLine = revealed.length - 1

    return (
        <div style={{
            position:        'fixed',
            top:             '72px',
            left:            '50%',
            transform:       'translateX(-50%)',
            zIndex:          1000,
            background:      'rgba(5, 9, 26, 0.92)',
            backdropFilter:  'blur(14px)',
            border:          '1px solid rgba(56, 189, 248, 0.32)',
            borderRadius:    '10px',
            maxWidth:        '520px',
            width:           'calc(100% - 48px)',
            boxShadow:       '0 0 32px rgba(56,189,248,0.09), 0 6px 36px rgba(0,0,0,0.65)',
            fontFamily:      FONT,
            pointerEvents:   'none',
            overflow:        'hidden',
        }}>
            {/* terminal chrome */}
            <div style={{
                display:         'flex',
                alignItems:      'center',
                gap:             '6px',
                padding:         '10px 14px',
                background:      'rgba(13, 22, 40, 0.7)',
                borderBottom:    '1px solid rgba(56,189,248,0.12)',
            }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#f87171' }} />
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#fbbf24' }} />
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#4ade80' }} />
                <span style={{
                    color:          '#475569',
                    fontSize:       '11px',
                    marginLeft:     '8px',
                    letterSpacing:  '0.5px',
                }}>
                    dome@nasa-explorer ~ /archive
                </span>
            </div>

            {/* typed output */}
            <div style={{ padding: '14px 16px', fontSize: '13px', lineHeight: '1.85', minHeight: '96px' }}>
                {revealed.map((text, i) => (
                    <div key={i} style={{ color: LINES[i]?.color ?? '#e2e8f0' }}>
                        {text}
                        {i === activeLine && !done && (
                            <span style={{ opacity: cursorOn ? 1 : 0 }}>█</span>
                        )}
                    </div>
                ))}
                {done && (
                    <span style={{ color: '#38bdf8', opacity: cursorOn ? 1 : 0 }}>█</span>
                )}
            </div>
        </div>
    )
}
