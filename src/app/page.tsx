import { Settings, GraduationCap, School } from "lucide-react";
import Link from "next/link";
export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <div className="grid grid-cols-3 gap-8">
        <Link
          href="/login/"
          className="bg-indigo-500 text-white rounded-lg p-8 shadow-lg transition duration-500 ease-in-out transform hover:scale-105 flex flex-col items-center justify-center"
        >

          <Settings size={64} />
          <h2 className="text-2xl font-bold mt-4">Admin</h2>
        </Link>

        <Link
          href="/result"
          className="bg-blue-500  text-white rounded-lg p-8 shadow-lg transition duration-500 ease-in-out transform hover:scale-105 flex flex-col items-center justify-center"
        >

          <GraduationCap size={64} />
          <h2 className="text-2xl font-bold mt-4">Student</h2>
        </Link>

        <Link
          href="/login/"
          className="bg-fuchsia-600  text-white rounded-lg p-8 shadow-lg transition duration-500 ease-in-out transform hover:scale-105 flex flex-col items-center justify-center"
        >
          <School size={64} />
          <h2 className="text-2xl font-bold mt-4">Teacher</h2>
        </Link>
      </div>
    </main>
  );
}

