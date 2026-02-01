import React, { useState, useEffect } from 'react';
import { Save, FileText } from 'lucide-react';
import { useUIStore } from '@/store/uiStore';
import { useUpdateProject } from '@/hooks/useProjects';
import { Project } from '@/types';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Textarea } from '@/components/ui/Textarea';

export function ProjectNoteModal() {
    const { activeModal, modalData, closeModal, addToast } = useUIStore();
    const updateProject = useUpdateProject();
    const [note, setNote] = useState('');

    const isOpen = activeModal === 'project-note';
    const project = modalData as Project | null;

    useEffect(() => {
        if (project) {
            setNote(project.notes || '');
        }
    }, [project, isOpen]);

    const handleSave = async () => {
        if (!project) return;

        try {
            await updateProject.mutateAsync({
                id: project.id,
                updates: { notes: note },
            });
            addToast({
                type: 'success',
                title: 'Note saved',
                message: 'Project progress note has been updated.',
            });
            closeModal();
        } catch (error) {
            addToast({
                type: 'error',
                title: 'Error',
                message: 'Failed to save note. Please try again.',
            });
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={closeModal}
            title="Project Progress Note"
            size="sm"
        >
            <div className="p-6 space-y-4">
                <div className="flex items-center gap-2 text-violet-600 mb-2">
                    <FileText className="w-5 h-5" />
                    <span className="font-semibold text-sm">Add your daily progress for "{project?.title}"</span>
                </div>

                <Textarea
                    placeholder="What did you accomplish today? Any roadblocks?"
                    rows={6}
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    autoFocus
                />

                <div className="flex justify-end gap-3 pt-2">
                    <Button variant="ghost" onClick={closeModal}>
                        Cancel
                    </Button>
                    <Button
                        onClick={handleSave}
                        loading={updateProject.isPending}
                        icon={<Save className="w-4 h-4" />}
                    >
                        Save Note
                    </Button>
                </div>
            </div>
        </Modal>
    );
}
