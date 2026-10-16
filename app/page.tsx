import { chatGPTSignInPath, getChatGPTUser } from "./chatgpt-auth";
import { getTeacherSessionId } from "./teacher-auth";
import LoanBoard from "./loan-board";
import TeacherLogin from "./teacher-login";

export const dynamic = "force-dynamic";

export default async function Home() {
  const adminUser = await getChatGPTUser();
  const teacherId = adminUser ? null : await getTeacherSessionId();
  if (!adminUser && !teacherId) return <TeacherLogin adminSignInPath={chatGPTSignInPath("/")} />;
  return <LoanBoard displayName={adminUser?.displayName ?? "Teacher"} />;
}
