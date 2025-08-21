import { h, render } from '/vendor/preact/preact.mjs';
import { useEffect, useMemo, useRef, useState, useCallback } from '/vendor/preact/hooks.mjs';

const NIL_UUID = "00000000-0000-0000-0000-000000000000";

export default function NetworkMenu({
  onNavigate,
  onOpenLink,
  onRunJs,
  className,
  collapsed = false, // <-- NEW
}) {
  const [items, setItems] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  // Accordion state: for each parentId, store the single expanded childId (or null).
  const [expandedByParent, setExpandedByParent] = useState({});

  // Flyout state when collapsed
  const [flyoutFor, setFlyoutFor] = useState(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        setError("");
        const res = await fetch("/api/data/menuitem?sortOrder=sort_order%20ASC", { credentials: "same-origin" });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        if (!Array.isArray(data)) throw new Error("Expected an array from /api/data/menuitem");
        if (!cancelled) setItems(data);
      } catch (e) {
        if (!cancelled) setError(e.message || "Failed to load menu");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  // Index by parent -> children, and by id -> item
  const { childrenByParent, byId, rootsSorted } = useMemo(() => {
    const byIdLocal = new Map();
    const children = new Map();
    (items || []).forEach((it) => {
      byIdLocal.set(it.menu_id, it);
      const parentId = it.parent_menu_id || NIL_UUID;
      if (!children.has(parentId)) children.set(parentId, []);
      children.get(parentId).push(it);
    });
    // Sort by sort_order, then display_text
    for (const [k, arr] of children.entries()) {
      arr.sort((a, b) => {
        const sa = Number.isFinite(+a.sort_order) ? +a.sort_order : Number.POSITIVE_INFINITY;
        const sb = Number.isFinite(+b.sort_order) ? +b.sort_order : Number.POSITIVE_INFINITY;
        if (sa !== sb) return sa - sb;
        return (a.display_text || "").localeCompare(b.display_text || "", undefined, { sensitivity: "base" });
      });
      children.set(k, arr);
    }
    const roots = children.get(NIL_UUID) || [];
    return { childrenByParent: children, byId: byIdLocal, rootsSorted: roots };
  }, [items]);

  const hasChildren = useCallback(
    (id) => (childrenByParent.get(id) || []).length > 0,
    [childrenByParent]
  );

  const toggle = useCallback(
    (parentId, childId) => {
      setExpandedByParent((prev) => {
        const current = prev[parentId] || null;
        return { ...prev, [parentId]: current === childId ? null : childId };
      });
    },
    []
  );

  const handleLeafAction = useCallback(
    (item) => {
      const {
        nav_jsx,
        nav_jsx_parameters,
        nav_jsx_asmodal,
        nav_popup_link,
        nav_js_code,
      } = item;

      if (nav_popup_link) {
        (onOpenLink || ((url) => window.open(url, "_blank", "noopener,noreferrer")))(nav_popup_link);
        return;
      }
      if (nav_js_code && onRunJs) onRunJs(nav_js_code, item);
      if (nav_jsx) {
        (onNavigate || ((panel, params, asModal) => {
          // eslint-disable-next-line no-console
          console.log("[NetworkMenu] navigate:", { panel, params, asModal });
        }))(nav_jsx, nav_jsx_parameters || {}, !!nav_jsx_asmodal);
      }
    },
    [onNavigate, onOpenLink, onRunJs]
  );

  const renderIcon = (item) => {
    const { icon_class, icon_text } = item;
    if (icon_class) return <i className={icon_class} aria-hidden="true" />;
    if (icon_text) {
      return (
        <span className="nm-icon-text" aria-hidden="true">
          {icon_text.slice(0, 2).toUpperCase()}
        </span>
      );
    }
    return <span className="nm-icon-placeholder" aria-hidden="true" />;
  };

  const Node = ({ item, level, parentId }) => {
    const children = childrenByParent.get(item.menu_id) || [];
    const isExpandable = children.length > 0;
    const isOpenFromParent = expandedByParent[parentId] === item.menu_id;
    const showFlyout = collapsed && isExpandable && flyoutFor === item.menu_id;

    return (
      <li
        role="treeitem"
        aria-expanded={!collapsed && isExpandable ? !!isOpenFromParent : undefined}
        aria-level={level}
        className={`nm-node ${isExpandable ? "nm-expandable" : "nm-leaf"} ${!collapsed && isOpenFromParent ? "is-open" : ""}`}
        onMouseEnter={() => { if (collapsed && isExpandable) setFlyoutFor(item.menu_id); }}
        onMouseLeave={() => { if (collapsed) setFlyoutFor(null); }}
        onFocus={() => { if (collapsed && isExpandable) setFlyoutFor(item.menu_id); }}
        onBlur={(e) => {
          if (collapsed && !e.currentTarget.contains(e.relatedTarget)) setFlyoutFor(null);
        }}
      >
        <div className="nm-row">
          {!collapsed && isExpandable ? (
            <button
              type="button"
              className="nm-toggle"
              onClick={() => toggle(parentId, item.menu_id)}
              aria-controls={`nm-sub-${item.menu_id}`}
              aria-expanded={!!isOpenFromParent}
            >
              <Chevron rotated={!!isOpenFromParent} />
            </button>
          ) : (
            <span className="nm-spacer" />
          )}

          <button
            type="button"
            className="nm-item"
            // In collapsed mode, clicking a parent just opens flyout; clicking again on the same parent closes it
            onClick={() => {
              if (collapsed && isExpandable) {
                setFlyoutFor((id) => (id === item.menu_id ? null : item.menu_id));
              } else {
                isExpandable ? toggle(parentId, item.menu_id) : handleLeafAction(item);
              }
            }}
            title={item.display_text}
            aria-haspopup={collapsed && isExpandable ? "menu" : undefined}
            aria-expanded={collapsed && isExpandable ? showFlyout : undefined}
          >
            {renderIcon(item)}
            <span className="nm-label">{item.display_text}</span>
          </button>
        </div>

        {/* Children (normal accordion when not collapsed) */}
        {!collapsed && isExpandable && isOpenFromParent && (
          <ul id={`nm-sub-${item.menu_id}`} role="group" className="nm-sublist">
            {children.map((child) => (
              <Node key={child.menu_id} item={child} level={level + 1} parentId={item.menu_id} />
            ))}
          </ul>
        )}

        {/* Flyout when collapsed */}
        {showFlyout && (
          <div className="nm-flyout" role="menu" aria-label={item.display_text}>
            <div class="nm-row">{item.display_text}</div>
            <ul className="nm-flyout-list">
              {children.map((child) => {
                const childHasKids = hasChildren(child.menu_id);
                return (
                  <li key={child.menu_id} role="none">
                    <button
                      type="button"
                      role="menuitem"
                      className="nm-item"
                      onClick={() => (childHasKids ? setFlyoutFor(child.menu_id) : handleLeafAction(child))}
                      title={child.display_text}
                    >
                      {renderIcon(child)}
                      <span className="nm-label">{child.display_text}</span>
                      {childHasKids ? <Chevron rotated={true} /> : null}
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        )}
      </li>
    );
  };

  if (loading) {
    return (
      <div className={`nm-wrapper ${className || ""}`}>
        <div className="nm-loading">Loading menu…</div>
        <StyleTag />
      </div>
    );
  }

  if (error) {
    return (
      <div className={`nm-wrapper ${className || ""}`}>
        <div className="nm-error">Failed to load menu: {error}</div>
        <StyleTag />
      </div>
    );
  }

  if (!items || rootsSorted.length === 0) {
    return (
      <div className={`nm-wrapper ${className || ""}`}>
        <div className="nm-empty">No menu items found.</div>
        <StyleTag />
      </div>
    );
  }

  return (
    <nav className={`nm-wrapper ${className || ""} ${collapsed ? "nm-collapsed" : ""}`} aria-label="Network Menu">
      <ul role="tree" className="nm-root">
        {rootsSorted.map((root) => (
          <Node key={root.menu_id} item={root} level={1} parentId={NIL_UUID} />
        ))}
      </ul>
      <StyleTag />
    </nav>
  );
}

function Chevron({ rotated }) {
  return (
    <svg
      className={`nm-chevron ${rotated ? "rotated" : ""}`}
      viewBox="0 0 24 24"
      width="16"
      height="16"
      aria-hidden="true"
      focusable="false"
    >
      <path d="M8.12 9.29L12 13.17l3.88-3.88 1.41 1.41L12 16l-5.29-5.29z" />
    </svg>
  );
}

function StyleTag() {
  return (
    <style>{`
      .nm-wrapper { font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, "Apple Color Emoji", "Segoe UI Emoji"; }
      .nm-root, .nm-sublist { list-style: none; margin: 0; padding-left: 0; }
      .nm-root > .nm-node { border-bottom: 1px solid rgba(0,0,0,0.06); }
      .nm-node { position: relative; }
      .nm-row { display: flex; align-items: center; gap: 6px; padding: 6px 8px; }
      .nm-toggle { border: 0; background: transparent; padding: 4px; cursor: pointer; border-radius: 6px; }
      .nm-toggle:hover { background: rgba(0,0,0,0.06); }
      .nm-chevron { transition: transform 160ms ease; }
      .nm-chevron.rotated { transform: rotate(180deg); }

      .nm-spacer { display: inline-block; width: 24px; }

      .nm-item { 
        flex: 1; display: flex; align-items: center; gap: 10px;
        border: 0; background: transparent; cursor: pointer; padding: 6px 8px; border-radius: 8px;
        text-align: left; width: 100%;
      }
      .nm-item:hover { background: rgba(0,0,0,0.04); }
      .nm-item:active { background: rgba(0,0,0,0.08); }

      .nm-label { font-size: 14px; line-height: 1.1; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

      .nm-icon-placeholder, .nm-icon-text, .nm-item i { width: 22px; height: 22px; display: inline-flex; align-items: center; justify-content: center; }
      .nm-icon-placeholder { border-radius: 50%; border: 1px dashed rgba(0,0,0,0.3); }
      .nm-icon-text { border-radius: 50%; font-size: 11px; font-weight: 700; background: rgba(0,0,0,0.08); }

      .nm-sublist { margin-left: 28px; padding-left: 10px; border-left: 2px solid rgba(0,0,0,0.06); }
      .nm-expandable.is-open > .nm-row .nm-item { font-weight: 600; }

      .nm-loading, .nm-error, .nm-empty { padding: 12px; font-size: 14px; color: #333; }
      .nm-error { color: #b00020; }

      /* Collapsed mode */
      .nm-collapsed { width: 56px; }
      .nm-collapsed .nm-label { display: none; }
      .nm-collapsed .nm-toggle { display: none; }
      .nm-collapsed .nm-row { justify-content: center; }
      .nm-collapsed .nm-root > .nm-node { border-bottom: 1px solid rgba(0,0,0,0.06); }

      /* Flyout */
      .nm-flyout {
        position: absolute;
        left: 100%;
        top: 0;
        min-width: 220px;
        background: #fff;
        border: 1px solid rgba(0,0,0,0.06);
        box-shadow: 0 12px 24px rgba(0,0,0,0.12);
        border-radius: 8px;
        padding: 6px 0;
        z-index: 1000;
      }
      .nm-flyout .nm-item { width: 100%; justify-content: flex-start; }
      .nm-flyout .nm-label { display: inline; }
      .nm-flyout-list { list-style: none; margin: 0; padding: 0; }
      .nm-flyout li + li .nm-item { margin-top: 2px; }
    `}</style>
  );
}
