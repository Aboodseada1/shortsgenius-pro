import { Settings, Film, Clock, Maximize } from 'lucide-react';

interface VideoSettingsProps {
  fps: number;
  duration: number;
  onFpsChange: (fps: number) => void;
  onDurationChange: (duration: number) => void;
}

export function VideoSettings({
  fps,
  duration,
  onFpsChange,
  onDurationChange,
}: VideoSettingsProps) {
  return (
    <div className="bg-gray-900 rounded-xl p-6 space-y-4">
      <h2 className="text-xl font-bold text-white flex items-center gap-2">
        <Settings size={20} />
        Video Settings
      </h2>

      <div className="grid grid-cols-2 gap-4">
        {/* Resolution display */}
        <div className="bg-gray-800 rounded-lg p-4">
          <div className="flex items-center gap-2 text-gray-400 text-sm mb-1">
            <Maximize size={16} />
            Resolution
          </div>
          <p className="text-white font-bold text-lg">1080 × 1920</p>
          <p className="text-gray-500 text-xs">9:16 (Reel/Shorts)</p>
        </div>

        {/* FPS */}
        <div className="bg-gray-800 rounded-lg p-4">
          <div className="flex items-center gap-2 text-gray-400 text-sm mb-1">
            <Film size={16} />
            Frame Rate
          </div>
          <select
            value={fps}
            onChange={(e) => onFpsChange(Number(e.target.value))}
            className="w-full mt-1 px-3 py-1.5 bg-gray-700 border border-gray-600 rounded-lg text-white text-lg font-bold focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value={24}>24 FPS</option>
            <option value={30}>30 FPS</option>
            <option value={60}>60 FPS</option>
          </select>
        </div>
      </div>

      {/* Duration */}
      <div className="bg-gray-800 rounded-lg p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2 text-gray-400 text-sm">
            <Clock size={16} />
            Duration
          </div>
          <span className="text-white font-bold">{duration}s</span>
        </div>
        <input
          type="range"
          min={5}
          max={30}
          value={duration}
          onChange={(e) => onDurationChange(Number(e.target.value))}
          className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-purple-500"
        />
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>5s</span>
          <span>15s</span>
          <span>30s (max)</span>
        </div>
      </div>

      {/* Export info */}
      <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 rounded-lg p-4">
        <p className="text-purple-300 text-sm">
          <strong>💡 Tip:</strong> This is a preview template. For actual video export, 
          use Remotion CLI with these settings as your composition config.
        </p>
      </div>
    </div>
  );
}
