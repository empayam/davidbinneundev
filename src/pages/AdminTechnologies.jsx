import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Save, Plus, Loader2, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import AdminHeader from '../components/admin/AdminHeader';

const defaultTechnologies = [
  { name: 'Splunk', color: '#65A637', category: 'security' },
  { name: 'Cortex XDR', color: '#F04E23', category: 'security' },
  { name: 'FortiSIEM', color: '#EE3124', category: 'security' },
  { name: 'Harmony', color: '#00A0DC', category: 'security' },
  { name: 'Active Directory', color: '#0078D4', category: 'security' },
  { name: 'Wireshark', color: '#1679A7', category: 'security' },
  { name: 'JavaScript', color: '#F7DF1E', category: 'frontend' },
  { name: 'TypeScript', color: '#3178C6', category: 'frontend' },
  { name: 'React', color: '#61DAFB', category: 'frontend' },
  { name: 'HTML', color: '#E34F26', category: 'frontend' },
  { name: 'CSS', color: '#1572B6', category: 'frontend' },
  { name: 'Node.js', color: '#339933', category: 'backend' },
  { name: 'Express', color: '#000000', category: 'backend' },
  { name: 'Docker', color: '#2496ED', category: 'backend' },
  { name: 'MongoDB', color: '#47A248', category: 'database' },
  { name: 'SQL', color: '#CC2927', category: 'database' },
  { name: 'DynamoDB', color: '#4053D6', category: 'database' },
  { name: 'AWS EC2', color: '#FF9900', category: 'cloud' },
  { name: 'AWS S3', color: '#569A31', category: 'cloud' },
  { name: 'AWS Lambda', color: '#FF9900', category: 'cloud' },
  { name: 'AWS IAM', color: '#DD344C', category: 'cloud' },
  { name: 'Git', color: '#F05032', category: 'tools' },
  { name: 'Jest', color: '#C21325', category: 'tools' },
  { name: 'Puppeteer', color: '#40B5A4', category: 'tools' },
  { name: 'Linux', color: '#FCC624', category: 'tools' },
  { name: 'Windows', color: '#0078D6', category: 'tools' },
];

const categories = ['security', 'frontend', 'backend', 'database', 'cloud', 'tools'];

export default function AdminTechnologies() {
  const queryClient = useQueryClient();
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [technologies, setTechnologies] = useState(defaultTechnologies);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const currentUser = await base44.auth.me();
        if (!currentUser || currentUser.role !== 'admin') {
          base44.auth.redirectToLogin(window.location.pathname);
          return;
        }
        setUser(currentUser);
      } catch (error) {
        base44.auth.redirectToLogin(window.location.pathname);
      } finally {
        setAuthLoading(false);
      }
    };
    checkAuth();
  }, []);

  const { data: existingSettings, isLoading } = useQuery({
    queryKey: ['siteSettings'],
    queryFn: async () => {
      const result = await base44.entities.SiteSettings.filter({ key: 'main' });
      return result[0] || null;
    },
  });

  useEffect(() => {
    if (existingSettings?.floating_technologies) {
      setTechnologies(existingSettings.floating_technologies);
    }
  }, [existingSettings]);

  const saveMutation = useMutation({
    mutationFn: async (data) => {
      const settingsData = { ...existingSettings, floating_technologies: data, key: 'main' };
      if (existingSettings?.id) {
        return base44.entities.SiteSettings.update(existingSettings.id, settingsData);
      } else {
        return base44.entities.SiteSettings.create(settingsData);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['siteSettings'] });
      toast.success('Technologies saved!');
    },
  });

  const updateTech = (index, field, value) => {
    const newTech = [...technologies];
    newTech[index] = { ...newTech[index], [field]: value };
    setTechnologies(newTech);
  };

  const addTech = () => {
    setTechnologies([...technologies, { name: 'New Tech', color: '#569cd6', category: 'tools' }]);
  };

  const removeTech = (index) => {
    setTechnologies(technologies.filter((_, i) => i !== index));
  };

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen bg-[#1e1e1e] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-[#007acc] animate-spin" />
      </div>
    );
  }

  if (!user) return null;

  const groupedTech = categories.reduce((acc, cat) => {
    acc[cat] = technologies.filter(t => t.category === cat);
    return acc;
  }, {});

  return (
    <div className="min-h-screen bg-[#1e1e1e] text-[#cccccc]">
      <AdminHeader currentPage="AdminTechnologies" />
      
      <main className="pt-[6.25rem] pb-8 px-4 md:px-8 max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-mono">
            <span className="text-[#6a9955]">// </span>
            <span className="text-[#cccccc]">Floating Technologies</span>
          </h1>
          <div className="flex gap-2">
            <Button onClick={addTech} variant="outline" className="border-[#3c3c3c] text-[#cccccc]">
              <Plus className="w-4 h-4 mr-2" />
              Add Tech
            </Button>
            <Button
              onClick={() => saveMutation.mutate(technologies)}
              disabled={saveMutation.isPending}
              className="bg-[#007acc] hover:bg-[#005a9e]"
            >
              {saveMutation.isPending ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Save className="w-4 h-4 mr-2" />
              )}
              Save Changes
            </Button>
          </div>
        </div>

        <p className="text-[#808080] font-mono text-sm mb-6">
          // These technologies float around the background of your portfolio
        </p>

        {categories.map(category => (
          <div key={category} className="mb-6">
            <h2 className="text-[#569cd6] font-mono mb-3 capitalize flex items-center gap-2">
              <span className="text-[#c586c0]">const</span> {category} = [
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 pl-4">
              {technologies.map((tech, index) => 
                tech.category === category && (
                  <div
                    key={index}
                    className="bg-[#252526] border border-[#3c3c3c] rounded-lg p-3 hover:border-[#007acc] transition-all flex items-center gap-3"
                  >
                    <div
                      className="w-8 h-8 rounded flex-shrink-0"
                      style={{ backgroundColor: tech.color }}
                    />
                    <div className="flex-1 min-w-0">
                      <Input
                        value={tech.name}
                        onChange={(e) => updateTech(index, 'name', e.target.value)}
                        className="bg-[#1e1e1e] border-[#3c3c3c] text-[#cccccc] font-mono text-sm h-8 mb-1"
                      />
                      <div className="flex gap-2">
                        <Input
                          value={tech.color}
                          onChange={(e) => updateTech(index, 'color', e.target.value)}
                          className="bg-[#1e1e1e] border-[#3c3c3c] text-[#ce9178] font-mono text-xs h-6 flex-1"
                        />
                        <Select value={tech.category} onValueChange={(v) => updateTech(index, 'category', v)}>
                          <SelectTrigger className="bg-[#1e1e1e] border-[#3c3c3c] text-[#cccccc] text-xs h-6 w-24">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-[#252526] border-[#3c3c3c]">
                            {categories.map(c => (
                              <SelectItem key={c} value={c} className="text-[#cccccc] text-xs">{c}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <button
                      onClick={() => removeTech(index)}
                      className="text-[#f44747] hover:text-[#f44747]/80"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                )
              )}
            </div>
            
            <div className="text-[#cccccc] font-mono mt-2">]</div>
          </div>
        ))}
      </main>
    </div>
  );
}