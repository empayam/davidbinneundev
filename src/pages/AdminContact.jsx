import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Save, Plus, Loader2, X, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import AdminHeader from '../components/admin/AdminHeader';

const defaultSocialLinks = [
  { platform: 'GitHub', url: '#', icon: 'Github' },
  { platform: 'LinkedIn', url: '#', icon: 'Linkedin' },
  { platform: 'Twitter', url: '#', icon: 'Twitter' },
  { platform: 'Email', url: 'mailto:your@email.com', icon: 'Mail' },
];

export default function AdminContact() {
  const queryClient = useQueryClient();
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [socialLinks, setSocialLinks] = useState(defaultSocialLinks);

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
    if (existingSettings?.social_links) {
      setSocialLinks(existingSettings.social_links);
    }
  }, [existingSettings]);

  const saveMutation = useMutation({
    mutationFn: async (data) => {
      const settingsData = { ...existingSettings, social_links: data, key: 'main' };
      if (existingSettings?.id) {
        return base44.entities.SiteSettings.update(existingSettings.id, settingsData);
      } else {
        return base44.entities.SiteSettings.create(settingsData);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['siteSettings'] });
      toast.success('Social links saved!');
    },
  });

  const updateLink = (index, field, value) => {
    const newLinks = [...socialLinks];
    newLinks[index] = { ...newLinks[index], [field]: value };
    setSocialLinks(newLinks);
  };

  const addLink = () => {
    setSocialLinks([...socialLinks, { platform: 'New Platform', url: '#', icon: 'Link' }]);
  };

  const removeLink = (index) => {
    setSocialLinks(socialLinks.filter((_, i) => i !== index));
  };

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen bg-[#1e1e1e] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-[#007acc] animate-spin" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-[#1e1e1e] text-[#cccccc]">
      <AdminHeader currentPage="AdminContact" />
      
      <main className="pt-[6.25rem] pb-8 px-4 md:px-8 max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-mono">
            <span className="text-[#6a9955]">// </span>
            <span className="text-[#cccccc]">Contact & Social Links</span>
          </h1>
          <Button
            onClick={() => saveMutation.mutate(socialLinks)}
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

        <div className="bg-[#252526] border border-[#3c3c3c] rounded-lg p-6">
          <div className="font-mono text-sm mb-4">
            <span className="text-[#569cd6]">const</span>{' '}
            <span className="text-[#4fc1ff]">socialLinks</span>{' '}
            <span className="text-[#cccccc]">= [</span>
          </div>

          <div className="pl-4 space-y-4 mb-4">
            {socialLinks.map((link, index) => (
              <div key={index} className="bg-[#1e1e1e] border border-[#3c3c3c] rounded-lg p-4">
                <div className="flex items-start justify-between mb-3">
                  <span className="text-[#cccccc] font-mono">{'{'}</span>
                  <button
                    onClick={() => removeLink(index)}
                    className="text-[#f44747] hover:text-[#f44747]/80"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                
                <div className="pl-4 space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-[#9cdcfe] font-mono w-20">platform:</span>
                    <Input
                      value={link.platform}
                      onChange={(e) => updateLink(index, 'platform', e.target.value)}
                      className="bg-[#252526] border-[#3c3c3c] text-[#ce9178] font-mono flex-1"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[#9cdcfe] font-mono w-20">url:</span>
                    <Input
                      value={link.url}
                      onChange={(e) => updateLink(index, 'url', e.target.value)}
                      className="bg-[#252526] border-[#3c3c3c] text-[#ce9178] font-mono flex-1"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[#9cdcfe] font-mono w-20">icon:</span>
                    <Input
                      value={link.icon}
                      onChange={(e) => updateLink(index, 'icon', e.target.value)}
                      placeholder="Github, Linkedin, Twitter, Mail, Link..."
                      className="bg-[#252526] border-[#3c3c3c] text-[#ce9178] font-mono flex-1"
                    />
                  </div>
                </div>
                
                <div className="mt-2 text-[#cccccc] font-mono">{'}'}<span className="text-[#cccccc]">,</span></div>
              </div>
            ))}
          </div>

          <Button
            onClick={addLink}
            variant="outline"
            className="w-full border-[#3c3c3c] border-dashed text-[#808080] hover:text-[#cccccc] hover:border-[#007acc]"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Social Link
          </Button>

          <div className="font-mono text-sm mt-4">
            <span className="text-[#cccccc]">]</span>
          </div>
        </div>
      </main>
    </div>
  );
}