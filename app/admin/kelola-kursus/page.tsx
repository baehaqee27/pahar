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

interface Course {
  id: string;
  title: string;
  description: string;
  instructor: string;
  link: string;
  createdAt: string;
}

export default function KelolaKursus() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [newCourse, setNewCourse] = useState({
    title: "",
    description: "",
    instructor: "",
    link: "",
  });
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const querySnapshot = await getDocs(collection(db, "courses"));
      const courseList = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Course[];
      setCourses(courseList);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching courses:", err);
      setError("Failed to load courses. Please try again.");
      setLoading(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    if (editingCourse) {
      setEditingCourse({ ...editingCourse, [name]: value });
    } else {
      setNewCourse({ ...newCourse, [name]: value });
    }
  };

  const handleAddCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const courseToAdd = {
        ...newCourse,
        createdAt: new Date().toISOString(),
      };
      await addDoc(collection(db, "courses"), courseToAdd);
      setNewCourse({ title: "", description: "", instructor: "", link: "" });
      fetchCourses();
    } catch (err) {
      console.error("Error adding course:", err);
      setError("Failed to add course. Please try again.");
    }
  };

  const handleUpdateCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCourse) return;
    try {
      const courseRef = doc(db, "courses", editingCourse.id);
      await updateDoc(courseRef, {
        title: editingCourse.title,
        description: editingCourse.description,
        instructor: editingCourse.instructor,
        link: editingCourse.link,
      });
      setEditingCourse(null);
      fetchCourses();
    } catch (err) {
      console.error("Error updating course:", err);
      setError("Failed to update course. Please try again.");
    }
  };

  const handleDeleteCourse = async (id: string) => {
    if (confirm("Are you sure you want to delete this course?")) {
      try {
        await deleteDoc(doc(db, "courses", id));
        fetchCourses();
      } catch (err) {
        console.error("Error deleting course:", err);
        setError("Failed to delete course. Please try again.");
      }
    }
  };

  const handleEditCourse = (course: Course) => {
    setEditingCourse(course);
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl text-gray-800 font-bold">Kelola Kursus</h1>

      {error && (
        <div
          className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded"
          role="alert"
        >
          <span className="block sm:inline">{error}</span>
        </div>
      )}

      {/* Form for Adding/Editing Courses */}
      <div className="bg-white text-gray-600 p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">
          {editingCourse ? "Edit Kursus" : "Tambah Kursus Baru"}
        </h2>
        <form
          onSubmit={editingCourse ? handleUpdateCourse : handleAddCourse}
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
              value={editingCourse ? editingCourse.title : newCourse.title}
              onChange={handleInputChange}
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm"
              placeholder="Masukkan judul kursus"
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
                editingCourse
                  ? editingCourse.description
                  : newCourse.description
              }
              onChange={handleInputChange}
              required
              rows={3}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm"
              placeholder="Masukkan deskripsi kursus"
            />
          </div>
          <div>
            <label
              htmlFor="instructor"
              className="block text-sm font-medium text-gray-700"
            >
              Instruktur
            </label>
            <input
              type="text"
              id="instructor"
              name="instructor"
              value={
                editingCourse ? editingCourse.instructor : newCourse.instructor
              }
              onChange={handleInputChange}
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm"
              placeholder="Masukkan nama instruktur"
            />
          </div>
          <div>
            <label
              htmlFor="link"
              className="block text-sm font-medium text-gray-700"
            >
              Link Kursus
            </label>
            <input
              type="url"
              id="link"
              name="link"
              value={editingCourse ? editingCourse.link : newCourse.link}
              onChange={handleInputChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm"
              placeholder="Masukkan URL kursus (opsional)"
            />
          </div>
          <div className="flex space-x-2">
            <button
              type="submit"
              className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
            >
              {editingCourse ? "Simpan Perubahan" : "Tambah Kursus"}
            </button>
            {editingCourse && (
              <button
                type="button"
                onClick={() => setEditingCourse(null)}
                className="inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
              >
                Batal
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Courses Table */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">Daftar Kursus</h2>
        {loading ? (
          <div className="text-center py-4">Memuat data...</div>
        ) : courses.length === 0 ? (
          <div className="text-center py-4 text-gray-500">
            Belum ada kursus yang ditambahkan.
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
                    Instruktur
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Link
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
                {courses.map((course) => (
                  <tr key={course.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {course.id.slice(0, 8)}...
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {course.title}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {course.description.length > 50
                        ? `${course.description.slice(0, 50)}...`
                        : course.description}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {course.instructor}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {course.link ? (
                        <a
                          href={course.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-emerald-600 hover:underline"
                        >
                          Lihat Kursus
                        </a>
                      ) : (
                        "-"
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(course.createdAt).toLocaleDateString("id-ID")}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleEditCourse(course)}
                        className="text-emerald-600 hover:text-emerald-900 mr-2"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteCourse(course.id)}
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
    </div>
  );
}
