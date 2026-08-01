export default function Home() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-6 px-6 text-center">
      <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
        Whitecoat Map
      </h1>
      <p className="max-w-xl text-lg opacity-80">
        The hidden curriculum of getting into medical school in Texas, written
        down.
      </p>
      <p className="text-sm uppercase tracking-widest opacity-50">
        In development
      </p>
      <footer className="fixed bottom-6 max-w-xl px-6 text-xs opacity-40">
        An independent, free resource. Not affiliated with the AAMC, AACOM,
        TMDSAS, or any school.
      </footer>
    </main>
  );
}
