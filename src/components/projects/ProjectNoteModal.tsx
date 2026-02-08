import React, { useState, useEffect } from 'react';
import { Save, FileText, Clock, Calendar } from 'lucide-react';
import { useUIStore } from '@/store/uiStore';
import { useUpdateProject } from '@/hooks/useProjects';
import { Project } from '@/types';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { RichTextEditor } from '@/components/editor/RichTextEditor';
import { format, isToday } from 'date-fns';

export function ProjectNoteModal() {
    const { activeModal, modalData, closeModal, addToast } = useUIStore();
    const updateProject = useUpdateProject();
    const [note, setNote] = useState('');
    const [lastSaved, setLastSaved] = useState<Date | null>(null);

    const isOpen = activeModal === 'project-note';
    const project = modalData as Project | null;

    useEffect(() => {
        if (project) {
            // Check if reason is "add new note for today" or "edit today's note"
            // If the note was updated today, show it. Otherwise, start blank for a new daily entry.
            const isNoteFromToday = project.noteUpdatedAt && isToday(new Date(project.noteUpdatedAt));

            if (isNoteFromToday) {
                setNote(project.notes || '');
            } else {
                setNote('');
            }
            setLastSaved(null);
        }
    }, [project, isOpen]);

    const handleSave = async () => {
        if (!project) return;

        try {
            console.log("Saving note content:", note); // Debug: Trace note content
            await updateProject.mutateAsync({
                id: project.id,
                updates: {
                    notes: note
                },
            });
            setLastSaved(new Date());
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

    const insertDateTime = () => {
        const now = new Date();
        const dateTimeString = format(now, "MMM d, yyyy 'at' h:mm a");
        const htmlContent = `<p><strong>${dateTimeString}</strong></p><p></p>`;
        setNote((prev) => prev + htmlContent);
    };

    const insertTemplate = (template: string) => {
        let content = '';
        switch (template) {
            case 'daily':
                content = `
                    <h3>📅 Daily Progress - ${format(new Date(), 'MMM d, yyyy')}</h3>
                    <h4>✅ Accomplishments</h4>
                    <ul data-type="taskList">
                        <li data-checked="false"><label><input type="checkbox"><div></div></label><div>[Task completed]</div></li>
                        <li data-checked="false"><label><input type="checkbox"><div></div></label><div>[Task completed]</div></li>
                    </ul>
                    <h4>🚧 Blockers</h4>
                    <p>[Describe any challenges or roadblocks...]</p>
                    <h4>📝 Notes</h4>
                    <p>[Additional observations...]</p>
                `;
                break;
            case 'meeting':
                content = `
                    <h3>🤝 Meeting Notes</h3>
                    <p><strong>Date:</strong> ${format(new Date(), 'MMM d, yyyy')}</p>
                    <p><strong>Attendees:</strong></p>
                    <ul>
                        <li>[Attendee Name]</li>
                        <li>[Attendee Name]</li>
                    </ul>
                    <h4>🎯 Agenda</h4>
                    <ol>
                        <li>[Topic 1]</li>
                        <li>[Topic 2]</li>
                    </ol>
                    <h4>✅ Action Items</h4>
                    <ul data-type="taskList">
                        <li data-checked="false"><label><input type="checkbox"><div></div></label><div>[Action Item]</div></li>
                    </ul>
                `;
                break;
            case 'bug':
                content = `
                    <h3>🐛 Bug Report</h3>
                    <p><strong>Date:</strong> ${format(new Date(), 'MMM d, yyyy')}</p>
                    <h4>🔍 Description</h4>
                    <p>[Brief description of the issue...]</p>
                    <h4>🔄 Steps to Reproduce</h4>
                    <ol>
                        <li>[Step 1]</li>
                        <li>[Step 2]</li>
                        <li>[Step 3]</li>
                    </ol>
                    <h4>✅ Expected Behavior</h4>
                    <p>[What should happen...]</p>
                    <h4>❌ Actual Behavior</h4>
                    <p>[What actually happens...]</p>
                `;
                break;
        }
        setNote((prev) => prev + content);
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={closeModal}
            title="Project Progress Note"
            size="lg"
        >
            <div className="p-6 space-y-4">
                {/* Header */}
                <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2 text-violet-600 dark:text-violet-400">
                        <FileText className="w-5 h-5" />
                        <span className="font-semibold text-sm">
                            {project?.noteUpdatedAt && isToday(new Date(project.noteUpdatedAt))
                                ? "Editing today's progress"
                                : "Add daily progress"} for "{project?.title}"
                        </span>
                    </div>
                    {lastSaved && (
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Clock className="w-3 h-3" />
                            <span>Saved {format(lastSaved, 'h:mm a')}</span>
                        </div>
                    )}
                </div>

                {/* Templates */}
                <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs text-muted-foreground font-medium">Templates:</span>
                    <button
                        onClick={() => insertTemplate('daily')}
                        className="text-xs px-3 py-1.5 bg-violet-50 dark:bg-violet-900/20 text-violet-700 dark:text-violet-300 rounded-full hover:bg-violet-100 dark:hover:bg-violet-900/40 transition-colors"
                    >
                        📅 Daily Progress
                    </button>
                    <button
                        onClick={() => insertTemplate('meeting')}
                        className="text-xs px-3 py-1.5 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded-full hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors"
                    >
                        🤝 Meeting Notes
                    </button>
                    <button
                        onClick={() => insertTemplate('bug')}
                        className="text-xs px-3 py-1.5 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 rounded-full hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors"
                    >
                        🐛 Bug Report
                    </button>
                    <button
                        onClick={insertDateTime}
                        className="text-xs px-3 py-1.5 bg-secondary text-secondary-foreground rounded-full hover:bg-secondary/80 transition-colors flex items-center gap-1"
                    >
                        <Calendar className="w-3 h-3" />
                        Insert Date
                    </button>
                </div>

                {/* Rich Text Editor */}
                <RichTextEditor
                    content={note}
                    onChange={setNote}
                    placeholder="What did you accomplish today? Use the toolbar to format your notes..."
                />

                {/* Tips */}
                <div className="text-xs text-muted-foreground bg-muted/50 p-3 rounded-lg">
                    <strong>💡 Tips:</strong> Use <kbd className="px-1.5 py-0.5 bg-card rounded border border-border text-muted-foreground">Ctrl+B</kbd> for bold,{' '}
                    <kbd className="px-1.5 py-0.5 bg-card rounded border border-border text-muted-foreground">Ctrl+I</kbd> for italic,{' '}
                    <kbd className="px-1.5 py-0.5 bg-card rounded border border-border text-muted-foreground">Ctrl+K</kbd> for links
                </div>

                {/* Actions */}
                <div className="flex justify-end gap-3 pt-2">
                    <Button variant="ghost" onClick={closeModal}>
                        Cancel
                    </Button>
                    <Button
                        onClick={handleSave}
                        loading={updateProject.isPending}
                        className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700"
                    >
                        <Save className="w-4 h-4 mr-2" />
                        Save Note
                    </Button>
                </div>
            </div>
        </Modal>
    );
}
