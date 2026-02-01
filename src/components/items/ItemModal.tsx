import { useState, useEffect } from 'react';
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
  Save,
  Clock
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

  const typeColorClasses = {
    code: 'text-blue-600 bg-blue-50 border-blue-100',
    prompt: 'text-purple-600 bg-purple-50 border-purple-100',
    file: 'text-amber-600 bg-amber-50 border-amber-100',
  };

  const currentTypeStyle = typeColorClasses[itemType] || typeColorClasses.code;

  return (
    <Modal isOpen={isOpen} onClose={handleClose} size="xl" title="">
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="px-8 py-6 border-b border-gray-100 flex items-start justify-between bg-white/50 backdrop-blur-sm sticky top-0 z-10">
          <div className="flex items-center gap-5">
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center border shadow-sm ${currentTypeStyle}`}>
              <Icon className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-3 mb-1">
                <Badge variant="outline" className="uppercase tracking-wider text-[10px] font-bold bg-white">
                  {itemType === 'code' ? 'Code Snippet' : itemType === 'prompt' ? 'AI Prompt' : 'File Asset'}
                </Badge>
                {existingItem && (
                   <span className="text-xs text-gray-400 font-medium flex items-center gap-1">
                     <Clock className="w-3 h-3" />
                     Last edited recently
                   </span>
                )}
              </div>
              {!isEditing && (existingItem || formData.title) ? (
                <h2 className="text-2xl font-bold text-gray-900 tracking-tight">
                  {formData.title || existingItem?.title}
                </h2>
              ) : (
                <h2 className="text-2xl font-bold text-gray-900 tracking-tight">
                  {existingItem ? 'Edit Item' : 'New Resource'}
                </h2>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {existingItem && (
              <>
                <button
                  onClick={handleToggleFavorite}
                  className={`p-2.5 rounded-xl transition-all duration-200 border ${
                    formData.isFavorite 
                      ? 'bg-yellow-50 text-yellow-600 border-yellow-200 shadow-sm' 
                      : 'bg-white text-gray-400 border-gray-200 hover:border-gray-300 hover:text-gray-600'
                  }`}
                  title={formData.isFavorite ? "Remove from favorites" : "Add to favorites"}
                >
                  <Star className={`w-5 h-5 ${formData.isFavorite ? 'fill-current' : ''}`} />
                </button>
                {!isEditing && (
                  <>
                    {confirmDelete ? (
                      <div className="flex items-center gap-1 bg-red-50 p-1 rounded-xl border border-red-100">
                        <button
                          onClick={handleDelete}
                          className="p-1.5 rounded-lg bg-red-500 hover:bg-red-600 text-white transition-colors shadow-sm"
                          title="Confirm Delete"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setConfirmDelete(false)}
                          className="p-1.5 rounded-lg text-red-600 hover:bg-red-100 transition-colors"
                          title="Cancel"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setConfirmDelete(true)}
                        className="p-2.5 rounded-xl bg-white border border-gray-200 text-gray-400 hover:text-red-500 hover:border-red-200 hover:bg-red-50 transition-all duration-200"
                        title="Delete Item"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    )}
                    <button
                      onClick={() => setIsEditing(true)}
                      className="p-2.5 rounded-xl bg-white border border-gray-200 text-gray-400 hover:text-violet-600 hover:border-violet-200 hover:bg-violet-50 transition-all duration-200"
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
              className="p-2.5 rounded-xl bg-white border border-gray-200 text-gray-400 hover:text-gray-900 hover:bg-gray-50 transition-all duration-200"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

      <div className="px-8 py-6 space-y-6 overflow-y-auto custom-scrollbar">
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
                  className="w-full px-4 py-3 rounded-2xl border border-gray-700 bg-gray-950 text-gray-100 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 resize-none placeholder-gray-500"
                />
              </div>
            </div>
          </>
        ) : (
          <>
            {existingItem?.description && (
              <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                <p className="text-gray-600 text-sm leading-relaxed">{existingItem.description}</p>
              </div>
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
        <div className="px-8 py-5 border-t border-gray-100 bg-gray-50 flex items-center justify-end gap-3 mt-auto">
          <Button variant="ghost" onClick={handleClose} className="text-gray-500 hover:text-gray-900">
            {existingItem ? 'Cancel' : 'Discard'}
          </Button>
          <Button
            onClick={handleSave}
            loading={createItem.isPending || updateItem.isPending}
            icon={<Save className="w-4 h-4" />}
            className="shadow-lg shadow-violet-500/20"
          >
            {existingItem ? 'Save Changes' : 'Create Resource'}
          </Button>
        </div>
      )}
      </div>
    </Modal>
  );
}
