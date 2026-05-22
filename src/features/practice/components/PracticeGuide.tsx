import { CheckCircle2, Clock, Target } from "lucide-react"

const steps = [
  {
    title: "Khởi động",
    time: "5 phút",
    description: "Thả lỏng cổ tay, bấm từng dây chậm, kiểm tra tiếng đàn không bị rè.",
  },
  {
    title: "Luyện kỹ thuật chính",
    time: "15 phút",
    description: "Chọn một bài luyện tập: tempo, hợp âm ngẫu nhiên, tiết tấu hoặc nốt đơn.",
  },
  {
    title: "Ghi nhận kết quả",
    time: "3 phút",
    description: "Bấm hoàn thành để lưu thời gian luyện tập, độ chính xác và ghi chú vào hệ thống.",
  },
]

export function PracticeGuide() {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      {steps.map((step, index) => (
        <div key={step.title} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              {index === 0 ? <Clock size={20} /> : index === 1 ? <Target size={20} /> : <CheckCircle2 size={20} />}
            </div>
            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
              {step.time}
            </span>
          </div>

          <h3 className="font-bold text-slate-900">{step.title}</h3>
          <p className="mt-2 text-sm leading-6 text-slate-600">{step.description}</p>
        </div>
      ))}
    </div>
  )
}
