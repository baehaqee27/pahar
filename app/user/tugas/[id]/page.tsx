"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  doc,
  getDoc,
  updateDoc,
  collection,
  addDoc,
  getDocs,
} from "firebase/firestore";
import { db } from "../../../../lib/firebase";
import { useAuth } from "../../../../context/AuthContext";

interface Task {
  id: string;
  title: string;
  description: string;
  deadline: string;
  file: string;
  createdAt: string;
  viewedBy: string[];
}

interface Comment {
  id: string;
  taskId: string;
  userId: string;
  userName: string;
  text: string;
  parentId: string | null;
  createdAt: string;
  replies?: Comment[];
}

export default function TaskDetailPage() {
  const [task, setTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [answerType, setAnswerType] = useState<"text" | "file">("text");
  const [answerText, setAnswerText] = useState<string>("");
  const [answerFile, setAnswerFile] = useState<string>("");
  const [submissionStatus, setSubmissionStatus] = useState<string | null>(null);
  const [hasSubmitted, setHasSubmitted] = useState<boolean>(false);
  const [checkingSubmission, setCheckingSubmission] = useState<boolean>(true);
  const [userSubmissionId, setUserSubmissionId] = useState<string | null>(null);
  const [submissionScore, setSubmissionScore] = useState<number | null>(null);
  const [submissionFeedback, setSubmissionFeedback] = useState<string | null>(
    null
  );
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentText, setCommentText] = useState<string>("");
  const [replyText, setReplyText] = useState<string>("");
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [loadingComments, setLoadingComments] = useState<boolean>(true);
  const { id } = useParams();
  const router = useRouter();
  const { user } = useAuth();

  useEffect(() => {
    const fetchTask = async () => {
      try {
        setLoading(true);
        const taskRef = doc(db, "tasks", id as string);
        const taskSnap = await getDoc(taskRef);
        if (taskSnap.exists()) {
          const taskData = { id: taskSnap.id, ...taskSnap.data() } as Task;
          setTask(taskData);

          // Update viewedBy if user is logged in and hasn't viewed the task yet
          if (user && !taskData.viewedBy.includes(user.uid)) {
            const updatedViewedBy = [...taskData.viewedBy, user.uid];
            await updateDoc(taskRef, { viewedBy: updatedViewedBy });
            setTask({ ...taskData, viewedBy: updatedViewedBy });
          }
        } else {
          setError("Task not found.");
        }
        setLoading(false);
      } catch (err) {
        console.error("Error fetching task:", err);
        setError("Failed to load task. Please try again.");
        setLoading(false);
      }
    };

    const checkSubmission = async () => {
      if (!user || !id) {
        setCheckingSubmission(false);
        return;
      }
      try {
        setCheckingSubmission(true);
        const submissionsSnapshot = await getDocs(
          collection(db, "submissions")
        );
        const userSubmissions = submissionsSnapshot.docs.filter(
          (doc) =>
            doc.data().userId === user.uid &&
            doc.data().taskId === id &&
            !doc.data().deleted
        );
        setHasSubmitted(userSubmissions.length > 0);
        if (userSubmissions.length > 0) {
          setUserSubmissionId(userSubmissions[0].id);
          const submissionData = userSubmissions[0].data();
          if (submissionData.score !== undefined) {
            setSubmissionScore(submissionData.score);
            setSubmissionFeedback(
              submissionData.feedback || "Tidak ada feedback."
            );
          }
        }
        setCheckingSubmission(false);
      } catch (err) {
        console.error("Error checking submission:", err);
        setCheckingSubmission(false);
      }
    };

    const fetchComments = async () => {
      if (!id) {
        setLoadingComments(false);
        return;
      }
      try {
        setLoadingComments(true);
        const commentsSnapshot = await getDocs(collection(db, "comments"));
        const commentsList = commentsSnapshot.docs
          .filter((doc) => doc.data().taskId === id)
          .map((doc) => ({
            id: doc.id,
            ...doc.data(),
          })) as Comment[];

        // Build threaded comments structure
        const threadedComments = buildThreadedComments(commentsList);
        setComments(threadedComments);
        setLoadingComments(false);
      } catch (err) {
        console.error("Error fetching comments:", err);
        setLoadingComments(false);
      }
    };

    fetchTask();
    checkSubmission();
    fetchComments();
  }, [id, user]);

  const buildThreadedComments = (comments: Comment[]): Comment[] => {
    const commentMap = new Map<string, Comment>();
    const rootComments: Comment[] = [];

    // Initialize map and add empty replies array
    comments.forEach((comment) => {
      commentMap.set(comment.id, { ...comment, replies: [] });
    });

    // Build tree structure
    comments.forEach((comment) => {
      if (comment.parentId === null) {
        rootComments.push(commentMap.get(comment.id)!);
      } else {
        const parent = commentMap.get(comment.parentId);
        if (parent) {
          parent.replies!.push(commentMap.get(comment.id)!);
        }
      }
    });

    // Sort by createdAt (newest first)
    const sortByDate = (a: Comment, b: Comment) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();

    rootComments.sort(sortByDate);
    rootComments.forEach((comment) => {
      if (comment.replies) {
        comment.replies.sort(sortByDate);
      }
    });

    return rootComments;
  };

  const handleSubmitAnswer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !task) return;

    try {
      setSubmissionStatus("Submitting...");
      // Fetch user data from Firestore if displayName is not availaemerald
      let userName = user.displayName || "";
      if (!userName) {
        const userRef = doc(db, "users", user.uid);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
          userName = userSnap.data().name || "Pengguna Tanpa Nama";
        } else {
          userName = "Pengguna Tanpa Nama";
        }
      }
      const submissionData = {
        taskId: task.id,
        userId: user.uid,
        userName,
        answerType,
        answerText: answerType === "text" ? answerText : "",
        answerFile: answerType === "file" ? answerFile : "",
        submittedAt: new Date().toISOString(),
      };
      if (hasSubmitted && userSubmissionId) {
        // Update existing submission
        const submissionRef = doc(db, "submissions", userSubmissionId);
        await updateDoc(submissionRef, submissionData);
        setSubmissionStatus("Jawaban berhasil diperbarui!");
      } else {
        // Create new submission
        const newSubmission = await addDoc(
          collection(db, "submissions"),
          submissionData
        );
        setUserSubmissionId(newSubmission.id);
        setSubmissionStatus("Jawaban berhasil dikirim!");
        setHasSubmitted(true); // Lock the submission form after successful submission
      }
      setAnswerText("");
      setAnswerFile("");
    } catch (err) {
      console.error("Error submitting answer:", err);
      setSubmissionStatus("Gagal mengirim jawaban. Silakan coba lagi.");
    }
  };

  const handleBack = () => {
    router.push("/user/tugas");
  };

  const handleUnsendSubmission = async () => {
    if (!user || !id || !userSubmissionId) return;
    try {
      setSubmissionStatus("Membatalkan pengiriman...");
      const submissionRef = doc(db, "submissions", userSubmissionId);
      await updateDoc(submissionRef, { deleted: true }); // Soft delete to maintain record if needed
      setHasSubmitted(false);
      setUserSubmissionId(null);
      setSubmissionStatus(
        "Pengiriman berhasil dibatalkan. Anda dapat mengirim jawaban baru."
      );
    } catch (err) {
      console.error("Error unsending submission:", err);
      setSubmissionStatus("Gagal membatalkan pengiriman. Silakan coba lagi.");
    }
  };

  const handlePostComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !id || !commentText.trim()) return;

    try {
      let userName = user.displayName || "";
      if (!userName) {
        const userRef = doc(db, "users", user.uid);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
          userName = userSnap.data().name || "Pengguna Tanpa Nama";
        } else {
          userName = "Pengguna Tanpa Nama";
        }
      }

      const commentData = {
        taskId: id,
        userId: user.uid,
        userName,
        text: commentText.trim(),
        parentId: replyTo || null,
        createdAt: new Date().toISOString(),
      };

      await addDoc(collection(db, "comments"), commentData);
      setCommentText("");
      setReplyTo(null);
      // Refresh comments
      const commentsSnapshot = await getDocs(collection(db, "comments"));
      const commentsList = commentsSnapshot.docs
        .filter((doc) => doc.data().taskId === id)
        .map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Comment[];
      const threadedComments = buildThreadedComments(commentsList);
      setComments(threadedComments);
    } catch (err) {
      console.error("Error posting comment:", err);
    }
  };

  const handleReplyComment = (commentId: string) => {
    setReplyTo(commentId);
    setCommentText("");
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        Loading...
      </div>
    );
  }

  if (error || !task) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-red-500">{error || "Task not found."}</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <button
        onClick={handleBack}
        className="mb-4 flex items-center text-emerald-600 hover:text-emerald-800"
      >
        &larr; Kembali ke Daftar Tugas
      </button>
      <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
        <h1 className="text-2xl text-gray-800 font-bold mb-2">{task.title}</h1>
        <p className="text-gray-600 mb-4">{task.description}</p>
        <p className="text-sm text-gray-500 mb-2">Deadline: {task.deadline}</p>
        {task.file && (
          <a
            href={task.file}
            target="_blank"
            rel="noopener noreferrer"
            className="text-emerald-600 hover:underline text-sm mb-2 block"
          >
            Lihat File Tugas
          </a>
        )}
        <p className="text-xs text-gray-400">
          Dibuat pada: {new Date(task.createdAt).toLocaleDateString("id-ID")}
        </p>

        <div className="mt-6">
          <h2 className="text-md text-gray-700 border-t-1 pt-6 font-semibold mb-4">
            Kirim Jawaban
          </h2>
          {submissionStatus && (
            <div
              className={`mb-4 p-3 rounded ${
                submissionStatus.includes("berhasil")
                  ? "bg-green-100 text-green-800"
                  : submissionStatus.includes("Submitting")
                  ? "bg-emerald-100 text-emerald-800"
                  : "bg-red-100 text-red-800"
              }`}
            >
              {submissionStatus}
            </div>
          )}
          {checkingSubmission ? (
            <div className="text-center py-4">
              Memeriksa status pengiriman...
            </div>
          ) : hasSubmitted ? (
            <div className="bg-yellow-100 text-yellow-800 p-3 rounded mb-4">
              Anda sudah mengirimkan jawaban untuk tugas ini.
              {submissionScore !== null ? (
                <div className="mt-2 p-2 bg-green-100 text-green-800 rounded">
                  <p className="font-semibold">Nilai: {submissionScore}</p>
                  <p className="text-sm">Feedback: {submissionFeedback}</p>
                  <p className="text-sm text-red-600">
                    Pengiriman jawaban telah dinilai dan tidak dapat diperbarui.
                  </p>
                </div>
              ) : (
                <>
                  Anda dapat memperbarui jawaban Anda dengan mengirimkan yang
                  baru atau membatalkan pengiriman untuk menghapus data.
                  <button
                    onClick={handleUnsendSubmission}
                    className="mt-2 inline-flex justify-center py-1 px-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                  >
                    Batalkan Pengiriman
                  </button>
                </>
              )}
            </div>
          ) : (
            <form onSubmit={handleSubmitAnswer} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tipe Jawaban
                </label>
                <div className="flex space-x-4">
                  <button
                    type="button"
                    onClick={() => setAnswerType("text")}
                    className={`px-4 py-2 rounded-md text-sm font-medium ${
                      answerType === "text"
                        ? "bg-emerald-600 text-white"
                        : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                    }`}
                  >
                    Teks Biasa
                  </button>
                  <button
                    type="button"
                    onClick={() => setAnswerType("file")}
                    className={`px-4 py-2 rounded-md text-sm font-medium ${
                      answerType === "file"
                        ? "bg-emerald-600 text-white"
                        : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                    }`}
                  >
                    Link File
                  </button>
                </div>
              </div>
              {answerType === "text" ? (
                <div>
                  <label
                    htmlFor="answerText"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Jawaban Teks
                  </label>
                  <textarea
                    id="answerText"
                    value={answerText}
                    onChange={(e) => setAnswerText(e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 text-gray-600 p-7 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm"
                    placeholder="Masukkan jawaban Anda di sini"
                    rows={5}
                    required
                  />
                </div>
              ) : (
                <div>
                  <label
                    htmlFor="answerFile"
                    className="block text-sm font-medium text-gray-700"
                  >
                    URL File Jawaban
                  </label>
                  <input
                    type="url"
                    id="answerFile"
                    value={answerFile}
                    onChange={(e) => setAnswerFile(e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm"
                    placeholder="Masukkan URL file jawaban Anda"
                    required
                  />
                  <p className="mt-1 text-sm text-gray-500">
                    Catatan: Upload file langsung saat ini tidak didukung karena
                    masalah CORS. Silakan gunakan URL file. (saran gunakan
                    google drive, lalu salin link-nya disini)
                  </p>
                </div>
              )}
              <button
                type="submit"
                className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
              >
                Kirim Jawaban
              </button>
            </form>
          )}
        </div>
        <div className="mt-8">
          <h2 className="text-xl text-gray-800 font-semibold mb-4">Komentar</h2>
          {loadingComments ? (
            <div className="text-center py-4">Memuat komentar...</div>
          ) : (
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <form onSubmit={handlePostComment} className="mb-6">
                <div className="mb-3">
                  <label
                    htmlFor="commentText"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    {replyTo ? `Balas komentar` : "Tambah Komentar"}
                  </label>
                  <textarea
                    id="commentText"
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 text-gray-600 p-4 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm"
                    placeholder={
                      replyTo
                        ? "Masukkan balasan Anda..."
                        : "Masukkan komentar Anda..."
                    }
                    rows={3}
                    required
                  />
                </div>
                <div className="flex space-x-2">
                  <button
                    type="submit"
                    className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
                  >
                    {replyTo ? "Balas" : "Kirim Komentar"}
                  </button>
                  {replyTo && (
                    <button
                      type="button"
                      onClick={() => {
                        setReplyTo(null);
                        setCommentText("");
                      }}
                      className="inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
                    >
                      Batal Balas
                    </button>
                  )}
                </div>
              </form>

              {comments.length === 0 ? (
                <p className="text-gray-500">
                  Belum ada komentar untuk tugas ini.
                </p>
              ) : (
                <div className="space-y-4">
                  {comments.map((comment) => (
                    <div
                      key={comment.id}
                      className="border-b border-gray-200 pb-4"
                    >
                      <div className="flex justify-between items-start mb-1">
                        <p className="font-semibold text-gray-800">
                          {comment.userName}
                        </p>
                        <p className="text-xs text-gray-500">
                          {new Date(comment.createdAt).toLocaleString("id-ID")}
                        </p>
                      </div>
                      <p className="text-gray-700 mb-2">{comment.text}</p>
                      <button
                        onClick={() => handleReplyComment(comment.id)}
                        className="text-emerald-600 hover:text-emerald-800 text-sm"
                      >
                        Balas
                      </button>
                      {comment.replies && comment.replies.length > 0 && (
                        <div className="ml-6 mt-3 space-y-3">
                          {comment.replies.map((reply) => (
                            <div
                              key={reply.id}
                              className="border-l-2 border-gray-300 pl-3 pb-3"
                            >
                              <div className="flex justify-between items-start mb-1">
                                <p className="font-semibold text-gray-800">
                                  {reply.userName}
                                </p>
                                <p className="text-xs text-gray-500">
                                  {new Date(reply.createdAt).toLocaleString(
                                    "id-ID"
                                  )}
                                </p>
                              </div>
                              <p className="text-gray-700 mb-2">{reply.text}</p>
                              <button
                                onClick={() => handleReplyComment(comment.id)}
                                className="text-emerald-600 hover:text-emerald-800 text-sm"
                              >
                                Balas
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
