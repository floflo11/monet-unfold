// Hand-drawn SVG bits for the DOM UI.

export function HandArrow({ flip = false }: { flip?: boolean }) {
  return (
    <svg viewBox="0 0 90 64" width="78" height="56" style={{ transform: flip ? "scaleX(-1)" : undefined }} aria-hidden="true">
      <path d="M8 34 C 24 30.5, 44 36.5, 77 31.5" />
      <path d="M57 14.5 C 64 21, 71 27, 79 31.8 C 71 36.5, 64 42.5, 56.5 50" />
      <path d="M10 37.5 C 30 35, 50 39, 70 35.5" opacity="0.35" />
    </svg>
  );
}

export function HandUnderline() {
  return (
    <svg className="underline" viewBox="0 0 120 14" preserveAspectRatio="none" aria-hidden="true">
      <path d="M2 9 C 30 5, 70 11, 118 6" />
      <path d="M8 12 C 40 9, 80 13, 112 10" opacity="0.5" />
    </svg>
  );
}
