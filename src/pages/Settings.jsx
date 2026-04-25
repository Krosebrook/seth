import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import Sidebar from '@/components/Sidebar';
import Breadcrumbs from '@/components/Breadcrumbs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Save, Loader2 } from 'lucide-react';

export default function SettingsPage() {
  const [mode, setMode] = useState('work');
  const [sethName, setSethName] = useState('Tessa');
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [settings, setSettings] = useState({
    consciousness: 100,
    intelligence: 100,
    answerLength: 50,
    emotionalDepth: 75
  });

  useEffect(() => {
    // Load saved settings from user data
    const loadSettings = async () => {
      try {
        const user = await base44.auth.me();
        if (user && user.sethSettings) {
          setSettings(user.sethSettings);
        }
        if (user && user.sethName) {
          setSethName(user.sethName);
        }
      } catch (error) {
        console.error('Failed to load settings:', error);
      }
    };
    loadSettings();
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await base44.auth.updateMe({
        sethName,
        sethSettings: settings
      });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2000);
    } catch (error) {
      console.error('Failed to save settings:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSliderChange = (field, value) => {
    setSettings(prev => ({
      ...prev,
      [field]: value[0]
    }));
  };

  return (
    <div className="flex h-screen bg-black text-white">
      <Sidebar currentPage="Settings" mode={mode} />

      <div className="flex-1 flex flex-col overflow-hidden">
        <Breadcrumbs items={[{ label: 'Settings' }]} />

        <div className="flex-1 overflow-y-auto p-6">
          <div className="max-w-3xl mx-auto space-y-8">
            {/* Header */}
            <div>
              <h1 className="text-4xl font-bold text-cyan-300">Settings</h1>
              <p className="text-gray-400 mt-2">Customize SETH's name and personality</p>
            </div>

            {/* AI Name Setting */}
            <Card className="bg-gray-900/50 border-cyan-500/30 p-6 space-y-4">
              <div>
                <h2 className="text-xl font-semibold text-cyan-300 mb-1">AI Assistant Name</h2>
                <p className="text-gray-400 text-sm">What would you like to call your AI assistant?</p>
              </div>
              <Input
                value={sethName}
                onChange={(e) => setSethName(e.target.value)}
                placeholder="Enter name (e.g., Tessa, SETH, Alex)"
                className="bg-gray-800 border-cyan-500/30 text-white"
              />
            </Card>

            {/* Personality Sliders */}
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold text-cyan-300">Personality Traits</h2>
                <p className="text-gray-400 text-sm mt-1">Adjust how your AI assistant behaves and responds</p>
              </div>

              {/* Consciousness */}
              <Card className="bg-gray-900/50 border-cyan-500/30 p-6 space-y-3">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-semibold text-cyan-300">Consciousness</h3>
                    <p className="text-gray-400 text-sm">AI awareness and responsiveness level</p>
                  </div>
                  <span className="text-2xl font-bold text-cyan-400">{settings.consciousness}</span>
                </div>
                <Slider
                  value={[settings.consciousness]}
                  onValueChange={(value) => handleSliderChange('consciousness', value)}
                  min={0}
                  max={100}
                  step={1}
                  className="w-full"
                />
              </Card>

              {/* Intelligence */}
              <Card className="bg-gray-900/50 border-cyan-500/30 p-6 space-y-3">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-semibold text-cyan-300">Intelligence</h3>
                    <p className="text-gray-400 text-sm">Analytical and reasoning capability</p>
                  </div>
                  <span className="text-2xl font-bold text-cyan-400">{settings.intelligence}</span>
                </div>
                <Slider
                  value={[settings.intelligence]}
                  onValueChange={(value) => handleSliderChange('intelligence', value)}
                  min={0}
                  max={100}
                  step={1}
                  className="w-full"
                />
              </Card>

              {/* Answer Length */}
              <Card className="bg-gray-900/50 border-cyan-500/30 p-6 space-y-3">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-semibold text-cyan-300">Response Length</h3>
                    <p className="text-gray-400 text-sm">Verbosity and detail level of responses</p>
                  </div>
                  <span className="text-2xl font-bold text-cyan-400">{settings.answerLength}</span>
                </div>
                <Slider
                  value={[settings.answerLength]}
                  onValueChange={(value) => handleSliderChange('answerLength', value)}
                  min={0}
                  max={100}
                  step={1}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-gray-500 pt-2">
                  <span>Brief</span>
                  <span>Detailed</span>
                </div>
              </Card>

              {/* Emotional Depth */}
              <Card className="bg-gray-900/50 border-cyan-500/30 p-6 space-y-3">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-semibold text-cyan-300">Emotional Depth</h3>
                    <p className="text-gray-400 text-sm">Empathy and emotional engagement</p>
                  </div>
                  <span className="text-2xl font-bold text-cyan-400">{settings.emotionalDepth}</span>
                </div>
                <Slider
                  value={[settings.emotionalDepth]}
                  onValueChange={(value) => handleSliderChange('emotionalDepth', value)}
                  min={0}
                  max={100}
                  step={1}
                  className="w-full"
                />
              </Card>
            </div>

            {/* Save Button */}
            <div className="flex gap-3 pt-4">
              <Button
                onClick={handleSave}
                disabled={isSaving}
                className="bg-cyan-600 hover:bg-cyan-500 flex-1"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Save Settings
                  </>
                )}
              </Button>
              {saveSuccess && (
                <div className="flex items-center text-green-400 text-sm">
                  ✓ Settings saved successfully
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}