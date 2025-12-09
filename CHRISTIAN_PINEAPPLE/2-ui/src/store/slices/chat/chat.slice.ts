import { StateCreator } from "zustand";
import { State } from "../../state";
import { processSendMessageFlow } from "./flows/process-send-message-flow";
import { processGetThreadsFlow } from "./flows/process-get-threads-flow";
import { selectThreadFlow } from "./flows/select-thread-flow";
import { Message, Thread } from "../../../models/thread";

export interface ChatSlice {
  chat: {
    threads: null | { [threadId: string]: Thread };
    selectedThreadId: null | string;
    selectedThread: null | Thread;
    discussion: Message[];
    isLoadingThreads: boolean;
    isSendMessageLoading: boolean;
    error: string | null;
    startNewMessagingThread: () => void;
    getThreads: () => void;
    selectThread: (id: string) => void;
    deleteThread: (id: string) => void;
    setContext: (context: any) => void;
    suggestTitleWithAi: () => void;
    sendMessage: (message: string) => Promise<void>;
    giveFeedBackOnAssistanceResponse: (
      run_id: string,
      type: "POSITIVE" | "NEGATIVE"
    ) => void;
    reportRunWithUserComment: (runId: string, comment: string) => Promise<void>;
    clearError: () => void;
  };
}

export const createChatSlice: StateCreator<State, [], [], ChatSlice> = (
  set,
  get
) => ({
  chat: {
    threads: {},
    selectedThreadId: null,
    selectedThread: null,
    discussion: [],
    isLoadingThreads: false,
    isLoadingSelectedThread: false,
    isChatResponseEnded: true,
    isSendMessageLoading: false,
    error: null,
    getThreads: async () => {
      await processGetThreadsFlow(set, get);
    },
    startNewMessagingThread: () => {
      set((state) => ({
        chat: {
          ...state.chat,
          selectedThreadId: null,
          selectedThread: null,
          discussion: [],
        },
      }));
    },
    selectThread: (threadId: string) => {
      selectThreadFlow(set, get, threadId);
    },
    deleteThread: async (id: string) => {
      // await deleteThreadFlow(set, get, id);
    },
    setContext: (context: any) => {
      // console.log("context asetettu");
      // set((state) => ({
      //   chat: {
      //     ...state.chat,
      //     context,
      //   },
      // }));
    },
    suggestTitleWithAi: () => {
      // set((state) => ({
      //   chat: {
      //     ...state.chat,
      //     isSuggestTitleWithAi: true,
      //   },
      // }));
    },
    sendMessage: async (message: string) => {
      console.log("sendMessage slice");

      await processSendMessageFlow(set, get, message);
    },
    giveFeedBackOnAssistanceResponse: async (
      run_id: string,
      type: "POSITIVE" | "NEGATIVE"
    ) => {
      // await processGiveFeedBackOnAssistanceResponseFlow(set, get, run_id, type);
    },
    reportRunWithUserComment: async (runId: string, comment: string) => {
      // await processReportRunWithUserCommentFlow(set, get, runId, comment);
    },
    clearError: () =>
      set((state) => ({
        chat: {
          ...state.chat,
          error: null,
        },
      })),
  },
});
