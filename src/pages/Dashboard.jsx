import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import Sidebar from '@/components/Sidebar';
import Breadcrumbs from '@/components/Breadcrumbs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Plus, Loader2, ArrowRight } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export default function DashboardPage() {
  const [mode, setMode] = useState('work');

  const { data: simulations = [], isLoading } = useQuery({
    queryKey: ['simulations', 'recent'],
    queryFn: () => base44.entities.Simulation.list('-updated_date', 10)
  });

  const getStatusColor = (status) => {
    const colors = {
      draft: 'bg-gray-500/20 text-gray-300 border-gray-500/30',
      active: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
      completed: 'bg-green-500/20 text-green-300 border-green-500/30'
    };
    return colors[status] || colors.draft;
  };

  const getStatusLabel = (status) => {
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  return (
    <div className="flex h-screen bg-black text-white">
      <Sidebar currentPage="Dashboard" mode={mode} />

      <div className="flex-1 flex flex-col overflow-hidden">
        <Breadcrumbs items={[{ label: 'Dashboard' }]} />

        <div className="flex-1 overflow-y-auto p-6">
          <div className="max-w-6xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-4xl font-bold text-cyan-300">Dashboard</h1>
                <p className="text-gray-400 mt-2">View and manage your recent simulations</p>
              </div>
              <Link to="/Simulations">
                <Button className="bg-cyan-600 hover:bg-cyan-500">
                  <Plus className="w-4 h-4 mr-2" />
                  New Simulation
                </Button>
              </Link>
            </div>

            {/* Recent Simulations */}
            <div className="space-y-3">
              <h2 className="text-xl font-semibold text-gray-300">Recent Simulations</h2>

              {isLoading ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-cyan-400" />
                </div>
              ) : simulations.length === 0 ? (
                <Card className="bg-gray-900/50 border-cyan-500/30 p-12 text-center">
                  <p className="text-gray-400 mb-4">No simulations yet</p>
                  <Link to="/Simulations">
                    <Button className="bg-cyan-600">Create Your First Simulation</Button>
                  </Link>
                </Card>
              ) : (
                <div className="space-y-3">
                  {simulations.map((sim) => (
                    <Card
                      key={sim.id}
                      className="bg-gray-900/50 border-cyan-500/30 p-4 hover:border-cyan-500/60 transition-colors cursor-pointer group"
                    >
                      <Link to={`/Simulations`} className="block">
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="text-lg font-semibold text-cyan-300 truncate group-hover:text-cyan-200">
                                {sim.title}
                              </h3>
                              <Badge
                                className={`${getStatusColor(sim.status)} border whitespace-nowrap`}
                              >
                                {getStatusLabel(sim.status)}
                              </Badge>
                            </div>
                            <p className="text-gray-400 text-sm line-clamp-2 mb-3">
                              {sim.description}
                            </p>

                            {/* Simulation Meta */}
                            <div className="flex flex-wrap gap-4 text-xs text-gray-500">
                              <span>
                                {sim.roles && Array.isArray(sim.roles) ? sim.roles.length : 0} participants
                              </span>
                              <span>
                                Updated {formatDistanceToNow(new Date(sim.updated_date), { addSuffix: true })}
                              </span>
                              {sim.summary && <span>Has summary</span>}
                            </div>
                          </div>

                          <div className="ml-4 flex-shrink-0">
                            <ArrowRight className="w-5 h-5 text-gray-600 group-hover:text-cyan-400 transition-colors" />
                          </div>
                        </div>
                      </Link>
                    </Card>
                  ))}
                </div>
              )}
            </div>

            {/* Quick Stats */}
            {simulations.length > 0 && (
              <div className="grid grid-cols-3 gap-4 mt-8">
                <Card className="bg-gray-900/50 border-cyan-500/30 p-6 text-center">
                  <div className="text-3xl font-bold text-cyan-400">
                    {simulations.length}
                  </div>
                  <p className="text-gray-400 text-sm mt-2">Total Simulations</p>
                </Card>
                <Card className="bg-gray-900/50 border-cyan-500/30 p-6 text-center">
                  <div className="text-3xl font-bold text-green-400">
                    {simulations.filter(s => s.status === 'completed').length}
                  </div>
                  <p className="text-gray-400 text-sm mt-2">Completed</p>
                </Card>
                <Card className="bg-gray-900/50 border-cyan-500/30 p-6 text-center">
                  <div className="text-3xl font-bold text-cyan-400">
                    {simulations.filter(s => s.status === 'draft').length}
                  </div>
                  <p className="text-gray-400 text-sm mt-2">Drafts</p>
                </Card>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}