// AppLayoutLazy.jsx
import { h, render } from '/vendor/preact/preact.mjs';
import { useEffect, useMemo, useRef, useState } from '/vendor/preact/hooks.mjs';

/**
 * Build candidate URLs from a panel name:
 *  "DashboardPanel"     -> /panels/DashboardPanel.js  or /panels/DashboardPanel/index.js
 *  "admin/UsersRoles"   -> /panels/admin/UsersRoles.js or /panels/admin/UsersRoles/index.js
 */

export default function LazyPanelHost({ url, params }) {
    const [Comp, setComp] = useState(null);
    const [err, setErr] = useState("");

    useEffect(() => {
        let cancelled = false;
        setComp(null);
        setErr("");

        (async () => {
            try {
                // Try to import each candidate URL
                const m = await import(`/part/${url}`);
                // Pick default, then named matching the last segment, then first function export
                const exportName = url.split("/").pop();
                const picked = m?.default || m?.[exportName] || Object.values(m).find((v) => typeof v === "function");
                if (picked) {
                    if (!cancelled) setComp(() => picked);
                    return;
                }
            } catch (e) {
                // try next candidate
            }
            if (!cancelled) setErr(`Panel "${url}" not found.`);
        })();

        return () => { cancelled = true; };
    }, [url]);

    if (err) return <div className="panel"><h2>Panel not found</h2><p>{err}</p></div>;
    if (!Comp) return <div className="panel"><em>Loading {url}…</em></div>;
    return <Comp {...(params || {})} />;
}
