import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { KanbanBoardUI } from '@/components/projects/KanbanBoardUI';
import { PublicProjectUpdatesModal } from '@/components/projects/PublicProjectUpdatesModal';
import { Loader2 } from 'lucide-react';
import { Project } from '@/types';

export default function PublicBoardPage() {
  const { token } = useParams();
  const data = useQuery(api.boardShares.getPublicBoardByToken, { token: token || '' });
  const [isUpdatesOpen, setIsUpdatesOpen] = useState(false);

  if (data === undefined) {
    return <div className="flex items-center justify-center min-h-screen"><Loader2 className="w-8 h-8 animate-spin text-violet-600" /></div>;
  }

  if (data === null) {
    return <div className="flex items-center justify-center min-h-screen text-muted-foreground">Board not found or link expired</div>;
  }

  // Map backend projects to frontend projects
  const projects = data.projects.map((p: any) => ({ 
      ...p, 
      id: p._id,
  })) as Project[];

  return (
    <div className="p-4 md:p-6 min-h-screen bg-background">
        <div className="max-w-7xl mx-auto">
            <KanbanBoardUI 
                projects={projects} 
                isReadOnly={true}
                onOpenUpdates={() => setIsUpdatesOpen(true)}
            />
            
            <PublicProjectUpdatesModal 
                isOpen={isUpdatesOpen}
                onClose={() => setIsUpdatesOpen(false)}
                token={token || ''}
                projects={projects}
            />
        </div>
    </div>
  );
}
