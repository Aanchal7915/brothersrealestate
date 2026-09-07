import { useRef, useState } from "react";
import { GripVertical } from "lucide-react";

/** Pulls an item out and re-inserts it at `to` — how a drag actually behaves. */
export const move = (list, from, to) => {
  if (from === to || from < 0 || to < 0 || from >= list.length || to >= list.length) return list;
  const next = [...list];
  const [item] = next.splice(from, 1);
  next.splice(to, 0, item);
  return next;
};

/** Kept for callers that only ever swap two neighbours. */
export const swap = (list, a, b) => {
  if (a < 0 || b < 0 || a >= list.length || b >= list.length) return list;
  const next = [...list];
  [next[a], next[b]] = [next[b], next[a]];
  return next;
};

/**
 * Drag-to-reorder for a list. Spread `dragProps(index)` onto each item.
 * `onReorder(from, to)` fires once, on drop.
 *
 *   const { dragProps, draggingIndex, overIndex } = useDragReorder(onReorder);
 *   <div {...dragProps(i)} />
 */
export const useDragReorder = (onReorder, { disabled = false } = {}) => {
  const from = useRef(null);
  const [draggingIndex, setDraggingIndex] = useState(null);
  const [overIndex, setOverIndex] = useState(null);

  const reset = () => {
    from.current = null;
    setDraggingIndex(null);
    setOverIndex(null);
  };

  const dragProps = (index) =>
    disabled
      ? {}
      : {
          draggable: true,
          onDragStart: (e) => {
            from.current = index;
            setDraggingIndex(index);
            e.dataTransfer.effectAllowed = "move";
            // Firefox refuses to start a drag without payload.
            try {
              e.dataTransfer.setData("text/plain", String(index));
            } catch (err) {
              /* ignore */
            }
          },
          onDragOver: (e) => {
            e.preventDefault();
            e.dataTransfer.dropEffect = "move";
            if (overIndex !== index) setOverIndex(index);
          },
          onDragLeave: () => {
            if (overIndex === index) setOverIndex(null);
          },
          onDrop: (e) => {
            e.preventDefault();
            e.stopPropagation();
            const start = from.current;
            if (start !== null && start !== index) onReorder(start, index);
            reset();
          },
          onDragEnd: reset,
        };

  return { dragProps, draggingIndex, overIndex };
};

/** Visual state classes for a tile being dragged / hovered over. */
export const dragClass = (index, draggingIndex, overIndex) =>
  [
    "transition-all duration-150",
    draggingIndex === index ? "opacity-40 scale-95" : "",
    overIndex === index && draggingIndex !== index ? "ring-2 ring-gold ring-offset-1" : "",
  ]
    .filter(Boolean)
    .join(" ");

/** Grip shown on a draggable row so it reads as movable. */
export const DragHandle = ({ label = "Drag to reorder" }) => (
  <span
    title={label}
    aria-label={label}
    className="inline-flex cursor-grab items-center text-gray-300 transition-colors hover:text-matte active:cursor-grabbing"
  >
    <GripVertical size={16} />
  </span>
);

/** Small position badge overlaid on an image tile. */
export const OrderBadge = ({ index }) => (
  <span className="pointer-events-none absolute bottom-1 left-1 rounded bg-black/70 px-1.5 text-[9px] font-bold text-white">
    {index + 1}
  </span>
);
