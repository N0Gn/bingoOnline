import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api, getMyHistory } from "../lib/api";
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
    red:
      "bg-rose-50 text-rose-800 border-rose-200 dark:bg-rose-900/25 dark:text-rose-200 dark:border-rose-800",
    blue:
      "bg-sky-50 text-sky-800 border-sky-200 dark:bg-sky-900/25 dark:text-sky-200 dark:border-sky-800",
  };

  return (
    <span
      className={[
        "inline-flex items-center rounded-full border px-2 py-1 text-xs font-semibold",
        tones[tone] || tones.slate,
      ].join(" ")}
    >
      {children}
    </span>
  );
}

function statusTone(status) {
  if (status === "RUNNING") return "green";
  if (status === "WAITING") return "yellow";
  if (status === "FINISHED") return "slate";
  return "slate";
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

function SecondaryButton({ children, className = "", ...props }) {
  return (
    <button
      {...props}
      className={[
        "inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 font-semibold",
        "border border-slate-200 bg-white text-slate-800 hover:bg-slate-50 active:bg-slate-100",
        "dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800 dark:active:bg-slate-950",
        "disabled:cursor-not-allowed disabled:opacity-60 transition",
        className,
      ].join(" ")}
    >
      {children}
    </button>
  );
}

function Input({ className = "", ...props }) {
  return (
    <input
      {...props}
      className={[
        "w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-slate-900 placeholder:text-slate-400",
        "focus:outline-none focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-400 transition",
        "dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:ring-emerald-400/20 dark:focus:border-emerald-500",
        className,
      ].join(" ")}
    />
  );
}

function EmptyState({ title, desc }) {
  return (
    <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-6 text-center dark:border-slate-800 dark:bg-slate-900">
      <p className="font-semibold text-slate-900 dark:text-slate-100">{title}</p>
      <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{desc}</p>
    </div>
  );
}

export default function Lobby() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  

  const isAdmin = useMemo(() => user?.role === "ADMIN", [user]);

  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);

  const [history, setHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(true);

  const [err, setErr] = useState("");
  const [code, setCode] = useState("");

  // admin create
  const [newName, setNewName] = useState("");
  const [newPrize, setNewPrize] = useState("");
  const [creating, setCreating] = useState(false);

  // admin users
  const [users, setUsers] = useState([]);
  const [showUsers, setShowUsers] = useState(false);
  const [loadingUsers, setLoadingUsers] = useState(false);
  

  async function fetchRooms() {
    setErr("");
    setLoading(true);
    try {
      const { data } = await api.get("/rooms");
      setRooms(data.rooms || []);
    } catch {
      setErr("Não foi possível carregar os bingos.");
    } finally {
      setLoading(false);
    }
  }

  async function fetchUsers() {
    setErr("");
    setLoadingUsers(true);
    try {
      const { data } = await api.get("/admin/users");
      setUsers(data.users || []);
    } catch {
      setUsers([]);
      setErr("Não foi possível carregar usuários.");
    } finally {
      setLoadingUsers(false);
    }
  }

  async function handleToggleUsers() {
    const next = !showUsers;
    setShowUsers(next);
    if (next && users.length === 0) await fetchUsers();
  }

  async function fetchHistory() {
    setLoadingHistory(true);
    try {
      const { data } = await getMyHistory();
      setHistory(Array.isArray(data) ? data : data.history || []);
    } catch {
      setHistory([]);
    } finally {
      setLoadingHistory(false);
    }
  }

  useEffect(() => {
    fetchRooms();
    fetchHistory();
  }, []);

  async function handleJoin(e) {
    e.preventDefault();
    setErr("");

    const cleaned = code.trim().toUpperCase();
    if (!cleaned) return setErr("Informe um código.");

    try {
      await api.post(`/rooms/${cleaned}/join`);
      setCode("");
      navigate(`/room/${cleaned}`);
    } catch (error) {
      setErr(
        error?.response?.data?.error ||
          error?.response?.data?.message ||
          "Não foi possível entrar."
      );
    }
  }

  async function handleCreate(e) {
    e.preventDefault();
    setErr("");
    setCreating(true);

    try {
      const { data } = await api.post("/rooms", { name: newName, prize: newPrize || null });
      const createdCode = data?.room?.code;

      setNewName("");
      setNewPrize("");

      await fetchRooms();
      if (createdCode) navigate(`/room/${createdCode}`);
    } catch (error) {
      setErr(
        error?.response?.data?.error ||
          error?.response?.data?.message ||
          "Não foi possível criar."
      );
    } finally {
      setCreating(false);
    }
  }

  async function handleClose(codeToClose) {
    setErr("");
    try {
      await api.post(`/rooms/${codeToClose}/close`);
      await fetchRooms();
      await fetchHistory();
    } catch (error) {
      setErr(
        error?.response?.data?.error ||
          error?.response?.data?.message ||
          "Não foi possível encerrar."
      );
    }

  }
    function handleLogout() {
    logout();
    navigate("/login", { replace: true });
  }

  const runningRooms = useMemo(
    () => rooms.filter((r) => r.status === "WAITING" || r.status === "RUNNING"),
    [rooms]
  );

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
              Lobby
            </h1>
            <p className="truncate text-sm text-slate-600 dark:text-slate-300">
              {user?.name} • {user?.email} {isAdmin ? "• ADMIN" : ""}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <ThemeToggle />
            <SecondaryButton onClick={fetchRooms} className="hidden sm:inline-flex">
              Atualizar
            </SecondaryButton>
            <button
              onClick={handleLogout}
              className="inline-flex items-center justify-center rounded-xl bg-rose-600 px-4 py-2.5 font-semibold text-white hover:bg-rose-500 active:bg-rose-700 transition"
            >
              Sair
            </button>
          </div>
        </div>
      </header>

      {/* Conteúdo */}
      <main className="mx-auto grid max-w-6xl gap-6 px-4 py-6 lg:grid-cols-3">
        {/* Coluna esquerda */}
        <section className="space-y-6 lg:col-span-1">
          <Card title="Entrar com código">
            <form onSubmit={handleJoin} className="space-y-3">
              <Input
                placeholder="Ex: A1B2C3"
                value={code}
                onChange={(e) => setCode(e.target.value)}
              />
              <PrimaryButton>Entrar</PrimaryButton>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Dica: você pode copiar o código do lobby/admin e colar aqui.
              </p>
            </form>
          </Card>

          <Card
            title="Histórico"
            action={
              <SecondaryButton onClick={fetchHistory} className="px-3 py-2 text-sm">
                Atualizar
              </SecondaryButton>
            }
          >
            {loadingHistory ? (
              <p className="text-sm text-slate-600 dark:text-slate-300">Carregando...</p>
            ) : history.length === 0 ? (
              <p className="text-sm text-slate-600 dark:text-slate-300">
                Nenhuma partida finalizada ainda.
              </p>
            ) : (
              <ul className="space-y-2">
                {history.slice(0, 8).map((h) => (
                  <li
                    key={h.roomId}
                    className="rounded-xl border border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-950"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-semibold text-slate-900 dark:text-slate-100">
                        {h.name}{" "}
                        <span className="text-sm text-slate-500 dark:text-slate-400">
                          ({h.code})
                        </span>
                      </p>
                      <Badge tone={h.won ? "green" : "red"}>{h.won ? "Ganhou" : "Perdeu"}</Badge>
                    </div>
                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                      Prêmio: {h.prize || "—"}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </Card>

          {/* Admin */}
          {isAdmin && (
            <Card title="Administração">
              <form onSubmit={handleCreate} className="space-y-3">
                <Input
                  placeholder="Nome do bingo"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                />
                <Input
                  placeholder="Prêmio (opcional)"
                  value={newPrize}
                  onChange={(e) => setNewPrize(e.target.value)}
                />
                <PrimaryButton disabled={creating}>
                  {creating ? "Criando..." : "Criar bingo"}
                </PrimaryButton>
              </form>

              <div className="mt-4 space-y-3">
                <SecondaryButton onClick={handleToggleUsers} className="w-full">
                  {showUsers ? "Ocultar usuários" : "Ver usuários cadastrados"}
                </SecondaryButton>

                {showUsers && (
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950">
                    <div className="mb-2 flex items-center justify-between">
                      <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                        Usuários
                      </p>
                      <SecondaryButton onClick={fetchUsers} className="px-3 py-2 text-sm">
                        Atualizar
                      </SecondaryButton>
                    </div>

                    {loadingUsers ? (
                      <p className="text-sm text-slate-600 dark:text-slate-300">
                        Carregando...
                      </p>
                    ) : users.length === 0 ? (
                      <p className="text-sm text-slate-600 dark:text-slate-300">
                        Nenhum usuário encontrado.
                      </p>
                    ) : (
                      <ul className="max-h-64 space-y-2 overflow-auto pr-1">
                        {users.map((u) => (
                          <li
                            key={u.id}
                            className="rounded-xl border border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-900"
                          >
                            <div className="flex items-center justify-between gap-2">
                              <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                                {u.name}
                              </p>
                              <Badge tone={u.role === "ADMIN" ? "blue" : "slate"}>{u.role}</Badge>
                            </div>
                            <p className="mt-1 text-xs text-slate-600 dark:text-slate-300">
                              {u.email}
                            </p>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}
              </div>

              <div className="mt-4">
                <p className="mb-2 text-sm font-semibold text-slate-900 dark:text-slate-100">
                  Bingos em andamento
                </p>

                {runningRooms.length === 0 ? (
                  <p className="text-sm text-slate-600 dark:text-slate-300">
                    Nenhum bingo em andamento.
                  </p>
                ) : (
                  <ul className="space-y-2">
                    {runningRooms.slice(0, 6).map((r) => (
                      <li key={r.id} className="rounded-xl border border-slate-200 p-3 dark:border-slate-800">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <p className="truncate font-semibold text-slate-900 dark:text-slate-100">
                              {r.name}{" "}
                              <span className="text-sm text-slate-500 dark:text-slate-400">
                                ({r.code})
                              </span>
                            </p>
                            <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                              Jogadores:{" "}
                              <span className="font-semibold text-slate-900 dark:text-slate-100">
                                {r.playersCount}
                              </span>
                            </p>
                          </div>
                          <Badge tone={statusTone(r.status)}>{r.status}</Badge>
                        </div>

                        <button
                          onClick={() => handleClose(r.code)}
                          className="mt-3 w-full rounded-xl border border-rose-200 bg-rose-50 px-4 py-2.5 font-semibold text-rose-700 hover:bg-rose-100 active:bg-rose-200 transition
                          dark:border-rose-900 dark:bg-rose-900/20 dark:text-rose-200 dark:hover:bg-rose-900/30"
                        >
                          Encerrar bingo
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </Card>
          )}

          {/* Erro global - com contraste bom */}
          {err && (
            <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-rose-900 shadow-sm dark:border-rose-900 dark:bg-rose-900/20 dark:text-rose-100">
              <p className="font-bold">Opa!</p>
              <p className="mt-1 text-sm opacity-90">{err}</p>
            </div>
          )}
        </section>

        {/* Coluna direita */}
        <section className="lg:col-span-2">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Bingos</h2>
            <SecondaryButton onClick={fetchRooms}>Atualizar</SecondaryButton>
          </div>

          {loading ? (
            <EmptyState title="Carregando..." desc="Buscando bingos no servidor." />
          ) : rooms.length === 0 ? (
            <EmptyState title="Nenhum bingo ainda" desc="Crie um bingo (admin) ou entre com um código." />
          ) : (
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <ul className="divide-y divide-slate-100 dark:divide-slate-800">
                {rooms.map((r) => {
                  const winnerName = isAdmin ? r.winner?.user?.name || null : null;

                  return (
                    <li key={r.id} className="p-5 flex items-center justify-between gap-4">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="font-semibold text-slate-900 dark:text-slate-100">
                            {r.name}{" "}
                            <span className="text-sm text-slate-500 dark:text-slate-400">
                              ({r.code})
                            </span>
                          </p>
                          <Badge tone={statusTone(r.status)}>{r.status}</Badge>
                          {r.isParticipating && <Badge tone="green">Participando</Badge>}
                        </div>

                        <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                          Jogadores:{" "}
                          <span className="font-semibold text-slate-900 dark:text-slate-100">
                            {r.playersCount}
                          </span>
                          {isAdmin && r.prize ? ` • Prêmio: ${r.prize}` : ""}
                          {winnerName ? ` • Vencedor: ${winnerName}` : ""}
                        </p>
                      </div>

                      <div className="flex shrink-0 gap-2">
                        {r.isParticipating ? (
                          <button
                            onClick={() => navigate(`/room/${r.code}`)}
                            className="rounded-xl bg-emerald-600 px-4 py-2.5 font-semibold text-white hover:bg-emerald-500 active:bg-emerald-700 transition"
                          >
                            Abrir
                          </button>
                        ) : (
                          <button
                            onClick={() => setCode(r.code)}
                            className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 font-semibold text-slate-800 hover:bg-slate-50 active:bg-slate-100 transition
                            dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800 dark:active:bg-slate-950"
                          >
                            Usar código
                          </button>
                        )}

                        {isAdmin && r.status !== "FINISHED" && (
                          <button
                            onClick={() => handleClose(r.code)}
                            className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-2.5 font-semibold text-rose-700 hover:bg-rose-100 active:bg-rose-200 transition
                            dark:border-rose-900 dark:bg-rose-900/20 dark:text-rose-200 dark:hover:bg-rose-900/30"
                            title="Encerrar este bingo"
                          >
                            Encerrar
                          </button>
                        )}
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}

          <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">

          </p>
        </section>
      </main>
    </div>
  );
}
