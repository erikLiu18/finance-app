export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex min-h-screen w-full max-w-4xl flex-col items-center justify-center py-16 px-8">
        <div className="flex flex-col items-center gap-8 text-center">
          <h1 className="text-5xl font-bold leading-tight tracking-tight text-black dark:text-zinc-50">
            Personal Finance
          </h1>
          <p className="max-w-2xl text-xl leading-8 text-zinc-600 dark:text-zinc-400">
            Track your income, expenses, and budgets. Take control of your financial future.
          </p>
          <div className="mt-8 flex flex-col gap-4 sm:flex-row">
            <button className="flex h-12 items-center justify-center rounded-full bg-black px-8 text-white transition-colors hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200">
              Get Started
            </button>
            <button className="flex h-12 items-center justify-center rounded-full border border-zinc-300 px-8 transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-900">
              Learn More
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
