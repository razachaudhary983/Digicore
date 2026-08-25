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
  
  // Lead Operations (Always originated via Channels or Quick-Add)
  addLead: (lead: Omit<Lead, 'id' | 'createdAt'>) => Lead;
  updateLead: (id: string, updates: Partial<Lead>) => void;
  deleteLead: (id: string) => void;
  bulkUpdateStatus: (ids: string[], newStatus: LeadStatus) => void;
  
  // Client & Finance Operations
  createClientFromWonLead: (lead: Lead, serviceCategory: string, monthlyRetainer: number) => ClientProfile;
  addInvoice: (invoice: Omit<Invoice, 'id' | 'dueDate' | 'invoiceNumber'>) => Invoice;
  updateInvoiceStatus: (id: string, status: PaymentStatus) => void;
  deleteInvoice: (id: string) => void;
  
  // Task & Action Center Operations
  toggleTaskComplete: (id: string) => void;
  rescheduleTask: (id: string, newDate: string) => void;
  addCommentTask: (task: Omit<LinkedInCommentTask, 'id'>) => void;
  toggleCommentStatus: (id: string) => void;
  updateMeetingOutcome: (id: string, status: MeetingTask['status'], outcome?: MeetingTask['outcome']) => void;
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
    postUrl: 'https://linkedin.com/posts/sarahjenkins-apex_ai-healthcare-post',
    dueDate: new Date().toISOString().split('T')[0],
    status: 'Pending',
    notes: 'Drop insightful comment regarding LLM compliance.',
  },
  {
    id: 'comm-2',
    leadName: 'Elena Rostova',
    postUrl: 'https://linkedin.com/posts/elena-nordic-growth-post',
    dueDate: new Date().toISOString().split('T')[0],
    status: 'Completed',
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
    meetingLink: 'https://meet.google.com/abc-defg-hij',
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
    return saved ? JSON.parse(saved) : initialComments;
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

  // Lead CRUD
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

    return newLead;
  };

  const updateLead = (id: string, updates: Partial<Lead>) => {
    setLeads(prev => prev.map(l => (l.id === id ? { ...l, ...updates } : l)));
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

  // Clients & Finance
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

    // Auto generate 1st month invoice
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

  const addInvoice = (inv: Omit<Invoice, 'id' | 'dueDate' | 'invoiceNumber'>): Invoice => {
    const sent = new Date(inv.sentDate);
    const due = new Date(sent);
    due.setDate(due.getDate() + 7);

    const newInv: Invoice = {
      ...inv,
      id: `inv-${Date.now()}`,
      dueDate: due.toISOString().split('T')[0],
      invoiceNumber: `INV-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`,
    };
    setInvoices(prev => [newInv, ...prev]);
    return newInv;
  };

  const updateInvoiceStatus = (id: string, status: PaymentStatus) => {
    setInvoices(prev => prev.map(inv => (inv.id === id ? { ...inv, status } : inv)));
  };

  const deleteInvoice = (id: string) => {
    setInvoices(prev => prev.filter(inv => inv.id !== id));
  };

  // Action Center
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

  const addCommentTask = (task: Omit<LinkedInCommentTask, 'id'>) => {
    setComments(prev => [{ ...task, id: `comm-${Date.now()}` }, ...prev]);
  };

  const toggleCommentStatus = (id: string) => {
    setComments(prev =>
      prev.map(c =>
        c.id === id ? { ...c, status: c.status === 'Completed' ? 'Pending' : 'Completed' } : c
      )
    );
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
        createClientFromWonLead,
        addInvoice,
        updateInvoiceStatus,
        deleteInvoice,
        toggleTaskComplete,
        rescheduleTask,
        addCommentTask,
        toggleCommentStatus,
        updateMeetingOutcome,
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
