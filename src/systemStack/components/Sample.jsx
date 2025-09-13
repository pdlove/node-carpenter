/** @jsxImportSource preact */
// Preact Table + Filters + Modal Starter (JavaScript)
// ------------------------------------------------------------
// Drop this file into your Preact app and tweak the endpoint/columns.
// It fetches data (with filters), shows a refresh button, renders a table,
// and opens a modal with full row details.
//
// If you're not using a preset, make sure your bundler knows to use Preact's JSX runtime
// or add aliases for react/react-dom to preact/compat.
// ------------------------------------------------------------

import { useEffect, useMemo, useRef, useState } from 'preact/hooks';
import { createPortal } from 'preact/compat';

// ----- Config: tweak this for your API ----------------------
const ENDPOINT = '/api/devices';

function buildQuery(filters) {
    const params = new URLSearchParams();
    if (filters.search.trim()) params.set('search', filters.search.trim());
    if (filters.status !== 'any') params.set('status', filters.status);
    return `${ENDPOINT}${params.toString() ? `?${params.toString()}` : ''}`;
}

// ----- Page Component ---------------------------------------
export default function DevicesPage() {
    const [draft, setDraft] = useState({ search: '', status: 'any' });
    const [filters, setFilters] = useState({ search: '', status: 'any' });
    const [refreshTick, setRefreshTick] = useState(0);

    const { data, loading, error, refetch } = useDeviceList(filters, refreshTick);

    function onSubmit(e) {
        e.preventDefault();
        setFilters(draft);
    }

    return (
        <div style={{ padding: 16, display: 'grid', gap: 12 }}>
            <h1 style={{ margin: 0 }}>Devices</h1>

            {/* Filters + Refresh */}
            <form onSubmit={onSubmit} style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'end' }}>
                <div style={{ display: 'grid' }}>
                    <label htmlFor="search">Search</label>
                    <input
                        id="search"
                        type="text"
                        placeholder="name, ip…"
                        value={draft.search}
                        onInput={(e) => setDraft((f) => ({ ...f, search: e.currentTarget.value }))}
                    />
                </div>

                <div style={{ display: 'grid' }}>
                    <label htmlFor="status">Status</label>
                    <select
                        id="status"
                        value={draft.status}
                        onInput={(e) => setDraft((f) => ({ ...f, status: e.currentTarget.value }))}
                    >
                        <option value="any">Any</option>
                        <option value="online">Online</option>
                        <option value="offline">Offline</option>
                        <option value="unknown">Unknown</option>
                    </select>
                </div>

                <button type="submit">Apply Filters</button>
                <button type="button" onClick={() => (refetch ? refetch() : setRefreshTick((t) => t + 1))}>
                    Refresh
                </button>
            </form>

            {/* Data states */}
            {loading && <div>Loading…</div>}
            {error && (<div role="alert" style={{ color: 'crimson' }}>Failed to load: {error}</div>)}
            {!loading && !error && <DevicesTable devices={data} />}
        </div>
    );
}

