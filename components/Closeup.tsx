"use client";

import { useEffect, useRef, useState } from "react";
import { addEntry, deleteEntry, listEntries, updateEntry, type Entry } from "@/lib/journal";
import type { Kind, Spot } from "@/lib/spots";
import Crumple from "./Crumple";

const day = (ms: number) => new Date(ms).toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" }).toLowerCase().replace(",", "");
const time = (ms: number) => new Date(ms).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" }).toLowerCase();

const NOTE_COLORS: Record<Kind, string[]> = {
  cork: ["#fff3b5", "#fffdf4", "#dbe8fb", "#fadbe2", "#dff0d4"],
  mirror: ["#fff3b5", "#fadbe2", "#dbe8fb", "#dff0d4"],
  fridge: ["#fffdf4", "#fff3b5", "#fadbe2", "#dbe8fb"],
  diary: ["#fffdf4"],
};
const MAGNETS = ["#f6a99a", "#9db8ff", "#f0cf6e", "#a9d39a"];

const tilt = (i: number) => `${(((i * 53) % 7) - 3) * 1.1}deg`;

/** What holds a note to the surface: a push pin, a strip of tape or a fridge magnet. */
function Holder({ kind, i }: { kind: Kind; i: number }) {
  if (kind === "cork")
    return (
      <svg className="cu-pin" viewBox="0 0 48 56" aria-hidden="true">
        <path className="pin-needle" d="M24 33 C 24.3 39, 23.8 44, 24.2 50" />
        <path
          className="pin-body"
          d="M15 31 C 18 29, 30 29, 33 31 C 31 26, 29 24, 29.5 19 C 33 17.5, 35 15, 34.5 11.5 C 30 9, 18 9, 13.5 11.5 C 13 15, 15 17.5, 18.5 19 C 19 24, 17 26, 15 31 Z"
          style={{ fill: MAGNETS[i % MAGNETS.length] }}
        />
        <path className="pin-shine" d="M17.5 13.5 C 19 12.6, 21.5 12.2, 23.5 12.3" />
      </svg>
    );
  if (kind === "mirror") return <span className="cu-tape" style={{ rotate: `${((i * 31) % 5) * 3 - 6}deg` }} />;
  return <span className="cu-magnet" style={{ background: MAGNETS[i % MAGNETS.length] }} />;
}

function Diary({
  entries,
  current,
  draft,
  spot,
  error,
  saved,
  page,
  area,
  onOpen,
  onDraft,
  onSave,
  onTear,
}: {
  entries: Entry[];
  current: string | null;
  draft: string;
  spot: Spot;
  error: string;
  saved: boolean;
  page: React.RefObject<HTMLDivElement | null>;
  area: React.RefObject<HTMLTextAreaElement | null>;
  onOpen: (e: Entry | null) => void;
  onDraft: (s: string) => void;
  onSave: () => void;
  onTear: () => void;
}) {
  const editing = entries.find((e) => e.id === current);
  return (
    <div className="cu-diary">
      <div className="cu-page cu-left">
        <div className="cu-page-head">pages</div>
        <button className={`cu-index ${current === null ? "on" : ""}`} onClick={() => onOpen(null)}>
          <span className="cu-index-day">+ a fresh page</span>
        </button>
        {entries.map((e) => (
          <button key={e.id} className={`cu-index ${current === e.id ? "on" : ""}`} onClick={() => onOpen(e)}>
            <span className="cu-index-day">
              {day(e.createdAt)} <em>{time(e.createdAt)}</em>
            </span>
            <span className="cu-index-text">{e.text.split("\n")[0]}</span>
          </button>
        ))}
        {entries.length === 0 && <p className="cu-empty-small">{spot.empty}</p>}
      </div>
      <div className="cu-spine" aria-hidden="true" />
      <div className="cu-page cu-right" ref={page}>
        <div className="cu-page-head">{editing ? `${day(editing.createdAt)} · ${time(editing.createdAt)}` : day(Date.now())}</div>
        <textarea
          ref={area}
          value={draft}
          placeholder={spot.prompt}
          onChange={(e) => onDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
              e.preventDefault();
              onSave();
            }
          }}
        />
        <div className="cu-actions">
          {current && (
            <button className="cu-link" onClick={onTear}>
              tear out
            </button>
          )}
          <span className="cu-spacer" />
          {error && <span className="cu-error">{error}</span>}
          {saved && !error && <span className="cu-saved">saved</span>}
          <button className="cu-save" onClick={onSave}>
            {current ? "save changes" : spot.save}
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * Close-up of a journal spot: the camera has moved in on it, and here it is, big. Boards (cork,
 * mirror, fridge) show your notes stuck on them; the diary opens as a two-page spread.
 */
