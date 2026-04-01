import TicTacToe from "./components/TicTacToe";

export default function Home() {
  return (
    <div className="flex flex-col flex-1 items-center justify-center min-h-screen bg-gray-50 dark:bg-[#0d0d0f] font-sans transition-colors duration-300">
      <main className="flex flex-1 w-full flex-col items-center justify-center py-16 px-4">
        <TicTacToe />
      </main>
    </div>
  );
}
