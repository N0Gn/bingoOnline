import { useState } from "react";
import Layout from "../components/Layout";
import Card from "../components/Card";

export default function Home({ onEnter }) {
  const [nickname, setNickname] = useState("");
  const [roomCode, setRoomCode] = useState("");

  return (
    <Layout title="Entrar">
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <h1 className="text-xl font-semibold">Entrar na sala</h1>
          <p className="mt-1 text-sm text-zinc-400">
            Informe seu nickname e o código da sala.
          </p>

          <div className="mt-4 grid gap-3">
            <input
              className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 outline-none"
              placeholder="Nickname"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
            />
            <input
              className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 outline-none uppercase tracking-widest"
              placeholder="CÓDIGO (ex: A1B2C3)"
              value={roomCode}
              onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
            />
            <button
              className="rounded-xl bg-emerald-500 px-4 py-2 font-semibold text-zinc-950 disabled:opacity-50"
              disabled={!nickname || roomCode.length < 4}
              onClick={() => onEnter({ nickname, roomCode })}
            >
              Entrar
            </button>
          </div>
        </Card>

        <Card>
          <h2 className="text-xl font-semibold">Admin</h2>
          <p className="mt-1 text-sm text-zinc-400">
            Para testar rapidamente, você pode entrar como admin usando um código de sala.
          </p>
          <p className="mt-4 text-sm text-zinc-400">
            (Depois a gente cria tela de criar sala e autenticação.)
          </p>
        </Card>
      </div>
    </Layout>
  );
}
