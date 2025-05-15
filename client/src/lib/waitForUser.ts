import { useAuth } from "@/hooks/useAuth";

export async function waitForUser(
  getUser: () => User | null,
  retries: number = 10,
  delay: number = 100
): Promise<User | null> {
  let user = getUser();

  if (!user) {
    console.log("Waiting for user to be authenticated...");
  }

  for (let i = 0; i < retries; i++) {
    // Wait for `loading` to be false before checking the user
    if (!user) {
      console.log(`User is null, retrying... Attempt ${i + 1}`);
      await new Promise((res) => setTimeout(res, delay));  // Wait before retry
    }

    // Update user after retry
    user = getUser();
    if (user) return user;
  }

  console.warn("User is still null after waiting");
  return null;
}
