import { StoreApi } from "zustand";
import { State } from "../../../state";
import { getThreadsService } from "../../../../services/chat.service";
import { Thread } from "../../../../models/thread";
import { arrayToHashmap } from "../../../../shared/array-to-dictionary.util";

export const processGetThreadsFlow = async (
  set: StoreApi<State>["setState"],
  get: StoreApi<State>["getState"]
) => {
  set((state) => {
    return {
      chat: {
        ...state.chat,
        isLoadingThreads: true,
      },
    };
  });

  try {
    const idToken = get().auth.tokens.IdToken;
    const rawThreads: Thread[] = await getThreadsService(idToken);

    const threadsAsDictionary: {
      [threadId: string]: Thread;
    } = arrayToHashmap(rawThreads, "threadId");

    set((state) => {
      return {
        chat: {
          ...state.chat,
          threads: threadsAsDictionary,
          isLoadingThreads: false,
        },
      };
    });
  } catch (err) {
    console.log(err);
    set((state) => ({
      chat: {
        ...state.chat,
        error: "Failed to get threads",
        isLoadingThreads: false,
      },
    }));
  }
};
