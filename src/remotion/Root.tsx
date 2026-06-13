import { Composition } from "remotion";
import { QuestionPunchlineJoke } from "./compositions/QuestionPunchlineJoke";
import { StoryJoke } from "./compositions/StoryJoke";
import { JokeSchema, StoryJokeSchema } from "./schemas";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      {/* Type 1: Question + Punchline Joke */}
      <Composition
        id="QuestionPunchlineJoke"
        component={QuestionPunchlineJoke}
        durationInFrames={900} // Will be overridden by calculated duration
        fps={30}
        width={1080}
        height={1920}
        schema={JokeSchema}
        defaultProps={{
          question: {
            text: "Why do programmers prefer dark mode?",
            audioSrc: "",
            audioDuration: 2,
          },
          punchline: {
            text: "Because light attracts bugs!",
            audioSrc: "",
            audioDuration: 2,
          },
          style: {
            backgroundColor: "#0f0f23",
            textColor: "#ffffff",
            accentColor: "#fbbf24",
            questionColor: "#60a5fa",
            punchlineColor: "#34d399",
          },
        }}
      />

      {/* Type 2: Story-based Joke */}
      <Composition
        id="StoryJoke"
        component={StoryJoke}
        durationInFrames={900}
        fps={30}
        width={1080}
        height={1920}
        schema={StoryJokeSchema}
        defaultProps={{
          title: "The Developer Interview",
          story: {
            text: "A programmer goes to a job interview...",
            audioSrc: "",
            audioDuration: 10,
          },
          style: {
            backgroundColor: "#1a1a2e",
            textColor: "#ffffff",
            accentColor: "#e94560",
            titleColor: "#fbbf24",
          },
        }}
      />
    </>
  );
};
