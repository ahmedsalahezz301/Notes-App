import { useState, useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import { NotesList } from './NotesList';
import { NoteEditor } from './NoteEditor';
import { Note } from '../types';
import { LogOut, Plus, Moon, Sun, Edit3 } from 'lucide-react';
import { motion } from 'motion/react';

export function Layout() {
  const { user, signOut } = useAuthStore();
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [darkMode, setDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      return document.documentElement.classList.contains('dark');
    }
    return false;
  });

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const handleCreateNew = () => {
    setSelectedNote(null);
    setIsCreating(true);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
        e.preventDefault();
        handleCreateNew();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="flex h-screen bg-white dark:bg-gray-900 overflow-hidden">
      {/* Sidebar / Notes List */}
      <div className={`
        ${selectedNote || isCreating ? 'hidden sm:flex' : 'flex'} 
        flex-col h-full border-r border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50 w-full sm:w-80 flex-shrink-0
      `}>
        <div className="p-4 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold shadow-md shadow-indigo-500/20">
              N
            </div>
            <span className="font-bold text-gray-900 dark:text-white tracking-tight">Notes</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors"
            >
              {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
            <button
              onClick={signOut}
              className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
        
        <div className="p-4">
          <button
            onClick={handleCreateNew}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-all text-sm font-semibold shadow-md shadow-indigo-500/20 hover:shadow-lg hover:shadow-indigo-500/30 active:scale-[0.98]"
          >
            <Plus className="w-4 h-4" />
            New Note
          </button>
        </div>

        <div className="flex-1 overflow-hidden">
          <NotesList 
            onSelectNote={(note) => {
              setSelectedNote(note);
              setIsCreating(false);
            }} 
            selectedNoteId={selectedNote?.id || null} 
          />
        </div>
      </div>

      {/* Main Content Area */}
      <div className={`
        ${!selectedNote && !isCreating ? 'hidden sm:flex' : 'flex'} 
        flex-1 flex-col h-full bg-white dark:bg-gray-900
      `}>
        {selectedNote || isCreating ? (
          <NoteEditor 
            note={selectedNote} 
            onClose={() => {
              setSelectedNote(null);
              setIsCreating(false);
            }} 
          />
        ) : (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex-1 flex flex-col items-center justify-center text-gray-500 dark:text-gray-400"
          >
            <div className="w-20 h-20 mb-6 rounded-2xl bg-gray-50 dark:bg-gray-800/50 flex items-center justify-center border border-gray-100 dark:border-gray-800 shadow-sm">
              <Edit3 className="w-10 h-10 text-gray-400 dark:text-gray-500" />
            </div>
            <p className="text-xl font-semibold text-gray-900 dark:text-white mb-2 tracking-tight">No note selected</p>
            <p className="text-sm text-gray-500">Select a note from the sidebar or create a new one.</p>
          </motion.div>
        )}
      </div>
    </div>
  );
}
