import { StoreApi } from "zustand";
import { State } from "../../../state";

export const selectThreadFlow = async (
  set: StoreApi<State>["setState"],
  get: StoreApi<State>["getState"],
  threadId: string
) => {
  const threads = get().chat.threads;
  if (!threads) return;

  const selectedThread = threads[threadId];

  set((state) => ({
    chat: {
      ...state.chat,
      selectedThread,
      selectedThreadId: threadId,
    },
  }));
};
