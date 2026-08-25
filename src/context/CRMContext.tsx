import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  Lead,
  ClientProfile,
  Invoice,
  LinkedInCommentTask,
  MeetingTask,
  ActivityTask,
  LeadStatus,
  PaymentStatus,
  ClientStatus,
} from '../types/crm';

interface CRMContextType {
  leads: Lead[];
  clients: ClientProfile[];
  invoices: Invoice[];
  comments: LinkedInCommentTask[];
  meetings: MeetingTask[];
  tasks: ActivityTask[];
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  
  // Lead Operations
  addLead: (lead: Omit<Lead, 'id' | 'createdAt'>) => Lead;
  updateLead: (id: string, updates: Partial<Lead>) => void;
  deleteLead: (id: string) => void;
  bulkUpdateStatus: (ids: string[], newStatus: LeadStatus) => void;
  
  // Client Operations
  addClient: (client: Omit<ClientProfile, 'id'>) => ClientProfile;
  updateClient: (id: string, updates: Partial<ClientProfile>) => void;
  deleteClient: (id: string) => void;
  createClientFromWonLead: (lead: Lead, serviceCategory: string, monthlyRetainer: number) => ClientProfile;
  
  // Finance Operations
  addInvoice: (invoice: Omit<Invoice, 'id' | 'dueDate' | 'invoiceNumber'>) => Invoice;
  updateInvoiceStatus: (id: string, status: PaymentStatus) => void;
  deleteInvoice: (id: string) => void;
  
  // LinkedIn Commenting Operations
  addCommentTask: (task: Omit<LinkedInCommentTask, 'id'>) => LinkedInCommentTask;
  toggleCommentStatus: (id: string) => void;
  convertCommentToLead: (commentId: string, leadData?: Partial<Lead>) => void;
  markCommentDead: (commentId: string) => void;
  deleteCommentTask: (id: string) => void;
  
  // Meeting Operations
  addMeeting: (meeting: Omit<MeetingTask, 'id'>) => MeetingTask;
  updateMeetingOutcome: (id: string, status: MeetingTask['status'], outcome?: MeetingTask['outcome']) => void;
  deleteMeeting: (id: string) => void;
  
  // Task Operations
  toggleTaskComplete: (id: string) => void;
  rescheduleTask: (id: string, newDate: string) => void;
}

const CRMContext = createContext<CRMContextType | undefined>(undefined);

const initialLeads: Lead[] = [
  {
    id: 'lead-1',
    name: 'Sarah Jenkins',
    company: 'Apex Health Corp',
    jobTitle: 'CMO',
    email: 's.jenkins@apexhealth.io',
    phone: '+14155552671',
    linkedInUrl: 'https://linkedin.com/in/sarahjenkins-apex',
    channel: 'LinkedIn',
    temperature: 'Hot',
    status: 'Meeting Booked',
    estimatedValue: 4500,
    followUpDate: new Date().toISOString().split('T')[0],
    createdAt: '2025-02-15',
    connectionStatus: 'Connected',
    notes: 'Interested in AI Automated lead gen workflows.',
  },
  {
    id: 'lead-2',
    name: 'Tariq Mehmood',
    company: 'Greenline Logistics',
    jobTitle: 'Managing Director',
    email: 'tariq@greenline.pk',
    phone: '+923001234567',
    linkedInUrl: 'https://linkedin.com/in/tariq-greenline',
    channel: 'Google Maps',
    temperature: 'Warm',
    status: 'Qualified',
    estimatedValue: 2200,
    followUpDate: new Date().toISOString().split('T')[0],
    createdAt: '2025-02-18',
    websiteAvailable: true,
    socialMediaAvailable: false,
    location: 'Lahore, Pakistan',
    notes: 'No Meta Pixel found on site. High scope for Web & Ads.',
  },
  {
    id: 'lead-3',
    name: 'Elena Rostova',
    company: 'Nordic FinTech',
    jobTitle: 'VP Growth',
    email: 'elena@nordicfin.se',
    phone: '+46812345678',
    linkedInUrl: 'https://linkedin.com/in/elena-rostova',
    channel: 'LinkedIn',
    temperature: 'Hot',
    status: 'Proposal Sent',
    estimatedValue: 6000,
    followUpDate: '2025-02-20',
    createdAt: '2025-02-10',
    connectionStatus: 'Connected',
    notes: 'Sent $6k/mo Retainer proposal for AI & Paid Acquisition.',
  },
  {
    id: 'lead-4',
    name: 'David Vance',
    company: 'Vance Dental Group',
    jobTitle: 'Owner / Principal',
    email: 'david@vancedental.com',
    phone: '+13125550199',
    channel: 'Cold Email',
    temperature: 'Cold',
    status: 'New',
    estimatedValue: 1800,
    followUpDate: '2025-02-25',
    createdAt: '2025-02-19',
    notes: 'First touchpoint via cold email sequence #1.',
  }
];

