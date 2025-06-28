"use client";

import { useRouter } from "next/navigation";
import { useAuth } from "../context/AuthContext";

export default function Home() {
  const router = useRouter();
  const { user, role } = useAuth();

  const handleLogin = () => {
    router.push("/login");
  };

  const handleRegister = () => {
    router.push("/register");
  };

  const handleDashboard = () => {
    if (role === "admin") {
      router.push("/admin/tugas");
    } else {
      router.push("/user/tugas");
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-emerald-500 to-emerald-700 text-white py-20 px-6">
        <div className="container mx-auto flex flex-col md:flex-row items-center justify-between gap-12">
          <div className="md:w-1/2 text-center md:text-left">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Welcome to I-Techno
            </h1>
            <p className="text-lg md:text-xl mb-8">
              Manage Tasks, Learn with Courses, and Collaborate Seamlessly
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
              {user ? (
                <button
                  onClick={handleDashboard}
                  className="bg-white text-emerald-700 px-6 py-3 rounded-lg font-medium text-lg hover:bg-gray-100 transition-colors"
                >
                  Go to Dashboard
                </button>
              ) : (
                <>
                  <button
                    onClick={handleLogin}
                    className="bg-white text-emerald-700 px-6 py-3 rounded-lg font-medium text-lg hover:bg-gray-100 transition-colors"
                  >
                    Login
                  </button>
                  <button
                    onClick={handleRegister}
                    className="bg-transparent border-2 border-white text-white px-6 py-3 rounded-lg font-medium text-lg hover:bg-white hover:bg-opacity-10 transition-colors"
                  >
                    Register
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-6">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold text-center text-emerald-700 mb-12">
            Key Features
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
              <div className="bg-emerald-100 w-12 h-12 rounded-full flex items-center justify-center mb-4">
                <svg
                  className="w-6 h-6 text-emerald-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">
                Task Management
              </h3>
              <p className="text-gray-600">
                Create, submit, and manage tasks with deadlines and detailed
                instructions to stay organized.
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
              <div className="bg-emerald-100 w-12 h-12 rounded-full flex items-center justify-center mb-4">
                <svg
                  className="w-6 h-6 text-emerald-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">
                Course Access
              </h3>
              <p className="text-gray-600">
                Explore a variety of courses to enhance your skills and
                knowledge at your own pace.
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
              <div className="bg-emerald-100 w-12 h-12 rounded-full flex items-center justify-center mb-4">
                <svg
                  className="w-6 h-6 text-emerald-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">
                User Collaboration
              </h3>
              <p className="text-gray-600">
                Engage with peers and administrators through comments and
                feedback on tasks.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* About Sistem Informasi Techno Sekolah Section */}
      <section className="py-16 px-6 bg-gray-100">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold text-center text-emerald-700 mb-12">
            About Sistem Informasi Techno Sekolah
          </h2>
          <div className="bg-white p-8 rounded-lg shadow-md border border-gray-200 mx-auto max-w-4xl text-justify">
            <p className="text-gray-600 mb-6 text-lg">
              Sistem Informasi Techno Sekolah adalah platform yang dirancang
              untuk mempermudah pengumpulan tugas siswa secara digital,
              memastikan proses yang efisien dan terorganisir bagi siswa dan
              pengajar.
            </p>
            <p className="text-gray-600 mb-6 text-lg">
              Selain itu, platform ini akan menyediakan berbagai informasi
              penting kedepannya, seperti pengumuman sekolah, jadwal kegiatan,
              dan pembaruan lainnya untuk mendukung kebutuhan akademik dan
              administratif.
            </p>
            <p className="text-gray-600 text-lg">
              Bergabunglah dengan kami untuk pengalaman belajar dan pengelolaan
              tugas yang lebih modern dan terintegrasi.
            </p>
          </div>
        </div>
      </section>

      {/* Footer Section */}
      <footer className="bg-gray-800 text-white py-8 px-6">
        <div className="container mx-auto text-center">
          <p className="text-emerald-300 mb-2">
            I-Techno &copy; {new Date().getFullYear()}
          </p>
          <p className="text-gray-400 text-sm">
            A platform for task management and learning
          </p>
        </div>
      </footer>
    </div>
  );
}
