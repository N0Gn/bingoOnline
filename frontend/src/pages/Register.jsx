import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../lib/api";
import ThemeToggle from "../components/ThemeToggle";

function Input(props) {
  return (
    <input
      {...props}
      className={[
        "w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-slate-900 placeholder:text-slate-400",
        "focus:outline-none focus:ring-2 focus:ring-slate-900/15 focus:border-slate-300 transition",
        "dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:placeholder:text-slate-400",
        "dark:focus:ring-slate-100/10 dark:focus:border-slate-600",
      ].join(" ")}
    />
  );
}

function PrimaryButton({ children, ...props }) {
  return (
    <button
      {...props}
      className={[
        "w-full inline-flex items-center justify-center rounded-xl px-4 py-2.5 font-medium transition",
        "bg-slate-900 text-white hover:bg-slate-800 active:bg-slate-950",
        "dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-white dark:active:bg-slate-200",
        "disabled:opacity-60 disabled:cursor-not-allowed",
      ].join(" ")}
    >
      {children}
    </button>
  );
}

export default function Register() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await api.post("/auth/register", { name, email, password });
      navigate("/login", { replace: true });
    } catch (e2) {
      setError(e2?.response?.data?.error || "Não foi possível cadastrar.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 px-4 py-10">
      <div className="max-w-md mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 tracking-wide">
              BINGO ONLINE
            </p>
            <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">
              Criar conta
            </h1>
          </div>
          <ThemeToggle />
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm p-6 space-y-4"
        >
          {error && (
            <div className="bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-800 dark:text-rose-200 rounded-xl p-3">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-1">
              Nome
            </label>
            <Input value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-1">
              Email
            </label>
            <Input value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-1">
              Senha
            </label>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="new-password"
              placeholder="mínimo 6 caracteres"
            />
          </div>

          <PrimaryButton disabled={loading}>
            {loading ? "Cadastrando..." : "Cadastrar"}
          </PrimaryButton>

          <p className="text-sm text-slate-600 dark:text-slate-300">
            Já tem conta?{" "}
            <Link className="font-medium underline" to="/login">
              Entrar
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
