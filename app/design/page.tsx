import Link from "next/link";
import { SCREENS } from "@/components/design/registry";

export default function DesignIndex() {
  return (
    <main className="wd-index">
      <h1>웹 추가 기능 시안 ({SCREENS.length}화면)</h1>
      {SCREENS.map(([slug, name, features]) => (
        <Link key={slug} href={`/design/${slug}`}>
          {name} <small>{features}</small>
        </Link>
      ))}
    </main>
  );
}
