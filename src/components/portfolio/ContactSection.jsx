import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Mail, Github, Linkedin, Twitter, Send, Link as LinkIcon, Copy, Loader2, Check, ShieldAlert } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

const iconMap = {
  Github, Linkedin, Twitter, Mail, Link: LinkIcon
};

const defaultSocialLinks = [
  { platform: 'GitHub', url: '#', icon: 'Github' },
  { platform: 'LinkedIn', url: '#', icon: 'Linkedin' },
  { platform: 'Twitter', url: '#', icon: 'Twitter' },
  { platform: 'Email', url: 'mailto:your@email.com', icon: 'Mail' },
];

const colorMap = {
  Github: '#f0f0f0',
  Linkedin: '#0a66c2',
  Twitter: '#1da1f2',
  Mail: '#ea4335',
  Link: '#569cd6'
};

const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const detectMaliciousInput = (input) => {
  const xssPatterns = [
    /<script\b[^>]*>/i,
    /javascript:/i,
    /on\w+\s*=/i,
    /<iframe/i,
    /<img[^>]+onerror/i,
    /<svg[^>]+onload/i,
    /eval\s*\(/i,
    /document\.(cookie|write|location)/i,
    /window\.(location|open)/i,
  ];
  const sqlPatterns = [
    /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|UNION|ALTER|CREATE|TRUNCATE)\b.*\b(FROM|INTO|TABLE|DATABASE)\b)/i,
    /('|")\s*(OR|AND)\s*('|"|\d)/i,
    /;\s*(DROP|DELETE|UPDATE|INSERT)/i,
    /--\s*$/,
    /\/\*.*\*\//,
  ];
  return [...xssPatterns, ...sqlPatterns].some(pattern => pattern.test(input));
};

const sanitizeInput = (input) => {
  return input
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
};

