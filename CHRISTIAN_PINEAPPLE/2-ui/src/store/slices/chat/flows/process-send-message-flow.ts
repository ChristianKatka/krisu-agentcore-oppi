import { StoreApi } from "zustand";
import { State } from "../../../state";
import { sendSendMessageService } from "../../../../services/chat.service";
import { parseClaudeResponse } from "./utils/parseClaudeResponse";
import { checkIfItsNewThreadAndIfSoPutNewThreadWithOtherThreads } from "./utils/checkIfItsNewThreadAndIfSoPutNewThreadWithOtherThreads";
import { Message, Thread } from "../../../../models/thread";

export const processSendMessageFlow = async (
  set: StoreApi<State>["setState"],
  get: StoreApi<State>["getState"],
  message: string
) => {
  set((state) => ({
    chat: {
      ...state.chat,
      isSendMessageLoading: true,
    },
  }));

  const idToken = get().auth.tokens.IdToken;
  const selectedThread = get().chat.selectedThread;

  const userMessage: Message = { role: "user", content: message };
  try {
    // THIS IS BRAND NEW THREAD
    if (!selectedThread) {
      console.log("new thread, discussion starts");

      const discussion: Message[] = [userMessage];

      const thread: Thread = await sendSendMessageService(
        idToken,
        discussion,
        null,
        null
      );

      set((state) => ({
        chat: {
          ...state.chat,
          isSendMessageLoading: false,
          threads: { ...state.chat.threads, [thread.threadId]: thread },
          selectedThread: thread,
          selectedThreadId: thread.threadId,
        },
      }));
    } else {
      console.log("existing thread, discussion continues");
      const discussion: Message[] = [...selectedThread.discussion, userMessage];
      const thread: Thread = await sendSendMessageService(
        idToken,
        discussion,
        selectedThread.createdAtTimeStamp,
        selectedThread.threadId
      );

      set((state) => ({
        chat: {
          ...state.chat,
          isSendMessageLoading: false,
          threads: { ...state.chat.threads, [thread.threadId]: thread },
          selectedThread: thread,
          selectedThreadId: thread.threadId,
        },
      }));
    }
  } catch (err) {
    console.log("error:");
    console.log(err);

    set((state) => ({
      chat: {
        ...state.chat,
        isSendMessageLoading: false,
        error: "Failed to send message",
      },
    }));
  }
};
