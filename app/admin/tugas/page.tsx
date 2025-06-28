"use client";

import { useState, useEffect } from "react";
import { collection, getDocs } from "firebase/firestore";
import { useRouter } from "next/navigation";
import { db } from "../../../lib/firebase";
import { useAuth } from "../../../context/AuthContext";

interface Task {
  id: string;
  title: string;
  description: string;
  deadline: string;
  file: string;
  createdAt: string;
  viewedBy: string[];
}

export default function TugasPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        setLoading(true);
        const querySnapshot = await getDocs(collection(db, "tasks"));
        const taskList = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Task[];
        setTasks(taskList);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching tasks:", err);
        setError("Failed to load tasks. Please try again.");
        setLoading(false);
      }
    };

    fetchTasks();
  }, []);

  const handleViewTask = (taskId: string) => {
    router.push(`/admin/tugas/${taskId}`);
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        Loading...
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl text-gray-800 font-bold mb-4">Daftar Tugas</h1>
      {tasks.length === 0 ? (
        <p className="text-gray-500">Belum ada tugas yang tersedia.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {tasks.map((task) => (
            <div
              key={task.id}
              className="bg-white text-gray-600 p-4 rounded-lg shadow-md border border-gray-200 cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => handleViewTask(task.id)}
            >
              <h2 className="text-xl font-semibold mb-2">{task.title}</h2>
              <p className="text-gray-600 mb-2">
                {task.description.length > 100
                  ? `${task.description.slice(0, 100)}...`
                  : task.description}
              </p>
              <p className="text-sm text-gray-500 mb-2">
                Deadline: {task.deadline}
              </p>
              {task.file && (
                <a
                  href={task.file}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-emerald-600 hover:underline text-sm mb-2 block"
                  onClick={(e) => e.stopPropagation()}
                >
                  Lihat File
                </a>
              )}
              <p className="text-xs text-gray-400">
                Dibuat pada:{" "}
                {new Date(task.createdAt).toLocaleDateString("id-ID")}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
