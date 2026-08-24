"use client";

import { useEffect } from "react";

export interface ShortcutMap {
  [key: string]: (e: KeyboardEvent) => void;
}

export function useKeyboardShortcuts(
  shortcuts: ShortcutMap,
  deps: unknown[] = [],
  options: { allowInInput?: string[] } = {},
) {
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      const target = e.target as HTMLElement | null;
      const isInput =
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.isContentEditable ||
          target.getAttribute("role") === "textbox");

      const keyLower = e.key.toLowerCase();
      const hasCtrl = e.ctrlKey;
      const hasMeta = e.metaKey;
      const hasShift = e.shiftKey;
      const hasAlt = e.altKey;

      // Primary modifier key (Ctrl on Win/Linux, Cmd on Mac)
      const isMod = hasCtrl || hasMeta;

      // Candidate key combinations to test
      const keysToTest: string[] = [];

      // Unified "mod" shortcuts (e.g. "mod+k", "mod+u", "mod+shift+n")
      if (isMod) {
        const combo = ["mod", hasShift ? "shift" : "", hasAlt ? "alt" : "", keyLower]
          .filter(Boolean)
          .join("+");
        keysToTest.push(combo);

        const specificCombo = [
          hasCtrl ? "ctrl" : "",
          hasMeta ? "meta" : "",
          hasShift ? "shift" : "",
          hasAlt ? "alt" : "",
          keyLower,
        ]
          .filter(Boolean)
          .join("+");
        keysToTest.push(specificCombo);
      } else {
        const combo = [hasShift ? "shift" : "", hasAlt ? "alt" : "", keyLower]
          .filter(Boolean)
          .join("+");
        keysToTest.push(combo);
        keysToTest.push(keyLower);
      }

      for (const k of keysToTest) {
        if (shortcuts[k]) {
          // If inside an input, only execute if explicitly allowed (e.g. Escape)
          if (isInput && !options.allowInInput?.includes(k)) {
            continue;
          }

          e.preventDefault();
          shortcuts[k](e);
          return;
        }
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shortcuts, ...deps]);
}
