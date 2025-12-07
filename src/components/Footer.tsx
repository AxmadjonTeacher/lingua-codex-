export function Footer() {
  return (
    <footer className="py-4 text-center text-xs text-muted-foreground">
      © 2025 Lingua Codex — Created by{" "}
      <a
        href="https://t.me/YodgorovAxmadjon"
        target="_blank"
        rel="noopener noreferrer"
        className="underline hover:text-foreground transition-colors"
      >
        Yodgorov Axmadjon
      </a>{" "}
      |{" "}
      <a
        href="https://alxorazmiymaktabi.vercel.app"
        target="_blank"
        rel="noopener noreferrer"
        className="hover:text-foreground transition-colors inline-flex items-center gap-1 align-middle"
      >
        Al-Xorazmiy School
        <img src="/school_logo.png" alt="Logo" className="h-4 w-auto object-contain" />
      </a>
    </footer>
  );
}
