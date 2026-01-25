import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Sidebar from '@/components/Sidebar';
import Breadcrumbs from '@/components/Breadcrumbs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Plus, Play, Loader2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

export default function SimulationsPage() {
  const [mode, setMode] = useState('work');
  const [showCreate, setShowCreate] = useState(false);
  const [newSimulation, setNewSimulation] = useState({ title: '', description: '' });
  const [isGenerating, setIsGenerating] = useState(false);
  const queryClient = useQueryClient();

  const { data: simulations = [], isLoading } = useQuery({
    queryKey: ['simulations'],
    queryFn: () => base44.entities.Simulation.list('-created_date')
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.Simulation.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['simulations'] });
      setShowCreate(false);
      setNewSimulation({ title: '', description: '' });
      base44.entities.ActivityLog.create({
        action: 'created_simulation',
        entity_type: 'Simulation',
        details: { title: newSimulation.title }
      });
    }
  });

  const runSimulation = async (simulation) => {
    setIsGenerating(true);
    try {
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `Analyze this simulation scenario and provide:
1. A comprehensive summary of the discussion
2. Key decision trade-offs with pros and cons
3. Primary drivers behind each role's stance
4. Next steps with confidence scores (0-100)

Simulation: ${simulation.title}
Description: ${simulation.description}
Roles: ${JSON.stringify(simulation.roles || [])}

Return JSON:`,
        response_json_schema: {
          type: 'object',
          properties: {
            summary: { type: 'string' },
            trade_offs: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  description: { type: 'string' },
                  pros: { type: 'array', items: { type: 'string' } },
                  cons: { type: 'array', items: { type: 'string' } }
                }
              }
            },
            next_steps: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  step: { type: 'string' },
                  confidence_score: { type: 'number' }
                }
              }
            }
          }
        }
      });

      await base44.entities.Simulation.update(simulation.id, {
        ...simulation,
        summary: response.summary,
        trade_offs: response.trade_offs,
        next_steps: response.next_steps,
        status: 'completed'
      });

      queryClient.invalidateQueries({ queryKey: ['simulations'] });
      
      await base44.entities.ActivityLog.create({
        action: 'ran_simulation',
        entity_type: 'Simulation',
        entity_id: simulation.id
      });
    } catch (error) {
      console.error('Simulation failed:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="flex h-screen bg-black text-white">
      <Sidebar currentPage="Simulations" mode={mode} />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Breadcrumbs items={[{ label: 'Simulations' }]} />
        
        <div className="flex-1 overflow-y-auto p-6">
          <div className="max-w-6xl mx-auto space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold text-cyan-300">Simulations</h1>
                <p className="text-gray-400 mt-2">Run scenario simulations with enhanced AI analysis</p>
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={() => setMode(mode === 'work' ? 'personal' : 'work')}
                  variant="outline"
                  className="border-cyan-500/50"
                >
                  {mode === 'work' ? 'Switch to Personal' : 'Switch to Work'}
                </Button>
                <Button onClick={() => setShowCreate(true)} className="bg-cyan-600">
                  <Plus className="w-4 h-4 mr-2" />
                  New Simulation
                </Button>
              </div>
            </div>

            {isLoading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-cyan-400" />
              </div>
            ) : (
              <div className="grid gap-4">
                {simulations.map((sim) => (
                  <Card key={sim.id} className="bg-gray-900/50 border-cyan-500/30 p-6">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="text-xl font-semibold text-cyan-300">{sim.title}</h3>
                        <p className="text-gray-400 mt-2">{sim.description}</p>
                        
                        {sim.summary && (
                          <div className="mt-4 space-y-3">
                            <div>
                              <h4 className="font-semibold text-cyan-400">Summary:</h4>
                              <p className="text-gray-300 mt-1">{sim.summary}</p>
                            </div>
                            
                            {sim.trade_offs && sim.trade_offs.length > 0 && (
                              <div>
                                <h4 className="font-semibold text-cyan-400">Trade-offs:</h4>
                                {sim.trade_offs.map((tradeoff, idx) => (
                                  <div key={idx} className="mt-2 pl-4 border-l-2 border-cyan-500/30">
                                    <p className="text-gray-300">{tradeoff.description}</p>
                                    <div className="grid grid-cols-2 gap-4 mt-2">
                                      <div>
                                        <p className="text-green-400 text-sm">Pros:</p>
                                        <ul className="text-gray-400 text-sm list-disc list-inside">
                                          {tradeoff.pros?.map((pro, i) => <li key={i}>{pro}</li>)}
                                        </ul>
                                      </div>
                                      <div>
                                        <p className="text-red-400 text-sm">Cons:</p>
                                        <ul className="text-gray-400 text-sm list-disc list-inside">
                                          {tradeoff.cons?.map((con, i) => <li key={i}>{con}</li>)}
                                        </ul>
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                            
                            {sim.next_steps && sim.next_steps.length > 0 && (
                              <div>
                                <h4 className="font-semibold text-cyan-400">Next Steps:</h4>
                                <div className="space-y-2 mt-2">
                                  {sim.next_steps.map((step, idx) => (
                                    <div key={idx} className="flex justify-between items-center bg-gray-800/50 p-2 rounded">
                                      <span className="text-gray-300">{step.step}</span>
                                      <span className="text-cyan-400 font-semibold">
                                        {step.confidence_score}% confidence
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                      
                      <Button
                        onClick={() => runSimulation(sim)}
                        disabled={isGenerating}
                        className="bg-cyan-600 ml-4"
                      >
                        {isGenerating ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <>
                            <Play className="w-4 h-4 mr-2" />
                            Run
                          </>
                        )}
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent className="bg-gray-900 text-white border-cyan-500/30">
          <DialogHeader>
            <DialogTitle className="text-cyan-300">Create New Simulation</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              placeholder="Simulation Title"
              value={newSimulation.title}
              onChange={(e) => setNewSimulation({ ...newSimulation, title: e.target.value })}
              className="bg-gray-800 border-cyan-500/30"
            />
            <Textarea
              placeholder="Describe the simulation scenario..."
              value={newSimulation.description}
              onChange={(e) => setNewSimulation({ ...newSimulation, description: e.target.value })}
              className="bg-gray-800 border-cyan-500/30 min-h-32"
            />
            <Button
              onClick={() => createMutation.mutate(newSimulation)}
              disabled={!newSimulation.title || !newSimulation.description}
              className="w-full bg-cyan-600"
            >
              Create Simulation
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}