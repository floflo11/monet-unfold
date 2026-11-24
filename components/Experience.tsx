"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { ContactShadows } from "@react-three/drei";
import Book from "./Book";
import Closeup from "./Closeup";
import { SPOTS } from "@/lib/spots";
import { HandArrow, HandUnderline } from "./Hand";
import { N, logicalOf, physicalOf } from "@/lib/fold";
import { ROOMS } from "@/lib/rooms";
import { book } from "@/lib/store";
import { buildTextures, type BookTextures } from "@/lib/textures";

const FONT = "Caveat";

export default function Experience() {
  const [tex, setTex] = useState<BookTextures | null>(null);
  const [room, setRoom] = useState(0); // logical index
  const [open, setOpen] = useState(false);
  const [writing, setWriting] = useState<{ room: string; spot: string } | null>(null);
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
      if (alive) setTex(buildTextures(`${FONT}, cursive`));
    })();
    return () => {
      alive = false;
    };
  }, []);

  const goTo = useCallback((logical: number) => {
    const li = Math.max(0, Math.min(N - 1, logical));
    book.target = physicalOf(li);
    setRoom(li);
  }, []);

  const setBookOpen = useCallback((v: boolean) => {
    book.openTarget = v ? 1 : 0;
    setOpen(v);
  }, []);

  useEffect(() => {
    const onKey = (ev: KeyboardEvent) => {
      if (writing) return; // the journal sheet handles its own keys
      if (ev.key === "ArrowRight") {
        if (!open) setBookOpen(true);
        else goTo(room + 1);
      } else if (ev.key === "ArrowLeft") {
        if (open) {
          if (room === 0) setBookOpen(false);
          else goTo(room - 1);
        }
      } else if (ev.key === "Enter" || ev.key === " ") {
        setBookOpen(!open);
      } else if (ev.key === "Escape") setBookOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, room, goTo, setBookOpen, writing]);

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
    book.f = Math.max(0, Math.min(N - 1, book.f + dx / 170));
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
    goTo(logicalOf(Math.round(book.f)));
  };

  const current = ROOMS[room];

  return (
    <main className="stage">
      <header className="topbar">
        <div className="wordmark">
          unfold
          <HandUnderline />
        </div>
      </header>

      <div className="canvas-wrap" onPointerDown={onDown} onPointerMove={onMove} onPointerUp={onUp} onPointerCancel={onUp} onDoubleClick={() => setBookOpen(!open)}>
        {tex && (
          <Canvas orthographic flat linear dpr={[1, 2]} camera={{ position: [0, 2, 10], zoom: 200, near: 0.1, far: 100 }} gl={{ alpha: true, antialias: true }}>
            <Book
              tex={tex}
              onSpot={(li, spot) => {
                // move in on the spot, then open its close-up
                book.zoomTarget = 1;
                setTimeout(() => setWriting({ room: ROOMS[li].name, spot }), 380);
              }}
            />
            <ContactShadows position={[0, -0.04, 0]} scale={5} resolution={512} far={1.4} blur={2.4} opacity={0.32} color="#2a2350" frames={Infinity} />
          </Canvas>
        )}
        {!tex && <div className="loading">sharpening pencils…</div>}
      </div>

      <button
        className={`arrow arrow-left ${open ? "" : "is-off"} ${writing ? "is-hidden" : ""}`}
        aria-label={room === 0 ? "Close the book" : "Previous room"}
        onClick={() => (room === 0 ? setBookOpen(false) : goTo(room - 1))}
        disabled={!open}
      >
        <HandArrow flip />
      </button>
      <button
        className={`arrow arrow-right ${!open || room < N - 1 ? "" : "is-off"}`}
        aria-label={open ? "Next room" : "Open the book"}
        onClick={() => (open ? goTo(room + 1) : setBookOpen(true))}
        disabled={open && room === N - 1}
      >
        <HandArrow />
      </button>

      <footer className="caption">
        {open ? (
          <>
            <div className="room-name">{current.name}</div>
          </>
        ) : (
          <div className="room-mood">tap the cover to open</div>
        )}
      </footer>
      {writing && SPOTS[writing.room]?.[writing.spot] && (
        <Closeup
          room={writing.room}
          spotKey={writing.spot}
          spot={SPOTS[writing.room][writing.spot]}
          onClose={() => {
            setWriting(null);
            book.zoomTarget = 0;
          }}
        />
      )}
    </main>
  );
}
