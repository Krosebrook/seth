import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import Sidebar from '@/components/Sidebar';
import Breadcrumbs from '@/components/Breadcrumbs';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Download, Loader2 } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function ExportPage() {
  const [mode, setMode] = useState('work');
  const [format, setFormat] = useState('json');
  const [selectedEntities, setSelectedEntities] = useState({
    ChatSession: true,
    Learning: true,
    Simulation: false,
    CustomRole: false,
    ActivityLog: false
  });
  const [isExporting, setIsExporting] = useState(false);

  const entities = [
    { name: 'ChatSession', label: 'Chat Sessions', fields: ['title', 'messages', 'created_date'] },
    { name: 'Learning', label: 'Learnings', fields: ['fact', 'created_date'] },
    { name: 'Simulation', label: 'Simulations', fields: ['title', 'description', 'summary', 'status'] },
    { name: 'CustomRole', label: 'Custom Roles', fields: ['name', 'description', 'concerns', 'priorities'] },
    { name: 'ActivityLog', label: 'Activity Log', fields: ['action', 'entity_type', 'created_by', 'created_date'] }
  ];

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const exportData = {};
      
      for (const [entityName, isSelected] of Object.entries(selectedEntities)) {
        if (isSelected) {
          const data = await base44.entities[entityName].list();
          exportData[entityName] = data;
        }
      }

      let content, filename, mimeType;

      if (format === 'json') {
        content = JSON.stringify(exportData, null, 2);
        filename = `tessa-export-${new Date().toISOString()}.json`;
        mimeType = 'application/json';
      } else if (format === 'csv') {
        // Convert to CSV format
        const csvParts = [];
        for (const [entityName, records] of Object.entries(exportData)) {
          if (records.length > 0) {
            csvParts.push(`\n# ${entityName}\n`);
            const headers = Object.keys(records[0]).join(',');
            csvParts.push(headers);
            records.forEach(record => {
              const row = Object.values(record).map(v => 
                typeof v === 'object' ? JSON.stringify(v) : v
              ).join(',');
              csvParts.push(row);
            });
          }
        }
        content = csvParts.join('\n');
        filename = `tessa-export-${new Date().toISOString()}.csv`;
        mimeType = 'text/csv';
      }

      const blob = new Blob([content], { type: mimeType });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      await base44.entities.ActivityLog.create({
        action: 'exported_data',
        entity_type: 'Multiple',
        details: { format, entities: Object.keys(selectedEntities).filter(k => selectedEntities[k]) }
      });
    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      setIsExporting(false);
    }
  };

  const toggleEntity = (entityName) => {
    setSelectedEntities(prev => ({
      ...prev,
      [entityName]: !prev[entityName]
    }));
  };

  return (
    <div className="flex h-screen bg-black text-white">
      <Sidebar currentPage="Export Data" mode={mode} />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Breadcrumbs items={[{ label: 'Export Data' }]} />
        
        <div className="flex-1 overflow-y-auto p-6">
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold text-cyan-300">Export Data</h1>
                <p className="text-gray-400 mt-2">Export your data in CSV or JSON format</p>
              </div>
              <Button
                onClick={() => setMode(mode === 'work' ? 'personal' : 'work')}
                variant="outline"
                className="border-cyan-500/50"
              >
                {mode === 'work' ? 'Switch to Personal' : 'Switch to Work'}
              </Button>
            </div>

            <Card className="bg-gray-900/50 border-cyan-500/30 p-6">
              <h3 className="text-lg font-semibold text-cyan-300 mb-4">Export Settings</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="text-sm text-gray-400 mb-2 block">Format</label>
                  <Select value={format} onValueChange={setFormat}>
                    <SelectTrigger className="bg-gray-800 border-cyan-500/30">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-cyan-500/30">
                      <SelectItem value="json">JSON</SelectItem>
                      <SelectItem value="csv">CSV</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm text-gray-400 mb-3 block">Select Entities to Export</label>
                  <div className="space-y-3">
                    {entities.map((entity) => (
                      <div
                        key={entity.name}
                        className="flex items-start space-x-3 p-3 bg-gray-800/50 rounded-lg"
                      >
                        <Checkbox
                          checked={selectedEntities[entity.name]}
                          onCheckedChange={() => toggleEntity(entity.name)}
                          className="mt-1"
                        />
                        <div className="flex-1">
                          <div className="font-medium text-white">{entity.label}</div>
                          <div className="text-sm text-gray-400 mt-1">
                            Fields: {entity.fields.join(', ')}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <Button
                  onClick={handleExport}
                  disabled={isExporting || !Object.values(selectedEntities).some(v => v)}
                  className="w-full bg-cyan-600 mt-6"
                >
                  {isExporting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Exporting...
                    </>
                  ) : (
                    <>
                      <Download className="w-4 h-4 mr-2" />
                      Export Data
                    </>
                  )}
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}