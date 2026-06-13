import { bundle } from "@remotion/bundler";
import { renderMedia, selectComposition } from "@remotion/renderer";
import path from "path";
import fs from "fs";

const remotionDisabledMarker = path.join(process.cwd(), ".remotion-auto-render-disabled");
if (fs.existsSync(remotionDisabledMarker)) {
  const note = fs.readFileSync(remotionDisabledMarker, "utf8").trim().split("\n")[0];
  console.error(
    "Remotion renders are disabled (.remotion-auto-render-disabled in project root).",
  );
  if (note) console.error(note);
  console.error("Delete that file to allow renders again.");
  process.exit(0);
}

// ============================================
// JOKE REEL RENDERER - CLI Tool
// ============================================
// Usage:
//   npx ts-node render.ts --config joke-config.json
//   npx ts-node render.ts --type question-punchline --question "Why?" --question-audio q.mp3 --punchline "Because!" --punchline-audio p.mp3
//   npx ts-node render.ts --type story --title "My Story" --story "The story text..." --story-audio story.mp3
// ============================================

interface JokeConfig {
  type: "question-punchline" | "story";
  outputFileName?: string;
  questionPunchline?: {
    question: {
      text: string;
      audioFile: string;
      audioDuration: number;
    };
    punchline: {
      text: string;
      audioFile: string;
      audioDuration: number;
    };
  };
  story?: {
    title: string;
    text: string;
    audioFile: string;
    audioDuration: number;
  };
  ctaAudio?: {
    audioSrc: string;
    audioDuration: number;
  };
  bgMusic?: {
    audioSrc: string;
    volume: number;
  };
  style?: {
    backgroundColor?: string;
    textColor?: string;
    accentColor?: string;
    questionColor?: string;
    punchlineColor?: string;
    titleColor?: string;
  };
  settings?: {
    fps?: number;
    handle?: string;
  };
}

// Parse command line arguments
function parseArgs(): { configPath?: string; inline?: Partial<JokeConfig> } {
  const args = process.argv.slice(2);
  const result: { configPath?: string; inline?: Partial<JokeConfig> } = {};

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    const nextArg = args[i + 1];

    switch (arg) {
      case "--config":
      case "-c":
        result.configPath = nextArg;
        i++;
        break;
      case "--type":
      case "-t":
        result.inline = result.inline || {};
        result.inline.type = nextArg as "question-punchline" | "story";
        i++;
        break;
      case "--output":
      case "-o":
        result.inline = result.inline || {};
        result.inline.outputFileName = nextArg;
        i++;
        break;
      case "--question":
        result.inline = result.inline || {};
        result.inline.questionPunchline = result.inline.questionPunchline || {
          question: { text: "", audioFile: "", audioDuration: 0 },
          punchline: { text: "", audioFile: "", audioDuration: 0 },
        };
        result.inline.questionPunchline.question.text = nextArg;
        i++;
        break;
      case "--question-audio":
        result.inline = result.inline || {};
        result.inline.questionPunchline = result.inline.questionPunchline || {
          question: { text: "", audioFile: "", audioDuration: 0 },
          punchline: { text: "", audioFile: "", audioDuration: 0 },
        };
        result.inline.questionPunchline.question.audioFile = nextArg;
        i++;
        break;
      case "--question-duration":
        result.inline = result.inline || {};
        result.inline.questionPunchline = result.inline.questionPunchline || {
          question: { text: "", audioFile: "", audioDuration: 0 },
          punchline: { text: "", audioFile: "", audioDuration: 0 },
        };
        result.inline.questionPunchline.question.audioDuration = parseFloat(nextArg);
        i++;
        break;
      case "--punchline":
        result.inline = result.inline || {};
        result.inline.questionPunchline = result.inline.questionPunchline || {
          question: { text: "", audioFile: "", audioDuration: 0 },
          punchline: { text: "", audioFile: "", audioDuration: 0 },
        };
        result.inline.questionPunchline.punchline.text = nextArg;
        i++;
        break;
      case "--punchline-audio":
        result.inline = result.inline || {};
        result.inline.questionPunchline = result.inline.questionPunchline || {
          question: { text: "", audioFile: "", audioDuration: 0 },
          punchline: { text: "", audioFile: "", audioDuration: 0 },
        };
        result.inline.questionPunchline.punchline.audioFile = nextArg;
        i++;
        break;
      case "--punchline-duration":
        result.inline = result.inline || {};
        result.inline.questionPunchline = result.inline.questionPunchline || {
          question: { text: "", audioFile: "", audioDuration: 0 },
          punchline: { text: "", audioFile: "", audioDuration: 0 },
        };
        result.inline.questionPunchline.punchline.audioDuration = parseFloat(nextArg);
        i++;
        break;
      case "--title":
        result.inline = result.inline || {};
        result.inline.story = result.inline.story || {
          title: "",
          text: "",
          audioFile: "",
          audioDuration: 0,
        };
        result.inline.story.title = nextArg;
        i++;
        break;
      case "--story":
        result.inline = result.inline || {};
        result.inline.story = result.inline.story || {
          title: "",
          text: "",
          audioFile: "",
          audioDuration: 0,
        };
        result.inline.story.text = nextArg;
        i++;
        break;
      case "--story-audio":
        result.inline = result.inline || {};
        result.inline.story = result.inline.story || {
          title: "",
          text: "",
          audioFile: "",
          audioDuration: 0,
        };
        result.inline.story.audioFile = nextArg;
        i++;
        break;
      case "--story-duration":
        result.inline = result.inline || {};
        result.inline.story = result.inline.story || {
          title: "",
          text: "",
          audioFile: "",
          audioDuration: 0,
        };
        result.inline.story.audioDuration = parseFloat(nextArg);
        i++;
        break;
      case "--help":
      case "-h":
        printHelp();
        process.exit(0);
    }
  }

  return result;
}

