import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDropzone } from 'react-dropzone';
import {
  Upload,
  FolderOpen,
  File,
  FileImage,
  FileText,
  FileCode,
  FileArchive,
  Download,
  Trash2,
  Eye,
  X,
  Plus,
  Grid3X3,
  List,
  Search
} from 'lucide-react';
import { useMutation } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { useItems, useCreateItem, useDeleteItem } from '@/hooks/useItems';
import { useAuthStore } from '@/store/authStore';
import { useUIStore } from '@/store/uiStore';
import { Item } from '@/types';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { Badge } from '@/components/ui/Badge';
import { format } from 'date-fns';

const fileTypeIcons: Record<string, React.ElementType> = {
  image: FileImage,
  pdf: FileText,
  code: FileCode,
  archive: FileArchive,
  default: File,
};

const getFileIcon = (fileType: string | null) => {
  if (!fileType) return fileTypeIcons.default;
  if (fileType.startsWith('image/')) return fileTypeIcons.image;
  if (fileType === 'application/pdf') return fileTypeIcons.pdf;
  if (fileType.includes('zip') || fileType.includes('rar') || fileType.includes('tar')) return fileTypeIcons.archive;
  if (fileType.includes('javascript') || fileType.includes('json') || fileType.includes('text/')) return fileTypeIcons.code;
  return fileTypeIcons.default;
};

