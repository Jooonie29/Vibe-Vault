import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  X,
  Copy,
  Check,
  Edit2,
  Trash2,
  Star,
  Code2,
  MessageSquare,
  FolderOpen,
  Save
} from 'lucide-react';
import { useUIStore } from '@/store/uiStore';
import { useCreateItem, useUpdateItem, useDeleteItem, useToggleFavorite } from '@/hooks/useItems';
import { Item, ItemType } from '@/types';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Select } from '@/components/ui/Select';
import { Modal } from '@/components/ui/Modal';
import { Badge } from '@/components/ui/Badge';

const languages = [
  { value: 'javascript', label: 'JavaScript' },
  { value: 'typescript', label: 'TypeScript' },
  { value: 'python', label: 'Python' },
  { value: 'rust', label: 'Rust' },
  { value: 'go', label: 'Go' },
  { value: 'java', label: 'Java' },
  { value: 'csharp', label: 'C#' },
  { value: 'cpp', label: 'C++' },
  { value: 'ruby', label: 'Ruby' },
  { value: 'php', label: 'PHP' },
  { value: 'swift', label: 'Swift' },
  { value: 'kotlin', label: 'Kotlin' },
  { value: 'sql', label: 'SQL' },
  { value: 'html', label: 'HTML' },
  { value: 'css', label: 'CSS' },
  { value: 'bash', label: 'Bash' },
  { value: 'json', label: 'JSON' },
  { value: 'yaml', label: 'YAML' },
  { value: 'markdown', label: 'Markdown' },
  { value: 'other', label: 'Other' },
];

const codeCategories = [
  { value: 'utility', label: 'Utility' },
  { value: 'component', label: 'Component' },
  { value: 'hook', label: 'Hook' },
  { value: 'api', label: 'API' },
  { value: 'algorithm', label: 'Algorithm' },
  { value: 'ui', label: 'UI' },
  { value: 'backend', label: 'Backend' },
  { value: 'testing', label: 'Testing' },
  { value: 'other', label: 'Other' },
];

const promptCategories = [
  { value: 'creative', label: 'Creative' },
  { value: 'technical', label: 'Technical' },
  { value: 'analysis', label: 'Analysis' },
  { value: 'writing', label: 'Writing' },
  { value: 'debugging', label: 'Debugging' },
  { value: 'optimization', label: 'Optimization' },
  { value: 'refactoring', label: 'Refactoring' },
  { value: 'documentation', label: 'Documentation' },
  { value: 'learning', label: 'Learning' },
  { value: 'other', label: 'Other' },
];

const fileCategories = [
  { value: 'asset', label: 'Asset' },
  { value: 'icon', label: 'Icon' },
  { value: 'image', label: 'Image' },
  { value: 'style', label: 'Style' },
  { value: 'config', label: 'Config' },
  { value: 'template', label: 'Template' },
  { value: 'other', label: 'Other' },
];

const getCategoriesByType = (type: ItemType) => {
  switch (type) {
    case 'code':
      return codeCategories;
    case 'prompt':
      return promptCategories;
    case 'file':
      return fileCategories;
    default:
      return codeCategories;
  }
};

const typeIcons = {
  code: Code2,
  prompt: MessageSquare,
  file: FolderOpen,
};

const typeColors = {
  code: 'from-blue-500 to-cyan-500',
  prompt: 'from-purple-500 to-pink-500',
  file: 'from-amber-500 to-orange-500',
};

