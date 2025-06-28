"use client";

import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import "../globals.css";
import Sidebar from "@/components/Sidebar";
import { useAuth } from "../../context/AuthContext";

const inter = Inter({ subsets: ["latin"] });

export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { user, role, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push("/login");
      } else if (role !== "admin") {
        router.push("/user/tugas");
      }
    }
  }, [user, role, loading, router]);

  const adminMenu = [
    { name: "Tugas", path: "/admin/tugas" },
    { name: "Course", path: "/admin/course" },
    { name: "Kelola User", path: "/admin/kelola-user" },
    { name: "Kelola Kursus", path: "/admin/kelola-kursus" },
    { name: "Kelola Tugas", path: "/admin/kelola-tugas" },
    { name: "Laporan", path: "/admin/laporan" },
    { name: "Lihat Jawaban", path: "/admin/lihat-jawaban" },
  ];

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        Loading...
      </div>
    );
  }

  if (!user || role !== "admin") {
    return null; // The redirection is handled by useEffect
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Sidebar menuItems={adminMenu} title="Admin Menu" />
      <main className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          {children}
        </div>
      </main>
    </div>
  );
}
