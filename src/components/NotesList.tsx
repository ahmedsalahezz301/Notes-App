import { useState, useEffect } from 'react';
import { useNotesStore } from '../store/notesStore';
import { Note } from '../types';
import { format } from 'date-fns';
import { Search, Plus, Trash2, Edit3, X, Save, Tag, Pin } from 'lucide-react';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';

export function NotesList({ 
  onSelectNote, 
  selectedNoteId 
}: { 
  onSelectNote: (note: Note | null) => void;
  selectedNoteId: string | null;
}) {
  const { notes, loading, error, fetchNotes, deleteNote, updateNote } = useNotesStore();
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchNotes();
  }, [fetchNotes]);

  const filteredNotes = notes.filter(note => 
    note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    note.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
    note.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const sortedNotes = [...filteredNotes].sort((a, b) => {
    if (a.is_pinned && !b.is_pinned) return -1;
    if (!a.is_pinned && b.is_pinned) return 1;
    return new Date(b.updated_at).getTime() > new Date(a.updated_at).getTime() ? -1 : 1;
  });

  return (
    <div className="flex flex-col h-full border-r border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50 w-full sm:w-80 flex-shrink-0">
      <div className="p-4 border-b border-gray-200 dark:border-gray-800">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search notes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-gray-100/50 dark:bg-gray-800/50 border border-transparent focus:border-indigo-500/30 rounded-xl text-sm focus:outline-none focus:ring-4 focus:ring-indigo-500/10 dark:text-white transition-all"
          />
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto">
        {error && (
          <div className="p-4 m-4 bg-red-50 dark:bg-red-900/30 text-red-500 rounded-md text-sm text-center">
            {error}
          </div>
        )}
        {loading ? (
          <div className="p-4 text-center text-gray-500 dark:text-gray-400">Loading notes...</div>
        ) : sortedNotes.length === 0 ? (
          <div className="p-4 text-center text-gray-500 dark:text-gray-400">
            {searchQuery ? 'No notes found.' : 'No notes yet. Create one!'}
          </div>
        ) : (
          <div className="p-3 space-y-1">
            <AnimatePresence mode="popLayout">
              {sortedNotes.map((note, index) => (
                <motion.div
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.2, delay: Math.min(index * 0.05, 0.5) }}
                  key={note.id}
                  onClick={() => onSelectNote(note)}
                  className={cn(
                    "p-4 cursor-pointer rounded-xl transition-all group border",
                    selectedNoteId === note.id 
                      ? "bg-white dark:bg-gray-800 border-indigo-200 dark:border-indigo-500/30 shadow-[0_2px_10px_rgb(0,0,0,0.04)] dark:shadow-[0_2px_10px_rgb(0,0,0,0.2)]" 
                      : "bg-transparent border-transparent hover:bg-gray-100 dark:hover:bg-gray-800/60"
                  )}
                >
                  <div className="flex justify-between items-start mb-1">
                    <h3 className="font-medium text-gray-900 dark:text-white truncate pr-4 flex items-center gap-2">
                      {note.is_pinned && <Pin className="w-3 h-3 text-indigo-500 fill-current" />}
                      {note.title || 'Untitled Note'}
                    </h3>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          updateNote(note.id, { is_pinned: !note.is_pinned });
                        }}
                        className={cn(
                          "text-gray-400 hover:text-indigo-500",
                          note.is_pinned && "text-indigo-500"
                        )}
                        title={note.is_pinned ? "Unpin note" : "Pin note"}
                      >
                      <Pin className="w-4 h-4" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (window.confirm('Are you sure you want to delete this note?')) {
                          deleteNote(note.id);
                          if (selectedNoteId === note.id) onSelectNote(null);
                        }
                      }}
                      className="text-gray-400 hover:text-red-500"
                      title="Delete note"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 mb-2">
                  {note.content || 'No content'}
                </p>
                <div className="flex justify-between items-center text-xs text-gray-400">
                  <span>{format(new Date(note.updated_at), 'MMM d, yyyy')}</span>
                  {note.tags && note.tags.length > 0 && (
                    <div className="flex gap-1">
                      {note.tags.slice(0, 2).map(tag => (
                        <span key={tag} className="bg-gray-200 dark:bg-gray-700 px-1.5 py-0.5 rounded-md truncate max-w-[60px]">
                          {tag}
                        </span>
                      ))}
                      {note.tags.length > 2 && <span>+{note.tags.length - 2}</span>}
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}
