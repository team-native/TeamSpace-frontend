"use client";

// 구성원 사진 모음: GET /people 의 photo · avatarBackground 를 한 번 받아 모든 화면에서 같이 쓴다
// 글 · 댓글처럼 서버가 이름만 주는 곳은 이름으로 찾는다 (같은 이름이 둘이면 기본 이미지)
import { useEffect, useState } from "react";
import { api } from "./api";
import type { AuthorProfile } from "./shared";

type Raw = { id: string | number; name?: string; photo?: string | null; avatarBackground?: string | null };
type Page = { items: Raw[]; nextCursor: string | null };
export type PhotoBook = { byId: Map<string, AuthorProfile>; byName: Map<string, AuthorProfile | null> };

let cache: Promise<PhotoBook> | null = null;
let current: PhotoBook | null = null;
const listeners = new Set<(b: PhotoBook) => void>();

async function load(): Promise<PhotoBook> {
  const byId = new Map<string, AuthorProfile>();
  const byName = new Map<string, AuthorProfile | null>();
  let cursor: string | null = null;
  for (let i = 0; i < 20; i++) {
    const page: Page = await api<Page>("/people", { query: { limit: 100, cursor } });
    for (const p of page.items) {
      const prof = { photo: p.photo || "", bg: (p.avatarBackground || "GRAY").toUpperCase() };
      byId.set(String(p.id), prof);
      const name = (p.name || "").trim();
      if (name) byName.set(name, byName.has(name) ? null : prof);
    }
    cursor = page.nextCursor;
    if (!cursor) break;
  }
  return { byId, byName };
}

function fetchBook(): Promise<PhotoBook> {
  if (!cache) {
    cache = load()
      .then((b) => {
        current = b;
        listeners.forEach((f) => f(b));
        return b;
      })
      .catch((e) => {
        cache = null; // 다음에 다시 시도
        throw e;
      });
  }
  return cache;
}

// 내 사진을 바꾼 뒤처럼 새로 받아야 할 때
export function refreshPhotoBook() {
  cache = null;
  void fetchBook().catch(() => undefined);
}

export function usePhotoBook(): PhotoBook | null {
  const [book, setBook] = useState<PhotoBook | null>(current);
  useEffect(() => {
    listeners.add(setBook);
    if (!current) void fetchBook().catch(() => undefined);
    return () => {
      listeners.delete(setBook);
    };
  }, []);
  return book;
}

export function findPhoto(book: PhotoBook | null, { memberId, name }: { memberId?: string; name?: string }): AuthorProfile | null {
  if (!book) return null;
  if (memberId && book.byId.has(memberId)) return book.byId.get(memberId) ?? null;
  const n = name?.trim();
  return (n && book.byName.get(n)) || null;
}
