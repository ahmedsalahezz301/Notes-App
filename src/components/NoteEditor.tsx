import React, { useState, useEffect } from 'react';
import { Note } from '../types';
import { useNotesStore } from '../store/notesStore';
import { Save, Tag, X, Eye, Edit2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { motion } from 'motion/react';

export function NoteEditor({ 
  note, 
  onClose 
}: { 
  note: Note | null;
  onClose: () => void;
}) {
  const { addNote, updateNote } = useNotesStore();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isPreview, setIsPreview] = useState(false);

  useEffect(() => {
    if (note) {
      setTitle(note.title);
      setContent(note.content);
      setTags(note.tags || []);
    } else {
      setTitle('');
      setContent('');
      setTags([]);
    }
    setIsPreview(false);
  }, [note]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      if (note) {
        await updateNote(note.id, { title, content, tags });
      } else {
        await addNote({ title, content, tags });
        onClose(); // Close editor after creating new note
      }
    } catch (err) {
      console.error("Failed to save note:", err);
    } finally {
      setIsSaving(false);
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        if (title.trim() || content.trim()) {
          handleSave();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [title, content, tags, note]);

  const handleAddTag = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      if (!tags.includes(tagInput.trim())) {
        setTags([...tags, tagInput.trim()]);
      }
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col h-full bg-white dark:bg-gray-950"
    >
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800">
        <div className="flex items-center gap-2">
          <button
            onClick={handleSave}
            disabled={isSaving || (!title.trim() && !content.trim())}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 disabled:opacity-50 transition-all text-sm font-semibold shadow-sm active:scale-95"
            title="Save (Ctrl+S)"
          >
            <Save className="w-4 h-4" />
            {isSaving ? 'Saving...' : 'Save'}
          </button>
          
          <div className="h-6 w-px bg-gray-300 dark:bg-gray-700 mx-2" />
          
          <button
            onClick={() => setIsPreview(false)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${!isPreview ? 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800/50'}`}
          >
            <Edit2 className="w-4 h-4" />
            Write
          </button>
          <button
            onClick={() => setIsPreview(true)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${isPreview ? 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800/50'}`}
          >
            <Eye className="w-4 h-4" />
            Preview
          </button>
        </div>
        <button
          onClick={onClose}
          className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors sm:hidden"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-6 lg:p-10 space-y-6 max-w-4xl mx-auto w-full">
        <input
          type="text"
          placeholder="Note Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full text-4xl font-extrabold bg-transparent border-none focus:outline-none focus:ring-0 text-gray-900 dark:text-white placeholder-gray-300 dark:placeholder-gray-800 tracking-tight"
        />

        <div className="flex items-center gap-2 flex-wrap">
          <Tag className="w-4 h-4 text-gray-400" />
          {tags.map(tag => (
            <span key={tag} className="flex items-center gap-1 px-2.5 py-1 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 text-xs font-medium rounded-full border border-indigo-100 dark:border-indigo-500/20">
              {tag}
              <button onClick={() => removeTag(tag)} className="hover:text-red-500 transition-colors">
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
          <input
            type="text"
            placeholder="Add tag..."
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={handleAddTag}
            className="bg-transparent text-sm border-none focus:outline-none focus:ring-0 text-gray-900 dark:text-white placeholder-gray-400 w-24"
          />
        </div>

        {isPreview ? (
          <div className="prose dark:prose-invert max-w-none w-full h-full min-h-[500px]">
            {content ? (
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {content}
              </ReactMarkdown>
            ) : (
              <p className="text-gray-400 italic">Nothing to preview</p>
            )}
          </div>
        ) : (
          <textarea
            placeholder="Start typing your note here... (Markdown supported)"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full h-full min-h-[500px] resize-none bg-transparent border-none focus:outline-none focus:ring-0 text-gray-700 dark:text-gray-300 placeholder-gray-400 leading-relaxed font-mono text-sm"
          />
        )}
      </div>
    </motion.div>
  );
}
