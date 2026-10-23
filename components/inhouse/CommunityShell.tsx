"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { COMMENTS, POSTS, loadLocal, saveLocal, type Comment, type Post } from "@/lib/demo";
import WdPage from "./WdPage";

const TABS: [string, string][] = [
  ["게시판", "/inhouse/community"],
  ["문의·건의", "/inhouse/community/inquiry"],
  ["공지", "/inhouse/community/notices"],
];

export default function CommunityShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const current = pathname.startsWith("/inhouse/community/inquiry")
    ? TABS[1][1]
    : pathname.startsWith("/inhouse/community/notices")
      ? TABS[2][1]
      : TABS[0][1];
  return (
    <WdPage>
      <div className="wd-wrap wd-pb">
        <nav className="wd-row pf-community-tabs" aria-label="커뮤니티">
          {TABS.map(([label, href]) => (
            <Link key={href} href={href} aria-current={current === href ? "page" : undefined} className={current === href ? "on" : ""}>
              {label}
            </Link>
          ))}
        </nav>
        {children}
      </div>
    </WdPage>
  );
}

// 게시판 데모 저장소: 새 글·댓글·공감·삭제를 브라우저에 보관
const POSTS_KEY = "native-inhouse-posts";
const COMMENTS_KEY = "native-inhouse-comments";
const LIKES_KEY = "native-inhouse-likes";
const DELETED_KEY = "native-inhouse-deleted-posts";

export const board = {
  posts: (): Post[] => {
    const deleted = loadLocal<string[]>(DELETED_KEY, []);
    return [...loadLocal<Post[]>(POSTS_KEY, []), ...POSTS].filter((p) => !deleted.includes(p.id));
  },
  addPost: (p: Post) => saveLocal(POSTS_KEY, [p, ...loadLocal<Post[]>(POSTS_KEY, [])]),
  updatePost: (p: Post) => {
    const local = loadLocal<Post[]>(POSTS_KEY, []);
    saveLocal(POSTS_KEY, local.some((x) => x.id === p.id) ? local.map((x) => (x.id === p.id ? p : x)) : [p, ...local]);
  },
  deletePost: (id: string) => saveLocal(DELETED_KEY, [...loadLocal<string[]>(DELETED_KEY, []), id]),
  comments: (postId: string): Comment[] =>
    [...COMMENTS, ...loadLocal<Comment[]>(COMMENTS_KEY, [])].filter((c) => c.postId === postId),
  addComment: (c: Comment) => saveLocal(COMMENTS_KEY, [...loadLocal<Comment[]>(COMMENTS_KEY, []), c]),
  liked: (): string[] => loadLocal<string[]>(LIKES_KEY, []),
  toggleLike: (id: string) => {
    const likes = loadLocal<string[]>(LIKES_KEY, []);
    const next = likes.includes(id) ? likes.filter((x) => x !== id) : [...likes, id];
    saveLocal(LIKES_KEY, next);
    return next;
  },
};
