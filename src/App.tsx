import { useState } from 'react';

function App() {
  const [activeTab, setActiveTab] = useState<'docs' | 'config' | 'test' | 'monitor'>('docs');
  const [jokesLog, setJokesLog] = useState<any[]>([]);
  const [isLoadingJokes, setIsLoadingJokes] = useState(false);
  const [jokeType, setJokeType] = useState<'question-punchline' | 'story'>('question-punchline');
  const [config, setConfig] = useState({
    question: "Why do programmers prefer dark mode?",
    questionDuration: 2.5,
    punchline: "Because light attracts bugs!",
    punchlineDuration: 1.8,
    storyTitle: "The Developer Interview",
    storyText: "A programmer walks into a job interview. The interviewer asks: 'What's your greatest weakness?' The programmer thinks for a moment and says: 'I'd say it's my attention to detail.' The interviewer nods and makes a note. Then he looks up confused and asks: 'Wait, you wrote your name as undefined.'",
    storyDuration: 15,
    backgroundColor: "#0f0f23",
    accentColor: "#fbbf24",
  });

  const fetchJokes = async () => {
    setIsLoadingJokes(true);
    try {
      const response = await fetch('/api/jokes');
      const data = await response.json();
      setJokesLog(data);
    } catch (err) {
      console.error('Failed to fetch jokes:', err);
    } finally {
      setIsLoadingJokes(false);
    }
  };

  const generateConfigJSON = () => {
    if (jokeType === 'question-punchline') {
      return JSON.stringify({
        type: "question-punchline",
        outputFileName: `joke-${new Date().toISOString().split('T')[0]}.mp4`,
        questionPunchline: {
          question: {
            text: config.question,
            audioFile: "question.mp3",
            audioDuration: config.questionDuration
          },
          punchline: {
            text: config.punchline,
            audioFile: "punchline.mp3",
            audioDuration: config.punchlineDuration
          }
        },
        style: {
          backgroundColor: config.backgroundColor,
          accentColor: config.accentColor
        }
      }, null, 2);
    } else {
      return JSON.stringify({
        type: "story",
        outputFileName: `story-${new Date().toISOString().split('T')[0]}.mp4`,
        story: {
          title: config.storyTitle,
          text: config.storyText,
          audioFile: "story.mp3",
          audioDuration: config.storyDuration
        },
        style: {
          backgroundColor: config.backgroundColor,
          accentColor: config.accentColor
        }
      }, null, 2);
    }
  };

  const generateCLICommand = () => {
    if (jokeType === 'question-punchline') {
      return `npx ts-node render.ts \\
  --type question-punchline \\
  --question "${config.question}" \\
  --question-audio question.mp3 \\
  --question-duration ${config.questionDuration} \\
  --punchline "${config.punchline}" \\
  --punchline-audio punchline.mp3 \\
  --punchline-duration ${config.punchlineDuration} \\
  --output joke-today.mp4`;
    } else {
      return `npx ts-node render.ts \\
  --type story \\
  --title "${config.storyTitle}" \\
  --story "${config.storyText.substring(0, 100)}..." \\
  --story-audio story.mp3 \\
  --story-duration ${config.storyDuration} \\
  --output story-today.mp4`;
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <header className="bg-gradient-to-r from-purple-900 to-indigo-900 py-8 px-6">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-4xl font-bold mb-2">🎬 Joke Reel Generator</h1>
          <p className="text-purple-200 text-lg">
            Automated Remotion video generator for daily joke reels
          </p>
        </div>
      </header>

      {/* Tabs */}
      <div className="max-w-5xl mx-auto mt-6 px-6">
        <div className="flex gap-2 border-b border-gray-700">
          {(['docs', 'config', 'test', 'monitor'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => {
                setActiveTab(tab);
                if (tab === 'monitor') fetchJokes();
              }}
              className={`px-6 py-3 font-medium capitalize transition-colors ${activeTab === tab
                ? 'bg-gray-800 text-white border-b-2 border-purple-500'
                : 'text-gray-400 hover:text-white'
                }`}
            >
              {tab === 'docs' ? '📚 Documentation' : tab === 'config' ? '⚙️ Config Generator' : tab === 'test' ? '🧪 Preview' : '📊 Monitor'}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <main className="max-w-5xl mx-auto p-6">
        {activeTab === 'docs' && (
          <div className="space-y-8">
            {/* Quick Start */}
            <section className="bg-gray-800 rounded-xl p-6">
              <h2 className="text-2xl font-bold mb-4 text-purple-400">🚀 Quick Start</h2>
              <div className="space-y-4">
                <div className="bg-gray-900 rounded-lg p-4">
                  <p className="text-gray-400 mb-2"># 1. Create your config file</p>
                  <code className="text-green-400">cp joke-config.example.json joke-config.json</code>
                </div>
                <div className="bg-gray-900 rounded-lg p-4">
                  <p className="text-gray-400 mb-2"># 2. Add your audio files to public/ folder</p>
                  <code className="text-green-400">cp your-audio.mp3 public/question.mp3</code>
                </div>
                <div className="bg-gray-900 rounded-lg p-4">
                  <p className="text-gray-400 mb-2"># 3. Render the video</p>
                  <code className="text-green-400">npx ts-node render.ts --config joke-config.json</code>
                </div>
              </div>
            </section>

            {/* Joke Types */}
            <section className="bg-gray-800 rounded-xl p-6">
              <h2 className="text-2xl font-bold mb-4 text-purple-400">📝 Joke Types</h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-gray-900 rounded-lg p-5">
                  <h3 className="text-xl font-bold text-yellow-400 mb-3">Type 1: Question + Punchline</h3>
                  <p className="text-gray-300 mb-3">Classic Q&A format jokes</p>
                  <div className="text-sm space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="text-blue-400">1️⃣</span>
                      <span>Intro animation (1s)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-blue-400">2️⃣</span>
                      <span>Question + audio plays</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-blue-400">3️⃣</span>
                      <span>Pause for suspense (1s)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-blue-400">4️⃣</span>
                      <span>Punchline + audio plays</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-blue-400">5️⃣</span>
                      <span>Outro with CTA (1.5s)</span>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-900 rounded-lg p-5">
                  <h3 className="text-xl font-bold text-pink-400 mb-3">Type 2: Story</h3>
                  <p className="text-gray-300 mb-3">Longer narrative jokes</p>
                  <div className="text-sm space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="text-pink-400">1️⃣</span>
                      <span>Title card (2s)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-pink-400">2️⃣</span>
                      <span>Story pages + audio plays</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-pink-400">3️⃣</span>
                      <span>Auto-splits into readable chunks</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-pink-400">4️⃣</span>
                      <span>Outro with CTA (1.5s)</span>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* CLI Usage */}
            <section className="bg-gray-800 rounded-xl p-6">
              <h2 className="text-2xl font-bold mb-4 text-purple-400">💻 CLI Usage</h2>
              <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto">
                <pre className="text-sm text-gray-300">{`# Using config file (recommended)
npx ts-node render.ts --config joke-config.json

# Question-Punchline via CLI
npx ts-node render.ts \\
  --type question-punchline \\
  --question "Why do programmers prefer dark mode?" \\
  --question-audio question.mp3 \\
  --question-duration 2.5 \\
  --punchline "Because light attracts bugs!" \\
  --punchline-audio punchline.mp3 \\
  --punchline-duration 1.8 \\
  --output joke.mp4

# Story via CLI
npx ts-node render.ts \\
  --type story \\
  --title "The Developer Interview" \\
  --story "A programmer walks into..." \\
  --story-audio story.mp3 \\
  --story-duration 15 \\
  --output story.mp4

# Get help
npx ts-node render.ts --help`}</pre>
              </div>
            </section>

            {/* Cron / n8n */}
            <section className="bg-gray-800 rounded-xl p-6">
              <h2 className="text-2xl font-bold mb-4 text-purple-400">⏰ Cron / n8n Integration</h2>
              <div className="space-y-4">
                <div className="bg-gray-900 rounded-lg p-4">
                  <h3 className="font-bold text-yellow-400 mb-2">Crontab Example (3x daily)</h3>
                  <pre className="text-sm text-green-400">{`# Run at 8am, 2pm, 8pm
0 8,14,20 * * * cd /path/to/project && ./render-joke.sh >> /var/log/joke-reel.log 2>&1`}</pre>
                </div>
                <div className="bg-gray-900 rounded-lg p-4">
                  <h3 className="font-bold text-yellow-400 mb-2">n8n Workflow</h3>
                  <ol className="text-sm text-gray-300 space-y-1 list-decimal list-inside">
                    <li>Schedule Trigger (3x daily)</li>
                    <li>HTTP Request → Your AI for joke generation</li>
                    <li>HTTP Request → Chatterbox TTS for audio</li>
                    <li>Write Files (joke-config.json + audio files)</li>
                    <li>Execute Command: <code className="text-green-400">npx ts-node render.ts --config joke-config.json</code></li>
                    <li>Upload to social media API</li>
                  </ol>
                </div>
              </div>
            </section>

            {/* File Structure */}
            <section className="bg-gray-800 rounded-xl p-6">
              <h2 className="text-2xl font-bold mb-4 text-purple-400">📁 File Structure</h2>
              <div className="bg-gray-900 rounded-lg p-4">
                <pre className="text-sm text-gray-300">{`project/
├── public/                    # Audio files go here
│   ├── question.mp3
│   ├── punchline.mp3
│   └── story.mp3
├── src/remotion/
│   ├── index.ts              # Remotion entry point
│   ├── Root.tsx              # Composition registration
│   ├── schemas.ts            # Zod validation schemas
│   └── compositions/
│       ├── QuestionPunchlineJoke.tsx
│       └── StoryJoke.tsx
├── out/                       # Rendered videos output here
├── joke-config.json          # Your config file
├── joke-config.example.json  # Example config
├── render.ts                 # CLI render script
├── render-joke.sh            # Shell wrapper script
└── remotion.config.ts        # Remotion configuration`}</pre>
              </div>
            </section>
          </div>
        )}

        {activeTab === 'config' && (
          <div className="space-y-6">
            {/* Type Selector */}
            <div className="bg-gray-800 rounded-xl p-6">
              <h2 className="text-xl font-bold mb-4">Select Joke Type</h2>
              <div className="flex gap-4">
                <button
                  onClick={() => setJokeType('question-punchline')}
                  className={`flex-1 py-4 px-6 rounded-lg font-medium transition-all ${jokeType === 'question-punchline'
                    ? 'bg-yellow-500 text-black'
                    : 'bg-gray-700 hover:bg-gray-600'
                    }`}
                >
                  🤔 Question + Punchline
                </button>
                <button
                  onClick={() => setJokeType('story')}
                  className={`flex-1 py-4 px-6 rounded-lg font-medium transition-all ${jokeType === 'story'
                    ? 'bg-pink-500 text-white'
                    : 'bg-gray-700 hover:bg-gray-600'
                    }`}
                >
                  📖 Story
                </button>
              </div>
            </div>

            {/* Config Form */}
            <div className="bg-gray-800 rounded-xl p-6">
              <h2 className="text-xl font-bold mb-4">Configure Your Joke</h2>

              {jokeType === 'question-punchline' ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Question</label>
                    <input
                      type="text"
                      value={config.question}
                      onChange={(e) => setConfig({ ...config, question: e.target.value })}
                      className="w-full bg-gray-900 rounded-lg px-4 py-3 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Question Audio Duration (seconds)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={config.questionDuration}
                      onChange={(e) => setConfig({ ...config, questionDuration: parseFloat(e.target.value) })}
                      className="w-full bg-gray-900 rounded-lg px-4 py-3 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Punchline</label>
                    <input
                      type="text"
                      value={config.punchline}
                      onChange={(e) => setConfig({ ...config, punchline: e.target.value })}
                      className="w-full bg-gray-900 rounded-lg px-4 py-3 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Punchline Audio Duration (seconds)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={config.punchlineDuration}
                      onChange={(e) => setConfig({ ...config, punchlineDuration: parseFloat(e.target.value) })}
                      className="w-full bg-gray-900 rounded-lg px-4 py-3 text-white"
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Story Title</label>
                    <input
                      type="text"
                      value={config.storyTitle}
                      onChange={(e) => setConfig({ ...config, storyTitle: e.target.value })}
                      className="w-full bg-gray-900 rounded-lg px-4 py-3 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Story Text</label>
                    <textarea
                      value={config.storyText}
                      onChange={(e) => setConfig({ ...config, storyText: e.target.value })}
                      rows={5}
                      className="w-full bg-gray-900 rounded-lg px-4 py-3 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Story Audio Duration (seconds)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={config.storyDuration}
                      onChange={(e) => setConfig({ ...config, storyDuration: parseFloat(e.target.value) })}
                      className="w-full bg-gray-900 rounded-lg px-4 py-3 text-white"
                    />
                  </div>
                </div>
              )}

              {/* Style Options */}
              <div className="mt-6 pt-6 border-t border-gray-700">
                <h3 className="font-bold mb-4">Style Options</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Background Color</label>
                    <input
                      type="color"
                      value={config.backgroundColor}
                      onChange={(e) => setConfig({ ...config, backgroundColor: e.target.value })}
                      className="w-full h-10 rounded cursor-pointer"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Accent Color</label>
                    <input
                      type="color"
                      value={config.accentColor}
                      onChange={(e) => setConfig({ ...config, accentColor: e.target.value })}
                      className="w-full h-10 rounded cursor-pointer"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Generated Config */}
            <div className="bg-gray-800 rounded-xl p-6">
              <h2 className="text-xl font-bold mb-4">📄 Generated Config (joke-config.json)</h2>
              <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto">
                <pre className="text-sm text-green-400">{generateConfigJSON()}</pre>
              </div>
              <button
                onClick={() => navigator.clipboard.writeText(generateConfigJSON())}
                className="mt-4 px-4 py-2 bg-purple-600 hover:bg-purple-500 rounded-lg transition-colors"
              >
                📋 Copy to Clipboard
              </button>
            </div>

            {/* CLI Command */}
            <div className="bg-gray-800 rounded-xl p-6">
              <h2 className="text-xl font-bold mb-4">💻 CLI Command</h2>
              <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto">
                <pre className="text-sm text-yellow-400">{generateCLICommand()}</pre>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'test' && (
          <div className="bg-gray-800 rounded-xl p-6">
            <h2 className="text-xl font-bold mb-4">🧪 Test with Remotion Studio</h2>
            <p className="text-gray-300 mb-6">
              To preview your compositions in the Remotion Studio, run:
            </p>
            <div className="bg-gray-900 rounded-lg p-4 mb-6">
              <code className="text-green-400">npx remotion studio src/remotion/index.ts</code>
            </div>
            <p className="text-gray-400">
              This will open an interactive preview where you can see your compositions
              and test different props before rendering.
            </p>

            <div className="mt-8 p-6 bg-gradient-to-r from-purple-900/50 to-pink-900/50 rounded-xl">
              <h3 className="text-lg font-bold mb-3">📐 Output Specifications</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                <div className="bg-black/30 rounded-lg p-4">
                  <div className="text-2xl font-bold text-purple-400">1080×1920</div>
                  <div className="text-sm text-gray-400">Resolution</div>
                </div>
                <div className="bg-black/30 rounded-lg p-4">
                  <div className="text-2xl font-bold text-pink-400">9:16</div>
                  <div className="text-sm text-gray-400">Aspect Ratio</div>
                </div>
                <div className="bg-black/30 rounded-lg p-4">
                  <div className="text-2xl font-bold text-yellow-400">30 FPS</div>
                  <div className="text-sm text-gray-400">Frame Rate</div>
                </div>
                <div className="bg-black/30 rounded-lg p-4">
                  <div className="text-2xl font-bold text-green-400">≤30s</div>
                  <div className="text-sm text-gray-400">Max Duration</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'monitor' && (
          <div className="bg-gray-800 rounded-xl p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-blue-400">📊 Daily Jokes Monitor</h2>
              <button
                onClick={fetchJokes}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg text-sm transition-colors"
              >
                🔄 Refresh
              </button>
            </div>

            {isLoadingJokes ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
              </div>
            ) : jokesLog.length === 0 ? (
              <div className="text-center py-12 bg-gray-900 rounded-lg">
                <p className="text-gray-500">No jokes uploaded yet.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-gray-700 bg-gray-900/50">
                      <th className="px-4 py-3 font-bold text-gray-400">Date</th>
                      <th className="px-4 py-3 font-bold text-gray-400">Type</th>
                      <th className="px-4 py-3 font-bold text-gray-400">Joke/Title</th>
                      <th className="px-4 py-3 font-bold text-gray-400">Status</th>
                      <th className="px-4 py-3 font-bold text-gray-400">Video</th>
                    </tr>
                  </thead>
                  <tbody>
                    {jokesLog.map((joke) => (
                      <tr key={joke.id} className="border-b border-gray-700/50 hover:bg-gray-700/30 transition-colors">
                        <td className="px-4 py-3 text-sm text-gray-400">
                          {new Date(joke.created_at).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 rounded text-xs font-bold ${joke.type === 'story' ? 'bg-pink-900/50 text-pink-400' : 'bg-yellow-900/50 text-yellow-400'
                            }`}>
                            {joke.type}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="max-w-xs truncate font-medium">
                            {joke.title || joke.content.substring(0, 50)}
                          </div>
                          <div className="text-xs text-gray-500 truncate">
                            {joke.content.substring(0, 100)}...
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`flex items-center gap-1 text-sm ${joke.status === 'completed' ? 'text-green-400' : 'text-blue-400'
                            }`}>
                            {joke.status === 'completed' ? '✅ Done' : '⏳ Rendering'}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          {joke.video_path ? (
                            <a href={joke.video_path} target="_blank" className="text-blue-400 hover:underline text-sm">
                              🎬 Watch
                            </a>
                          ) : (
                            <span className="text-gray-600 text-sm">N/A</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            <div className="mt-8 p-4 bg-blue-900/20 border border-blue-900/30 rounded-lg">
              <h3 className="text-blue-300 font-bold mb-2 flex items-center gap-2">
                ℹ️ Database Status: <span className="text-green-400">Connected</span>
              </h3>
              <p className="text-sm text-blue-200/70">
                Connected to <code>db.lobster.chat</code>. Monitoring <code>jokes_db.jokes_log</code>.
              </p>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="mt-12 py-6 border-t border-gray-800 text-center text-gray-500">
        <p>🎬 Joke Reel Generator • Powered by Remotion</p>
      </footer>
    </div>
  );
}

export default App;
