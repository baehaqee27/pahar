"use client";

import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import "../globals.css";
import Sidebar from "@/components/Sidebar";
import { useAuth } from "../../context/AuthContext";

const inter = Inter({ subsets: ["latin"] });

export default function UserLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  const userMenu = [
    { name: "Tugas", path: "/user/tugas" },
    { name: "Course", path: "/user/course" },
    // { name: "Galeri", path: "/user/galeri" },
  ];

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        Loading...
      </div>
    );
  }

  if (!user) {
    return null; // The redirection is handled by useEffect
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Sidebar menuItems={userMenu} title="User Menu" />
      <main className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          {children}
        </div>
      </main>
    </div>
  );
}
