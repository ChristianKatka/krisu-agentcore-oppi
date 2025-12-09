import { create } from "zustand";
import { devtools } from "zustand/middleware";

import { ChatSlice, createChatSlice } from "./slices/chat/chat.slice";

export interface State extends ChatSlice {}

export const useMyStore = create<State>()(
  devtools(
    (set, get, store) => ({
      ...createChatSlice(set, get, store),
    }),
    { name: "ZustandStore" }
  )
);
