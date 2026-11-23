import * as React from "react"
import { addPropertyControls, ControlType } from "framer"

// Church Wear church map. Reads the live feed (updated nightly from GHL) and falls back to a
// built-in copy. Data: https://github.com/jzdogazzz/churchwear-map

type Pin = [string, string, string, string, number, number] // name, city, state, website, lat, lon
interface Feed { churches: number; states: number; pins: Pin[] }

const FEED = "https://raw.githubusercontent.com/jzdogazzz/churchwear-map/main/churches.json"
const ZIPS = "https://raw.githubusercontent.com/jzdogazzz/churchwear-map/main/zips.json"
const FALLBACK: Feed = __FALLBACK__
const STATES: Record<string, string> = __STATES__
const NAMES: Record<string, string> = {AL:"Alabama",AK:"Alaska",AZ:"Arizona",AR:"Arkansas",CA:"California",CO:"Colorado",CT:"Connecticut",DE:"Delaware",DC:"Washington, DC",FL:"Florida",GA:"Georgia",HI:"Hawaii",ID:"Idaho",IL:"Illinois",IN:"Indiana",IA:"Iowa",KS:"Kansas",KY:"Kentucky",LA:"Louisiana",ME:"Maine",MD:"Maryland",MA:"Massachusetts",MI:"Michigan",MN:"Minnesota",MS:"Mississippi",MO:"Missouri",MT:"Montana",NE:"Nebraska",NV:"Nevada",NH:"New Hampshire",NJ:"New Jersey",NM:"New Mexico",NY:"New York",NC:"North Carolina",ND:"North Dakota",OH:"Ohio",OK:"Oklahoma",OR:"Oregon",PA:"Pennsylvania",RI:"Rhode Island",SC:"South Carolina",SD:"South Dakota",TN:"Tennessee",TX:"Texas",UT:"Utah",VT:"Vermont",VA:"Virginia",WA:"Washington",WV:"West Virginia",WI:"Wisconsin",WY:"Wyoming"}

const W = 975, H = 610
const project = (() => {
    const R = Math.PI / 180
    const cea = (p0: number, p1: number) => {
        const s0 = Math.sin(p0 * R), n = (s0 + Math.sin(p1 * R)) / 2, c = 1 + s0 * (2 * n - s0), r0 = Math.sqrt(c) / n
        return (l: number, f: number) => { const r = Math.sqrt(c - 2 * n * Math.sin(f * R)) / n; return [r * Math.sin(l * R * n), r0 - r * Math.cos(l * R * n)] }
    }
    const mk = (rot: number, cx: number, cy: number, p0: number, p1: number, k: number, tx: number, ty: number) => {
        const f = cea(p0, p1), c = f(cx, cy)
        return (lo: number, la: number) => { let l = lo + rot; l = (((l + 180) % 360) + 360) % 360 - 180; const p = f(l, la); return [tx + k * (p[0] - c[0]), ty - k * (p[1] - c[1])] }
    }
    const K = 1280, X = W / 2, Y = H / 2
    const L = mk(96, -0.6, 38.7, 29.5, 45.5, K, X, Y), A = mk(154, -2, 58.5, 55, 65, 0.35 * K, X - 0.307 * K, Y + 0.201 * K), Hi = mk(157, -3, 19.9, 8, 18, K, X - 0.205 * K, Y + 0.212 * K)
    return (lo: number, la: number, s: string) => (s === "AK" ? A(lo, la) : s === "HI" ? Hi(lo, la) : L(lo, la))
})()
const miles = (a: number, b: number, c: number, d: number) => {
    const R = Math.PI / 180, x = Math.sin(((c - a) * R) / 2) ** 2 + Math.cos(a * R) * Math.cos(c * R) * Math.sin(((d - b) * R) / 2) ** 2
    return 7917.5 * Math.asin(Math.sqrt(x))
}
const host = (w: string) => w.replace(/^https?:\/\/(www\.)?/, "").replace(/\/$/, "")

let feedCache: Feed | null = null
let zipCache: Promise<Record<string, [number, number]>> | null = null
const loadZips = () => (zipCache ??= fetch(ZIPS).then((r) => r.json()).catch(() => { zipCache = null; return {} }))

