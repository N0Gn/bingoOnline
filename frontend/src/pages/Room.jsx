import { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { api } from "../lib/api";
import { useAuth } from "../context/AuthContext";
import ThemeToggle from "../components/ThemeToggle";

function Card({ title, action, children }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
      {(title || action) && (
        <div className="flex items-center justify-between gap-3 border-b border-slate-100 px-5 py-4 dark:border-slate-800">
          <h2 className="font-semibold text-slate-900 dark:text-slate-100">{title}</h2>
          {action}
        </div>
      )}
      <div className="p-5">{children}</div>
    </div>
  );
}

function Badge({ children, tone = "slate" }) {
  const tones = {
    slate:
      "bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:border-slate-700",
    green:
      "bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-900/25 dark:text-emerald-200 dark:border-emerald-800",
    yellow:
      "bg-amber-50 text-amber-900 border-amber-200 dark:bg-amber-900/25 dark:text-amber-200 dark:border-amber-800",
  };

  return (
    <span className={`inline-flex items-center px-2 py-1 text-xs font-semibold border rounded-full ${tones[tone] || tones.slate}`}>
      {children}
    </span>
  );
}

function SecondaryButton({ children, className = "", ...props }) {
  return (
    <button
      {...props}
      className={[
        "inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 font-semibold",
        "border border-slate-200 bg-white text-slate-800 hover:bg-slate-50 active:bg-slate-100",
        "dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800 dark:active:bg-slate-950",
        "transition",
        className,
      ].join(" ")}
    >
      {children}
    </button>
  );
}

function PrimaryButton({ children, className = "", ...props }) {
  return (
    <button
      {...props}
      className={[
        "inline-flex w-full items-center justify-center gap-2 rounded-xl px-4 py-2.5 font-semibold",
        "bg-emerald-600 text-white hover:bg-emerald-500 active:bg-emerald-700",
        "disabled:cursor-not-allowed disabled:opacity-60 transition",
        className,
      ].join(" ")}
    >
      {children}
    </button>
  );
}

function statusTone(status) {
  if (status === "RUNNING") return "green";
  if (status === "WAITING") return "yellow";
  return "slate";
}

