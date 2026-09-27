import Link from "next/link";

export default function NotFound() {
  return (
    <main id="main" className="grid min-h-svh place-items-center px-5 text-center">
      <div>
        <p className="label">404</p>
        <h1 className="display mt-4 text-[clamp(48px,10vw,140px)]">LOST IN SPACE.</h1>
        <Link href="/" className="label mt-8 inline-block hover:text-[var(--color-accent)]">
          ← BACK HOME
        </Link>
      </div>
    </main>
  );
}
