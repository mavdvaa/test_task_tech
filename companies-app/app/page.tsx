import Link from "next/link";

export default function Home() {
  return (
    <main style={{ padding: 30 }}>
      <h1>Companies App</h1>

      <Link href="/companies">Открыть список компаний</Link>
    </main>
  );
}