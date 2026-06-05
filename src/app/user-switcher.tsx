"use client";

import { motion } from "framer-motion";
import { type KeyboardEvent, useEffect, useRef, useState } from "react";

type SwitchUser = { id: string; label: string };

export function UserSwitcher({
  users,
  activeId,
  onSelect
}: {
  users: SwitchUser[];
  activeId: string;
  onSelect: (id: string) => void;
}) {
  // Track the selection optimistically so the pill slides instantly on click,
  // before the server navigation resolves.
  const [selected, setSelected] = useState(activeId);

  // Keep in sync when the active user changes from outside (e.g. browser
  // back/forward), so the pill always reflects the real current user.
  useEffect(() => setSelected(activeId), [activeId]);

  const btnRefs = useRef<(HTMLButtonElement | null)[]>([]);

  function select(id: string) {
    if (id === selected) return;
    setSelected(id);
    onSelect(id);
  }

  // WAI-ARIA radiogroup keyboard support: arrows/Home/End move and select.
  function onKeyDown(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    let next: number | null = null;
    if (event.key === "ArrowRight" || event.key === "ArrowDown") {
      next = (index + 1) % users.length;
    } else if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
      next = (index - 1 + users.length) % users.length;
    } else if (event.key === "Home") {
      next = 0;
    } else if (event.key === "End") {
      next = users.length - 1;
    }
    if (next === null) return;
    event.preventDefault();
    btnRefs.current[next]?.focus();
    select(users[next].id);
  }

  return (
    <div
      role="radiogroup"
      aria-label="Switch current user"
      className="inline-flex items-center gap-1 rounded-full border border-border bg-surface-1 p-1 shadow-sm"
    >
      {users.map((user, index) => {
        const isActive = selected === user.id;
        return (
          <button
            key={user.id}
            role="radio"
            type="button"
            ref={(element) => {
              btnRefs.current[index] = element;
            }}
            aria-checked={isActive}
            tabIndex={isActive ? 0 : -1}
            onClick={() => select(user.id)}
            onKeyDown={(event) => onKeyDown(event, index)}
            className="relative isolate rounded-full px-4 py-1.5 text-sm font-semibold transition-colors"
            style={{ color: isActive ? "var(--accent-contrast)" : "var(--text-muted)" }}
          >
            {isActive ? (
              <motion.span
                layoutId="user-pill"
                transition={{ type: "spring", stiffness: 420, damping: 34 }}
                className="absolute inset-0 -z-10 rounded-full"
                style={{
                  background: "linear-gradient(135deg, var(--accent), var(--accent-2))",
                  boxShadow: "var(--shadow-glow)"
                }}
              />
            ) : null}
            {user.label}
          </button>
        );
      })}
    </div>
  );
}