export function ItemModal() {
  const { activeModal, modalData, closeModal, addToast } = useUIStore();
  const createItem = useCreateItem();
  const updateItem = useUpdateItem();
  const deleteItem = useDeleteItem();
  const toggleFavorite = useToggleFavorite();


  const [isEditing, setIsEditing] = useState(false);
  const [copied, setCopied] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    content: '',
    language: 'javascript',
    category: 'utility',
    type: 'code' as ItemType,
    isFavorite: false,
  });

  const isOpen = activeModal === 'item';

  // Use a more direct approach to identification
  const existingItem = (isOpen && modalData && (modalData.id || modalData._id)) ? modalData as Item : null;
  const itemType = (modalData?.type || existingItem?.type || 'code') as ItemType;

  useEffect(() => {
    if (existingItem) {
      setFormData({
        title: existingItem.title,
        description: existingItem.description || '',
        content: existingItem.content || '',
        language: existingItem.language || 'javascript',
        category: existingItem.category || 'utility',
        type: existingItem.type,
        isFavorite: existingItem.isFavorite || false,
      });
      setIsEditing(false);
    } else {
      setFormData({
        title: '',
        description: '',
        content: '',
        language: 'javascript',
        category: 'utility',
        type: itemType || 'code',
        isFavorite: false,
      });
      setIsEditing(true);
    }
  }, [existingItem, itemType, isOpen]);

  const handleClose = () => {
    closeModal();
    setIsEditing(false);
    setConfirmDelete(false);
  };

  const handleSave = async () => {
    if (!formData.title.trim()) {
      addToast({ type: 'error', title: 'Title required', message: 'Please enter a title.' });
      return;
    }

    if (existingItem) {
      await updateItem.mutateAsync({
        id: (existingItem as any).id || (existingItem as any)._id,
        updates: formData,
      });
    } else {
      await createItem.mutateAsync(formData);
    }
    handleClose();
  };

  const handleDelete = async () => {
    if (!existingItem) return;
    await deleteItem.mutateAsync((existingItem as any).id || (existingItem as any)._id);
    handleClose();
  };

  const handleCopy = async () => {
    if (!formData.content) return;
    await navigator.clipboard.writeText(formData.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    addToast({ type: 'success', title: 'Copied!', message: 'Content copied to clipboard.' });
  };

  const handleToggleFavorite = async () => {
    if (!existingItem) return;
    const newFavorite = !formData.isFavorite;

    // Optimistic update
    setFormData(prev => ({ ...prev, isFavorite: newFavorite }));

    try {
      await toggleFavorite.mutateAsync({
        id: (existingItem as any).id || (existingItem as any)._id,
        isFavorite: newFavorite,
      });
    } catch (error) {
      // Revert on error
      setFormData(prev => ({ ...prev, isFavorite: !newFavorite }));
    }
  };

  const Icon = typeIcons[itemType] || Code2;

  return (
    <Modal isOpen={isOpen} onClose={handleClose} size="xl" title={isEditing ? (existingItem ? 'Edit Item' : 'New Item') : ''}>
      <div className={`bg-gradient-to-r ${typeColors[itemType]} px-6 py-5 text-white`}>
        <div className="flex items-start justify-between gap-6">
          <div className="flex items-center gap-4 min-w-0">
            <div className="min-w-0">
              <Badge variant="outline" className="bg-white/20 text-white border-white/30 mb-2">
                {itemType === 'code' ? 'Code Snippet' : itemType === 'prompt' ? 'AI Prompt' : 'File'}
              </Badge>
              {!isEditing && (existingItem || formData.title) && (
                <h2 className="text-2xl font-semibold leading-tight truncate max-w-[320px] md:max-w-lg">
                  {formData.title || existingItem?.title}
                </h2>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {existingItem && (
              <>
                <button
                  onClick={handleToggleFavorite}
                  className={`p-2 rounded-xl transition-colors ${formData.isFavorite ? 'bg-yellow-400 text-yellow-900' : 'bg-white/20 hover:bg-white/30'
                    }`}
                >
                  <Star className={`w-5 h-5 ${formData.isFavorite ? 'fill-current' : ''}`} />
                </button>
                {!isEditing && (
                  <>
                    {confirmDelete ? (
                      <div className="flex items-center gap-1 bg-white/20 rounded-xl p-1">
                        <button
                          onClick={handleDelete}
                          className="p-1.5 rounded-lg bg-red-500 hover:bg-red-600 text-white transition-colors"
                          title="Confirm Delete"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setConfirmDelete(false)}
                          className="p-1.5 rounded-lg bg-white/20 hover:bg-white/30 text-white transition-colors"
                          title="Cancel"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setConfirmDelete(true)}
                        className="p-2 rounded-xl bg-white/20 hover:bg-white/30 transition-colors text-white"
                        title="Delete Item"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    )}
                    <button
                      onClick={() => setIsEditing(true)}
                      className="p-2 rounded-xl bg-white/20 hover:bg-white/30 transition-colors"
                      title="Edit Item"
                    >
                      <Edit2 className="w-5 h-5" />
                    </button>
                  </>
                )}
              </>
            )}
            <button
              onClick={handleClose}
              className="p-2 rounded-xl bg-white/20 hover:bg-white/30 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      <div className="px-6 pt-5 pb-6 space-y-5">
        {isEditing ? (
          <>
            <Input
              label="Title"
              placeholder="Enter a descriptive title..."
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            />

            <Textarea
              label="Description"
              placeholder="What does this do? When would you use it?"
              rows={2}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />

            <div className="grid grid-cols-2 gap-5">
              {itemType === 'code' && (
                <Select
                  label="Language"
                  options={languages}
                  value={formData.language}
                  onChange={(e) => setFormData({ ...formData, language: e.target.value })}
                />
              )}
              <Select
                label="Category"
                options={getCategoriesByType(itemType)}
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                {itemType === 'code' ? 'Code' : 'Content'}
              </label>
              <div className="relative">
                <textarea
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  placeholder={itemType === 'code' ? 'Paste your code here...' : 'Enter your prompt or content...'}
                  rows={12}
                  className="w-full px-4 py-3 rounded-2xl border border-gray-200 bg-gray-900 text-gray-100 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 resize-none"
                />
              </div>
            </div>
          </>
        ) : (
          <>
            {existingItem?.description && (
              <p className="text-gray-600 text-sm leading-relaxed">{existingItem.description}</p>
            )}

            <div className="flex gap-2 flex-wrap">
              {existingItem?.language && itemType !== 'prompt' && (
                <Badge variant="primary">{existingItem.language}</Badge>
              )}
              {existingItem?.category && (
                <Badge>{existingItem.category}</Badge>
              )}
            </div>

            {existingItem?.content && (
              <div className="relative rounded-2xl bg-gray-900/95 border border-gray-800 p-4">
                <div className="absolute top-3 right-3 z-10">
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={handleCopy}
                    icon={copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  >
                    {copied ? 'Copied!' : 'Copy'}
                  </Button>
                </div>
                <pre className="text-gray-100 whitespace-pre-wrap break-words font-mono text-sm pr-16">
                  <code>{existingItem.content}</code>
                </pre>
              </div>
            )}
          </>
        )}
      </div>

      {/* Footer */}
      {(isEditing || !existingItem) && (
        <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-end gap-3">
          <Button variant="ghost" onClick={handleClose}>
            {existingItem ? 'Cancel' : 'Discard'}
          </Button>
          <Button
            onClick={handleSave}
            loading={createItem.isPending || updateItem.isPending}
            icon={<Save className="w-4 h-4" />}
          >
            {existingItem ? 'Save Changes' : 'Create Item'}
          </Button>
        </div>
      )}
    </Modal>
  );
}
