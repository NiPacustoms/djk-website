import { sessionCookie } from "../_lib.js";

export async function onRequest() {
  const res = new Response(null, { status: 303, headers: { Location: "/admin/login.html?abgemeldet=1" } });
  res.headers.append("Set-Cookie", sessionCookie("", 0));
  return res;
}
