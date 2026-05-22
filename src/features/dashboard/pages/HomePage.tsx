import { Link } from "react-router-dom"
import { AppLayout } from "@/components/AppLayout"
import { PageHeader } from "@/shared/ui/PageHeader"
import { Card, CardContent, CardHeader } from "@/shared/ui/Card"
import { Badge } from "@/shared/ui/Badge"
import { BookOpen, Sparkles, Music, TrendingUp, AlertCircle, ArrowRight } from "lucide-react"

const learningSections = [
  {
    title: "Khóa học guitar",
    description: "Xem danh sách khóa học guitar theo trình độ: cơ bản, hợp âm, fingerstyle.",
    path: "/courses",
    status: "active",
    icon: BookOpen,
  },
  {
    title: "Bài học chi tiết",
    description: "Xem chi tiết bài học, video/audio hướng dẫn và nội dung luyện tập.",
    path: "/courses",
    status: "active",
    icon: Music,
  },
  {
    title: "Trợ lý guitar AI",
    description: "Hỏi đáp về lộ trình học, hợp âm, fingerstyle, barre chord và luyện tập cá nhân hóa.",
    path: "/assistant",
    status: "active",
    icon: Sparkles,
  },
  {
    title: "Luyện tập",
    description: "Luyện hợp âm, tiết tấu, chuyển hợp âm, metronome và bài tập ngón tay.",
    path: "/practice",
    status: "developing",
    icon: Music,
  },
  {
    title: "Tiến độ học tập",
    description: "Theo dõi bài đã học, thời gian luyện tập, phần trăm hoàn thành và kỹ năng còn yếu.",
    path: "/dashboard",
    status: "developing",
    icon: TrendingUp,
  },
  {
    title: "Gợi ý lộ trình",
    description: "Nhận đề xuất bài học tiếp theo dựa trên tiến độ và hành vi học tập.",
    path: "/dashboard",
    status: "active",
    icon: Sparkles,
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
    <AppLayout hideOnAuth={false}>
      <div className="max-w-6xl mx-auto">
        <PageHeader
          title="Guitar Learning Platform"
          subtitle="Nền tảng học guitar cá nhân hóa với AI Assistant"
          icon={<Music size={32} className="text-blue-600" />}
        />

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-8">
          {learningSections.map((section) => {
            const Icon = section.icon
            const isActive = section.status === "active"
            return (
              <Link
                key={section.title}
                to={section.path}
                className="no-underline"
              >
                <Card interactive clickable>
                  <CardContent>
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <Icon className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
                      <Badge variant={isActive ? "primary" : "warning"}>
                        {isActive ? "Hoạt động" : "Phát triển"}
                      </Badge>
                    </div>
                    <h3 className="font-semibold text-slate-900 text-lg mb-2">
                      {section.title}
                    </h3>
                    <p className="text-sm text-slate-600 mb-4">
                      {section.description}
                    </p>
                    <div className="flex items-center gap-2 text-blue-600 text-sm font-medium">
                      Khám phá
                      <ArrowRight size={16} />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            )
          })}
        </div>

        <Card className="mb-8">
          <CardHeader>
            <h2 className="text-xl font-bold text-slate-900">Tính năng chính</h2>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
              {featureHighlights.map((feature) => (
                <div
                  key={feature}
                  className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 border border-slate-200"
                >
                  <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                    <span className="text-green-700 text-xs font-bold">✓</span>
                  </div>
                  <span className="text-sm text-slate-700">{feature}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <div className="grid gap-6 md:grid-cols-3 py-4">
              <div className="text-center">
                <p className="text-3xl font-bold text-blue-600">3+</p>
                <p className="text-sm text-slate-600 mt-2">Khóa học mẫu</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-blue-600">AI</p>
                <p className="text-sm text-slate-600 mt-2">Trợ lý học guitar</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-blue-600">24/7</p>
                <p className="text-sm text-slate-600 mt-2">Học mọi lúc, mọi nơi</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  )
}