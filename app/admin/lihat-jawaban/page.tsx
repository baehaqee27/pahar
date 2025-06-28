"use client";

import { useState, useEffect } from "react";
import { collection, getDocs, doc, updateDoc } from "firebase/firestore";
import { db } from "../../../lib/firebase";

interface Submission {
  id: string;
  taskId: string;
  userId: string;
  userName: string;
  answerType: "text" | "file";
  answerText: string;
  answerFile: string;
  submittedAt: string;
  score?: number;
  feedback?: string;
}

interface Task {
  id: string;
  title: string;
}

export default function LihatJawaban() {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedSubmission, setSelectedSubmission] =
    useState<Submission | null>(null);
  const [score, setScore] = useState<number | "">("");
  const [feedback, setFeedback] = useState<string>("");
  const [evaluationStatus, setEvaluationStatus] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch submissions and filter out deleted ones
        const submissionsSnapshot = await getDocs(
          collection(db, "submissions")
        );
        const submissionsList = submissionsSnapshot.docs
          .filter((doc) => !doc.data().deleted)
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

        setLoading(false);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Failed to load submissions. Please try again.");
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const getTaskTitle = (taskId: string) => {
    const task = tasks.find((t) => t.id === taskId);
    return task ? task.title : "Unknown Task";
  };

  const handleEvaluate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSubmission || score === "") return;

    try {
      setEvaluationStatus("Submitting evaluation...");
      const submissionRef = doc(db, "submissions", selectedSubmission.id);
      await updateDoc(submissionRef, {
        score: Number(score),
        feedback: feedback.trim() || "No feedback provided.",
      });
      setSubmissions(
        submissions.map((sub) =>
          sub.id === selectedSubmission.id
            ? {
                ...sub,
                score: Number(score),
                feedback: feedback.trim() || "No feedback provided.",
              }
            : sub
        )
      );
      setSelectedSubmission(null);
      setScore("");
      setFeedback("");
      setEvaluationStatus("Evaluation submitted successfully!");
    } catch (err) {
      console.error("Error submitting evaluation:", err);
      setEvaluationStatus("Failed to submit evaluation. Please try again.");
    }
  };

  const handleSelectSubmission = (submission: Submission) => {
    setSelectedSubmission(submission);
    setScore(submission.score || "");
    setFeedback(submission.feedback || "");
    setEvaluationStatus(null);
  };

  const handleCloseModal = () => {
    setSelectedSubmission(null);
    setScore("");
    setFeedback("");
    setEvaluationStatus(null);
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
      <h1 className="text-2xl text-gray-800 font-bold mb-4">
        Lihat Jawaban User
      </h1>
      {submissions.length === 0 ? (
        <p className="text-gray-500">
          Belum ada jawaban yang dikirim oleh user.
        </p>
      ) : (
        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
          <h2 className="text-xl text-gray-600 font-semibold mb-4">
            Daftar Jawaban
          </h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    ID Jawaban
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Nama User
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Judul Tugas
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Tipe Jawaban
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Dikirim Pada
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Nilai
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
                {submissions.map((submission) => (
                  <tr key={submission.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {submission.id.slice(0, 8)}...
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {submission.userName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {getTaskTitle(submission.taskId)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {submission.answerType === "text" ? "Teks" : "File Link"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(submission.submittedAt).toLocaleDateString(
                        "id-ID"
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {submission.score !== undefined
                        ? submission.score
                        : "Belum Dinilai"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleSelectSubmission(submission)}
                        className="text-emerald-600 hover:text-emerald-900"
                      >
                        Lihat & Nilai
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal for Viewing and Evaluating Submission */}
      {selectedSubmission && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white text-gray-600 rounded-lg shadow-xl max-w-2xl w-full p-6">
            <h2 className="text-xl font-bold mb-4">
              Detail Jawaban: {selectedSubmission.userName}
            </h2>
            <p className="text-sm text-gray-500 mb-2">
              Tugas: {getTaskTitle(selectedSubmission.taskId)}
            </p>
            <p className="text-sm text-gray-500 mb-4">
              Dikirim pada:{" "}
              {new Date(selectedSubmission.submittedAt).toLocaleDateString(
                "id-ID"
              )}
            </p>

            <div className="mb-4">
              <h3 className="text-md font-semibold mb-2">Isi Jawaban:</h3>
              {selectedSubmission.answerType === "text" ? (
                <p className="text-gray-700 bg-gray-50 p-4 rounded border border-gray-200">
                  {selectedSubmission.answerText}
                </p>
              ) : (
                <a
                  href={selectedSubmission.answerFile}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-emerald-600 hover:underline"
                >
                  Lihat File Jawaban
                </a>
              )}
            </div>

            <div className="mb-4">
              <h3 className="text-md font-semibold mb-2">Penilaian:</h3>
              {evaluationStatus && (
                <div
                  className={`mb-4 p-3 rounded ${
                    evaluationStatus.includes("successfully")
                      ? "bg-green-100 text-green-800"
                      : evaluationStatus.includes("Submitting")
                      ? "bg-emerald-100 text-emerald-800"
                      : "bg-red-100 text-red-800"
                  }`}
                >
                  {evaluationStatus}
                </div>
              )}
              <form onSubmit={handleEvaluate} className="space-y-4">
                <div>
                  <label
                    htmlFor="score"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Nilai (0-100)
                  </label>
                  <input
                    type="number"
                    id="score"
                    value={score}
                    onChange={(e) =>
                      setScore(
                        e.target.value === "" ? "" : Number(e.target.value)
                      )
                    }
                    min="0"
                    max="100"
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm"
                    placeholder="Masukkan nilai"
                  />
                </div>
                <div>
                  <label
                    htmlFor="feedback"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Feedback (Opsional)
                  </label>
                  <textarea
                    id="feedback"
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    rows={3}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm"
                    placeholder="Masukkan feedback untuk jawaban ini"
                  />
                </div>
                <div className="flex space-x-2">
                  <button
                    type="submit"
                    className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
                  >
                    Simpan Penilaian
                  </button>
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
                  >
                    Tutup
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
