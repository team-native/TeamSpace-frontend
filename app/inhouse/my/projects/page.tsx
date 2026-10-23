"use client";

import MyShell, { MyTitle, ProjectCards } from "@/components/inhouse/MyShell";

export default function MyProjectsPage() {
  return (
    <MyShell>
      <MyTitle eyebrow="PROJECTS" title="참여 프로젝트" sub="참여 중인 프로젝트와 모집 중인 자리를 확인해요." />
      <ProjectCards />
    </MyShell>
  );
}
