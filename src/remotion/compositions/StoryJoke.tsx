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
import { StoryJokeProps } from "../schemas";

export const StoryJoke: React.FC<StoryJokeProps> = ({
  title,
  story,
  style,
  ctaAudio,
  bgMusic,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Calculate timing - IMPORTANT: Use actual audio duration for text display
  const titleFrames = Math.round(fps * 2); // 2 seconds for title
  const storyFrames = Math.round(fps * story.audioDuration); // Story duration = exact audio length
  const outroFrames = Math.round(fps * 3); // 3 second outro

  const storyStart = titleFrames;
  const outroStart = storyStart + storyFrames;
  const totalDuration = outroStart + outroFrames;

  // Title animation
  const titleOpacity = interpolate(
    frame,
    [0, fps * 0.5, titleFrames - fps * 0.3, titleFrames],
    [0, 1, 1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  const titleScale = spring({
    frame,
    fps,
    config: { damping: 12 },
  });

  // Story text animation - show for ENTIRE audio duration
  const storyOpacity = interpolate(
    frame,
    [storyStart, storyStart + fps * 0.5, outroStart - fps * 0.5, outroStart],
    [0, 1, 1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  const storyScale = spring({
    frame: frame - storyStart,
    fps,
    config: { damping: 15 },
  });

  // Outro animation
  const outroOpacity = interpolate(
    frame,
    [outroStart, outroStart + fps * 0.3, totalDuration - fps * 0.5, totalDuration],
    [0, 1, 1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  // Determine current phase
  const isTitle = frame < titleFrames;
  const isStory = frame >= storyStart && frame < outroStart;
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
      {/* Animated background */}
      <div
        style={{
          position: "absolute",
          width: "100%",
          height: "100%",
          background: `linear-gradient(${frame}deg, ${style.accentColor}11 0%, transparent 50%)`,
        }}
      />

      {/* Decorative elements */}
      <div
        style={{
          position: "absolute",
          top: 100,
          left: 60,
          width: 80,
          height: 4,
          backgroundColor: style.accentColor,
          transform: `scaleX(${interpolate(frame, [0, fps], [0, 1], { extrapolateRight: "clamp" })})`,
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: 100,
          right: 60,
          width: 80,
          height: 4,
          backgroundColor: style.accentColor,
          transform: `scaleX(${interpolate(frame, [0, fps], [0, 1], { extrapolateRight: "clamp" })})`,
        }}
      />

      {/* Audio */}
      {bgMusic?.audioSrc && (
        <Audio src={staticFile(bgMusic.audioSrc)} volume={bgMusic.volume} loop />
      )}

      {story.audioSrc && (
        <Sequence from={storyStart} durationInFrames={storyFrames}>
          <Audio src={staticFile(story.audioSrc)} volume={1} />
        </Sequence>
      )}
      {ctaAudio?.audioSrc && (
        <Sequence from={outroStart}>
          <Audio src={staticFile(ctaAudio.audioSrc)} volume={1} />
        </Sequence>
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
          opacity: isTitle ? titleOpacity : 1,
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

      {/* Title */}
      {isTitle && (
        <div
          style={{
            opacity: titleOpacity,
            transform: `scale(${titleScale})`,
            textAlign: "center",
            padding: "0 60px",
          }}
        >
          <div
            style={{
              fontSize: 40,
              color: style.accentColor,
              marginBottom: 20,
              textTransform: "uppercase",
              letterSpacing: 6,
            }}
          >
            Story Time
          </div>
          <div
            style={{
              fontSize: 64,
              fontWeight: "900",
              color: "#fbbf24", // Yellow
              lineHeight: 1.3,
              textShadow: "4px 4px 0px #000",
            }}
          >
            {title}
          </div>
          <div style={{ fontSize: 80, marginTop: 40 }}>📖</div>
        </div>
      )}

      {/* Story text - displayed for ENTIRE audio duration */}
      {isStory && (
        <div
          style={{
            opacity: storyOpacity,
            transform: `scale(${storyScale})`,
            padding: "0 60px",
            textAlign: "center",
            position: "absolute",
            top: 300,
            left: 0,
            right: 0,
            bottom: 200,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              fontSize: story.text.length > 400 ? 28 : story.text.length > 300 ? 32 : story.text.length > 200 ? 38 : story.text.length > 100 ? 44 : 52,
              fontWeight: "900",
              color: "#fbbf24",
              lineHeight: 1.4,
              textShadow: "4px 4px 0px #000",
              maxHeight: "100%",
              overflow: "hidden",
              wordWrap: "break-word",
            }}
          >
            {story.text}
          </div>
        </div>
      )}

      {/* Outro */}
      {isOutro && (
        <div
          style={{
            opacity: outroOpacity,
            textAlign: "center",
          }}
        >
          <div style={{ fontSize: 100, marginBottom: 30 }}>😂</div>
          <div
            style={{
              fontSize: 48,
              fontWeight: "bold",
              color: "#ffffff",
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
              color: "#fbbf24",
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
            width: `${(frame / totalDuration) * 100}%`,
            height: "100%",
            backgroundColor: style.accentColor,
            borderRadius: 3,
          }}
        />
      </div>
    </AbsoluteFill>
  );
};
