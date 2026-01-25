import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Sidebar from '@/components/Sidebar';
import Breadcrumbs from '@/components/Breadcrumbs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Plus, Sparkles, Loader2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

export default function CustomRolesPage() {
  const [mode, setMode] = useState('work');
  const [showCreate, setShowCreate] = useState(false);
  const [newRole, setNewRole] = useState({ name: '', description: '', concerns: [], priorities: [] });
  const [isGeneratingSuggestions, setIsGeneratingSuggestions] = useState(false);
  const queryClient = useQueryClient();

  const { data: roles = [], isLoading } = useQuery({
    queryKey: ['customRoles'],
    queryFn: () => base44.entities.CustomRole.list('-created_date')
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.CustomRole.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customRoles'] });
      setShowCreate(false);
      setNewRole({ name: '', description: '', concerns: [], priorities: [] });
      base44.entities.ActivityLog.create({
        action: 'created_custom_role',
        entity_type: 'CustomRole',
        details: { name: newRole.name }
      });
    }
  });

  const generateSuggestions = async () => {
    if (!newRole.name && !newRole.description) return;
    
    setIsGeneratingSuggestions(true);
    try {
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `Based on this role: "${newRole.name}" with description: "${newRole.description}"
        
Generate relevant:
1. Key concerns this role would have
2. Typical priorities for this role
3. An appropriate icon name (from lucide-react)
4. A color theme (hex code)

Return JSON:`,
        response_json_schema: {
          type: 'object',
          properties: {
            concerns: { type: 'array', items: { type: 'string' } },
            priorities: { type: 'array', items: { type: 'string' } },
            icon: { type: 'string' },
            color: { type: 'string' }
          }
        }
      });

      setNewRole(prev => ({
        ...prev,
        concerns: response.concerns || [],
        priorities: response.priorities || [],
        icon: response.icon || '',
        color: response.color || '#00ffff'
      }));
    } catch (error) {
      console.error('Failed to generate suggestions:', error);
    } finally {
      setIsGeneratingSuggestions(false);
    }
  };

  return (
    <div className="flex h-screen bg-black text-white">
      <Sidebar currentPage="Custom Roles" mode={mode} />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Breadcrumbs items={[{ label: 'Custom Roles' }]} />
        
        <div className="flex-1 overflow-y-auto p-6">
          <div className="max-w-6xl mx-auto space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold text-cyan-300">Custom Roles</h1>
                <p className="text-gray-400 mt-2">Create custom roles with AI-powered suggestions</p>
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
                  New Role
                </Button>
              </div>
            </div>

            {isLoading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-cyan-400" />
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {roles.map((role) => (
                  <Card
                    key={role.id}
                    className="bg-gray-900/50 border-cyan-500/30 p-6"
                    style={{ borderColor: role.color || '#00ffff' }}
                  >
                    <h3 className="text-xl font-semibold text-cyan-300">{role.name}</h3>
                    <p className="text-gray-400 mt-2 text-sm">{role.description}</p>
                    
                    {role.concerns && role.concerns.length > 0 && (
                      <div className="mt-4">
                        <h4 className="text-sm font-semibold text-cyan-400">Concerns:</h4>
                        <ul className="text-gray-300 text-sm list-disc list-inside mt-1">
                          {role.concerns.map((concern, idx) => (
                            <li key={idx}>{concern}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    
                    {role.priorities && role.priorities.length > 0 && (
                      <div className="mt-3">
                        <h4 className="text-sm font-semibold text-cyan-400">Priorities:</h4>
                        <ul className="text-gray-300 text-sm list-disc list-inside mt-1">
                          {role.priorities.map((priority, idx) => (
                            <li key={idx}>{priority}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent className="bg-gray-900 text-white border-cyan-500/30 max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-cyan-300">Create Custom Role</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              placeholder="Role Name (e.g., Product Manager, CFO)"
              value={newRole.name}
              onChange={(e) => setNewRole({ ...newRole, name: e.target.value })}
              className="bg-gray-800 border-cyan-500/30"
            />
            <Textarea
              placeholder="Role Description..."
              value={newRole.description}
              onChange={(e) => setNewRole({ ...newRole, description: e.target.value })}
              className="bg-gray-800 border-cyan-500/30 min-h-24"
            />
            
            <Button
              onClick={generateSuggestions}
              disabled={isGeneratingSuggestions || (!newRole.name && !newRole.description)}
              variant="outline"
              className="w-full border-cyan-500/50"
            >
              {isGeneratingSuggestions ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Generating AI Suggestions...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Generate AI Suggestions
                </>
              )}
            </Button>
            
            {newRole.concerns.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold text-cyan-400 mb-2">Suggested Concerns:</h4>
                <div className="flex flex-wrap gap-2">
                  {newRole.concerns.map((concern, idx) => (
                    <span key={idx} className="px-3 py-1 bg-cyan-500/20 rounded-full text-sm">
                      {concern}
                    </span>
                  ))}
                </div>
              </div>
            )}
            
            {newRole.priorities.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold text-cyan-400 mb-2">Suggested Priorities:</h4>
                <div className="flex flex-wrap gap-2">
                  {newRole.priorities.map((priority, idx) => (
                    <span key={idx} className="px-3 py-1 bg-purple-500/20 rounded-full text-sm">
                      {priority}
                    </span>
                  ))}
                </div>
              </div>
            )}
            
            <Button
              onClick={() => createMutation.mutate(newRole)}
              disabled={!newRole.name || !newRole.description}
              className="w-full bg-cyan-600"
            >
              Create Role
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}