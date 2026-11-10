import { redirect } from "next/navigation";

// 서버가 주는 프로필 주소(/inhouse/people/member-XX)는 팀원 화면에서 그 사람 상세를 연다
export default async function PersonPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  redirect(`/inhouse/team?member=${encodeURIComponent(id)}`);
}