export default function Room() {
  const { code } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const roomCode = (code || "").toUpperCase();
  const title = useMemo(() => `Sala ${roomCode}`, [roomCode]);

  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const [room, setRoom] = useState(null);
  const [card, setCard] = useState(null);
  const [draws, setDraws] = useState([]);

  const isAdmin = user?.role === "ADMIN";

  async function loadRoom() {
    setErr("");
    setLoading(true);

    try {
      const { data } = await api.get(`/rooms/${roomCode}`);
      setRoom(data.room || null);
      setCard(data.card || null);
      setDraws(data.draws || []);

      // se não tem card, garante entrada e recarrega
      if (!data.card) {
        await api.post(`/rooms/${roomCode}/join`);
        const { data: data2 } = await api.get(`/rooms/${roomCode}`);
        setRoom(data2.room || null);
        setCard(data2.card || null);
        setDraws(data2.draws || []);
      }
    } catch (error) {
      setErr(
        error?.response?.data?.error ||
          error?.response?.data?.message ||
          "Não foi possível carregar a sala."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!roomCode) return;
    loadRoom();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roomCode]);

  async function toggleCell(position) {
    if (!card) return;

    const current = card.cells.find((c) => c.position === position);
    if (!current) return;

    const nextMarked = !current.marked;

    // update otimista
    setCard((prev) => ({
      ...prev,
      cells: prev.cells.map((c) =>
        c.position === position ? { ...c, marked: nextMarked } : c
      ),
    }));

    try {
      await api.post(`/rooms/${roomCode}/mark`, { position, marked: nextMarked });
    } catch (error) {
      // rollback
      setCard((prev) => ({
        ...prev,
        cells: prev.cells.map((c) =>
          c.position === position ? { ...c, marked: !nextMarked } : c
        ),
      }));

      setErr(error?.response?.data?.message || "Falha ao marcar célula");
    }
  }

  async function handleDraw() {
    setErr("");
    try {
      await api.post(`/rooms/${roomCode}/draw`);
      await loadRoom();
    } catch (error) {
      setErr(
        error?.response?.data?.error ||
          error?.response?.data?.message ||
          "Não foi possível sortear"
      );
    }
  }

  async function handleClaim() {
    setErr("");
    try {
      await api.post(`/rooms/${roomCode}/claim`);
      alert("BINGO válido! 🎉");
      await loadRoom();
    } catch (error) {
      alert(error?.response?.data?.message || "Bingo inválido");
      await loadRoom();
    }
  }

  const lastDraw = draws?.[0]?.number ?? null;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      {/* Topbar */}
      <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/80 backdrop-blur dark:border-slate-800 dark:bg-slate-950/70">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4">
          <div className="min-w-0">
            <p className="text-xs font-bold tracking-wide text-emerald-700 dark:text-emerald-300">
              BINGO ONLINE
            </p>
            <h1 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
              {title}
            </h1>
            <p className="truncate text-sm text-slate-600 dark:text-slate-300">
              {room?.name} • Código: {room?.code} • {user?.name}{" "}
              {isAdmin ? "• ADMIN" : ""}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <ThemeToggle />
            <SecondaryButton onClick={loadRoom} className="hidden sm:inline-flex">
              Atualizar
            </SecondaryButton>
            <SecondaryButton onClick={() => navigate("/")}>Voltar</SecondaryButton>
          </div>
        </div>
      </header>

      <main className="mx-auto grid max-w-6xl gap-6 px-4 py-6 md:grid-cols-3">
        {/* CARTELA */}
        <section className="md:col-span-2">
          <Card
            title="Sua cartela 5x5"
            action={
              <Badge tone={statusTone(room?.status)}>
                {room?.status || "—"}
              </Badge>
            }
          >
            {loading ? (
              <p className="text-sm text-slate-600 dark:text-slate-300">Carregando sala...</p>
            ) : err ? (
              <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-rose-900 dark:border-rose-900 dark:bg-rose-900/20 dark:text-rose-100">
                <p className="font-bold">Opa!</p>
                <p className="mt-1 text-sm opacity-90">{err}</p>
                <div className="mt-3 flex gap-2">
                  <SecondaryButton onClick={loadRoom} className="px-3 py-2 text-sm">
                    Tentar novamente
                  </SecondaryButton>
                  <SecondaryButton onClick={() => navigate("/")} className="px-3 py-2 text-sm">
                    Voltar
                  </SecondaryButton>
                </div>
              </div>
            ) : (
              <>
                <p className="text-sm text-slate-600 dark:text-slate-300">
                  Clique para marcar.
                </p>

                <div className="mt-4 grid grid-cols-5 gap-2">
                  {(card?.cells || [])
                    .slice()
                    .sort((a, b) => a.position - b.position)
                    .map((c) => (
            <button
                key={c.position}
                onClick={() => toggleCell(c.position)}
                  className={[
                    "aspect-square rounded-2xl border px-2 py-2 font-bold",
                    "transition select-none",

            c.marked
           ? [
                // ✅ Marcado (inclui dark!)
                "bg-emerald-600 text-white border-emerald-700 shadow-sm",
                "dark:bg-emerald-500 dark:border-emerald-400 dark:text-slate-950",
              ].join(" ")
            : [
              // ✅ Não marcado (inclui dark!)
              "bg-white text-slate-900 border-slate-200 hover:bg-slate-50 active:bg-slate-100",
              "dark:bg-slate-950 dark:text-slate-100 dark:border-slate-800 dark:hover:bg-slate-900 dark:active:bg-slate-800",
              ].join(" "),
          ].join(" ")}
>
  {c.value}
</button>

                    ))}
                </div>

                <PrimaryButton
                  className="mt-4"
                  onClick={handleClaim}
                >
                  BINGO!
                </PrimaryButton>

                <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                  Para ganhar: complete uma linha horizontal, vertical ou diagonal com números já sorteados.
                </p>
              </>
            )}
          </Card>
        </section>

        {/* INFO + ADMIN */}
        <section className="space-y-6">
          <Card title="Info da sala">
            <div className="space-y-2 text-sm">
              <p className="text-slate-700 dark:text-slate-300">
                Jogadores:{" "}
                <span className="font-semibold text-slate-900 dark:text-slate-100">
                  {room?.playersCount ?? "—"}
                </span>
              </p>
              <p className="text-slate-700 dark:text-slate-300">
                Prêmio:{" "}
                <span className="font-semibold text-slate-900 dark:text-slate-100">
                  {room?.prize || "—"}
                </span>
              </p>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
                <p className="text-slate-700 dark:text-slate-300">
                  Último sorteio:{" "}
                  <span className="font-bold text-emerald-700 dark:text-emerald-300">
                    {lastDraw ?? "—"}
                  </span>
                </p>

                <div className="mt-3 flex flex-wrap gap-2">
                  {draws.slice(0, 24).map((d, idx) => (
                    <span
                      key={`${d.number}-${idx}`}
                      className="rounded-full border border-slate-200 bg-slate-50 px-2 py-1 text-xs font-semibold text-slate-700
                      dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200"
                    >
                      {d.number}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </Card>

          {isAdmin && (
            <Card title="Admin">
              <PrimaryButton onClick={handleDraw}>Sortear número</PrimaryButton>
              <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
               
              </p>
            </Card>
          )}
        </section>
      </main>
    </div>
  );
}