export default function ContactSection() {
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [securityAlert, setSecurityAlert] = useState(false);
  const [emailError, setEmailError] = useState('');

  const { data: settings } = useQuery({
    queryKey: ['siteSettings'],
    queryFn: async () => {
      const result = await base44.entities.SiteSettings.filter({ key: 'main' });
      return result[0] || null;
    },
  });

  const socialLinks = settings?.social_links || defaultSocialLinks;

  // Security alert overlay
  if (securityAlert) {
    return (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="fixed inset-0 z-50 flex items-center justify-center"
        style={{ backgroundColor: 'rgba(30, 30, 30, 0.95)' }}
      >
        <style>{`
          @keyframes terminalBlink {
            0%, 100% { opacity: 1; }
            50% { opacity: 0; }
          }
          .cursor-blink::after {
            content: '█';
            animation: terminalBlink 1s ease-in-out infinite;
          }
        `}</style>
        <motion.div 
          initial={{ scale: 0.9, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          className="bg-[#252526] border border-[#f44747] rounded-lg max-w-lg mx-4 overflow-hidden shadow-2xl"
        >
          {/* Terminal header */}
          <div className="bg-[#3c3c3c] px-4 py-2 flex items-center gap-2 border-b border-[#f44747]">
            <ShieldAlert className="w-4 h-4 text-[#f44747]" />
            <span className="text-[#f44747] font-mono text-sm">security_alert.ts — THREAT DETECTED</span>
          </div>
          
          <div className="p-6 font-mono text-sm">
            <div className="text-[#f44747] mb-4">
              <span className="text-[#569cd6]">throw new</span> <span className="text-[#4ec9b0]">SecurityError</span>
              <span className="text-[#ffd700]">(</span>
              <span className="text-[#ce9178]">"Malicious input detected"</span>
              <span className="text-[#ffd700]">)</span>;
            </div>
            
            <div className="bg-[#1e1e1e] rounded p-4 mb-4 border-l-2 border-[#f44747]">
              <div className="text-[#6a9955] mb-2">// Threat analysis</div>
              <div className="space-y-1">
                <div><span className="text-[#9cdcfe]">type</span><span className="text-[#cccccc]">:</span> <span className="text-[#ce9178]">"XSS/SQL Injection Attempt"</span></div>
                <div><span className="text-[#9cdcfe]">status</span><span className="text-[#cccccc]">:</span> <span className="text-[#ce9178]">"BLOCKED"</span></div>
                <div><span className="text-[#9cdcfe]">action</span><span className="text-[#cccccc]">:</span> <span className="text-[#ce9178]">"Input sanitized & logged"</span></div>
              </div>
            </div>
            
            <div className="text-[#808080] mb-6 cursor-blink">
              <span className="text-[#6a9955]">// Nice try. This portfolio is protected.</span>
            </div>
            
            <Button 
              onClick={() => {
                setSecurityAlert(false);
                setFormData({ name: '', email: '', message: '' });
              }}
              className="w-full bg-[#252526] border border-[#3c3c3c] hover:border-[#007acc] text-[#cccccc] font-mono"
            >
              <span className="text-[#569cd6]">await</span> resetForm<span className="text-[#ffd700]">()</span>
            </Button>
          </div>
        </motion.div>
      </motion.div>
    );
  }

  const handleSendMessage = async () => {
    if (!formData.name || !formData.email || !formData.message) {
      toast.error('Please fill in all fields');
      return;
    }
    
    if (!isValidEmail(formData.email)) {
      setEmailError('Invalid email format');
      toast.error('Please enter a valid email address');
      return;
    }
    
    // Check for malicious input
    const allInputs = `${formData.name} ${formData.email} ${formData.message}`;
    if (detectMaliciousInput(allInputs)) {
      setSecurityAlert(true);
      return;
    }
    
    setSending(true);
    const recipientEmail = socialLinks.find(l => l.icon === 'Mail')?.url?.replace('mailto:', '') || 'your@email.com';
    const sanitizedName = sanitizeInput(formData.name);
    const sanitizedEmail = sanitizeInput(formData.email);
    const sanitizedMessage = sanitizeInput(formData.message);
    
    await base44.integrations.Core.SendEmail({
      to: recipientEmail,
      subject: `Portfolio Contact: Message from ${sanitizedName}`,
      body: `Name: ${sanitizedName}\nEmail: ${sanitizedEmail}\n\nMessage:\n${sanitizedMessage}`
    });
    toast.success('Message sent successfully!');
    setFormData({ name: '', email: '', message: '' });
    setSending(false);
    setSent(true);
    setTimeout(() => setSent(false), 3000);
  };
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-8"
    >
      <div className="font-mono text-sm mb-6">
        <span className="text-[#6a9955]">// Let's connect and build something amazing</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Contact Form */}
        <div className="bg-[#252526] border border-[#3c3c3c] rounded-lg p-6">
          <div className="font-mono text-sm mb-4">
            <span className="text-[#569cd6]">const</span>{' '}
            <span className="text-[#9cdcfe]">sendMessage</span>{' '}
            <span className="text-[#cccccc]">=</span>{' '}
            <span className="text-[#569cd6]">async</span>{' '}
            <span className="text-[#ffd700]">()</span>{' '}
            <span className="text-[#569cd6]">{'=>'}</span>{' '}
            <span className="text-[#ffd700]">{'{'}</span>
          </div>
          
          <div className="pl-4 space-y-4">
            <div>
              <label className="text-[#9cdcfe] font-mono text-sm block mb-2">
                name<span className="text-[#cccccc]">:</span>
              </label>
              <Input 
                className="bg-[#1e1e1e] border-[#3c3c3c] text-[#cccccc] focus:border-[#007acc] font-mono"
                placeholder='"Your name"'
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            
            <div>
              <label className="text-[#9cdcfe] font-mono text-sm block mb-2">
                email<span className="text-[#cccccc]">:</span>
              </label>
              <Input 
                type="email"
                className={`bg-[#1e1e1e] border-[#3c3c3c] text-[#cccccc] focus:border-[#007acc] font-mono ${emailError ? 'border-red-500' : ''}`}
                placeholder='"your@email.com"'
                value={formData.email}
                onChange={(e) => {
                  setFormData({ ...formData, email: e.target.value });
                  setEmailError('');
                }}
              />
              {emailError && (
                <p className="text-red-500 text-xs font-mono mt-1">// {emailError}</p>
              )}
            </div>
            
            <div>
              <label className="text-[#9cdcfe] font-mono text-sm block mb-2">
                message<span className="text-[#cccccc]">:</span>
              </label>
              <Textarea 
                className="bg-[#1e1e1e] border-[#3c3c3c] text-[#cccccc] focus:border-[#007acc] font-mono min-h-[120px]"
                placeholder='"Hello, I would like to..."'
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              />
            </div>
            
            <Button 
              className={`w-full text-white font-mono ${sent ? 'bg-green-600 hover:bg-green-700' : 'bg-[#007acc] hover:bg-[#005a9e]'}`}
              onClick={handleSendMessage}
              disabled={sending}
            >
              {sending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : sent ? <Check className="w-4 h-4 mr-2" /> : <Send className="w-4 h-4 mr-2" />}
              {sending ? 'sending...' : sent ? 'Message sent!' : 'await send()'}
            </Button>
          </div>
          
          <div className="font-mono text-sm mt-4">
            <span className="text-[#ffd700]">{'}'}</span>
            <span className="text-[#6a9955]"> // This actually works by the way</span>
          </div>
          </div>

        {/* Social Links */}
        <div className="space-y-4">
          <div className="font-mono text-sm mb-4">
            <span className="text-[#569cd6]">const</span>{' '}
            <span className="text-[#9cdcfe]">socialLinks</span>
            <span className="text-[#cccccc]">:</span>{' '}
            <span className="text-[#4ec9b0]">Link</span>
            <span className="text-[#569cd6]">[]</span>{' '}
            <span className="text-[#cccccc]">=</span>{' '}
            <span className="text-[#569cd6]">[</span>
          </div>
          
          {socialLinks.map((link, index) => {
            const IconComponent = iconMap[link.icon] || LinkIcon;
            const color = colorMap[link.icon] || '#569cd6';
            const isEmail = link.icon === 'Mail' && link.url?.startsWith('mailto:');
            const email = isEmail ? link.url.replace('mailto:', '') : null;
            
            const handleClick = (e) => {
              if (isEmail && email) {
                e.preventDefault();
                navigator.clipboard.writeText(email);
                toast.success('Email copied to clipboard!');
              }
            };
            
            return (
              <motion.a
                key={link.platform}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                onClick={handleClick}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center gap-4 bg-[#252526] border border-[#3c3c3c] rounded-lg p-4 hover:border-[#007acc] transition-all duration-300 group cursor-pointer"
              >
                <div 
                  className="w-10 h-10 rounded-lg flex items-center justify-center transition-colors"
                  style={{ backgroundColor: `${color}20` }}
                >
                  <IconComponent className="w-5 h-5" style={{ color }} />
                </div>
                <div className="font-mono flex-1">
                  <span className="text-[#ffd700]">{'{ '}</span>
                  <span className="text-[#9cdcfe]">platform</span>
                  <span className="text-[#cccccc]">: </span>
                  <span className="text-[#ce9178]">"{link.platform}"</span>
                  <span className="text-[#ffd700]">{' }'}</span>
                </div>
                {isEmail && (
                  <Copy className="w-4 h-4 text-[#808080] group-hover:text-[#cccccc] transition-colors" />
                )}
              </motion.a>
            );
          })}
          
          <div className="font-mono text-sm">
            <span className="text-[#569cd6]">]</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}