export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

export interface Thread {
  id: string;
  title: string;
  preview: string;
  createdAt: Date;
  updatedAt: Date;
  messageCount: number;
  messages: Message[];
}

// Helper to create dates relative to now
const now = new Date();
const hoursAgo = (hours: number) =>
  new Date(now.getTime() - hours * 60 * 60 * 1000);
const daysAgo = (days: number) =>
  new Date(now.getTime() - days * 24 * 60 * 60 * 1000);

export const mockThreads: Thread[] = [
  // Today
  {
    id: "thread-1",
    title: "React Best Practices",
    preview: "Can you explain the best practices for React hooks?",
    createdAt: hoursAgo(2),
    updatedAt: hoursAgo(2),
    messageCount: 8,
    messages: [
      {
        id: "msg-1",
        role: "user",
        content: "Can you explain the best practices for React hooks?",
        timestamp: hoursAgo(2),
      },
      {
        id: "msg-2",
        role: "assistant",
        content: "Sure! Here are the key best practices for React hooks...",
        timestamp: hoursAgo(2),
      },
    ],
  },
  {
    id: "thread-2",
    title: "TypeScript Generics",
    preview: "How do I use generics in TypeScript effectively?",
    createdAt: hoursAgo(5),
    updatedAt: hoursAgo(5),
    messageCount: 12,
    messages: [
      {
        id: "msg-3",
        role: "user",
        content: "How do I use generics in TypeScript effectively?",
        timestamp: hoursAgo(5),
      },
      {
        id: "msg-4",
        role: "assistant",
        content: "Generics in TypeScript allow you to write reusable code...",
        timestamp: hoursAgo(5),
      },
    ],
  },

  // Yesterday
  {
    id: "thread-3",
    title: "AWS Amplify Setup",
    preview: "Help me set up AWS Amplify authentication",
    createdAt: daysAgo(1),
    updatedAt: daysAgo(1),
    messageCount: 15,
    messages: [
      {
        id: "msg-5",
        role: "user",
        content: "Help me set up AWS Amplify authentication",
        timestamp: daysAgo(1),
      },
      {
        id: "msg-6",
        role: "assistant",
        content: "Let's set up Amplify Auth step by step...",
        timestamp: daysAgo(1),
      },
    ],
  },
  {
    id: "thread-4",
    title: "CSS Grid Layout",
    preview: "What's the difference between Grid and Flexbox?",
    createdAt: daysAgo(1),
    updatedAt: daysAgo(1),
    messageCount: 6,
    messages: [
      {
        id: "msg-7",
        role: "user",
        content: "What's the difference between Grid and Flexbox?",
        timestamp: daysAgo(1),
      },
      {
        id: "msg-8",
        role: "assistant",
        content: "Grid and Flexbox serve different purposes...",
        timestamp: daysAgo(1),
      },
    ],
  },

  // 7 days ago
  {
    id: "thread-5",
    title: "Database Design",
    preview: "How should I structure my database schema?",
    createdAt: daysAgo(7),
    updatedAt: daysAgo(7),
    messageCount: 20,
    messages: [
      {
        id: "msg-9",
        role: "user",
        content: "How should I structure my database schema?",
        timestamp: daysAgo(7),
      },
      {
        id: "msg-10",
        role: "assistant",
        content: "Database schema design depends on your use case...",
        timestamp: daysAgo(7),
      },
    ],
  },
  {
    id: "thread-6",
    title: "API Rate Limiting",
    preview: "Implementing rate limiting in Express",
    createdAt: daysAgo(8),
    updatedAt: daysAgo(8),
    messageCount: 10,
    messages: [
      {
        id: "msg-11",
        role: "user",
        content: "Implementing rate limiting in Express",
        timestamp: daysAgo(8),
      },
      {
        id: "msg-12",
        role: "assistant",
        content: "Rate limiting is important for API security...",
        timestamp: daysAgo(8),
      },
    ],
  },

  // 2 weeks ago
  {
    id: "thread-7",
    title: "Docker Compose",
    preview: "Setting up multi-container applications",
    createdAt: daysAgo(14),
    updatedAt: daysAgo(14),
    messageCount: 18,
    messages: [
      {
        id: "msg-13",
        role: "user",
        content: "Setting up multi-container applications",
        timestamp: daysAgo(14),
      },
      {
        id: "msg-14",
        role: "assistant",
        content:
          "Docker Compose makes it easy to manage multiple containers...",
        timestamp: daysAgo(14),
      },
    ],
  },
  {
    id: "thread-8",
    title: "GraphQL vs REST",
    preview: "When should I use GraphQL over REST?",
    createdAt: daysAgo(15),
    updatedAt: daysAgo(15),
    messageCount: 14,
    messages: [
      {
        id: "msg-15",
        role: "user",
        content: "When should I use GraphQL over REST?",
        timestamp: daysAgo(15),
      },
      {
        id: "msg-16",
        role: "assistant",
        content: "Both have their use cases. Let me explain...",
        timestamp: daysAgo(15),
      },
    ],
  },

  // 3 weeks ago
  {
    id: "thread-9",
    title: "Testing Strategies",
    preview: "Unit vs Integration vs E2E testing",
    createdAt: daysAgo(21),
    updatedAt: daysAgo(21),
    messageCount: 16,
    messages: [
      {
        id: "msg-17",
        role: "user",
        content: "Unit vs Integration vs E2E testing",
        timestamp: daysAgo(21),
      },
      {
        id: "msg-18",
        role: "assistant",
        content: "Each testing type serves a different purpose...",
        timestamp: daysAgo(21),
      },
    ],
  },

  // 1 month ago
  {
    id: "thread-10",
    title: "Microservices Architecture",
    preview: "Pros and cons of microservices",
    createdAt: daysAgo(30),
    updatedAt: daysAgo(30),
    messageCount: 25,
    messages: [
      {
        id: "msg-19",
        role: "user",
        content: "Pros and cons of microservices",
        timestamp: daysAgo(30),
      },
      {
        id: "msg-20",
        role: "assistant",
        content: "Microservices offer many benefits but also challenges...",
        timestamp: daysAgo(30),
      },
    ],
  },
  {
    id: "thread-11",
    title: "Security Best Practices",
    preview: "How to secure a web application?",
    createdAt: daysAgo(32),
    updatedAt: daysAgo(32),
    messageCount: 22,
    messages: [
      {
        id: "msg-21",
        role: "user",
        content: "How to secure a web application?",
        timestamp: daysAgo(32),
      },
      {
        id: "msg-22",
        role: "assistant",
        content: "Web security involves multiple layers...",
        timestamp: daysAgo(32),
      },
    ],
  },

  // 2 months ago
  {
    id: "thread-12",
    title: "Performance Optimization",
    preview: "Making my React app faster",
    createdAt: daysAgo(60),
    updatedAt: daysAgo(60),
    messageCount: 19,
    messages: [
      {
        id: "msg-23",
        role: "user",
        content: "Making my React app faster",
        timestamp: daysAgo(60),
      },
      {
        id: "msg-24",
        role: "assistant",
        content: "There are several optimization techniques...",
        timestamp: daysAgo(60),
      },
    ],
  },
];

// Helper function to group threads by time period
export const groupThreadsByTime = (threads: Thread[]) => {
  const groups: Record<string, Thread[]> = {
    Today: [],
    Yesterday: [],
    "Last 7 days": [],
    "Last 2 weeks": [],
    "Last 3 weeks": [],
    "Last month": [],
    Older: [],
  };

  const oneDayMs = 24 * 60 * 60 * 1000;

  threads.forEach((thread) => {
    const daysDiff = Math.floor(
      (now.getTime() - thread.updatedAt.getTime()) / oneDayMs
    );

    if (daysDiff === 0) {
      groups.Today.push(thread);
    } else if (daysDiff === 1) {
      groups.Yesterday.push(thread);
    } else if (daysDiff <= 7) {
      groups["Last 7 days"].push(thread);
    } else if (daysDiff <= 14) {
      groups["Last 2 weeks"].push(thread);
    } else if (daysDiff <= 21) {
      groups["Last 3 weeks"].push(thread);
    } else if (daysDiff <= 30) {
      groups["Last month"].push(thread);
    } else {
      groups.Older.push(thread);
    }
  });

  // Remove empty groups
  return Object.entries(groups).filter(([_, threads]) => threads.length > 0);
};
