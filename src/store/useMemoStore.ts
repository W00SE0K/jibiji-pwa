import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import { persist, createJSONStorage } from 'zustand/middleware';

interface MemoStoreState {
  memoIds: string[];
  customTitles: Record<string, string>;
  pinnedIds: string[];
  memos: Record<string, string>; // Storing content in localStorage for simplicity
  
  // Actions
  createMemo: () => string;
  deleteMemo: (id: string) => void;
  updateContent: (id: string, content: string) => void;
  updateTitle: (id: string, title: string) => void;
  togglePin: (id: string) => void;
  getMemo: (id: string) => string;
  getTitle: (id: string) => string;
  isPinned: (id: string) => boolean;
}

export const useMemoStore = create<MemoStoreState>()(
  persist(
    (set, get) => ({
      memoIds: [],
      customTitles: {},
      pinnedIds: [],
      memos: {},

      createMemo: () => {
        const id = uuidv4();
        set((state) => ({
          memoIds: [id, ...state.memoIds], // Add to top
          memos: { ...state.memos, [id]: '' },
        }));
        return id;
      },

      deleteMemo: (id) => {
        set((state) => {
          const newIds = state.memoIds.filter((m) => m !== id);
          const { [id]: deleted, ...remainingMemos } = state.memos;
          const { [id]: deletedTitle, ...remainingTitles } = state.customTitles;
          const newPinned = state.pinnedIds.filter((p) => p !== id);
          return {
            memoIds: newIds,
            memos: remainingMemos,
            customTitles: remainingTitles,
            pinnedIds: newPinned,
          };
        });
      },

      updateContent: (id, content) => {
        set((state) => ({
          memos: { ...state.memos, [id]: content },
        }));
      },

      updateTitle: (id, title) => {
        set((state) => ({
          customTitles: { ...state.customTitles, [id]: title },
        }));
      },

      togglePin: (id) => {
        set((state) => {
          const isPinned = state.pinnedIds.includes(id);
          const newPinned = isPinned
            ? state.pinnedIds.filter((p) => p !== id)
            : [...state.pinnedIds, id];
            
          // If unpinning, move to normal position (which is top for now or sorted by create/edit? Swift logic: insert based on unpinned list logic?)
          // Swift logic:
          // Unpin: remove from pinned, move to top of unpinned section?
          // Pin: move to top of list. 
          
          // Simplified for now: pinnedIds defines visual order/icon.
          // Swift implementation actually reorders the `memoIds` array.
          // "pinnedIds.remove(id); memoIds.remove(at: idx); insert at first non-pinned index"
          // We will replicate this behavior for sorting.
          
          let newMemoIds = [...state.memoIds];
          if (isPinned) {
            // Unpinning
            newMemoIds = newMemoIds.filter(m => m !== id);
            // Insert after all pinned items? 
             // Find insertion point: first item that is NOT in newPinned
             const insertIdx = newMemoIds.findIndex(m => !newPinned.includes(m));
             if (insertIdx === -1) {
                 newMemoIds.push(id);
             } else {
                 newMemoIds.splice(insertIdx, 0, id);
             }
          } else {
              // Pinning
              newMemoIds = newMemoIds.filter(m => m !== id);
              newMemoIds.unshift(id); // Move to very top
          }

          return {
            pinnedIds: newPinned,
            memoIds: newMemoIds
          };
        });
      },

      getMemo: (id) => get().memos[id] || '',
      
      getTitle: (id) => {
        const custom = get().customTitles[id];
        if (custom && custom.trim().length > 0) return custom;
        
        const content = get().memos[id] || '';
        const firstLine = content.split('\n')[0] || '';
        const trimmed = firstLine.trim();
        if (trimmed.length === 0) return 'Untitled';
        return trimmed.length > 30 ? trimmed.substring(0, 30) + '…' : trimmed;
      },

      isPinned: (id) => get().pinnedIds.includes(id),
    }),
    {
      name: 'jibiji-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