const initialClients: ClientProfile[] = [
  {
    id: 'cli-1',
    leadId: 'lead-won-0',
    name: 'Marcus Sterling',
    company: 'Sterling Capital Advisors',
    email: 'marcus@sterlingcap.com',
    phone: '+12125559840',
    serviceCategory: 'Paid Acquisition',
    monthlyRetainer: 5000,
    startDate: '2025-01-10',
    status: 'Active',
  },
  {
    id: 'cli-2',
    name: 'Amina Khan',
    company: 'Zenith Aesthetics',
    email: 'amina@zenithaesthetics.pk',
    phone: '+923219988776',
    serviceCategory: 'Social Media Growth',
    monthlyRetainer: 2500,
    startDate: '2025-02-01',
    status: 'Active',
  }
];

const initialInvoices: Invoice[] = [
  {
    id: 'inv-101',
    clientId: 'cli-1',
    clientName: 'Sterling Capital Advisors',
    service: 'Paid Acquisition - Monthly Retainer',
    amount: 5000,
    sentDate: '2025-02-10',
    dueDate: '2025-02-17',
    datePaid: '2025-02-12',
    status: 'Paid',
    paymentMethod: 'Payoneer',
    invoiceNumber: 'INV-2025-001',
  },
  {
    id: 'inv-102',
    clientId: 'cli-2',
    clientName: 'Zenith Aesthetics',
    service: 'Social Media Growth - Setup & Retainer',
    amount: 2500,
    sentDate: '2025-02-14',
    dueDate: '2025-02-21',
    status: 'Pending',
    paymentMethod: 'Meezan Bank',
    invoiceNumber: 'INV-2025-002',
  }
];

const initialComments: LinkedInCommentTask[] = [
  {
    id: 'comm-1',
    leadName: 'Sarah Jenkins',
    profileUrl: 'https://linkedin.com/in/sarahjenkins-apex',
    postUrl: 'https://linkedin.com/posts/sarahjenkins-apex_ai-healthcare-post',
    dueDate: new Date().toISOString().split('T')[0],
    status: 'Pending',
    pipelineStatus: 'Pending',
    company: 'Apex Health Corp',
    notes: 'Drop insightful comment regarding LLM compliance.',
  },
  {
    id: 'comm-2',
    leadName: 'Elena Rostova',
    profileUrl: 'https://linkedin.com/in/elena-rostova',
    postUrl: 'https://linkedin.com/posts/elena-nordic-growth-post',
    dueDate: new Date().toISOString().split('T')[0],
    status: 'Completed',
    pipelineStatus: 'Commented',
    company: 'Nordic FinTech',
    notes: 'Praised their Series B announcement.',
  }
];

const initialMeetings: MeetingTask[] = [
  {
    id: 'meet-1',
    leadId: 'lead-1',
    leadName: 'Sarah Jenkins',
    company: 'Apex Health Corp',
    date: new Date().toISOString().split('T')[0],
    time: '15:30',
    status: 'Booked',
    outcome: 'Pending',
    meetingLink: 'https://meet.google.com',
  }
];

const initialTasks: ActivityTask[] = [
  {
    id: 'task-1',
    leadId: 'lead-1',
    leadName: 'Sarah Jenkins',
    type: 'Meeting',
    dueDate: new Date().toISOString().split('T')[0],
    completed: false,
    priority: 'High',
    details: 'Product Demo & Architecture overview call',
  },
  {
    id: 'task-2',
    leadId: 'lead-2',
    leadName: 'Tariq Mehmood',
    type: 'Follow-up',
    dueDate: new Date().toISOString().split('T')[0],
    completed: false,
    priority: 'Medium',
    details: 'Follow up on WhatsApp audit presentation',
  },
  {
    id: 'task-3',
    leadId: 'lead-3',
    leadName: 'Elena Rostova',
    type: 'DM / Message',
    dueDate: '2025-02-18',
    completed: false,
    priority: 'High',
    details: 'Check if legal team reviewed proposal document',
  }
];

