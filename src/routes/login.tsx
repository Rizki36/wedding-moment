import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "#/components/ui/Button";
import { signIn } from "../server/auth/auth-client";

export const Route = createFileRoute("/login")({ component: LoginPage });

const inputClass =
  "border-b-2 border-(--color-outline-variant) bg-(--color-surface-container-low) rounded px-4 py-3 text-(--color-on-surface) focus:border-(--color-primary) focus:outline-none transition-colors";

function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const { error } = await signIn.username({ username, password });
    if (error) setError(error.message ?? "Login gagal");
    else window.location.href = "/dashboard";
  }

  return (
    <main className="bg-(--color-surface) min-h-screen flex items-center justify-center px-6">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm flex flex-col gap-4"
      >
        <h1 className="font-(--font-display) text-3xl text-(--color-on-surface) text-center mb-2">
          Masuk
        </h1>
        <input
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Username"
          required
          className={inputClass}
        />
        <input
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          type="password"
          placeholder="Kata sandi"
          required
          className={inputClass}
        />
        {error && <p className="text-red-600 text-sm text-center">{error}</p>}
        <Button type="submit" className="mt-2">
          Masuk
        </Button>
      </form>
    </main>
  );
}
