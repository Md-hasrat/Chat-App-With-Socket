import { create } from 'zustand';
import toast from 'react-hot-toast';
import { axiosInstance } from '../lib/axios';
import { useAuthStore } from './useAuthStore';

export const useChatStore = create((set, get) => ({
  messages: [],
  users: [],
  selectedUser: null,
  isUsersLoading: false,
  isMessagesLoading: false,
  isTyping: false,

  socket: () => useAuthStore.getState().socket,

  getUsers: async () => {
    set({ isUsersLoading: true });
    try {
      const res = await axiosInstance.get("/message/users");
      const userList = Array.isArray(res.data.filteredUsers)
        ? res.data.filteredUsers
        : Array.isArray(res.data)
        ? res.data
        : [];

      set({ users: userList });
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to load users");
      set({ users: [] });
    } finally {
      set({ isUsersLoading: false });
    }
  },

  getMessages: async (userId) => {
    if (!userId) return toast.error("Invalid user selected");
    set({ isMessagesLoading: true });
    try {
      const res = await axiosInstance.get(`/message/chat/${userId}`);
      set({ messages: res.data });
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to load messages");
    } finally {
      set({ isMessagesLoading: false });
    }
  },

  sendMessage: async (messageData) => {
    const { selectedUser, messages } = get();
    if (!selectedUser?._id) return toast.error("No user selected");

    try {
      const res = await axiosInstance.post(`/message/send/${selectedUser._id}`, messageData);
      set({ messages: [...messages, res.data] });
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to send message");
    }
  },

  subscribeToMessage: () => {
    const {selectedUser} = get();
    if (!selectedUser) return;

    const socket = useAuthStore.getState().socket;
    if (!socket) return;

    socket.on("newMessage", (newMessage) => {
      if (newMessage.senderId !== selectedUser._id) return;
      set({ messages: [...get().messages, newMessage] });
    });
  },

//   subscribeToMessage: () => {
//   const { selectedUser } = get();
//   const authUser = useAuthStore.getState().authUser;
//   const socket = useAuthStore.getState().socket;

//   if (!selectedUser || !authUser || !socket) return;

//   socket.off("newMessage"); // Cleanup to avoid multiple listeners

//   socket.on("newMessage", (newMessage) => {
//     const isCurrentChat =
//       (newMessage.senderId === selectedUser._id && newMessage.recieverId === authUser._id) ||
//       (newMessage.senderId === authUser._id && newMessage.recieverId === selectedUser._id);

//     if (!isCurrentChat) return; // Don't show messages from other chats

//     set((state) => ({
//       messages: [...state.messages, newMessage],
//     }));
//   });
// },


  unsubscribeFromMessage: () => {
    const socket = useAuthStore.getState().socket;
    if (socket) socket.off("newMessage");
  },

//   subscribeToTyping: () => {
//     const socket = useAuthStore.getState().socket;
//     if (!socket) return;

//     socket.on("typing", (senderId) => {
//       if (senderId === get().selectedUser?._id) {
//         set({ isTyping: true });
//       }
//     });

//     socket.on("stopTyping", (senderId) => {
//       if (senderId === get().selectedUser?._id) {
//         set({ isTyping: false });
//       }
//     });
//   },

//   unsubscribeFromTyping: () => {
//     const socket = useAuthStore.getState().socket;
//     if (!socket) return;

//     socket.off("typing");
//     socket.off("stopTyping");
//   },

  setSelectedUser: (selectedUser) => set({ selectedUser }),
}));