interface Props {
    variant: "Section" | "Full page"
    ink: string
    paper: string
    land: string
    landActive: string
    accent: string
    ctaLabel: string
    ctaLink: string
    bodyFont?: React.CSSProperties
    labelFont?: React.CSSProperties
    style?: React.CSSProperties
}

/**
 * @framerSupportedLayoutWidth fixed
 * @framerSupportedLayoutHeight auto
 */
export default function ChurchMap(props: Props) {
    const { variant, ink, paper, land, landActive, accent, ctaLabel, ctaLink, bodyFont, labelFont, style } = props
    const full = variant === "Full page"
    const [feed, setFeed] = React.useState<Feed>(feedCache || FALLBACK)
    const [width, setWidth] = React.useState(1000)
    const [zip, setZip] = React.useState("")
    const [msg, setMsg] = React.useState("")
    const [origin, setOrigin] = React.useState<null | { xy: number[]; la: number; lo: number; zip: string }>(null)
    const [stateSel, setStateSel] = React.useState<string | null>(null)
    const [active, setActive] = React.useState<number | null>(null)
    const [view, setView] = React.useState([0, 0, W, H])
    const [query, setQuery] = React.useState("")
    const [open, setOpen] = React.useState<Record<string, boolean>>({})
    const rootRef = React.useRef<HTMLDivElement>(null)
    const anim = React.useRef(0)

    React.useEffect(() => {
        let live = true
        if (!feedCache) fetch(FEED, { cache: "no-cache" }).then((r) => r.json()).then((f: Feed) => {
            if (f && Array.isArray(f.pins) && f.pins.length >= FALLBACK.pins.length * 0.8) { feedCache = f; if (live) setFeed(f) }
        }).catch(() => {})
        return () => { live = false }
    }, [])
    React.useEffect(() => {
        const el = rootRef.current
        if (!el || typeof ResizeObserver === "undefined") return
        const ro = new ResizeObserver((e) => { const w = Math.round(e[0].contentRect.width); if (w > 0) setWidth(w) })
        ro.observe(el)
        return () => ro.disconnect()
    }, [])
    React.useEffect(() => () => cancelAnimationFrame(anim.current), [])

    const pins = React.useMemo(() => feed.pins.map((p, i) => ({ i, n: p[0], c: p[1], s: p[2], w: p[3], la: p[4], lo: p[5], xy: project(p[5], p[4], p[2]) })), [feed])
    const perState = React.useMemo(() => { const m: Record<string, number> = {}; pins.forEach((p) => (m[p.s] = (m[p.s] || 0) + 1)); return m }, [pins])
    const nStates = Object.keys(perState).length
    const stacked = width < 760
    const zoom = W / view[2]

    const flyTo = (target: number[]) => {
        cancelAnimationFrame(anim.current)
        const from = view.slice(), t0 = performance.now(), dur = 650
        const step = (t: number) => {
            const u = Math.min(1, (t - t0) / dur), e = u < 0.5 ? 4 * u * u * u : 1 - Math.pow(-2 * u + 2, 3) / 2
            setView(from.map((v, k) => v + (target[k] - v) * e))
            if (u < 1) anim.current = requestAnimationFrame(step)
        }
        anim.current = requestAnimationFrame(step)
    }
    const fit = (pts: number[][], pad = 60) => {
        let x0 = Math.min(...pts.map((p) => p[0])) - pad, x1 = Math.max(...pts.map((p) => p[0])) + pad
        let y0 = Math.min(...pts.map((p) => p[1])) - pad, y1 = Math.max(...pts.map((p) => p[1])) + pad
        let w = Math.max(x1 - x0, 240), h = Math.max(y1 - y0, 150)
        if (w / h > W / H) h = (w * H) / W; else w = (h * W) / H
        const cx = (x0 + x1) / 2, cy = (y0 + y1) / 2
        return [cx - w / 2, cy - h / 2, w, h]
    }
    const reset = () => { setOrigin(null); setStateSel(null); setActive(null); setMsg(""); setZip(""); flyTo([0, 0, W, H]) }
    // manual zoom + drag-to-pan
    const clampView = (v: number[]) => {
        const w = Math.min(W, Math.max(W / 10, v[2])), h = (w * H) / W
        return [Math.min(W - w, Math.max(0, v[0])), Math.min(H - h, Math.max(0, v[1])), w, h]
    }
    const zoomBy = (f: number) => {
        const cx = view[0] + view[2] / 2, cy = view[1] + view[3] / 2, w = Math.min(W, Math.max(W / 10, view[2] / f)), h = (w * H) / W
        flyTo(clampView([cx - w / 2, cy - h / 2, w, h]))
    }
    const svgRef = React.useRef<SVGSVGElement>(null)
    const drag = React.useRef<null | { x: number; y: number; v: number[]; moved: boolean }>(null)
    const dragged = React.useRef(false)
    const zoomedIn = view[2] < W - 1
    const onDown = (e: React.PointerEvent) => {
        if (!zoomedIn) return
        cancelAnimationFrame(anim.current)
        drag.current = { x: e.clientX, y: e.clientY, v: view.slice(), moved: false }
        dragged.current = false
    }
    const onMove = (e: React.PointerEvent) => {
        const d = drag.current, el = svgRef.current
        if (!d || !el) return
        const dx = e.clientX - d.x, dy = e.clientY - d.y
        if (!d.moved && Math.hypot(dx, dy) < 5) return
        if (!d.moved) { d.moved = true; dragged.current = true; try { el.setPointerCapture(e.pointerId) } catch {} }
        const k = d.v[2] / el.getBoundingClientRect().width
        setView(clampView([d.v[0] - dx * k, d.v[1] - dy * k, d.v[2], d.v[3]]))
    }
    const onUp = () => { drag.current = null; setTimeout(() => (dragged.current = false), 0) }

    const near = React.useMemo(() => {
        if (!origin) return null
        const d = pins.map((p) => ({ p, d: miles(origin.la, origin.lo, p.la, p.lo) })).sort((a, b) => a.d - b.d)
        return { list: d.slice(0, 5), within: d.filter((x) => x.d <= 100).length }
    }, [origin, pins])

    const findZip = async (e?: React.FormEvent) => {
        e?.preventDefault()
        const z = zip.trim()
        if (!/^\d{5}$/.test(z)) { setMsg("Enter a 5-digit ZIP code."); return }
        setMsg("Finding churches near " + z + "…")
        const zips = await loadZips()
        const g = zips[z]
        if (!g) { setMsg("We couldn't find that ZIP. Try a nearby one."); return }
        const st = g[1] < -140 ? (g[0] < 30 ? "HI" : "AK") : ""
        const xy = project(g[1], g[0], st)
        setStateSel(null); setActive(null); setMsg("")
        setOrigin({ xy, la: g[0], lo: g[1], zip: z })
        const d = pins.map((p) => ({ p, d: miles(g[0], g[1], p.la, p.lo) })).sort((a, b) => a.d - b.d).slice(0, 3)
        flyTo(fit([xy, ...d.map((x) => x.p.xy)], 50))
    }
    const pickState = (s: string) => {
        if (!perState[s] || dragged.current) return
        setOrigin(null); setActive(null); setMsg(""); setStateSel(s)
        flyTo(fit(pins.filter((p) => p.s === s).map((p) => p.xy), 70))
    }

    const mono: React.CSSProperties = { fontFamily: (labelFont && labelFont.fontFamily) || '"Spline Sans Mono", ui-monospace, monospace', fontWeight: 400, fontSize: 12, letterSpacing: "0.08em", textTransform: "uppercase" }
    const serif: React.CSSProperties = { fontFamily: (bodyFont && bodyFont.fontFamily) || '"CHURCH WEAR Regular", "CHURCH WEAR", sans-serif', fontWeight: 400, letterSpacing: "-0.02em" }
    const mapPx = stacked ? width : Math.max(200, width - 380)
    const r = Math.max(4.6 / Math.sqrt(zoom), (3.4 * view[2]) / mapPx)
    const act = active !== null ? pins[active] : null
    const listForState = stateSel ? pins.filter((p) => p.s === stateSel).sort((a, b) => a.c.localeCompare(b.c) || a.n.localeCompare(b.n)) : []

    const rowStyle: React.CSSProperties = { display: "flex", justifyContent: "space-between", gap: 12, padding: "10px 0", borderTop: `1px solid ${land}`, cursor: "pointer" }
    const Row = ({ p, right }: { p: (typeof pins)[number]; right?: string }) => (
        <div style={rowStyle} onClick={() => { setActive(p.i); flyTo(fit([p.xy], 90)) }} onMouseEnter={() => setActive(p.i)}>
            <div style={{ minWidth: 0 }}>
                <div style={{ ...serif, fontSize: 16, lineHeight: 1.2, color: ink }}>{p.n}</div>
                <div style={{ ...mono, fontSize: 11, color: accent, marginTop: 3 }}>{p.c}, {p.s}</div>
            </div>
            {right && <div style={{ ...mono, fontSize: 11, color: accent, whiteSpace: "nowrap", paddingTop: 3 }}>{right}</div>}
        </div>
    )

    const panel = (
        <div style={{ display: "flex", flexDirection: "column", gap: 14, width: stacked ? "100%" : 340, flexShrink: 0 }}>
            <form onSubmit={findZip} style={{ display: "flex", gap: 0 }}>
                <input value={zip} inputMode="numeric" autoComplete="postal-code" maxLength={5} placeholder="Enter your ZIP" aria-label="ZIP code"
                    onFocus={loadZips} onChange={(e) => setZip(e.target.value.replace(/\D/g, ""))}
                    style={{ ...serif, flex: 1, minWidth: 0, height: 48, padding: "0 14px", fontSize: 16, color: ink, background: paper, border: `1px solid ${ink}`, borderRight: "none", borderRadius: 0, outline: "none" }} />
                <button type="submit" style={{ ...mono, height: 48, padding: "0 18px", background: ink, color: paper, border: `1px solid ${ink}`, borderRadius: 0, cursor: "pointer" }}>Find</button>
            </form>
            {msg && <div style={{ ...mono, fontSize: 11, color: accent }}>{msg}</div>}
            {near && (
                <div>
                    <div style={{ ...serif, fontSize: 22, lineHeight: 1.15, color: ink }}>
                        {near.within > 0 ? `${near.within} ${near.within === 1 ? "church" : "churches"} within 100 miles of ${origin!.zip}.` : `Closest churches to ${origin!.zip}.`}
                    </div>
                    <div style={{ marginTop: 10 }}>{near.list.map((x) => <Row key={x.p.i} p={x.p} right={`${Math.round(x.d)} mi`} />)}</div>
                </div>
            )}
            {stateSel && (
                <div>
                    <div style={{ ...serif, fontSize: 22, lineHeight: 1.15, color: ink }}>{NAMES[stateSel]}</div>
                    <div style={{ marginTop: 10, maxHeight: stacked ? "none" : 300, overflowY: stacked ? "visible" : "auto" }}>{listForState.map((p) => <Row key={p.i} p={p} />)}</div>
                </div>
            )}
            {!near && !stateSel && !msg && (
                <div style={{ ...serif, fontSize: 16, lineHeight: 1.4, color: accent }}>
                    Type your ZIP or tap a state to see churches near you.
                </div>
            )}
            {(near || stateSel) && <button onClick={reset} style={{ ...mono, alignSelf: "flex-start", background: "none", border: "none", padding: 0, color: ink, textDecoration: "underline", cursor: "pointer" }}>Show all churches</button>}
            {ctaLabel && ctaLink && (
                <a href={ctaLink} style={{ ...mono, display: "flex", alignItems: "center", justifyContent: "center", height: 48, background: ink, color: paper, textDecoration: "none", marginTop: 4 }}>{ctaLabel}</a>
            )}
        </div>
    )

    const tipLeft = act ? ((act.xy[0] - view[0]) / view[2]) * 100 : 0
    const tipTop = act ? ((act.xy[1] - view[1]) / view[3]) * 100 : 0

    const map = (
        <div style={{ position: "relative", flex: 1, minWidth: 0, width: "100%" }}>
            <svg ref={svgRef} viewBox={view.join(" ")} onPointerDown={onDown} onPointerMove={onMove} onPointerUp={onUp} onPointerCancel={onUp}
                style={{ display: "block", width: "100%", height: "auto", aspectRatio: `${W} / ${H}`, touchAction: zoomedIn ? "none" : "pan-y", userSelect: "none", cursor: zoomedIn ? "grab" : "default" }}
                role="img" aria-label={`Map of ${feed.churches} churches Church Wear has made merch for`} onClick={(e) => { if (e.target === e.currentTarget) setActive(null) }}>
                <g>
                    {Object.entries(STATES).map(([s, d]) => (
                        <path key={s} d={d} fill={perState[s] ? (stateSel === s ? landActive : land) : paper} stroke={perState[s] ? paper : land}
                            strokeWidth={1 / zoom} vectorEffect="non-scaling-stroke" style={{ cursor: perState[s] ? "pointer" : "default", transition: "fill .2s" }}
                            onClick={() => pickState(s)} />
                    ))}
                </g>
                {origin && <circle cx={origin.xy[0]} cy={origin.xy[1]} r={10 / Math.sqrt(zoom)} fill="none" stroke={ink} strokeWidth={1.5} vectorEffect="non-scaling-stroke" strokeDasharray="3 3" />}
                <g>
                    {pins.map((p) => (
                        <circle key={p.i} cx={p.xy[0]} cy={p.xy[1]} r={active === p.i ? r * 1.7 : r} fill={ink} stroke={paper} strokeWidth={1.2} vectorEffect="non-scaling-stroke"
                            style={{ cursor: "pointer" }} onMouseEnter={() => setActive(p.i)} onClick={(e) => { e.stopPropagation(); if (!dragged.current) setActive(p.i) }} />
                    ))}
                </g>
            </svg>
            <div style={{ position: "absolute", top: 8, right: 8, display: "flex", flexDirection: "column", gap: 0, zIndex: 3 }}>
                {[
                    { k: "in", label: "Zoom in", on: () => zoomBy(1.8), dis: view[2] <= W / 10 + 1, icon: <path d="M7 1v12M1 7h12" /> },
                    { k: "out", label: "Zoom out", on: () => zoomBy(1 / 1.8), dis: !zoomedIn, icon: <path d="M1 7h12" /> },
                ].map((b, i) => (
                    <button key={b.k} type="button" aria-label={b.label} onClick={b.on} disabled={b.dis}
                        style={{ width: 36, height: 36, display: "flex", alignItems: "center", justifyContent: "center", padding: 0, background: paper, border: `1px solid ${ink}`, borderTop: i ? "none" : `1px solid ${ink}`, borderRadius: 0, cursor: b.dis ? "default" : "pointer", opacity: b.dis ? 0.35 : 1 }}>
                        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke={ink} strokeWidth="1.5">{b.icon}</svg>
                    </button>
                ))}
            </div>
            {zoomedIn && (
                <button type="button" onClick={reset} style={{ ...mono, fontSize: 11, position: "absolute", left: 8, top: 8, zIndex: 3, height: 36, padding: "0 12px", background: paper, color: ink, border: `1px solid ${ink}`, borderRadius: 0, cursor: "pointer" }}>
                    ← Full map
                </button>
            )}
            {act && tipLeft >= 0 && tipLeft <= 100 && tipTop >= 0 && tipTop <= 100 && (
                <div style={{ position: "absolute", left: `${Math.min(Math.max(tipLeft, 18), 82)}%`, top: `${tipTop}%`, transform: tipTop > 40 ? "translate(-50%, calc(-100% - 12px))" : "translate(-50%, 12px)",
                    background: paper, border: `1px solid ${ink}`, padding: "10px 12px", pointerEvents: "auto", maxWidth: 240, zIndex: 2 }}>
                    <div style={{ ...serif, fontSize: 15, lineHeight: 1.2, color: ink }}>{act.n}</div>
                    <div style={{ ...mono, fontSize: 10, color: accent, marginTop: 4 }}>{act.c}, {act.s}</div>
                    {act.w && <a href={act.w} target="_blank" rel="noopener nofollow" style={{ ...mono, fontSize: 10, color: ink, marginTop: 6, display: "inline-block" }}>{host(act.w)}</a>}
                </div>
            )}
        </div>
    )

    const q = query.trim().toLowerCase()
    const directory = full ? Object.keys(perState).sort((a, b) => NAMES[a].localeCompare(NAMES[b])).map((s) => ({
        s, list: pins.filter((p) => p.s === s && (!q || p.n.toLowerCase().includes(q) || p.c.toLowerCase().includes(q) || NAMES[s].toLowerCase().includes(q))).sort((a, b) => a.n.localeCompare(b.n)),
    })).filter((g) => g.list.length) : []

    return (
        <div ref={rootRef} style={{ ...style, display: "flex", flexDirection: "column", gap: full ? 56 : 0, background: paper, color: ink }}>
            <div style={{ display: "flex", flexDirection: stacked ? "column" : "row", gap: stacked ? 20 : 40, alignItems: stacked ? "stretch" : "flex-start" }}>
                {map}
                {panel}
            </div>
            {full && (
                <div>
                    <div style={{ display: "flex", flexDirection: stacked ? "column" : "row", justifyContent: "space-between", alignItems: stacked ? "stretch" : "flex-end", gap: 16, marginBottom: 24 }}>
                        <div style={{ ...serif, fontSize: stacked ? 32 : 48, lineHeight: 1.1, letterSpacing: "-0.04em" }}>Every church on the map</div>
                        <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search by church, city or state" aria-label="Search churches"
                            style={{ ...serif, height: 44, width: stacked ? "100%" : 320, padding: "0 14px", fontSize: 16, color: ink, background: paper, border: `1px solid ${ink}`, borderRadius: 0, outline: "none" }} />
                    </div>
                    <div style={stacked ? {} : { columnWidth: 260, columnGap: 40 }}>
                        {directory.map((g) => (
                            <div key={g.s} style={{ breakInside: "avoid", marginBottom: stacked ? 0 : 28 }}>
                                <div onClick={() => stacked && setOpen((o) => ({ ...o, [g.s]: !o[g.s] }))}
                                    style={{ ...mono, fontSize: 11, color: stacked ? ink : accent, padding: stacked ? "14px 0" : "0 0 8px", borderBottom: `1px solid ${stacked ? land : ink}`, display: "flex", justifyContent: "space-between", cursor: stacked ? "pointer" : "default" }}>
                                    <span>{NAMES[g.s]}</span>{stacked && <span style={{ color: accent }}>{g.list.length} {open[g.s] || q ? "−" : "+"}</span>}
                                </div>
                                {(!stacked || open[g.s] || q) && g.list.map((p) => (
                                    <div key={p.i} style={{ padding: "8px 0", borderBottom: `1px solid ${land}` }}>
                                        {p.w ? <a href={p.w} target="_blank" rel="noopener nofollow" style={{ ...serif, fontSize: 15, color: ink, textDecoration: "none" }}>{p.n}</a>
                                            : <span style={{ ...serif, fontSize: 15 }}>{p.n}</span>}
                                        <div style={{ ...mono, fontSize: 10, color: accent, marginTop: 2 }}>{p.c}</div>
                                    </div>
                                ))}
                            </div>
                        ))}
                        {!directory.length && <div style={{ ...serif, fontSize: 16, color: accent }}>No churches match that search.</div>}
                    </div>
                </div>
            )}
        </div>
    )
}

ChurchMap.defaultProps = { variant: "Section", ink: "#111111", paper: "#FFFFFF", land: "#EEEEEE", landActive: "#CCCCCC", accent: "#666666", ctaLabel: "", ctaLink: "" }

addPropertyControls(ChurchMap, {
    variant: { type: ControlType.Enum, title: "Variant", options: ["Section", "Full page"], defaultValue: "Section" },
    ctaLabel: { type: ControlType.String, title: "Button", defaultValue: "" },
    ctaLink: { type: ControlType.Link, title: "Button Link" },
    ink: { type: ControlType.Color, title: "Ink", defaultValue: "#111111" },
    paper: { type: ControlType.Color, title: "Background", defaultValue: "#FFFFFF" },
    land: { type: ControlType.Color, title: "States", defaultValue: "#EEEEEE" },
    landActive: { type: ControlType.Color, title: "Selected", defaultValue: "#CCCCCC" },
    accent: { type: ControlType.Color, title: "Muted Text", defaultValue: "#666666" },
    bodyFont: { type: ControlType.Font, title: "Body Font", controls: "basic", defaultFontType: "sans-serif" },
    labelFont: { type: ControlType.Font, title: "Label Font", controls: "basic", defaultFontType: "monospace" },
})
