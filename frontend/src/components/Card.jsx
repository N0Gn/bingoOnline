export default function Card({ children }) {
  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-4 shadow-sm">
      {children}
    </div>
  );
}
