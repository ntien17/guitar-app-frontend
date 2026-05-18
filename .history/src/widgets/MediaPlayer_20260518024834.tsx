import { useEffect, useRef, useState } from "react"
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
  onComplete?: () => void
}

export default function MediaPlayer({
  src,
  type,
  title,
  onProgressUpdate,
}: MediaPlayerProps) {
  const mediaRef = useRef<HTMLVideoElement | HTMLAudioElement>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(1)
  const [isMuted, setIsMuted] = useState(false)
  const [buffered, setBuffered] = useState(0)

  const handlePlayPause = () => {
    if (mediaRef.current) {
      if (isPlaying) {
        mediaRef.current.pause()
      } else {
        mediaRef.current.play()
      }
      setIsPlaying(!isPlaying)
    }
  }

  const handleTimeUpdate = () => {
    if (mediaRef.current) {
      const current = mediaRef.current.currentTime
      const dur = mediaRef.current.duration
      setCurrentTime(current)
      setDuration(dur)
      onProgressUpdate?.(current, dur)
    }
  }

  const handleProgress = () => {
    if (mediaRef.current) {
      const { buffered: buf } = mediaRef.current
      if (buf.length > 0) {
        setBuffered(buf.end(buf.length - 1))
      }
    }
  }

  const handleLoadedMetadata = () => {
    if (mediaRef.current) {
      setDuration(mediaRef.current.duration)
    }
  }

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value)
    if (mediaRef.current) {
      mediaRef.current.currentTime = time
      setCurrentTime(time)
    }
  }

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const vol = parseFloat(e.target.value)
    setVolume(vol)
    if (mediaRef.current) {
      mediaRef.current.volume = vol
    }
    if (vol > 0) {
      setIsMuted(false)
    }
  }

  const handleMuteToggle = () => {
    if (mediaRef.current) {
      if (isMuted) {
        mediaRef.current.volume = volume
        setIsMuted(false)
      } else {
        mediaRef.current.volume = 0
        setIsMuted(true)
      }
    }
  }

  const formatTime = (seconds: number) => {
    if (!seconds || isNaN(seconds)) return "0:00"
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  const progressPercent = duration ? (currentTime / duration) * 100 : 0
  const bufferedPercent = duration ? (buffered / duration) * 100 : 0

  return (
    <div className="rounded-xl border border-slate-700 bg-slate-900 p-6 space-y-4">
      {title && <h3 className="text-lg font-semibold text-white">{title}</h3>}

      {type === "video" ? (
        <video
          ref={mediaRef as React.RefObject<HTMLVideoElement>}
          src={src}
          onTimeUpdate={handleTimeUpdate}
          onProgress={handleProgress}
          onLoadedMetadata={handleLoadedMetadata}
          onEnded={() => setIsPlaying(false)}
          className="w-full rounded-lg bg-black"
        />
      ) : (
        <audio
          ref={mediaRef as React.RefObject<HTMLAudioElement>}
          src={src}
          onTimeUpdate={handleTimeUpdate}
          onProgress={handleProgress}
          onLoadedMetadata={handleLoadedMetadata}
          onEnded={() => setIsPlaying(false)}
          className="w-full"
        />
      )}

      <div className="space-y-3">
        <div className="space-y-1">
          <div className="relative bg-slate-800 rounded-full h-2 overflow-hidden">
            <div
              className="absolute h-full bg-slate-600 rounded-full"
              style={{ width: `${bufferedPercent}%` }}
            />
            <input
              type="range"
              min="0"
              max={duration || 0}
              value={currentTime}
              onChange={handleSeek}
              className="absolute w-full h-2 opacity-0 cursor-pointer"
              style={{ WebkitAppearance: "slider-horizontal" }}
            />
            <div
              className="absolute h-full bg-blue-500 rounded-full transition-all pointer-events-none"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-slate-400">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handlePlayPause}
            className="flex-shrink-0 rounded-full bg-blue-600 hover:bg-blue-500 p-2 transition-colors"
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
              onClick={handleMuteToggle}
              className="p-1 hover:bg-slate-800 rounded transition-colors"
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
            />
          </div>
        </div>
      </div>
    </div>
  )
}
