"use client";

import { useState, useEffect } from "react";
import {
  collection,
  addDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  doc,
} from "firebase/firestore";
import { db } from "../../../lib/firebase";

interface Task {
  id: string;
  title: string;
  description: string;
  deadline: string;
  file: string;
  createdAt: string;
  viewedBy: string[];
}

export default function KelolaTugas() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    deadline: "",
    file: "",
  });
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [viewers, setViewers] = useState<{ id: string; name: string }[]>([]);
  const [modalLoading, setModalLoading] = useState(false);

  useEffect(() => {
    fetchTasks();
  }, []);

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

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    if (editingTask) {
      setEditingTask({ ...editingTask, [name]: value });
    } else {
      setNewTask({ ...newTask, [name]: value });
    }
  };

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const taskToAdd = {
        ...newTask,
        createdAt: new Date().toISOString(),
        viewedBy: [],
      };
      await addDoc(collection(db, "tasks"), taskToAdd);
      setNewTask({ title: "", description: "", deadline: "", file: "" });
      fetchTasks();
    } catch (err) {
      console.error("Error adding task:", err);
      setError("Failed to add task. Please try again.");
    }
  };

  const handleUpdateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTask) return;
    try {
      const taskRef = doc(db, "tasks", editingTask.id);
      await updateDoc(taskRef, {
        title: editingTask.title,
        description: editingTask.description,
        deadline: editingTask.deadline,
        file: editingTask.file,
        viewedBy: editingTask.viewedBy || [],
      });
      setEditingTask(null);
      fetchTasks();
    } catch (err) {
      console.error("Error updating task:", err);
      setError("Failed to update task. Please try again.");
    }
  };

  const handleDeleteTask = async (id: string) => {
    if (confirm("Are you sure you want to delete this task?")) {
      try {
        await deleteDoc(doc(db, "tasks", id));
        fetchTasks();
      } catch (err) {
        console.error("Error deleting task:", err);
        setError("Failed to delete task. Please try again.");
      }
    }
  };

  const handleViewersClick = async (task: Task) => {
    setSelectedTask(task);
    setModalLoading(true);
    try {
      const usersSnapshot = await getDocs(collection(db, "users"));
      const usersList = usersSnapshot.docs.map((doc) => ({
        id: doc.id,
        name: doc.data().name || "Unknown User",
      }));
      const taskViewers = usersList.filter((user) =>
        task.viewedBy.includes(user.id)
      );
      setViewers(taskViewers);
      setModalLoading(false);
    } catch (err) {
      console.error("Error fetching viewers:", err);
      setError("Failed to load viewers. Please try again.");
      setModalLoading(false);
    }
  };

  const closeModal = () => {
    setSelectedTask(null);
    setViewers([]);
  };

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl text-gray-800 font-bold">Kelola Tugas</h1>

      {error && (
        <div
          className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded"
          role="alert"
        >
          <span className="block sm:inline">{error}</span>
        </div>
      )}

      {/* Form for Adding/Editing Tasks */}
      <div className="bg-white p-6 text-gray-600 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">
          {editingTask ? "Edit Tugas" : "Tambah Tugas Baru"}
        </h2>
        <form
          onSubmit={editingTask ? handleUpdateTask : handleAddTask}
          className="space-y-4"
        >
          <div>
            <label
              htmlFor="title"
              className="block text-sm font-medium text-gray-700"
            >
              Judul
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={editingTask ? editingTask.title : newTask.title}
              onChange={handleInputChange}
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm"
              placeholder="Masukkan judul tugas"
            />
          </div>
          <div>
            <label
              htmlFor="description"
              className="block text-sm font-medium text-gray-700"
            >
              Deskripsi
            </label>
            <textarea
              id="description"
              name="description"
              value={
                editingTask ? editingTask.description : newTask.description
              }
              onChange={handleInputChange}
              required
              rows={3}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm"
              placeholder="Masukkan deskripsi tugas"
            />
          </div>
          <div>
            <label
              htmlFor="deadline"
              className="block text-sm font-medium text-gray-700"
            >
              Deadline
            </label>
            <input
              type="date"
              id="deadline"
              name="deadline"
              value={editingTask ? editingTask.deadline : newTask.deadline}
              onChange={handleInputChange}
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm"
            />
          </div>
          <div>
            <label
              htmlFor="file"
              className="block text-sm font-medium text-gray-700"
            >
              File (URL)
            </label>
            <input
              type="url"
              id="file"
              name="file"
              value={editingTask ? editingTask.file : newTask.file}
              onChange={handleInputChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm"
              placeholder="Masukkan URL file (opsional)"
            />
            <p className="mt-1 text-sm text-gray-500">
              Catatan: Upload file langsung saat ini tidak didukung karena
              masalah CORS. Silakan gunakan URL file atau periksa aturan
              Firebase Storage.
            </p>
          </div>
          <div className="flex space-x-2">
            <button
              type="submit"
              className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
            >
              {editingTask ? "Simpan Perubahan" : "Tambah Tugas"}
            </button>
            {editingTask && (
              <button
                type="button"
                onClick={() => setEditingTask(null)}
                className="inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
              >
                Batal
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Tasks Table */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">Daftar Tugas</h2>
        {loading ? (
          <div className="text-center py-4">Memuat data...</div>
        ) : tasks.length === 0 ? (
          <div className="text-center py-4 text-gray-500">
            Belum ada tugas yang ditambahkan.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    ID
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Judul
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Deskripsi
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Deadline
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    File (URL)
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Dilihat Oleh
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Dibuat Pada
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {tasks.map((task) => (
                  <tr key={task.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {task.id.slice(0, 8)}...
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {task.title}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {task.description.length > 50
                        ? `${task.description.slice(0, 50)}...`
                        : task.description}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {task.deadline}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {task.file ? (
                        <a
                          href={task.file}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-emerald-600 hover:underline"
                        >
                          Lihat File
                        </a>
                      ) : (
                        "-"
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {task.viewedBy && task.viewedBy.length > 0 ? (
                        <button
                          onClick={() => handleViewersClick(task)}
                          className="text-emerald-600 hover:underline"
                        >
                          {task.viewedBy.length} user(s)
                        </button>
                      ) : (
                        "Belum dilihat"
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(task.createdAt).toLocaleDateString("id-ID")}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleEditTask(task)}
                        className="text-emerald-600 hover:text-emerald-900 mr-2"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteTask(task.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Hapus
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal for Viewers */}
      {selectedTask && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white text-gray-600 rounded-lg shadow-xl max-w-md w-full p-6">
            <h2 className="text-xl font-bold mb-4">
              Pengguna yang Melihat Tugas: {selectedTask.title}
            </h2>
            {modalLoading ? (
              <div className="text-center py-4">Memuat data...</div>
            ) : viewers.length === 0 ? (
              <div className="text-center py-4 text-gray-500">
                Tidak ada pengguna yang melihat tugas ini.
              </div>
            ) : (
              <ul className="space-y-2">
                {viewers.map((viewer) => (
                  <li
                    key={viewer.id}
                    className="p-2 bg-gray-50 rounded border border-gray-200"
                  >
                    {viewer.name}
                  </li>
                ))}
              </ul>
            )}
            <button
              onClick={closeModal}
              className="mt-4 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
            >
              Tutup
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
