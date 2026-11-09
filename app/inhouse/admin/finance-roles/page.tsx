import { redirect } from "next/navigation";

// 재정 권한(FA)은 멤버 권한 화면에서 다른 역할과 같이 관리한다
export default function AdminFinanceRoles() {
  redirect("/inhouse/admin/members");
}
