export interface StoryJoke {
  title: string;
  story: string[];
  punchline: string;
}

export const storyJokes: StoryJoke[] = [
  {
    title: "The Debugging Session",
    story: [
      "A programmer is walking through the park when he finds a frog.",
      "The frog says, 'If you kiss me, I'll turn into a beautiful princess and stay with you for a week.'",
      "The programmer picks up the frog and puts it in his pocket.",
      "The frog says, 'Hey! Didn't you hear me? I'll be your girlfriend for a whole week!'",
      "The programmer takes the frog out, smiles, and puts it back in his pocket."
    ],
    punchline: "'Look,' he says, 'I'm a programmer. I don't have time for a girlfriend. But a talking frog? That's cool!' 🐸"
  },
  {
    title: "The Interview",
    story: [
      "A software engineer goes to a job interview.",
      "The interviewer asks, 'What's your biggest weakness?'",
      "He replies, 'I'm too honest.'",
      "The interviewer says, 'I don't think that's a weakness.'",
    ],
    punchline: "The engineer says, 'I don't really care what you think.' 😅"
  },
  {
    title: "The QA Engineer",
    story: [
      "A QA engineer walks into a bar.",
      "Orders 1 beer.",
      "Orders 0 beers.",
      "Orders 99999999 beers.",
      "Orders -1 beers.",
      "Orders a lizard.",
      "Orders NULL beers.",
    ],
    punchline: "First real customer walks in and asks where the bathroom is. The bar bursts into flames. 🔥"
  },
  {
    title: "The Project Manager",
    story: [
      "A project manager, a developer, and a QA tester are walking in a forest.",
      "They find a magic lamp. A genie pops out and says, 'I'll grant each of you one wish.'",
      "The QA tester says, 'I want to be on a beach in Hawaii!' POOF! He's gone.",
      "The developer says, 'I want to be in a mansion with unlimited food!' POOF! He's gone.",
    ],
    punchline: "The PM says, 'I want those two back after lunch.' 💼"
  },
  {
    title: "The Programmer's Son",
    story: [
      "A programmer's wife asks him to go to the store.",
      "'Go get a gallon of milk. If they have eggs, get a dozen.'",
      "He comes back with 12 gallons of milk.",
      "His wife yells, 'Why did you get 12 gallons of milk?!'",
    ],
    punchline: "'Because they had eggs!' 🥛🥚"
  },
  {
    title: "The Tech Support Call",
    story: [
      "A man calls tech support...",
      "Tech: 'Have you tried turning it off and on again?'",
      "Man: 'Yes, three times!'",
      "Tech: 'Did you try unplugging it and plugging it back in?'",
      "Man: 'Yes! Nothing works!'",
      "Tech: 'Sir, what exactly is the problem?'",
    ],
    punchline: "Man: 'My wife hasn't spoken to me in three days!' 📞"
  },
  {
    title: "The Code Review",
    story: [
      "A senior developer is reviewing a junior's code.",
      "Senior: 'Why is this function 500 lines long?'",
      "Junior: 'I wanted to keep everything in one place.'",
      "Senior: 'And why are there no comments?'",
      "Junior: 'The code is self-documenting!'",
      "Senior: 'What about these 47 global variables?'",
    ],
    punchline: "Junior: 'That way every function can access them easily!' 💀"
  },
  {
    title: "The Startup",
    story: [
      "Two programmers start a company.",
      "Day 1: 'We'll disrupt the industry!'",
      "Week 1: 'Let's build an MVP'",
      "Month 1: 'We need to pivot'",
      "Month 3: 'We're running out of money'",
      "Month 6: 'Should we get real jobs?'",
    ],
    punchline: "Month 7: They get acquired by Google. For the office plants. 🌱"
  },
  {
    title: "The Bug Hunt",
    story: [
      "It's 3 AM. A programmer is still at the office.",
      "He's been hunting a bug for 6 hours.",
      "He's gone through 15 cups of coffee.",
      "He's questioned every life choice.",
      "Finally... he finds it.",
    ],
    punchline: "It was a missing semicolon. He cries. 😭;"
  },
  {
    title: "The Meeting",
    story: [
      "A developer gets pulled into a meeting.",
      "'This will only take 5 minutes.'",
      "30 minutes in: 'Quick question...'",
      "1 hour in: 'One more thing...'",
      "2 hours in: 'Let's schedule a follow-up.'",
    ],
    punchline: "He could have deployed to production 17 times by now. 📅"
  },
  {
    title: "The Legacy Code",
    story: [
      "A new developer joins the team.",
      "Manager: 'Here's the codebase. It's a bit old.'",
      "The code was written in 2003.",
      "There are no tests.",
      "Comments say things like 'TODO: fix this hack (2005)'",
      "The main function is 3000 lines.",
    ],
    punchline: "'The original developer?' Manager: 'No one knows. We call him... The Ancient One.' 🧙‍♂️"
  },
  {
    title: "The Git Blame",
    story: [
      "Developer: 'Who wrote this terrible code?'",
      "*runs git blame*",
      "*sweats nervously*",
      "*closes terminal*",
      "*deletes bash history*",
    ],
    punchline: "It was him. From 6 months ago. Past him was an idiot. 🤡"
  }
];

export function getRandomStoryJoke(): StoryJoke {
  return storyJokes[Math.floor(Math.random() * storyJokes.length)];
}