// ----- Data hook --------------------------------------------
function useDeviceList(filters, refreshTick) {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const acRef = useRef(null);

    const fetchList = async () => {
        acRef.current?.abort();
        const ac = new AbortController();
        acRef.current = ac;
        setLoading(true);
        setError(null);
        try {
            const res = await fetch(buildQuery(filters), { signal: ac.signal });
            if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
            const json = await res.json();
            setData(Array.isArray(json) ? json : []);
        } catch (err) {
            if (err?.name !== 'AbortError') setError(err.message || String(err));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchList();
        return () => acRef.current?.abort();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [filters, refreshTick]);

    return { data, loading, error, refetch: fetchList };
}

// ----- Table -------------------------------------------------
function DevicesTable({ devices }) {
    const [selected, setSelected] = useState(null);
    const rows = useMemo(() => devices, [devices]);

    if (!rows.length) return <div>Nothing to show.</div>;

    return (
        <>
            <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr>
                            <Th>Name</Th>
                            <Th>IP</Th>
                            <Th>Status</Th>
                            <Th>Model</Th>
                            <Th>Actions</Th>
                        </tr>
                    </thead>
                    <tbody>
                        {rows.map((d) => (
                            <tr key={d.id} style={{ borderTop: '1px solid #ddd' }}>
                                <Td>{d.name}</Td>
                                <Td>{d.ip}</Td>
                                <Td>
                                    <StatusPill status={d.status} />
                                </Td>
                                <Td>{d.model ?? '—'}</Td>
                                <Td>
                                    <button onClick={() => setSelected(d)} aria-haspopup="dialog" aria-controls="device-details-modal">
                                        View
                                    </button>
                                </Td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <DetailsModal device={selected} onClose={() => setSelected(null)} />
        </>
    );
}

function Th({ children }) {
    return (
        <th style={{ textAlign: 'left', padding: '8px 6px', fontWeight: 600, background: '#fafafa' }}>{children}</th>
    );
}

function Td({ children }) {
    return <td style={{ padding: '8px 6px', verticalAlign: 'top' }}>{children}</td>;
}

function StatusPill({ status }) {
    const color = status === 'online' ? '#0a7d33' : status === 'offline' ? '#b00020' : '#666';
    const bg = status === 'online' ? '#e6f4ea' : status === 'offline' ? '#fde7e9' : '#f1f1f1';
    return (
        <span style={{ display: 'inline-block', padding: '2px 8px', borderRadius: 9999, background: bg, color }}>
            {status}
        </span>
    );
}

// ----- Modal -------------------------------------------------
function DetailsModal({ device, onClose }) {
    const open = !!device;
    useLockBodyScroll(open);

    const panelRef = useRef(null);
    const previousFocusRef = useRef(null);

    useEffect(() => {
        if (!open) return;
        previousFocusRef.current = document.activeElement;
        const id = requestAnimationFrame(() => panelRef.current?.focus());
        const onKey = (e) => {
            if (e.key === 'Escape') onClose();
        };
        document.addEventListener('keydown', onKey);
        return () => {
            cancelAnimationFrame(id);
            document.removeEventListener('keydown', onKey);
            previousFocusRef.current?.focus?.();
        };
    }, [open, onClose]);

    if (!open || !device) return null;

    return createPortal(
        <div
            id="device-details-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="device-details-title"
            onClick={(e) => e.currentTarget === e.target && onClose()}
            style={{
                position: 'fixed', inset: 0, display: 'grid', placeItems: 'center',
                background: 'rgba(0,0,0,0.4)', padding: 12, zIndex: 1000,
            }}
        >
            <div
                ref={panelRef}
                tabIndex={-1}
                style={{ background: 'white', borderRadius: 8, padding: 16, width: 'min(720px, 96vw)', maxHeight: '90vh', overflow: 'auto' }}
            >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                    <h2 id="device-details-title" style={{ margin: 0 }}>Device Details</h2>
                    <button onClick={onClose} aria-label="Close">×</button>
                </div>

                <div style={{ marginTop: 12 }}>
                    <DefinitionList obj={device} importantKeys={['name', 'ip', 'status', 'model', 'osVersion', 'location', 'lastSeen']} />
                </div>
            </div>
        </div>,
        document.body
    );
}

function DefinitionList({ obj, importantKeys = [] }) {
    const entries = useMemo(() => {
        const imp = importantKeys.filter((k) => k in obj).map((k) => [k, obj[k]]);
        const rest = Object.keys(obj)
            .filter((k) => !importantKeys.includes(k))
            .sort((a, b) => a.localeCompare(b))
            .map((k) => [k, obj[k]]);
        return [...imp, ...rest];
    }, [obj, importantKeys]);

    return (
        <dl style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '8px 12px' }}>
            {entries.map(([k, v]) => (
                <>
                    <dt style={{ fontWeight: 600, textTransform: 'capitalize' }}>{k}</dt>
                    <dd style={{ margin: 0, wordBreak: 'break-word' }}>{formatValue(v)}</dd>
                </>
            ))}
        </dl>
    );
}

function formatValue(v) {
    if (v == null) return '—';
    if (typeof v === 'object') return <pre style={{ margin: 0, whiteSpace: 'pre-wrap' }}>{JSON.stringify(v, null, 2)}</pre>;
    return String(v);
}

// ----- Utilities --------------------------------------------
function useLockBodyScroll(lock) {
    useEffect(() => {
        if (!lock) return;
        const { overflow } = document.body.style;
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = overflow;
        };
    }, [lock]);
}
