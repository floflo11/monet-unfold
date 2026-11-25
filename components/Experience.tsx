"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { ContactShadows } from "@react-three/drei";
import Book from "./Book";
import { HandArrow, HandUnderline } from "./Hand";
import { logicalOf } from "@/lib/fold";
import { MONET_ROOMS as ROOMS } from "@/lib/monet";
import { book } from "@/lib/store";
import { buildTextures, type BookTextures } from "@/lib/textures";

const FONT = "Caveat";

export default function Experience() {
  const [tex, setTex] = useState<BookTextures | null>(null);
  const [room, setRoom] = useState(0); // logical index
  const [open, setOpen] = useState(false);
  const [leaving, setLeaving] = useState(false);
  // ?film: canvas keeps its drawing buffer (for frame capture) and the chrome is hidden; captions stay
  const [film, setFilm] = useState<boolean | null>(null);
  useEffect(() => {
    setFilm(new URLSearchParams(window.location.search).has("film"));
  }, []);
  const drag = useRef({ x: 0, startX: 0, active: false });

  // Draw every surface once the handwriting font is ready.
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        await Promise.all([document.fonts.load(`700 64px ${FONT}`), document.fonts.load(`500 64px ${FONT}`)]);
      } catch {
        /* fall back to whatever cursive font is around */
      }
      try {
        const t = await buildTextures(`${FONT}, cursive`);
        if (alive) setTex(t);
      } catch (err) {
        console.error(err);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  // Step round the circle: +1 = next room. The target keeps counting so the book always
  // turns the short way, and wraps from the last room back to the first.
  const step = useCallback((dir: number) => {
    book.target = Math.round(book.target) - dir;
    setRoom(logicalOf(book.target));
  }, []);

  const setBookOpen = useCallback((v: boolean) => {
    book.openTarget = v ? 1 : 0;
    setOpen(v);
  }, []);

  // Coming back from the game (browser back): undo the move into the painting.
  useEffect(() => {
    const onShow = () => {
      book.zoomTarget = 0;
      setLeaving(false);
    };
    window.addEventListener("pageshow", onShow);
    return () => window.removeEventListener("pageshow", onShow);
  }, []);

  useEffect(() => {
    const onKey = (ev: KeyboardEvent) => {
      if (leaving) return;
      if (ev.key === "ArrowRight") {
        if (!open) setBookOpen(true);
        else step(1);
      } else if (ev.key === "ArrowLeft") {
        if (open) step(-1);
      } else if (ev.key === "Enter" || ev.key === " ") {
        setBookOpen(!open);
      } else if (ev.key === "Escape") setBookOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, step, setBookOpen, leaving]);

  // Drag sideways to page through: content follows your finger.
  const onDown = (ev: React.PointerEvent) => {
    drag.current = { x: ev.clientX, startX: ev.clientX, active: true };
    (ev.target as HTMLElement).setPointerCapture?.(ev.pointerId);
    if (open) book.dragging = true;
  };
  const onMove = (ev: React.PointerEvent) => {
    if (!drag.current.active || !open) return;
    const dx = ev.clientX - drag.current.x;
    drag.current.x = ev.clientX;
    book.f += dx / 170;
  };
  const onUp = (ev: React.PointerEvent) => {
    if (!drag.current.active) return;
    drag.current.active = false;
    const moved = Math.abs(ev.clientX - drag.current.startX);
    if (!open) {
      if (moved < 6) setBookOpen(true);
      return;
    }
    book.dragging = false;
    book.target = Math.round(book.f);
    setRoom(logicalOf(book.target));
  };

  const current = ROOMS[room];

  return (
    <main className={`stage${film ? " is-film" : ""}`}>
      <header className="topbar">
        {!film && (
          <div className="wordmark">
            unfold
            <HandUnderline />
            <div className="wordmark-sub">a Monet Canvas remix</div>
          </div>
        )}
      </header>

      <div className="canvas-wrap" onPointerDown={onDown} onPointerMove={onMove} onPointerUp={onUp} onPointerCancel={onUp} onDoubleClick={() => setBookOpen(!open)}>
        {tex && film !== null && (
          <Canvas
            orthographic
            flat
            linear
            dpr={[1, 2]}
            camera={{ position: [0, 2, 10], zoom: 200, near: 0.1, far: 100 }}
            gl={film ? { alpha: true, antialias: true, preserveDrawingBuffer: true } : { alpha: true, antialias: true }}
          >
            <Book
              tex={tex}
              onSpot={(li) => {
                // move in on the spot, then step into the painting
                const href = ROOMS[li]?.href;
                if (!href) return;
                book.zoomTarget = 1;
                setLeaving(true);
                window.setTimeout(() => window.location.assign(href), 650);
              }}
            />
            <ContactShadows position={[0, -0.04, 0]} scale={5} resolution={512} far={1.4} blur={2.4} opacity={0.32} color="#2a2350" frames={Infinity} />
          </Canvas>
        )}
        {!tex && <div className="loading">sharpening pencils…</div>}
      </div>

      {!film && (
        <>
      <button
        className={`arrow arrow-left ${open ? "" : "is-off"} ${leaving ? "is-hidden" : ""}`}
        aria-label="Previous room"
        onClick={() => step(-1)}
        disabled={!open}
      >
        <HandArrow flip />
      </button>
      <button
        className={`arrow arrow-right ${leaving ? "is-hidden" : ""}`}
        aria-label={open ? "Next room" : "Open the book"}
        onClick={() => (open ? step(1) : setBookOpen(true))}
      >
        <HandArrow />
      </button>
        </>
      )}

      <footer className="caption">
        {open ? (
          <>
            <div className="room-name">{current.name}</div>
            <div className="room-mood">after Monet, {current.after}</div>
          </>
        ) : (
          !film && <div className="room-mood">tap the cover to open</div>
        )}
      </footer>
    </main>
  );
}
