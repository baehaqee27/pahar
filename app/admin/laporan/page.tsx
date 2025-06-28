"use client";

import React, { useState, useEffect } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../../lib/firebase";
import * as XLSX from "xlsx";

interface Submission {
  id: string;
  taskId: string;
  userName: string;
  score?: number;
  feedback?: string;
  deleted: boolean;
}

interface Task {
  id: string;
  title: string;
}

interface GroupedSubmission {
  taskTitle: string;
  submissions: Submission[];
}

export default function LaporanPage() {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [groupedSubmissions, setGroupedSubmissions] = useState<
    GroupedSubmission[]
  >([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch submissions and filter out deleted ones
        const submissionsSnapshot = await getDocs(
          collection(db, "submissions")
        );
        const submissionsList = submissionsSnapshot.docs
          .filter(
            (doc) => !doc.data().deleted && doc.data().score !== undefined
          )
          .map((doc) => ({
            id: doc.id,
            ...doc.data(),
          })) as Submission[];
        setSubmissions(submissionsList);

        // Fetch tasks for reference
        const tasksSnapshot = await getDocs(collection(db, "tasks"));
        const tasksList = tasksSnapshot.docs.map((doc) => ({
          id: doc.id,
          title: doc.data().title,
        })) as Task[];
        setTasks(tasksList);

        // Group submissions by task
        const grouped = tasksList
          .map((task) => ({
            taskTitle: task.title,
            submissions: submissionsList.filter(
              (sub) => sub.taskId === task.id
            ),
          }))
          .filter((group) => group.submissions.length > 0);
        setGroupedSubmissions(grouped);

        setLoading(false);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Failed to load report data. Please try again.");
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleExportToExcel = (group: GroupedSubmission) => {
    const data = group.submissions.map((sub) => ({
      "Nama Pengguna": sub.userName,
      Nilai: sub.score || "Belum Dinilai",
      Feedback: sub.feedback || "Tidak ada feedback",
    }));

    const worksheet = XLSX.utils.json_to_sheet(data, {
      header: ["Nama Pengguna", "Nilai", "Feedback"],
    });
    // Apply styles to header
    const range = XLSX.utils.decode_range(worksheet["!ref"] || "");
    for (let C = range.s.c; C <= range.e.c; ++C) {
      const cell = worksheet[XLSX.utils.encode_cell({ r: 0, c: C })];
      if (cell) {
        cell.s = {
          font: { bold: true },
          fill: { fgColor: { rgb: "DDDDDD" } },
          alignment: { horizontal: "center" },
        };
      }
    }
    // Auto width for columns
    const colWidths = data.reduce((acc, row) => {
      Object.keys(row).forEach((key, idx) => {
        const value = row[key as keyof typeof row];
        const width = value ? value.toString().length : 10;
        acc[idx] = Math.max(acc[idx] || 10, width);
      });
      return acc;
    }, [] as number[]);
    worksheet["!cols"] = colWidths.map((w) => ({ wch: w + 2 }));

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Laporan Nilai");
    XLSX.writeFile(
      workbook,
      `laporan_nilai_${group.taskTitle.replace(/\s+/g, "_")}.xlsx`
    );
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
      <h1 className="text-2xl text-gray-800 font-bold mb-4">Laporan Nilai</h1>
      {groupedSubmissions.length === 0 ? (
        <p className="text-gray-500">
          Belum ada nilai yang diberikan untuk tugas mana pun.
        </p>
      ) : (
        <div className="bg-white rounded-lg shadow-md p-6">
          {groupedSubmissions.map((group, index) => (
            <div key={index} className="mb-6">
              <div className="flex justify-between items-center mb-3">
                <h2 className="text-xl text-gray-600 font-semibold">
                  {group.taskTitle}
                </h2>
                <button
                  onClick={() => handleExportToExcel(group)}
                  className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600 text-sm"
                >
                  Ekspor ke Excel
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Nama Pengguna
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Nilai
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Feedback
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {group.submissions.map((submission) => (
                      <tr key={submission.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {submission.userName}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {submission.score !== undefined
                            ? submission.score
                            : "Belum Dinilai"}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          {submission.feedback || "Tidak ada feedback"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