export default function Closeup({ room, spotKey, spot, onClose }: { room: string; spotKey: string; spot: Spot; onClose: () => void }) {
  const kind = spot.kind;
  const [entries, setEntries] = useState<Entry[]>([]);
  // undefined = just looking at the board, null = writing a new note, string = an existing note
  const [current, setCurrent] = useState<string | null | undefined>(kind === "diary" ? null : undefined);
  const [draft, setDraft] = useState("");
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);
  const [fresh, setFresh] = useState<string | null>(null);
  const [crumple, setCrumple] = useState<{ rect: DOMRect; text: string } | null>(null);
  const [leaving, setLeaving] = useState(false);
  const area = useRef<HTMLTextAreaElement>(null);
  const note = useRef<HTMLDivElement>(null);
  const page = useRef<HTMLDivElement>(null);

  useEffect(() => {
    listEntries(room, spotKey).then(setEntries);
  }, [room, spotKey]);

  const focusSoon = () => setTimeout(() => area.current?.focus(), 80);
  useEffect(() => {
    if (kind === "diary") focusSoon();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const close = () => {
    setLeaving(true);
    setTimeout(onClose, 240);
  };

  const open = (e: Entry | null) => {
    setCurrent(e?.id ?? null);
    setDraft(e?.text ?? "");
    setError("");
    setSaved(false);
    focusSoon();
  };

  const putBack = () => {
    if (kind === "diary") return;
    setCurrent(undefined);
    setError("");
  };

  useEffect(() => {
    const onKey = (ev: KeyboardEvent) => {
      if (ev.key !== "Escape") return;
      if (kind !== "diary" && current !== undefined) putBack();
      else close();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [current]);

  const save = async () => {
    const text = draft.trim();
    if (!text) {
      setError("write something first");
      area.current?.focus();
      return;
    }
    if (current) {
      await updateEntry(current, text);
      setEntries((list) => list.map((e) => (e.id === current ? { ...e, text } : e)));
      if (kind === "diary") setSaved(true);
      else putBack();
    } else {
      const e = await addEntry(room, spotKey, text);
      setEntries((list) => [e, ...list]);
      setDraft("");
      if (kind === "diary") open(e);
      else {
        setFresh(e.id);
        putBack();
      }
    }
  };

  const tear = async () => {
    const el = kind === "diary" ? page.current : note.current;
    if (!current || !el) return;
    setCrumple({ rect: el.getBoundingClientRect(), text: draft });
    await deleteEntry(current);
    setEntries((list) => list.filter((e) => e.id !== current));
    if (kind === "diary") open(null);
    else setCurrent(undefined);
  };

  const editing = typeof current === "string" ? entries.find((e) => e.id === current) : undefined;
  const editIndex = editing ? entries.indexOf(editing) : 0;
  const colors = NOTE_COLORS[kind];

  return (
    <div className={`cu cu-k-${kind} ${leaving ? "leaving" : ""}`} onPointerDown={(e) => e.target === e.currentTarget && close()}>
      <div className="cu-title">{spot.title}</div>
      <button className="cu-x" aria-label="Close" onClick={close}>
        <svg viewBox="0 0 40 40" width="32" height="32" aria-hidden="true">
          <path d="M10 10 C 18 17, 24 24, 31 30" />
          <path d="M30 9 C 23 17, 17 23, 9 31" />
        </svg>
      </button>

      {kind === "diary" ? (
        <Diary
          entries={entries}
          current={current ?? null}
          draft={draft}
          spot={spot}
          error={error}
          saved={saved}
          page={page}
          area={area}
          onOpen={open}
          onDraft={(s) => {
            setDraft(s);
            if (error) setError("");
            if (saved) setSaved(false);
          }}
          onSave={save}
          onTear={tear}
        />
      ) : (
        <div className="cu-surface">
          {kind === "fridge" && <span className="cu-handle" aria-hidden="true" />}
          {kind === "mirror" && (
            <svg className="cu-shine" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
              <path d="M8 40 L30 12 M12 52 L44 14 M70 92 L94 62" />
            </svg>
          )}
          <div className="cu-notes">
            <button className="cu-note cu-add" style={{ rotate: "-2deg" }} onClick={() => open(null)} aria-label="Write a new note">
              <svg viewBox="0 0 40 40" width="30" height="30" aria-hidden="true">
                <path d="M20 8 C 20.5 16, 19.5 24, 20 32" />
                <path d="M8 20.5 C 16 19.5, 24 20.5, 32 20" />
              </svg>
            </button>
            {entries.map((e, i) => (
              <button
                key={e.id}
                className={`cu-note ${fresh === e.id ? "fresh" : ""} ${current === e.id ? "lifted" : ""}`}
                style={{ rotate: tilt(i + 1), background: colors[i % colors.length] }}
                onClick={() => open(e)}
              >
                <Holder kind={kind} i={i} />
                <span className="cu-note-day">{day(e.createdAt)}</span>
                <span className="cu-note-time">{time(e.createdAt)}</span>
                <span className="cu-note-text">{e.text}</span>
              </button>
            ))}
          </div>
          {entries.length === 0 && <p className="cu-empty">{spot.empty}</p>}
        </div>
      )}

      {kind !== "diary" && current !== undefined && (
        <div className="cu-editor" onPointerDown={(e) => e.target === e.currentTarget && putBack()}>
          <div ref={note} className="cu-note cu-big" style={{ background: editing ? colors[editIndex % colors.length] : colors[0] }}>
            <Holder kind={kind} i={editIndex} />
            <div className="cu-big-when">{editing ? `${day(editing.createdAt)} · ${time(editing.createdAt)}` : day(Date.now())}</div>
            <textarea
              ref={area}
              value={draft}
              placeholder={spot.prompt}
              onChange={(e) => {
                setDraft(e.target.value);
                if (error) setError("");
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                  e.preventDefault();
                  save();
                }
              }}
            />
            <div className="cu-actions">
              {current && (
                <button className="cu-link" onClick={tear}>
                  tear out
                </button>
              )}
              <span className="cu-spacer" />
              {error && <span className="cu-error">{error}</span>}
              <button className="cu-save" onClick={save}>
                {current ? "save" : spot.save}
              </button>
            </div>
          </div>
        </div>
      )}

      {crumple && <Crumple rect={crumple.rect} text={crumple.text} onDone={() => setCrumple(null)} />}
    </div>
  );
}