function printHelp() {
  console.log(`
╔══════════════════════════════════════════════════════════════╗
║           🎬 JOKE REEL RENDERER - CLI Tool                  ║
╚══════════════════════════════════════════════════════════════╝

USAGE:
  npx ts-node render.ts [OPTIONS]

OPTIONS:
  --config, -c <path>       Path to JSON config file
  --type, -t <type>         Joke type: "question-punchline" or "story"
  --output, -o <filename>   Output filename (default: output.mp4)

  Question-Punchline Mode:
    --question <text>           Question text
    --question-audio <file>     Question audio file (in public/ folder)
    --question-duration <sec>   Question audio duration in seconds
    --punchline <text>          Punchline text
    --punchline-audio <file>    Punchline audio file
    --punchline-duration <sec>  Punchline audio duration in seconds

  Story Mode:
    --title <text>              Story title
    --story <text>              Story text
    --story-audio <file>        Story audio file
    --story-duration <sec>      Story audio duration in seconds

EXAMPLES:
  # Using config file:
  npx ts-node render.ts --config joke-config.json

  # Question-Punchline inline:
  npx ts-node render.ts \\
    --type question-punchline \\
    --question "Why do programmers prefer dark mode?" \\
    --question-audio question.mp3 \\
    --question-duration 2.5 \\
    --punchline "Because light attracts bugs!" \\
    --punchline-audio punchline.mp3 \\
    --punchline-duration 1.8 \\
    --output joke-today.mp4

  # Story inline:
  npx ts-node render.ts \\
    --type story \\
    --title "The Developer Interview" \\
    --story "A programmer walks into an interview..." \\
    --story-audio story.mp3 \\
    --story-duration 15 \\
    --output story-today.mp4

CONFIG FILE FORMAT (joke-config.json):
  See joke-config.example.json for full example.
`);
}

function loadConfig(args: ReturnType<typeof parseArgs>): JokeConfig {
  let config: JokeConfig = {
    type: "question-punchline",
    style: {},
    settings: { fps: 30 },
  };

  // Load from file if specified
  if (args.configPath) {
    const configPath = path.resolve(args.configPath);
    if (!fs.existsSync(configPath)) {
      console.error(`❌ Config file not found: ${configPath}`);
      process.exit(1);
    }
    const fileConfig = JSON.parse(fs.readFileSync(configPath, "utf-8"));
    config = { ...config, ...fileConfig };
  }

  // Override with inline args
  if (args.inline) {
    if (args.inline.type) config.type = args.inline.type;
    if (args.inline.outputFileName) config.outputFileName = args.inline.outputFileName;
    if (args.inline.questionPunchline) {
      config.questionPunchline = {
        ...config.questionPunchline,
        ...args.inline.questionPunchline,
      } as JokeConfig["questionPunchline"];
    }
    if (args.inline.story) {
      config.story = { ...config.story, ...args.inline.story } as JokeConfig["story"];
    }
  }

  return config;
}

