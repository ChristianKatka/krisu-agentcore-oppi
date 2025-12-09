export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

export interface Discussion {
  threadId: string;
  messages: Message[];
}

export const mockDiscussion: Discussion = {
  threadId: "thread-1",
  messages: [
    {
      id: "msg-1",
      role: "user",
      content: "Can you help me understand how React hooks work?",
      timestamp: new Date("2024-12-05T10:30:00"),
    },
    {
      id: "msg-2",
      role: "assistant",
      content:
        "I'd be happy to help you understand React hooks! Hooks are functions that let you use state and other React features in functional components.\n\nThe most commonly used hooks are:\n\n1. **useState** - Lets you add state to functional components\n2. **useEffect** - Lets you perform side effects (like data fetching, subscriptions)\n3. **useContext** - Lets you access context values\n4. **useRef** - Lets you create mutable references\n\nWould you like me to explain any specific hook in more detail?",
      timestamp: new Date("2024-12-05T10:30:15"),
    },
    {
      id: "msg-3",
      role: "user",
      content:
        "Yes, can you explain useState with a practical example? Maybe a counter?",
      timestamp: new Date("2024-12-05T10:31:00"),
    },
    {
      id: "msg-4",
      role: "assistant",
      content:
        "Absolutely! Here's a simple counter example using useState:\n\n```tsx\nimport { useState } from 'react';\n\nexport const Counter = () => {\n  const [count, setCount] = useState(0);\n\n  return (\n    <div>\n      <p>Count: {count}</p>\n      <button onClick={() => setCount(count + 1)}>\n        Increment\n      </button>\n      <button onClick={() => setCount(count - 1)}>\n        Decrement\n      </button>\n      <button onClick={() => setCount(0)}>\n        Reset\n      </button>\n    </div>\n  );\n};\n```\n\nKey points:\n- `useState(0)` initializes the state with 0\n- It returns an array: `[currentValue, setterFunction]`\n- Calling `setCount` triggers a re-render with the new value\n- The component re-renders whenever state changes",
      timestamp: new Date("2024-12-05T10:31:30"),
    },
    {
      id: "msg-5",
      role: "user",
      content:
        "That's really clear! What about useEffect? When should I use it?",
      timestamp: new Date("2024-12-05T10:32:00"),
    },
    {
      id: "msg-6",
      role: "assistant",
      content:
        "Great question! useEffect is for side effects - operations that affect things outside your component. Common use cases:\n\n**1. Data Fetching**\n```tsx\nuseEffect(() => {\n  fetch('/api/data')\n    .then(res => res.json())\n    .then(data => setData(data));\n}, []); // Empty array = run once on mount\n```\n\n**2. Subscriptions**\n```tsx\nuseEffect(() => {\n  const subscription = subscribe();\n  return () => subscription.unsubscribe(); // Cleanup\n}, []);\n```\n\n**3. Responding to State Changes**\n```tsx\nuseEffect(() => {\n  console.log('Count changed:', count);\n}, [count]); // Runs when count changes\n```\n\nThe dependency array is crucial:\n- `[]` = run once on mount\n- `[value]` = run when value changes\n- No array = run on every render",
      timestamp: new Date("2024-12-05T10:32:45"),
    },
  ],
};
