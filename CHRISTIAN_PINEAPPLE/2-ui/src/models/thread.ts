export interface Citation {
  title: string;
  url: string;
  cited_text: string;
}

type Role = "user" | "assistant";

export interface Message {
  role: Role;
  content: string;
  citations?: Citation[]; // Only assistants may include this
}

export interface Thread {
  threadId: string;
  createdAtTimeStamp: string;
  email: string;
  discussion: Message[];
}