async function render() {
  console.log("\n🎬 Joke Reel Renderer Starting...\n");

  const args = parseArgs();
  const config = loadConfig(args);

  // Validate config
  const fps = config.settings?.fps || 30;

  // Calculate total duration based on audio
  let durationInFrames: number;
  let inputProps: Record<string, any>;
  let compositionId: string;

  if (config.type === "question-punchline" && config.questionPunchline) {
    const q = config.questionPunchline.question;
    const p = config.questionPunchline.punchline;

    // 1s intro + question audio + 0.5s + 1s pause + punchline audio + 0.5s + 3.5s outro (updated)
    const totalSeconds = 1 + q.audioDuration + 0.5 + 1 + p.audioDuration + 0.5 + 3.5;
    durationInFrames = Math.ceil(totalSeconds * fps);

    compositionId = "QuestionPunchlineJoke";
    inputProps = {
      question: {
        text: q.text,
        audioSrc: q.audioFile,
        audioDuration: q.audioDuration,
      },
      punchline: {
        text: p.text,
        audioSrc: p.audioFile,
        audioDuration: p.audioDuration,
      },
      ctaAudio: config.ctaAudio,
      bgMusic: config.bgMusic,
      style: {
        backgroundColor: config.style?.backgroundColor || "#0f0f23",
        textColor: config.style?.textColor || "#ffffff",
        accentColor: config.style?.accentColor || "#fbbf24",
        questionColor: config.style?.questionColor || "#60a5fa",
        punchlineColor: config.style?.punchlineColor || "#34d399",
      },
    };

    console.log("📝 Type: Question + Punchline");
    console.log(`   Question: "${q.text.substring(0, 50)}..."`);
    console.log(`   Punchline: "${p.text.substring(0, 50)}..."`);
  } else if (config.type === "story" && config.story) {
    const s = config.story;

    // 2s title + story audio + 3.5s outro (updated)
    const totalSeconds = 2 + s.audioDuration + 3.5;
    durationInFrames = Math.ceil(totalSeconds * fps);

    compositionId = "StoryJoke";
    inputProps = {
      title: s.title,
      story: {
        text: s.text,
        audioSrc: s.audioFile,
        audioDuration: s.audioDuration,
      },
      ctaAudio: config.ctaAudio,
      bgMusic: config.bgMusic,
      style: {
        backgroundColor: config.style?.backgroundColor || "#1a1a2e",
        textColor: config.style?.textColor || "#ffffff",
        accentColor: config.style?.accentColor || "#e94560",
        titleColor: config.style?.titleColor || "#fbbf24",
      },
    };

    console.log("📝 Type: Story");
    console.log(`   Title: "${s.title}"`);
    console.log(`   Story: "${s.text.substring(0, 80)}..."`);
  } else {
    console.error("❌ Invalid configuration");
    process.exit(1);
  }

  // Ensure duration doesn't exceed 30 seconds
  const maxFrames = 30 * fps;
  if (durationInFrames > maxFrames) {
    console.warn(`⚠️  Duration exceeds 30s, capping at 30 seconds`);
    durationInFrames = maxFrames;
  }

  console.log(`\n⏱️  Duration: ${(durationInFrames / fps).toFixed(1)}s (${durationInFrames} frames @ ${fps}fps)`);
  console.log(`📐 Resolution: 1080x1920 (9:16 vertical)`);

  const outputPath = path.resolve("out", config.outputFileName || "output.mp4");

  // Ensure output directory exists
  if (!fs.existsSync(path.dirname(outputPath))) {
    fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  }

  console.log(`\n📦 Bundling Remotion project...`);

  const bundleLocation = await bundle({
    entryPoint: path.resolve("src/remotion/index.ts"),
    // If you have a webpack override, add it here
  });

  console.log(`✅ Bundle created`);
  console.log(`\n🎥 Selecting composition: ${compositionId}`);

  const composition = await selectComposition({
    serveUrl: bundleLocation,
    id: compositionId,
    inputProps,
  });

  // Override duration
  composition.durationInFrames = durationInFrames;

  console.log(`\n🎬 Rendering video...`);
  console.log(`   Output: ${outputPath}\n`);

  await renderMedia({
    composition,
    serveUrl: bundleLocation,
    codec: "h264",
    outputLocation: outputPath,
    inputProps,
    onProgress: ({ progress }) => {
      const percent = Math.round(progress * 100);
      process.stdout.write(`\r   Progress: [${"█".repeat(percent / 2)}${"░".repeat(50 - percent / 2)}] ${percent}%`);
    },
  });

  console.log(`\n\n✅ Video rendered successfully!`);
  console.log(`📁 Output: ${outputPath}\n`);
}

render().catch((err) => {
  console.error("❌ Render failed:", err);
  process.exit(1);
});
