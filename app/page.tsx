import Link from "next/link";

export default function Home() {
  return (
    <>
    <h1 className="mx-auto">Welcome to the Home Page</h1>
    <Link href="/tests-list">
      <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">tests</button>
    </Link>
    </>
  );
}
