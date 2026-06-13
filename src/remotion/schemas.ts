import { z } from "zod";

// Schema for Question + Punchline jokes (Type 1)
export const JokeSchema = z.object({
  question: z.object({
    text: z.string(),
    audioSrc: z.string(), // Path to audio file
    audioDuration: z.number(), // Duration in seconds
  }),
  punchline: z.object({
    text: z.string(),
    audioSrc: z.string(),
    audioDuration: z.number(),
  }),
  style: z.object({
    backgroundColor: z.string().default("#0f0f23"),
    textColor: z.string().default("#ffffff"),
    accentColor: z.string().default("#fbbf24"),
    questionColor: z.string().default("#60a5fa"),
    punchlineColor: z.string().default("#34d399"),
  }),
  ctaAudio: z.object({
    audioSrc: z.string(),
    audioDuration: z.number(),
  }).optional(),
  bgMusic: z.object({
    audioSrc: z.string(),
    volume: z.number().default(0.1),
  }).optional(),
});

// Schema for Story-based jokes (Type 2)
export const StoryJokeSchema = z.object({
  title: z.string(),
  story: z.object({
    text: z.string(),
    audioSrc: z.string(),
    audioDuration: z.number(),
  }),
  style: z.object({
    backgroundColor: z.string().default("#1a1a2e"),
    textColor: z.string().default("#ffffff"),
    accentColor: z.string().default("#e94560"),
    titleColor: z.string().default("#fbbf24"),
  }),
  ctaAudio: z.object({
    audioSrc: z.string(),
    audioDuration: z.number(),
  }).optional(),
  bgMusic: z.object({
    audioSrc: z.string(),
    volume: z.number().default(0.1),
  }).optional(),
});

export type JokeProps = z.infer<typeof JokeSchema>;
export type StoryJokeProps = z.infer<typeof StoryJokeSchema>;
