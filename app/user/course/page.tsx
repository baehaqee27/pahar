"use client";

import React, { useState, useEffect } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../../lib/firebase";

interface Course {
  id: string;
  title: string;
  description: string;
  link: string;
}

export default function CoursePage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setLoading(true);
        const coursesSnapshot = await getDocs(collection(db, "courses"));
        const coursesList = coursesSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Course[];
        setCourses(coursesList);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching courses:", err);
        setError("Failed to load courses. Please try again.");
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  const handleNavigateToCourse = (link: string) => {
    window.open(link, "_blank", "noopener,noreferrer");
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
      <h1 className="text-2xl text-gray-800 font-bold mb-4">Daftar Kursus</h1>
      {courses.length === 0 ? (
        <p className="text-gray-500">Belum ada kursus yang tersedia.</p>
      ) : (
        <div className="bg-white text-gray-600 rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Kursus yang Tersedia</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {courses.map((course) => (
              <div
                key={course.id}
                className="border rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow"
              >
                <h3 className="text-lg font-semibold mb-2">{course.title}</h3>
                <p className="text-gray-600 mb-3">{course.description}</p>
                <button
                  onClick={() => handleNavigateToCourse(course.link)}
                  className="bg-emerald-500 text-white px-4 py-2 rounded hover:bg-emerald-600"
                >
                  Akses Kursus
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
