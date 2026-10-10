import { redirect } from "next/navigation";

/** Merged into /users: users are created and given a role there. */
export default function CreateUserPage() {
  redirect("/users");
}
