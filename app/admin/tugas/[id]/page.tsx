"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { doc, getDoc, collection, addDoc, getDocs } from "firebase/firestore";
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
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentText, setCommentText] = useState<string>("");
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
    fetchComments();
  }, [id]);

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

  const handleBack = () => {
    router.push("/admin/tugas");
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
          <div className="bg-yellow-100 text-yellow-800 p-3 rounded mb-4">
            Sebagai admin, Anda tidak dapat mengirimkan jawaban untuk tugas ini.
          </div>
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
