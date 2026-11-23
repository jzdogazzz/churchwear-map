import * as React from "react"
import { addPropertyControls, ControlType } from "framer"

// Live church and state counts from the nightly feed. {churches} and {states} are replaced.
const FEED = "https://raw.githubusercontent.com/jzdogazzz/churchwear-map/main/churches.json"
const FALLBACK = { churches: 179, states: 37 }

interface Props { text: string; font: React.CSSProperties; color: string; align: "left" | "center" | "right"; style?: React.CSSProperties }

/**
 * @framerSupportedLayoutWidth any-prefer-fixed
 * @framerSupportedLayoutHeight auto
 */
export default function ChurchCount({ text, font, color, align, style }: Props) {
    const [n, setN] = React.useState(FALLBACK)
    React.useEffect(() => {
        let live = true
        fetch(FEED, { cache: "no-cache" }).then((r) => r.json()).then((f) => {
            if (live && f && f.churches >= FALLBACK.churches * 0.8) setN({ churches: f.churches, states: f.states })
        }).catch(() => {})
        return () => { live = false }
    }, [])
    const out = text.replace(/\{churches\}/g, String(n.churches)).replace(/\{states\}/g, String(n.states))
    return <div style={{ ...style, ...font, color, textAlign: align, margin: 0 }}>{out}</div>
}

ChurchCount.defaultProps = { text: "{churches} churches. {states} states.", color: "#111111", align: "left" }

addPropertyControls(ChurchCount, {
    text: { type: ControlType.String, title: "Text", defaultValue: "{churches} churches. {states} states." },
    font: { type: ControlType.Font, title: "Font", controls: "extended", defaultFontType: "sans-serif", defaultValue: { fontSize: 16 } },
    color: { type: ControlType.Color, title: "Color", defaultValue: "#111111" },
    align: { type: ControlType.Enum, title: "Align", options: ["left", "center", "right"], displaySegmentedControl: true },
})
