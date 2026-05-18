import { Link } from "react-router-dom"

const learningSections = [
  {
    title: "Khóa học guitar",
    description: "Xem danh sách khóa học guitar theo trình độ: cơ bản, hợp âm, fingerstyle.",
    path: "/courses",
    status: "Đang hoạt động",
  },
  {
    title: "Bài học",
    description: "Xem chi tiết bài học, video/audio hướng dẫn và nội dung luyện tập.",
    path: "/courses",
    status: "Theo khóa học",
  },
  {
    title: "Trợ lý guitar AI",
    description: "Hỏi đáp về lộ trình học, hợp âm, fingerstyle, barre chord và luyện tập cá nhân hóa.",
    path: "/assistant",
    status: "Đang hoạt động",
  },
  {
    title: "Luyện tập",
    description: "Luyện hợp âm, tiết tấu, chuyển hợp âm, metronome và bài tập ngón tay.",
    path: "/practice",
    status: "Đang phát triển",
  },
  {
    title: "Tiến độ học tập",
    description: "Theo dõi bài đã học, thời gian luyện tập, phần trăm hoàn thành và kỹ năng còn yếu.",
    path: "/dashboard",
    status: "Đang phát triển",
  },
  {
    title: "Gợi ý lộ trình",
    description: "Nhận đề xuất bài học tiếp theo dựa trên tiến độ và hành vi học tập.",
    path: "/dashboard",
    status: "Theo dashboard",
  },
  {
    title: "Quản trị khóa học",
    description: "Thêm, sửa, quản lý khóa học và bài học cho hệ thống.",
    path: "/admin",
    status: "Admin",
  },
]

const featureHighlights = [
  "Học guitar theo khóa học",
  "Xem video/audio bài học",
  "Theo dõi tiến độ cá nhân",
  "Trợ lý AI đề xuất lộ trình",
  "Luyện tập hợp âm và tiết tấu",
  "Dashboard phân tích học tập",
]

export default function HomePage() {
  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <section className="mx-auto max-w-7xl px-6 py-10">
        <nav className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Guitar Learning Platform</h1>
            <p className="text-sm text-slate-400">
              Nền tảng học guitar cá nhân hóa với AI Assistant
            </p>
          </div>

          <div className="flex gap-3">
            <Link
              to="/login"
              className="rounded-xl border border-slate-700 px-4 py-2 text-sm hover:bg-slate-900"
            >
              Đăng nhập
            </Link>

            <Link
              to="/register"
              className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-medium hover:bg-blue-500"
            >
              Đăng ký
            </Link>
          </div>
        </nav>

        <section className="grid gap-10 py-16 lg:grid-cols-2 lg:items-center">
          <div>
            <span className="rounded-full bg-blue-600/20 px-4 py-2 text-sm text-blue-300">
              Web app học guitar thông minh
            </span>

            <h2 className="mt-6 text-5xl font-bold leading-tight">
              Học guitar dễ hơn với lộ trình cá nhân hóa
            </h2>

            <p className="mt-5 text-lg leading-8 text-slate-300">
              Hệ thống giúp người học xem khóa học, luyện tập theo bài học,
              theo dõi tiến độ và nhận gợi ý từ trợ lý AI dựa trên năng lực cá nhân.
            </p>

            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                to="/courses"
                className="rounded-xl bg-blue-600 px-6 py-3 font-semibold hover:bg-blue-500"
              >
                Bắt đầu học
              </Link>

              <Link
                to="/assistant"
                className="rounded-xl border border-slate-700 px-6 py-3 font-semibold hover:bg-slate-900"
              >
                Hỏi trợ lý AI
              </Link>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6 shadow-2xl">
            <h3 className="text-xl font-bold">Tính năng chính</h3>

            <div className="mt-5 grid gap-3">
              {featureHighlights.map((item) => (
                <div
                  key={item}
                  className="rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 text-slate-300"
                >
                  ✓ {item}
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="pb-16">
          <div className="flex items-end justify-between gap-4">
            <div>
              <h2 className="text-3xl font-bold">Các trang học tập</h2>
              <p className="mt-2 text-slate-400">
                Truy cập nhanh các chức năng chính của hệ thống.
              </p>
            </div>
          </div>

          <div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {learningSections.map((section) => (
              <Link
                key={section.title}
                to={section.path}
                className="group rounded-2xl border border-slate-800 bg-slate-900 p-6 transition hover:-translate-y-1 hover:border-blue-500 hover:bg-slate-900/80"
              >
                <div className="flex items-start justify-between gap-4">
                  <h3 className="text-xl font-bold group-hover:text-blue-400">
                    {section.title}
                  </h3>

                  <span className="rounded-full bg-slate-800 px-3 py-1 text-xs text-slate-300">
                    {section.status}
                  </span>
                </div>

                <p className="mt-4 leading-7 text-slate-400">
                  {section.description}
                </p>

                <div className="mt-5 text-sm font-medium text-blue-400">
                  Mở trang →
                </div>
              </Link>
            ))}
          </div>
        </section>

        <section className="rounded-3xl border border-slate-800 bg-slate-900 p-8">
          <div className="grid gap-8 md:grid-cols-3">
            <div>
              <p className="text-4xl font-bold text-blue-400">3+</p>
              <p className="mt-2 text-slate-300">Khóa học mẫu</p>
            </div>

            <div>
              <p className="text-4xl font-bold text-blue-400">AI</p>
              <p className="mt-2 text-slate-300">Trợ lý học guitar</p>
            </div>

            <div>
              <p className="text-4xl font-bold text-blue-400">24/7</p>
              <p className="mt-2 text-slate-300">Học mọi lúc, mọi nơi</p>
            </div>
          </div>
        </section>
      </section>
    </main>
  )
}