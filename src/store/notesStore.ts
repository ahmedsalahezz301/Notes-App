import { create } from 'zustand';
import { Note } from '../types';
import { supabase } from '../lib/supabase';

interface NotesState {
  notes: Note[];
  loading: boolean;
  error: string | null;
  fetchNotes: () => Promise<void>;
  addNote: (note: Omit<Note, 'id' | 'created_at' | 'updated_at' | 'user_id'>) => Promise<void>;
  updateNote: (id: string, updates: Partial<Note>) => Promise<void>;
  deleteNote: (id: string) => Promise<void>;
  setNotes: (notes: Note[]) => void;
}

export const useNotesStore = create<NotesState>((set, get) => ({
  notes: [],
  loading: false,
  error: null,
  setNotes: (notes) => set({ notes }),
  fetchNotes: async () => {
    set({ loading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('notes')
        .select('*')
        .order('updated_at', { ascending: false });

      if (error) throw error;
      set({ notes: data as Note[] });
    } catch (error: any) {
      set({ error: error.message });
    } finally {
      set({ loading: false });
    }
  },
  addNote: async (note) => {
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error('Not authenticated');

      const newNote = {
        ...note,
        user_id: userData.user.id,
      };

      const { data, error } = await supabase
        .from('notes')
        .insert([newNote])
        .select()
        .single();

      if (error) throw error;
      set({ notes: [data as Note, ...get().notes] });
    } catch (error: any) {
      set({ error: error.message });
      throw error;
    }
  },
  updateNote: async (id, updates) => {
    try {
      const { data, error } = await supabase
        .from('notes')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      set({
        notes: get().notes.map((n) => (n.id === id ? (data as Note) : n)),
      });
    } catch (error: any) {
      set({ error: error.message });
      throw error;
    }
  },
  deleteNote: async (id) => {
    try {
      const { error } = await supabase.from('notes').delete().eq('id', id);
      if (error) throw error;
      set({ notes: get().notes.filter((n) => n.id !== id) });
    } catch (error: any) {
      set({ error: error.message });
      throw error;
    }
  },
}));
