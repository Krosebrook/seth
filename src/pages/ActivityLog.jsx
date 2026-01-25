import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import Sidebar from '@/components/Sidebar';
import Breadcrumbs from '@/components/Breadcrumbs';
import { Card } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';

export default function ActivityLogPage() {
  const [mode, setMode] = useState('work');

  const { data: activities = [], isLoading } = useQuery({
    queryKey: ['activityLog'],
    queryFn: () => base44.entities.ActivityLog.list('-created_date', 100)
  });

  const getActionColor = (action) => {
    if (action.includes('created')) return 'text-green-400';
    if (action.includes('updated')) return 'text-blue-400';
    if (action.includes('deleted')) return 'text-red-400';
    return 'text-cyan-400';
  };

  return (
    <div className="flex h-screen bg-black text-white">
      <Sidebar currentPage="Activity Log" mode={mode} />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Breadcrumbs items={[{ label: 'Activity Log' }]} />
        
        <div className="flex-1 overflow-y-auto p-6">
          <div className="max-w-6xl mx-auto space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold text-cyan-300">Activity Log</h1>
                <p className="text-gray-400 mt-2">Track all user actions in the application</p>
              </div>
              <Button
                onClick={() => setMode(mode === 'work' ? 'personal' : 'work')}
                variant="outline"
                className="border-cyan-500/50"
              >
                {mode === 'work' ? 'Switch to Personal' : 'Switch to Work'}
              </Button>
            </div>

            {isLoading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-cyan-400" />
              </div>
            ) : (
              <div className="space-y-3">
                {activities.map((activity) => (
                  <Card key={activity.id} className="bg-gray-900/50 border-cyan-500/30 p-4">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <span className={`font-semibold ${getActionColor(activity.action)}`}>
                            {activity.action.replace(/_/g, ' ').toUpperCase()}
                          </span>
                          {activity.entity_type && (
                            <span className="text-gray-400 text-sm">
                              on {activity.entity_type}
                            </span>
                          )}
                        </div>
                        
                        <div className="mt-2 text-sm text-gray-400">
                          <span>By: {activity.created_by}</span>
                          <span className="mx-2">•</span>
                          <span>{format(new Date(activity.created_date), 'PPpp')}</span>
                        </div>
                        
                        {activity.details && (
                          <div className="mt-2 text-sm text-gray-500">
                            {JSON.stringify(activity.details)}
                          </div>
                        )}
                      </div>
                    </div>
                  </Card>
                ))}
                
                {activities.length === 0 && (
                  <div className="text-center py-12 text-gray-500">
                    No activities recorded yet
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}