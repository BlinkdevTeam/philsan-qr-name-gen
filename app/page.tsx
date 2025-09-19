"use client";

import Link from "next/link";

export default function Home() {
  return (
    <div className="w-full min-h-screen flex flex-col justify-center items-center bg-gradient-to-br from-gray-100 to-gray-200">
      <h1 className="text-3xl md:text-4xl font-bold mb-10 text-gray-800">
        Philsan QR Generator
      </h1>

      <div className="flex space-x-6">
        <Link
          href="/Printed"
          className="px-6 py-3 rounded-lg bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-semibold shadow-md transition-transform transform hover:scale-105"
        >
          Printed Version
        </Link>

        <Link
          href="/Digital"
          className="px-6 py-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-md transition-transform transform hover:scale-105"
        >
          Digital Version
        </Link>
      </div>
    </div>
  );
}