const formatFileSize = (bytes: number | null) => {
  if (!bytes) return 'Unknown size';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

export function FileManager() {
  const { user } = useAuthStore();
  const { addToast } = useUIStore();
  const { data: files, isLoading } = useItems('file');
  const createItem = useCreateItem();
  const deleteItem = useDeleteItem();
  const generateUploadUrl = useMutation(api.files.generateUploadUrl);

  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [previewFile, setPreviewFile] = useState<Item | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (!user) return;

    setUploading(true);
    setUploadProgress(0);

    for (let i = 0; i < acceptedFiles.length; i++) {
      const file = acceptedFiles[i];

      try {
        // Step 1: Get a short-lived upload URL from Convex
        const postUrl = await generateUploadUrl();

        // Step 2: POST the file to the URL
        const result = await fetch(postUrl, {
          method: "POST",
          headers: { "Content-Type": file.type },
          body: file,
        });
        const { storageId } = await result.json();

        // Step 3: Create item record in Convex
        await createItem.mutateAsync({
          type: 'file',
          title: file.name,
          description: `Uploaded on ${format(new Date(), 'MMMM d, yyyy')}`,
          fileUrl: undefined,
          fileType: file.type,
          fileSize: file.size,
          metadata: { originalName: file.name, storageId },
        });

        setUploadProgress(((i + 1) / acceptedFiles.length) * 100);
      } catch (error: any) {
        addToast({ type: 'error', title: 'Upload failed', message: error.message });
      }
    }

    setUploading(false);
    setUploadProgress(0);
  }, [user, createItem, generateUploadUrl, addToast]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.svg', '.webp'],
      'application/pdf': ['.pdf'],
      'application/zip': ['.zip'],
      'application/x-rar-compressed': ['.rar'],
      'text/*': ['.txt', '.md', '.json', '.js', '.ts', '.css', '.html'],
    },
    maxSize: 10 * 1024 * 1024, // 10MB
  });

  const handleDownload = async (file: Item) => {
    if (!file.fileUrl) return;
    window.open(file.fileUrl, '_blank');
  };

  const handleDelete = async (id: string) => {
    await deleteItem.mutateAsync(id);
    setConfirmDelete(null);
  };

  const filteredFiles = files?.filter((file) =>
    file.title.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 flex items-center justify-center shadow-sm">
              <FolderOpen className="w-6 h-6 text-amber-600" />
            </div>
            File Assets
          </h1>
          <p className="text-gray-500 mt-2 text-lg">Upload and manage your design files, icons, and documents</p>
        </div>
      </div>

      {/* Upload Zone */}
      <div className="bg-white rounded-[32px] p-2 shadow-sm border border-gray-100">
        <div
          {...getRootProps()}
          className={`p-12 border-2 border-dashed rounded-[24px] transition-all duration-300 cursor-pointer group ${isDragActive
            ? 'border-violet-500 bg-violet-50/50'
            : 'border-gray-200 hover:border-violet-400 hover:bg-gray-50/80'
            }`}
        >
          <input {...getInputProps()} />
          <div className="text-center">
            <div className={`w-24 h-24 rounded-[32px] mx-auto mb-6 flex items-center justify-center transition-all duration-300 shadow-sm ${isDragActive ? 'bg-violet-100 scale-110' : 'bg-gray-50 group-hover:bg-violet-50 group-hover:scale-105'}`}>
              <Upload className={`w-10 h-10 transition-colors duration-300 ${isDragActive ? 'text-violet-600' : 'text-gray-400 group-hover:text-violet-500'}`} />
            </div>
            {uploading ? (
              <>
                <p className="text-xl font-bold text-gray-900 mb-4">Uploading files...</p>
                <div className="w-72 h-3 bg-gray-100 rounded-full mx-auto overflow-hidden ring-1 ring-gray-200">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${uploadProgress}%` }}
                    className="h-full bg-gradient-to-r from-violet-500 to-fuchsia-500 rounded-full"
                  />
                </div>
              </>
            ) : (
              <>
                <h3 className="text-2xl font-bold text-gray-900 mb-3 tracking-tight">
                  {isDragActive ? 'Drop files to upload' : 'Drag & drop files here'}
                </h3>
                <p className="text-gray-500 mb-8 max-w-sm mx-auto text-base">
                  Support for images, documents, archives and code files up to 10MB
                </p>
                <Button variant="secondary" className="pointer-events-none rounded-xl px-8 py-6 text-base font-medium bg-gray-900 text-white hover:bg-gray-800 shadow-lg shadow-gray-900/20 border-0">
                  Browse Files
                </Button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 items-center bg-white p-2.5 rounded-[24px] shadow-sm border border-gray-100">
        <div className="flex-1 w-full md:w-auto relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-violet-500 transition-colors" />
          <input
            type="text"
            placeholder="Search files..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-gray-50 border-transparent rounded-2xl text-base focus:bg-white focus:border-violet-200 focus:ring-4 focus:ring-violet-500/10 transition-all outline-none placeholder:text-gray-400"
          />
        </div>
        <div className="flex bg-gray-100/80 p-1.5 rounded-2xl">
          <button
            onClick={() => setViewMode('grid')}
            className={`p-2.5 rounded-xl transition-all duration-300 ${viewMode === 'grid' ? 'bg-white shadow-md text-violet-600 scale-100' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200/50'
              }`}
          >
            <Grid3X3 className="w-5 h-5" />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`p-2.5 rounded-xl transition-all duration-300 ${viewMode === 'list' ? 'bg-white shadow-md text-violet-600 scale-100' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200/50'
              }`}
          >
            <List className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Files Grid/List */}
      {isLoading ? (
        <div className="text-center py-32">
          <div className="w-16 h-16 border-4 border-violet-100 border-t-violet-600 rounded-full animate-spin mx-auto mb-6" />
          <p className="text-gray-500 text-lg font-medium">Loading your assets...</p>
        </div>
      ) : filteredFiles.length === 0 ? (
        <div className="text-center py-32 bg-white rounded-[32px] border border-dashed border-gray-200">
          <div className="w-24 h-24 rounded-[32px] bg-gray-50 flex items-center justify-center mx-auto mb-6">
            <FolderOpen className="w-12 h-12 text-gray-300" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-3">
            {searchQuery ? 'No matching files found' : 'No files uploaded yet'}
          </h3>
          <p className="text-gray-500 max-w-sm mx-auto text-lg">
            {searchQuery ? 'Try adjusting your search terms' : 'Upload your first file to get started with your collection'}
          </p>
        </div>
      ) : (
        <AnimatePresence mode="popLayout">
          <motion.div
            layout
            className={viewMode === 'grid' ? 'grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6' : 'space-y-4'}
          >
            {filteredFiles.map((file, index) => {
              const FileIcon = getFileIcon(file.fileType);
              const isImage = file.fileType?.startsWith('image/');

              return (
                <motion.div
                  key={file.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ delay: index * 0.05 }}
                >
                  {viewMode === 'grid' ? (
                    <motion.div
                      whileHover={{ y: -8, scale: 1.02 }}
                      className="group relative bg-white rounded-[24px] p-4 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] hover:shadow-[0_20px_40px_-12px_rgba(0,0,0,0.12)] transition-all duration-300 border border-gray-100 h-full flex flex-col z-0 hover:z-10"
                    >
                      {/* Preview */}
                      <div className="aspect-square bg-gray-50 rounded-2xl mb-5 flex items-center justify-center overflow-hidden relative group-hover:shadow-inner transition-shadow">
                        {isImage && file.fileUrl ? (
                          <img
                            src={file.fileUrl}
                            alt={file.title}
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                          />
                        ) : (
                          <FileIcon className="w-20 h-20 text-gray-300 group-hover:text-violet-400 transition-colors duration-300" />
                        )}
                        
                        {/* Hover Overlay */}
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-3 backdrop-blur-[2px]">
                          {isImage && (
                            <button
                              onClick={(e) => { e.stopPropagation(); setPreviewFile(file); }}
                              className="p-3 bg-white/90 rounded-2xl hover:bg-white hover:scale-110 transition-all shadow-lg text-gray-700 hover:text-violet-600"
                              title="Preview"
                            >
                              <Eye className="w-5 h-5" />
                            </button>
                          )}
                          <button
                            onClick={(e) => { e.stopPropagation(); handleDownload(file); }}
                            className="p-3 bg-white/90 rounded-2xl hover:bg-white hover:scale-110 transition-all shadow-lg text-gray-700 hover:text-violet-600"
                            title="Download"
                          >
                            <Download className="w-5 h-5" />
                          </button>
                        </div>
                      </div>

                      {/* Info */}
                      <div className="flex items-start justify-between gap-3 mt-auto">
                        <div className="min-w-0">
                          <h4 className="font-bold text-gray-900 truncate text-sm mb-1.5" title={file.title}>{file.title}</h4>
                          <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider">{formatFileSize(file.fileSize)}</p>
                        </div>
                        <button
                          onClick={(e) => { e.stopPropagation(); setConfirmDelete(file.id); }}
                          className="text-gray-300 hover:text-red-500 transition-colors p-1.5 hover:bg-red-50 rounded-lg -mr-2 opacity-0 group-hover:opacity-100"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </motion.div>
                  ) : (
                    <div className="group flex items-center gap-5 bg-white p-4 rounded-[20px] border border-gray-100 hover:border-violet-100 hover:shadow-xl hover:shadow-violet-500/5 transition-all duration-300">
                      <div className="w-14 h-14 rounded-2xl bg-gray-50 flex items-center justify-center flex-shrink-0 overflow-hidden ring-1 ring-gray-100">
                        {isImage && file.fileUrl ? (
                          <img src={file.fileUrl} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <FileIcon className="w-7 h-7 text-gray-400" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0 grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
                        <h4 className="font-bold text-gray-900 truncate text-base">{file.title}</h4>
                        <p className="text-sm text-gray-500 font-medium hidden md:block">
                          {formatFileSize(file.fileSize)}
                        </p>
                        <p className="text-sm text-gray-400 hidden md:block text-right font-medium">
                          {format(new Date((file as any)._creationTime), 'MMM d, yyyy')}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        {isImage && (
                          <Button size="sm" variant="ghost" onClick={() => setPreviewFile(file)} className="rounded-xl hover:bg-violet-50 hover:text-violet-600">
                            <Eye className="w-4 h-4" />
                          </Button>
                        )}
                        <Button size="sm" variant="ghost" onClick={() => handleDownload(file)} className="rounded-xl hover:bg-violet-50 hover:text-violet-600">
                          <Download className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setConfirmDelete(file.id)}
                          className="text-red-600 hover:bg-red-50 rounded-xl"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  )}
                </motion.div>
              );
            })}
          </motion.div>
        </AnimatePresence>
      )}

      {/* Preview Modal */}
      <Modal isOpen={!!previewFile} onClose={() => setPreviewFile(null)} size="xl">
        {previewFile && (
          <div className="p-4">
            <img
              src={previewFile.fileUrl || ''}
              alt={previewFile.title}
              className="w-full h-auto max-h-[70vh] object-contain rounded-xl"
            />
            <div className="mt-4 flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-gray-900">{previewFile.title}</h3>
                <p className="text-sm text-gray-500">{formatFileSize(previewFile.fileSize)}</p>
              </div>
              <Button onClick={() => handleDownload(previewFile)} icon={<Download className="w-4 h-4" />}>
                Download
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Delete Confirmation */}
      <Modal isOpen={!!confirmDelete} onClose={() => setConfirmDelete(null)} size="sm">
        <div className="p-6 text-center">
          <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
            <Trash2 className="w-6 h-6 text-red-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Delete File?</h3>
          <p className="text-gray-500 mb-6">This action cannot be undone.</p>
          <div className="flex gap-3 justify-center">
            <Button variant="ghost" onClick={() => setConfirmDelete(null)}>
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={() => confirmDelete && handleDelete(confirmDelete)}
              loading={deleteItem.isPending}
            >
              Delete
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