export const CRMProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Theme Management
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    return (localStorage.getItem('digicore_theme') as 'light' | 'dark') || 'dark';
  });

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('digicore_theme', theme);
  }, [theme]);

  const toggleTheme = () => setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));

  // Data persistence with localStorage
  const [leads, setLeads] = useState<Lead[]>(() => {
    const saved = localStorage.getItem('digicore_leads');
    return saved ? JSON.parse(saved) : initialLeads;
  });

  const [clients, setClients] = useState<ClientProfile[]>(() => {
    const saved = localStorage.getItem('digicore_clients');
    return saved ? JSON.parse(saved) : initialClients;
  });

  const [invoices, setInvoices] = useState<Invoice[]>(() => {
    const saved = localStorage.getItem('digicore_invoices');
    return saved ? JSON.parse(saved) : initialInvoices;
  });

  const [comments, setComments] = useState<LinkedInCommentTask[]>(() => {
    const saved = localStorage.getItem('digicore_comments');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Ensure profileUrl exists on each comment
        return parsed.map((c: any) => ({
          ...c,
          profileUrl: c.profileUrl || `https://linkedin.com/in/${c.leadName.toLowerCase().replace(/\s+/g, '-')}`,
          pipelineStatus: c.pipelineStatus || (c.status === 'Completed' ? 'Commented' : 'Pending'),
        }));
      } catch (e) {
        return initialComments;
      }
    }
    return initialComments;
  });

  const [meetings, setMeetings] = useState<MeetingTask[]>(() => {
    const saved = localStorage.getItem('digicore_meetings');
    return saved ? JSON.parse(saved) : initialMeetings;
  });

  const [tasks, setTasks] = useState<ActivityTask[]>(() => {
    const saved = localStorage.getItem('digicore_tasks');
    return saved ? JSON.parse(saved) : initialTasks;
  });

  useEffect(() => {
    localStorage.setItem('digicore_leads', JSON.stringify(leads));
  }, [leads]);

  useEffect(() => {
    localStorage.setItem('digicore_clients', JSON.stringify(clients));
  }, [clients]);

  useEffect(() => {
    localStorage.setItem('digicore_invoices', JSON.stringify(invoices));
  }, [invoices]);

  useEffect(() => {
    localStorage.setItem('digicore_comments', JSON.stringify(comments));
  }, [comments]);

  useEffect(() => {
    localStorage.setItem('digicore_meetings', JSON.stringify(meetings));
  }, [meetings]);

  useEffect(() => {
    localStorage.setItem('digicore_tasks', JSON.stringify(tasks));
  }, [tasks]);

  // Lead CRUD & Auto Meeting Synchronization
  const addLead = (leadData: Omit<Lead, 'id' | 'createdAt'>): Lead => {
    const newLead: Lead = {
      ...leadData,
      id: `lead-${Date.now()}`,
      createdAt: new Date().toISOString().split('T')[0],
    };
    setLeads(prev => [newLead, ...prev]);

    // Create automatic task if follow-up exists
    if (leadData.followUpDate) {
      setTasks(prev => [
        {
          id: `task-${Date.now()}`,
          leadId: newLead.id,
          leadName: newLead.name,
          type: 'Follow-up',
          dueDate: newLead.followUpDate,
          completed: false,
          priority: leadData.temperature === 'Hot' ? 'High' : 'Medium',
          details: `Scheduled follow-up for ${newLead.company}`,
        },
        ...prev,
      ]);
    }

    // Auto-sync meeting if status is "Meeting Booked"
    if (leadData.status === 'Meeting Booked') {
      const todayStr = new Date().toISOString().split('T')[0];
      setMeetings(prev => [
        {
          id: `meet-${Date.now()}`,
          leadId: newLead.id,
          leadName: newLead.name,
          company: newLead.company,
          date: leadData.followUpDate || todayStr,
          time: '14:00',
          status: 'Booked',
          outcome: 'Pending',
          meetingLink: 'https://meet.google.com',
        },
        ...prev,
      ]);
    }

    return newLead;
  };

  const updateLead = (id: string, updates: Partial<Lead>) => {
    setLeads(prev => {
      const updated = prev.map(l => (l.id === id ? { ...l, ...updates } : l));
      const targetLead = updated.find(l => l.id === id);

      // If status changed to "Meeting Booked", auto-sync meeting if not already created
      if (updates.status === 'Meeting Booked' && targetLead) {
        setMeetings(currentMeetings => {
          const exists = currentMeetings.some(m => m.leadId === id && m.status === 'Booked');
          if (!exists) {
            const todayStr = new Date().toISOString().split('T')[0];
            return [
              {
                id: `meet-${Date.now()}`,
                leadId: targetLead.id,
                leadName: targetLead.name,
                company: targetLead.company,
                date: targetLead.followUpDate || todayStr,
                time: '15:00',
                status: 'Booked',
                outcome: 'Pending',
                meetingLink: 'https://meet.google.com',
              },
              ...currentMeetings,
            ];
          }
          return currentMeetings;
        });
      }

      return updated;
    });
  };

  const deleteLead = (id: string) => {
    setLeads(prev => prev.filter(l => l.id !== id));
    setTasks(prev => prev.filter(t => t.leadId !== id));
    setMeetings(prev => prev.filter(m => m.leadId !== id));
  };

  const bulkUpdateStatus = (ids: string[], newStatus: LeadStatus) => {
    setLeads(prev =>
      prev.map(l => (ids.includes(l.id) ? { ...l, status: newStatus } : l))
    );
  };

  // Client Operations
  const addClient = (clientData: Omit<ClientProfile, 'id'>): ClientProfile => {
    const newClient: ClientProfile = {
      ...clientData,
      id: `cli-${Date.now()}`,
    };
    setClients(prev => [newClient, ...prev]);
    return newClient;
  };

  const updateClient = (id: string, updates: Partial<ClientProfile>) => {
    setClients(prev => prev.map(c => (c.id === id ? { ...c, ...updates } : c)));
  };

  const deleteClient = (id: string) => {
    setClients(prev => prev.filter(c => c.id !== id));
  };

  const createClientFromWonLead = (
    lead: Lead,
    serviceCategory: string,
    monthlyRetainer: number
  ): ClientProfile => {
    const newClient: ClientProfile = {
      id: `cli-${Date.now()}`,
      leadId: lead.id,
      name: lead.name,
      company: lead.company,
      email: lead.email || 'client@company.com',
      phone: lead.phone || '',
      serviceCategory,
      monthlyRetainer,
      startDate: new Date().toISOString().split('T')[0],
      status: 'Active',
    };
    setClients(prev => [newClient, ...prev]);

    // Auto generate 1st month invoice (due in 7 days)
    const today = new Date();
    const dueDate = new Date();
    dueDate.setDate(today.getDate() + 7);

    const autoInvoice: Invoice = {
      id: `inv-${Date.now()}`,
      clientId: newClient.id,
      clientName: newClient.company,
      service: `${serviceCategory} - Initial Retainer`,
      amount: monthlyRetainer,
      sentDate: today.toISOString().split('T')[0],
      dueDate: dueDate.toISOString().split('T')[0],
      status: 'Pending',
      paymentMethod: 'Meezan Bank',
      invoiceNumber: `INV-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`,
    };
    setInvoices(prev => [autoInvoice, ...prev]);

    return newClient;
  };

  // Invoices & Finance
  const addInvoice = (inv: Omit<Invoice, 'id' | 'dueDate' | 'invoiceNumber'>): Invoice => {
    const sent = new Date(inv.sentDate);
    const due = new Date(sent);
    due.setDate(due.getDate() + 7);

    const newInv: Invoice = {
      ...inv,
      id: `inv-${Date.now()}`,
      dueDate: due.toISOString().split('T')[0],
      datePaid: inv.status === 'Paid' ? (inv.datePaid || new Date().toISOString().split('T')[0]) : undefined,
      invoiceNumber: `INV-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`,
    };
    setInvoices(prev => [newInv, ...prev]);
    return newInv;
  };

  const updateInvoiceStatus = (id: string, status: PaymentStatus) => {
    setInvoices(prev =>
      prev.map(inv => {
        if (inv.id === id) {
          return {
            ...inv,
            status,
            datePaid: status === 'Paid' ? (inv.datePaid || new Date().toISOString().split('T')[0]) : undefined,
          };
        }
        return inv;
      })
    );
  };

  const deleteInvoice = (id: string) => {
    setInvoices(prev => prev.filter(inv => inv.id !== id));
  };

  // LinkedIn Comment Operations
  const addCommentTask = (task: Omit<LinkedInCommentTask, 'id'>): LinkedInCommentTask => {
    const newTask: LinkedInCommentTask = {
      ...task,
      id: `comm-${Date.now()}`,
      profileUrl: task.profileUrl || `https://linkedin.com/in/${task.leadName.toLowerCase().replace(/\s+/g, '-')}`,
      pipelineStatus: task.pipelineStatus || 'Pending',
    };
    setComments(prev => [newTask, ...prev]);
    return newTask;
  };

  const toggleCommentStatus = (id: string) => {
    setComments(prev =>
      prev.map(c => {
        if (c.id === id) {
          const nextStatus = c.status === 'Completed' ? 'Pending' : 'Completed';
          return {
            ...c,
            status: nextStatus,
            pipelineStatus: nextStatus === 'Completed' ? 'Commented' : 'Pending',
          };
        }
        return c;
      })
    );
  };

  const convertCommentToLead = (commentId: string, leadData?: Partial<Lead>) => {
    const targetComment = comments.find(c => c.id === commentId);
    if (!targetComment) return;

    // Create lead
    addLead({
      name: targetComment.leadName,
      company: targetComment.company || `${targetComment.leadName}'s Org`,
      linkedInUrl: targetComment.profileUrl,
      channel: 'LinkedIn',
      temperature: leadData?.temperature || 'Warm',
      status: leadData?.status || 'Qualified',
      estimatedValue: leadData?.estimatedValue || 3500,
      followUpDate: new Date().toISOString().split('T')[0],
      notes: targetComment.notes ? `Converted from comment engagement: ${targetComment.notes}` : 'Converted from LinkedIn comment.',
    });

    // Update comment pipeline status
    setComments(prev =>
      prev.map(c => (c.id === commentId ? { ...c, pipelineStatus: 'Converted to Lead', status: 'Completed' } : c))
    );
  };

  const markCommentDead = (commentId: string) => {
    setComments(prev =>
      prev.map(c => (c.id === commentId ? { ...c, pipelineStatus: 'Dead', status: 'Completed' } : c))
    );
  };

  const deleteCommentTask = (id: string) => {
    setComments(prev => prev.filter(c => c.id !== id));
  };

  // Meeting Operations
  const addMeeting = (meetingData: Omit<MeetingTask, 'id'>): MeetingTask => {
    const newMeeting: MeetingTask = {
      ...meetingData,
      id: `meet-${Date.now()}`,
      meetingLink: meetingData.meetingLink || 'https://meet.google.com',
      status: meetingData.status || 'Booked',
      outcome: meetingData.outcome || 'Pending',
    };
    setMeetings(prev => [newMeeting, ...prev]);

    // Also add to tasks
    setTasks(prev => [
      {
        id: `task-${Date.now()}`,
        leadId: meetingData.leadId,
        leadName: meetingData.leadName,
        type: 'Meeting',
        dueDate: meetingData.date,
        completed: false,
        priority: 'High',
        details: `Scheduled Pitch / Demo Call (${meetingData.time})`,
      },
      ...prev,
    ]);

    return newMeeting;
  };

  const updateMeetingOutcome = (
    id: string,
    status: MeetingTask['status'],
    outcome?: MeetingTask['outcome']
  ) => {
    setMeetings(prev =>
      prev.map(m => (m.id === id ? { ...m, status, outcome: outcome || m.outcome } : m))
    );
  };

  const deleteMeeting = (id: string) => {
    setMeetings(prev => prev.filter(m => m.id !== id));
  };

  // Action Center Operations
  const toggleTaskComplete = (id: string) => {
    setTasks(prev =>
      prev.map(t => (t.id === id ? { ...t, completed: !t.completed } : t))
    );
  };

  const rescheduleTask = (id: string, newDate: string) => {
    setTasks(prev =>
      prev.map(t => (t.id === id ? { ...t, dueDate: newDate, completed: false } : t))
    );
  };

  return (
    <CRMContext.Provider
      value={{
        leads,
        clients,
        invoices,
        comments,
        meetings,
        tasks,
        theme,
        toggleTheme,
        addLead,
        updateLead,
        deleteLead,
        bulkUpdateStatus,
        addClient,
        updateClient,
        deleteClient,
        createClientFromWonLead,
        addInvoice,
        updateInvoiceStatus,
        deleteInvoice,
        addCommentTask,
        toggleCommentStatus,
        convertCommentToLead,
        markCommentDead,
        deleteCommentTask,
        addMeeting,
        updateMeetingOutcome,
        deleteMeeting,
        toggleTaskComplete,
        rescheduleTask,
      }}
    >
      {children}
    </CRMContext.Provider>
  );
};

export const useCRM = () => {
  const context = useContext(CRMContext);
  if (!context) throw new Error('useCRM must be used within a CRMProvider');
  return context;
};
