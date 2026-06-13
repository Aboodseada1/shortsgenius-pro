import { Shuffle, Palette } from 'lucide-react';

interface JokeEditorProps {
  setup: string;
  punchline: string;
  backgroundColor: string;
  textColor: string;
  onSetupChange: (value: string) => void;
  onPunchlineChange: (value: string) => void;
  onBackgroundColorChange: (value: string) => void;
  onTextColorChange: (value: string) => void;
  onRandomJoke: () => void;
}

const colorPresets = [
  { bg: '#1a1a2e', text: '#ffffff', name: 'Dark Purple' },
  { bg: '#0f0f0f', text: '#00ff88', name: 'Neon Green' },
  { bg: '#ff6b6b', text: '#ffffff', name: 'Coral' },
  { bg: '#4158d0', text: '#ffffff', name: 'Blue Gradient' },
  { bg: '#ffecd2', text: '#0d1b2a', name: 'Warm Light' },
  { bg: '#667eea', text: '#ffffff', name: 'Indigo' },
  { bg: '#f093fb', text: '#1a1a2e', name: 'Pink' },
  { bg: '#2d3436', text: '#fdcb6e', name: 'Dark Gold' },
];

export function JokeEditor({
  setup,
  punchline,
  backgroundColor,
  textColor,
  onSetupChange,
  onPunchlineChange,
  onBackgroundColorChange,
  onTextColorChange,
  onRandomJoke,
}: JokeEditorProps) {
  const applyPreset = (preset: typeof colorPresets[0]) => {
    onBackgroundColorChange(preset.bg);
    onTextColorChange(preset.text);
  };

  return (
    <div className="bg-gray-900 rounded-xl p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <span className="text-2xl">✏️</span> Edit Joke
        </h2>
        <button
          onClick={onRandomJoke}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 rounded-lg text-white font-medium transition-all transform hover:scale-105"
        >
          <Shuffle size={18} />
          Random Joke
        </button>
      </div>

      {/* Joke inputs */}
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-2">
            Setup (The Question)
          </label>
          <textarea
            value={setup}
            onChange={(e) => onSetupChange(e.target.value)}
            className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
            rows={3}
            placeholder="Why did the programmer quit his job?"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-2">
            Punchline (The Answer)
          </label>
          <textarea
            value={punchline}
            onChange={(e) => onPunchlineChange(e.target.value)}
            className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
            rows={3}
            placeholder="Because he didn't get arrays!"
          />
        </div>
      </div>

      {/* Color settings */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
          <Palette size={20} />
          Colors
        </h3>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">
              Background
            </label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={backgroundColor}
                onChange={(e) => onBackgroundColorChange(e.target.value)}
                className="w-12 h-12 rounded-lg cursor-pointer border-2 border-gray-700"
              />
              <input
                type="text"
                value={backgroundColor}
                onChange={(e) => onBackgroundColorChange(e.target.value)}
                className="flex-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm font-mono"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">
              Text
            </label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={textColor}
                onChange={(e) => onTextColorChange(e.target.value)}
                className="w-12 h-12 rounded-lg cursor-pointer border-2 border-gray-700"
              />
              <input
                type="text"
                value={textColor}
                onChange={(e) => onTextColorChange(e.target.value)}
                className="flex-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm font-mono"
              />
            </div>
          </div>
        </div>

        {/* Color presets */}
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-2">
            Presets
          </label>
          <div className="grid grid-cols-4 gap-2">
            {colorPresets.map((preset, index) => (
              <button
                key={index}
                onClick={() => applyPreset(preset)}
                className="group relative h-12 rounded-lg overflow-hidden border-2 border-gray-700 hover:border-purple-500 transition-all"
                style={{ backgroundColor: preset.bg }}
                title={preset.name}
              >
                <span
                  className="absolute inset-0 flex items-center justify-center text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity"
                  style={{ color: preset.text }}
                >
                  Aa
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
