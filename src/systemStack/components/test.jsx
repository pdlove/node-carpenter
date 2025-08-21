import { h, render } from '/vendor/preact/preact.mjs';
import { useEffect, useMemo, useRef, useState } from '/vendor/preact/hooks.mjs';

const MenuItem = ({ item }) => {
  const [open, setOpen] = useState(false);
  const [hovered, setHovered] = useState(false);

  const hasChildren = item.children && item.children.length > 0;

  return (
    <div className="ml-4">
      <div
        className="flex items-center justify-between p-1 rounded hover:bg-gray-600"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        <div
          className="flex items-center gap-2 cursor-pointer"
          onClick={() => hasChildren && setOpen(!open)}
        >
          <span className="w-4">{hasChildren ? "📁" : "📄"}</span>
          <span>{item.label}</span>
        </div>

        {hovered && (
          <button className="p-1 hover:bg-gray-200 rounded">
            <span className="text-gray-500">⋯</span>
          </button>
        )}
      </div>

      {hasChildren && open && (
        <div className="ml-4 border-l border-gray-200 pl-2">
          {item.children.map((child, i) => (
            <MenuItem key={i} item={child} />
          ))}
        </div>
      )}
    </div>
  );
};

export function App() {
  const menuData = [
    {
      label: "Prologue",
      children: [
        { label: "Who Am I?" },
        { label: "Awakening in the Dark" },
        {
          label: "Fabricated Beginnings",
          children: [
            { label: "Magic Brownie" },
            { label: "Into the Woods" },
          ],
        },
      ],
    },
    {
      label: "Nov 5, 2067",
      children: [
        { label: "8AM The Magic Memory Station" },
        { label: "Meeting Robert" },
      ],
    },
  ];

  return (
    <div className="w-64 p-2 bg-black border rounded shadow">
      {menuData.map((item, i) => (
        <MenuItem key={i} item={item} />
      ))}
    </div>
  );
}
