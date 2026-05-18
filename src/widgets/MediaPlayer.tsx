import { useRef, useState } from "react"
import { Play, Pause, Volume2, VolumeX } from "lucide-react"

interface MediaPlayerProps {
  src?: string
  type?: "video" | "audio"
  title?: string
  onProgress?: (progress: {
    currentTime: number
    duration: number
    completionPercent: number
  }) => void
  onProgressUpdate?: (currentTime: number, duration: number) => void
  onComplete?: () => void
}

export default function MediaPlayer({
  src,
  type = "video",
  title,
  onProgress,
  onProgressUpdate,
  onComplete,
}: MediaPlayerProps) {
  const mediaRef = useRef<HTMLVideoElement | HTMLAudioElement>(null)

  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(1)
  const [isMuted, setIsMuted] = useState(false)
  const [buffered, setBuffered] = useState(0)
  const [hasCompleted, setHasCompleted] = useState(false)

  const formatTime = (seconds: number) => {
    if (!seconds || Number.isNaN(seconds)) return "0:00"

    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)

    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  const handlePlayPause = async () => {
    const media = mediaRef.current
    if (!media) return

    try {
      if (media.paused) {
        await media.play()
        setIsPlaying(true)
      } else {
        media.pause()
        setIsPlaying(false)
      }
    } catch (error) {
      console.error("Media play error:", error)
    }
  }

  const handleTimeUpdate = () => {
    const media = mediaRef.current
    if (!media) return

    const current = media.currentTime || 0
    const dur = media.duration || 0
    const completionPercent = dur > 0 ? Math.min((current / dur) * 100, 100) : 0

    setCurrentTime(current)
    setDuration(dur)

    // Backward-compatible callback for older LessonDetailPage code.
    onProgressUpdate?.(current, dur)

    // Preferred callback for newer progress-tracking code.
    onProgress?.({
      currentTime: current,
      duration: dur,
      completionPercent,
    })

    if (completionPercent >= 90 && !hasCompleted) {
      setHasCompleted(true)
      onComplete?.()
    }
  }

  const handleProgress = () => {
    const media = mediaRef.current
    if (!media) return

    const bufferedRange = media.buffered

    if (bufferedRange.length > 0) {
      setBuffered(bufferedRange.end(bufferedRange.length - 1))
    }
  }

  const handleLoadedMetadata = () => {
    const media = mediaRef.current
    if (!media) return

    setDuration(media.duration || 0)
  }

  const handleSeek = (event: React.ChangeEvent<HTMLInputElement>) => {
    const media = mediaRef.current
    if (!media) return

    const time = Number(event.target.value)

    media.currentTime = time
    setCurrentTime(time)
  }

  const handleVolumeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const media = mediaRef.current
    if (!media) return

    const nextVolume = Number(event.target.value)

    setVolume(nextVolume)
    media.volume = nextVolume

    if (nextVolume > 0) {
      media.muted = false
      setIsMuted(false)
    }
  }

  const handleMuteToggle = () => {
    const media = mediaRef.current
    if (!media) return

    const nextMuted = !isMuted

    media.muted = nextMuted
    media.volume = nextMuted ? 0 : volume

    setIsMuted(nextMuted)
  }

  const handleEnded = () => {
    setIsPlaying(false)

    if (!hasCompleted) {
      setHasCompleted(true)
      onComplete?.()
    }
  }

  const progressPercent = duration > 0 ? Math.min((currentTime / duration) * 100, 100) : 0
  const bufferedPercent = duration > 0 ? Math.min((buffered / duration) * 100, 100) : 0

  if (!src) {
    return (
      <div className="rounded-xl border border-slate-700 bg-slate-900 p-6 text-slate-300">
        <h3 className="text-lg font-semibold text-white">
          {title || "Media bài học"}
        </h3>
        <p className="mt-2 text-sm text-slate-400">
          Bài học này chưa có video hoặc audio.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4 rounded-xl border border-slate-700 bg-slate-900 p-6">
      {title && <h3 className="text-lg font-semibold text-white">{title}</h3>}

      {type === "video" ? (
        <video
          ref={mediaRef as React.RefObject<HTMLVideoElement>}
          src={src}
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          onTimeUpdate={handleTimeUpdate}
          onProgress={handleProgress}
          onLoadedMetadata={handleLoadedMetadata}
          onEnded={handleEnded}
          className="w-full rounded-lg bg-black"
          playsInline
        />
      ) : (
        <audio
          ref={mediaRef as React.RefObject<HTMLAudioElement>}
          src={src}
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          onTimeUpdate={handleTimeUpdate}
          onProgress={handleProgress}
          onLoadedMetadata={handleLoadedMetadata}
          onEnded={handleEnded}
          className="w-full"
        />
      )}

      <div className="space-y-3">
        <div className="space-y-1">
          <div className="relative h-2 overflow-hidden rounded-full bg-slate-800">
            <div
              className="absolute h-full rounded-full bg-slate-600"
              style={{ width: `${bufferedPercent}%` }}
            />

            <div
              className="pointer-events-none absolute h-full rounded-full bg-blue-500 transition-all"
              style={{ width: `${progressPercent}%` }}
            />

            <input
              type="range"
              min="0"
              max={duration || 0}
              value={currentTime}
              onChange={handleSeek}
              className="absolute h-2 w-full cursor-pointer opacity-0"
              aria-label="Tua media"
            />
          </div>

          <div className="flex justify-between text-xs text-slate-400">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handlePlayPause}
            className="flex-shrink-0 rounded-full bg-blue-600 p-2 transition-colors hover:bg-blue-500"
            title={isPlaying ? "Tạm dừng" : "Phát"}
          >
            {isPlaying ? (
              <Pause size={20} className="text-white" />
            ) : (
              <Play size={20} className="text-white" />
            )}
          </button>

          <div className="flex-1" />

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleMuteToggle}
              className="rounded p-1 transition-colors hover:bg-slate-800"
              title={isMuted ? "Bật âm thanh" : "Tắt âm thanh"}
            >
              {isMuted || volume === 0 ? (
                <VolumeX size={18} className="text-slate-300" />
              ) : (
                <Volume2 size={18} className="text-slate-300" />
              )}
            </button>

            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={isMuted ? 0 : volume}
              onChange={handleVolumeChange}
              className="w-20"
              title="Âm lượng"
              aria-label="Âm lượng"
            />
          </div>
        </div>
      </div>
    </div>
  )
}
