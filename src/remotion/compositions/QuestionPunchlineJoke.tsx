import {
  AbsoluteFill,
  Audio,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
  staticFile,
  Sequence,
} from "remotion";
import { JokeProps } from "../schemas";

export const QuestionPunchlineJoke: React.FC<JokeProps> = ({
  question,
  punchline,
  style,
  ctaAudio,
  bgMusic,
}) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  // Calculate timing based on audio durations
  const introFrames = Math.round(fps * 1); // 1 second intro
  const questionFrames = Math.round(fps * (question.audioDuration + 0.5)); // Audio + 0.5s pause
  const pauseFrames = Math.round(fps * 1); // 1 second pause between Q&A
  const punchlineFrames = Math.round(fps * (punchline.audioDuration + 0.5)); // Audio + 0.5s pause
  const outroFrames = Math.round(fps * 3); // 3 second outro

  const questionStart = introFrames;
  const pauseStart = questionStart + questionFrames;
  const punchlineStart = pauseStart + pauseFrames;
  const outroStart = punchlineStart + punchlineFrames;
  const totalDuration = outroStart + outroFrames;

  // Intro animation
  const introOpacity = interpolate(frame, [0, fps * 0.5], [0, 1], {
    extrapolateRight: "clamp",
  });

  const introScale = spring({
    frame,
    fps,
    config: { damping: 12 },
  });

  // Question animation
  const questionOpacity = interpolate(
    frame,
    [questionStart, questionStart + fps * 0.3, pauseStart - fps * 0.3, pauseStart],
    [0, 1, 1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  const questionY = spring({
    frame: frame - questionStart,
    fps,
    config: { damping: 15 },
  });

  // Punchline animation
  const punchlineOpacity = interpolate(
    frame,
    [punchlineStart, punchlineStart + fps * 0.3],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  const punchlineScale = spring({
    frame: frame - punchlineStart,
    fps,
    config: { damping: 10, mass: 0.8 },
  });

  // Outro animation
  const outroOpacity = interpolate(
    frame,
    [outroStart, outroStart + fps * 0.3, totalDuration - fps * 0.5, totalDuration],
    [0, 1, 1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  // Determine current phase for visual effects
  const isIntro = frame < questionStart;
  const isQuestion = frame >= questionStart && frame < punchlineStart;
  const isPunchline = frame >= punchlineStart && frame < outroStart;
  const isOutro = frame >= outroStart;

  return (
    <AbsoluteFill
      style={{
        backgroundColor: style.backgroundColor,
        justifyContent: "center",
        alignItems: "center",
        fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
      }}
    >
      {/* Background animated gradient */}
      <div
        style={{
          position: "absolute",
          width: "200%",
          height: "200%",
          background: `radial-gradient(circle at 50% 50%, ${style.accentColor}22 0%, transparent 50%)`,
          transform: `rotate(${frame * 0.5}deg)`,
        }}
      />

      {/* Audio sequences */}
      {bgMusic?.audioSrc && (
        <Audio src={staticFile(bgMusic.audioSrc)} volume={bgMusic.volume} loop />
      )}

      {question.audioSrc && (
        <Sequence from={questionStart} durationInFrames={questionFrames}>
          <Audio src={staticFile(question.audioSrc)} volume={1} />
        </Sequence>
      )}
      {punchline.audioSrc && (
        <Sequence from={punchlineStart} durationInFrames={punchlineFrames}>
          <Audio src={staticFile(punchline.audioSrc)} volume={1} />
        </Sequence>
      )}
      {ctaAudio?.audioSrc && (
        <Sequence from={outroStart}>
          <Audio src={staticFile(ctaAudio.audioSrc)} volume={1} />
        </Sequence>
      )}

      {/* Intro */}
      {isIntro && (
        <div
          style={{
            opacity: introOpacity,
            transform: `scale(${introScale})`,
            textAlign: "center",
          }}
        >
          <div style={{ fontSize: 120, marginBottom: 20 }}>😂</div>
          <div
            style={{
              fontSize: 48,
              fontWeight: "bold",
              color: style.accentColor,
              textTransform: "uppercase",
              letterSpacing: 8,
            }}
          >
            Daily Joke
          </div>
        </div>
      )}

      {/* Question */}
      {isQuestion && (
        <div
          style={{
            opacity: questionOpacity,
            transform: `translateY(${(1 - questionY) * 50}px)`,
            padding: "0 60px",
            textAlign: "center",
          }}
        >
          <div
            style={{
              fontSize: 60,
              fontWeight: "900", // Extra bold
              color: "#fbbf24", // Force yellow as requested
              lineHeight: 1.4,
              textShadow: "4px 4px 0px #000", // Hard black shadow
              textTransform: "uppercase",
            }}
          >
            {question.text}
          </div>
          <div
            style={{
              marginTop: 40,
              fontSize: 80,
            }}
          >
            🤔
          </div>
        </div>
      )}

      {/* Punchline */}
      {isPunchline && (
        <div
          style={{
            opacity: punchlineOpacity,
            transform: `scale(${punchlineScale})`,
            padding: "0 60px",
            textAlign: "center",
          }}
        >
          <div
            style={{
              fontSize: 72,
              fontWeight: "900", // Extra bold
              color: "#ffffff", // White as requested
              lineHeight: 1.4,
              textShadow: "4px 4px 0px #000", // Hard black shadow
            }}
          >
            {punchline.text}
          </div>
          <div
            style={{
              marginTop: 50,
              fontSize: 100,
            }}
          >
            🤣
          </div>
        </div>
      )}

      {/* Logo */}
      <div
        style={{
          position: "absolute",
          top: 80,
          left: 0,
          right: 0,
          display: "flex",
          justifyContent: "center",
          opacity: isIntro ? introOpacity : 1,
        }}
      >
        <img
          src={staticFile("1024x1024.png")}
          style={{
            width: 200,
            height: 200,
            borderRadius: 40,
            boxShadow: "0 15px 40px rgba(0,0,0,0.6)",
          }}
        />
      </div>

      {/* Outro */}
      {isOutro && (
        <div
          style={{
            opacity: outroOpacity,
            textAlign: "center",
          }}
        >
          <div
            style={{
              fontSize: 48,
              fontWeight: "bold",
              color: style.textColor,
              marginBottom: 20,
              textShadow: "2px 2px 0px #000",
            }}
          >
            Subscribe for more! 🚀
          </div>
          <div
            style={{
              fontSize: 40,
              fontWeight: "900",
              color: "#fbbf24", // Yellow accent
              textShadow: "2px 2px 0px #000",
            }}
          >
            @daddysjokes
          </div>
        </div>
      )}

      {/* Progress bar */}
      <div
        style={{
          position: "absolute",
          bottom: 40,
          left: 60,
          right: 60,
          height: 6,
          backgroundColor: "rgba(255,255,255,0.2)",
          borderRadius: 3,
        }}
      >
        <div
          style={{
            width: `${(frame / durationInFrames) * 100}%`,
            height: "100%",
            backgroundColor: style.accentColor,
            borderRadius: 3,
          }}
        />
      </div>
    </AbsoluteFill>
  );
};
