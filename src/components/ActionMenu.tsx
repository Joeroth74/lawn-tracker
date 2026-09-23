import { useState, useRef, useLayoutEffect, useEffect, useCallback } from "react";
import { MoreVertical, Pencil, Trash2 } from "lucide-react";

interface ActionMenuProps {
  onEdit: () => void;
  onDelete: () => void;
}

export default function ActionMenu({ onEdit, onDelete }: ActionMenuProps) {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const [position, setPosition] = useState<{ top: number; right: number }>({
    top: 0,
    right: 0,
  });

  const updatePosition = useCallback(() => {
    if (!triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    setPosition({
      top: rect.bottom,
      right: window.innerWidth - rect.right,
    });
  }, []);

  useLayoutEffect(() => {
    if (!open) return;
    updatePosition();
  }, [open, updatePosition]);

  useEffect(() => {
    if (!open) return;
    function onScroll() {
      if (!triggerRef.current) return;
      const rect = triggerRef.current.getBoundingClientRect();
      setPosition({ top: rect.bottom, right: window.innerWidth - rect.right });
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    function handleClickOutside(e: MouseEvent) {
      const isOutsideTrigger =
        triggerRef.current && !triggerRef.current.contains(e.target as Node);
      const isOutsideMenu =
        menuRef.current && !menuRef.current.contains(e.target as Node);
      if (isOutsideTrigger && isOutsideMenu) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  return (
    <div className="relative inline-block">
      <button
        type="button"
        ref={triggerRef}
        onClick={() => setOpen((o) => !o)}
        aria-label="Open actions"
        aria-expanded={open}
        aria-haspopup="menu"
        className="p-1.5 text-gray-400 hover:text-gray-600 transition-colors rounded-lg active:bg-gray-100"
      >
        <MoreVertical size={16} />
      </button>
      {open && (
        <div
          ref={menuRef}
          role="menu"
          className="fixed w-36 bg-white rounded-lg border border-gray-200 shadow-lg z-50 py-1"
          style={{ top: position.top, right: position.right }}
        >
          <button
            type="button"
            role="menuitem"
            onClick={() => {
              onEdit();
              setOpen(false);
            }}
            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <Pencil size={16} />
            Edit
          </button>
          <button
            type="button"
            role="menuitem"
            onClick={() => {
              onDelete();
              setOpen(false);
            }}
            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-gray-50 transition-colors"
          >
            <Trash2 size={16} />
            Delete
          </button>
        </div>
      )}
    </div>
  );
}
