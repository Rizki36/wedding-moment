import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "#/components/ui/Button";
import { createPengantinAccountFn } from "../../../server/functions/users";

export const Route = createFileRoute("/_authed/admin/pengantin/new")({
  component: NewPengantinPage,
});

const inputClass =
  "border-b-2 border-(--color-outline-variant) bg-(--color-surface-container-low) rounded px-3 py-2 text-(--color-on-surface) focus:border-(--color-primary) focus:outline-none transition-colors";

function NewPengantinPage() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      const user = await createPengantinAccountFn({
        data: { name, username, password },
      });
      navigate({ to: "/admin/pengantin/$id", params: { id: user.id } });
    } catch {
      setError("Gagal membuat akun");
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-sm mx-auto mt-12 flex flex-col gap-4"
    >
      <h1 className="font-(--font-display) text-2xl text-(--color-on-surface)">
        Buat Akun Pengantin
      </h1>
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Nama"
        required
        className={inputClass}
      />
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
        placeholder="Kata sandi sementara"
        required
        className={inputClass}
      />
      <p className="text-sm text-(--color-on-surface-variant)">
        Beri tahu kredensial ini secara manual kepada pengantin (chat/telepon).
      </p>
      {error && <p className="text-red-600 text-sm">{error}</p>}
      <Button type="submit">Buat Akun</Button>
    </form>
  );
}
