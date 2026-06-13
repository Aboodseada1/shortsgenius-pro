export interface Joke {
  setup: string;
  punchline: string;
}

export const jokes: Joke[] = [
  {
    setup: "Why do programmers prefer dark mode?",
    punchline: "Because light attracts bugs! 🐛"
  },
  {
    setup: "Why did the developer go broke?",
    punchline: "Because he used up all his cache! 💸"
  },
  {
    setup: "Why do Java developers wear glasses?",
    punchline: "Because they can't C#! 👓"
  },
  {
    setup: "What's a programmer's favorite hangout place?",
    punchline: "Foo Bar! 🍺"
  },
  {
    setup: "Why was the JavaScript developer sad?",
    punchline: "Because he didn't Node how to Express himself! 😢"
  },
  {
    setup: "What do you call a programmer from Finland?",
    punchline: "Nerdic! 🇫🇮"
  },
  {
    setup: "Why did the function break up with the variable?",
    punchline: "Because it had too many arguments! 💔"
  },
  {
    setup: "What's a computer's least favorite food?",
    punchline: "Spam! 🥫"
  },
  {
    setup: "Why do programmers hate nature?",
    punchline: "It has too many bugs and no debugging tool! 🌲"
  },
  {
    setup: "What did the router say to the doctor?",
    punchline: "It hurts when IP! 🩺"
  },
  {
    setup: "Why did the database administrator leave his wife?",
    punchline: "She had one-to-many relationships! 💑"
  },
  {
    setup: "What's a programmer's favorite movie?",
    punchline: "The Social Network... just kidding, they don't go outside! 🎬"
  },
  {
    setup: "How many programmers does it take to change a light bulb?",
    punchline: "None, that's a hardware problem! 💡"
  },
  {
    setup: "Why do Python programmers have low self-esteem?",
    punchline: "They're constantly comparing themselves to snakes! 🐍"
  },
  {
    setup: "What's a computer's favorite snack?",
    punchline: "Microchips! 🍟"
  }
];

export function getRandomJoke(): Joke {
  return jokes[Math.floor(Math.random() * jokes.length)];
}
