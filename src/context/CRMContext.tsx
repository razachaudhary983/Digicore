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
import { db, handleFirestoreError, OperationType } from '../firebase';
import {
  collection,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
} from 'firebase/firestore';

interface CRMContextType {
  leads: Lead[];
  clients: ClientProfile[];
  invoices: Invoice[];
  comments: LinkedInCommentTask[];
  meetings: MeetingTask[];
  tasks: ActivityTask[];
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  isSyncing: boolean;
  
  // Lead Operations
  addLead: (lead: Omit<Lead, 'id' | 'createdAt'>) => Promise<Lead>;
  updateLead: (id: string, updates: Partial<Lead>) => Promise<void>;
  deleteLead: (id: string) => Promise<void>;
  bulkUpdateStatus: (ids: string[], newStatus: LeadStatus) => Promise<void>;
  
  // Client Operations
  addClient: (client: Omit<ClientProfile, 'id'>) => Promise<ClientProfile>;
  updateClient: (id: string, updates: Partial<ClientProfile>) => Promise<void>;
  deleteClient: (id: string) => Promise<void>;
  createClientFromWonLead: (lead: Lead, serviceCategory: string, monthlyRetainer: number) => Promise<ClientProfile>;
  
  // Finance Operations
  addInvoice: (invoice: Omit<Invoice, 'id' | 'dueDate' | 'invoiceNumber'>) => Promise<Invoice>;
  updateInvoiceStatus: (id: string, status: PaymentStatus) => Promise<void>;
  deleteInvoice: (id: string) => Promise<void>;
  
  // LinkedIn Commenting Operations
  addCommentTask: (task: Omit<LinkedInCommentTask, 'id'>) => Promise<LinkedInCommentTask>;
  toggleCommentStatus: (id: string) => Promise<void>;
  convertCommentToLead: (commentId: string, leadData?: Partial<Lead>) => Promise<void>;
  markCommentDead: (commentId: string) => Promise<void>;
  deleteCommentTask: (id: string) => Promise<void>;
  
  // Meeting Operations
  addMeeting: (meeting: Omit<MeetingTask, 'id'>) => Promise<MeetingTask>;
  updateMeetingOutcome: (id: string, status: MeetingTask['status'], outcome?: MeetingTask['outcome']) => Promise<void>;
  deleteMeeting: (id: string) => Promise<void>;
  
  // Task Operations
  toggleTaskComplete: (id: string) => Promise<void>;
  rescheduleTask: (id: string, newDate: string) => Promise<void>;
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

  // Main Live Cloud State (no mock state fallback)
  const [leads, setLeads] = useState<Lead[]>([]);
  const [clients, setClients] = useState<ClientProfile[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [comments, setComments] = useState<LinkedInCommentTask[]>([]);
  const [meetings, setMeetings] = useState<MeetingTask[]>([]);
  const [tasks, setTasks] = useState<ActivityTask[]>([]);
  const [isSyncing, setIsSyncing] = useState<boolean>(true);

  // Helper to sync kanban card to Firestore
  const syncKanbanCard = async (lead: Lead) => {
    try {
      await setDoc(doc(db, 'kanban', lead.id), {
        id: lead.id,
        leadId: lead.id,
        name: lead.name,
        company: lead.company,
        stage: lead.status,
        value: lead.estimatedValue,
        temperature: lead.temperature,
        updatedAt: new Date().toISOString(),
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `kanban/${lead.id}`);
    }
  };

  // 1. FIRESTORE REAL-TIME LISTENER: LEADS & KANBAN
  useEffect(() => {
    const unsubLeads = onSnapshot(
      collection(db, 'leads'),
      (snapshot) => {
        if (!snapshot.empty) {
          const list: Lead[] = [];
          snapshot.forEach(docSnap => {
            list.push({ ...(docSnap.data() as Lead), id: docSnap.id });
          });
          setLeads(list);
        } else {
          // Seed initial baseline records into live Firestore database if collection is empty
          initialLeads.forEach(async (item) => {
            try {
              await setDoc(doc(db, 'leads', item.id), item);
              await syncKanbanCard(item);
            } catch (err) {
              handleFirestoreError(err, OperationType.CREATE, `leads/${item.id}`);
            }
          });
          setLeads(initialLeads);
        }
        setIsSyncing(false);
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, 'leads');
        setIsSyncing(false);
      }
    );

    return () => unsubLeads();
  }, []);

  // 2. FIRESTORE REAL-TIME LISTENER: INVOICES
  useEffect(() => {
    const unsubInvoices = onSnapshot(
      collection(db, 'invoices'),
      (snapshot) => {
        if (!snapshot.empty) {
          const list: Invoice[] = [];
          snapshot.forEach(docSnap => {
            list.push({ ...(docSnap.data() as Invoice), id: docSnap.id });
          });
          setInvoices(list);
        } else {
          initialInvoices.forEach(async (item) => {
            try {
              await setDoc(doc(db, 'invoices', item.id), item);
            } catch (err) {
              handleFirestoreError(err, OperationType.CREATE, `invoices/${item.id}`);
            }
          });
          setInvoices(initialInvoices);
        }
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, 'invoices');
      }
    );

    return () => unsubInvoices();
  }, []);

  // 3. FIRESTORE REAL-TIME LISTENER: EVENTS / CALENDAR MEETINGS
  useEffect(() => {
    const unsubEvents = onSnapshot(
      collection(db, 'events'),
      (snapshot) => {
        if (!snapshot.empty) {
          const list: MeetingTask[] = [];
          snapshot.forEach(docSnap => {
            list.push({ ...(docSnap.data() as MeetingTask), id: docSnap.id });
          });
          setMeetings(list);
        } else {
          initialMeetings.forEach(async (item) => {
            try {
              await setDoc(doc(db, 'events', item.id), item);
            } catch (err) {
              handleFirestoreError(err, OperationType.CREATE, `events/${item.id}`);
            }
          });
          setMeetings(initialMeetings);
        }
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, 'events');
      }
    );

    return () => unsubEvents();
  }, []);

  // 4. FIRESTORE REAL-TIME LISTENER: CLIENTS
  useEffect(() => {
    const unsubClients = onSnapshot(
      collection(db, 'clients'),
      (snapshot) => {
        if (!snapshot.empty) {
          const list: ClientProfile[] = [];
          snapshot.forEach(docSnap => {
            list.push({ ...(docSnap.data() as ClientProfile), id: docSnap.id });
          });
          setClients(list);
        } else {
          initialClients.forEach(async (item) => {
            try {
              await setDoc(doc(db, 'clients', item.id), item);
            } catch (err) {
              handleFirestoreError(err, OperationType.CREATE, `clients/${item.id}`);
            }
          });
          setClients(initialClients);
        }
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, 'clients');
      }
    );

    return () => unsubClients();
  }, []);

  // 5. FIRESTORE REAL-TIME LISTENER: LINKEDIN COMMENTS
  useEffect(() => {
    const unsubComments = onSnapshot(
      collection(db, 'comments'),
      (snapshot) => {
        if (!snapshot.empty) {
          const list: LinkedInCommentTask[] = [];
          snapshot.forEach(docSnap => {
            const data = docSnap.data() as any;
            list.push({
              ...data,
              id: docSnap.id,
              profileUrl: data.profileUrl || `https://linkedin.com/in/${data.leadName?.toLowerCase().replace(/\s+/g, '-')}`,
              pipelineStatus: data.pipelineStatus || (data.status === 'Completed' ? 'Commented' : 'Pending'),
            });
          });
          setComments(list);
        } else {
          initialComments.forEach(async (item) => {
            try {
              await setDoc(doc(db, 'comments', item.id), item);
            } catch (err) {
              handleFirestoreError(err, OperationType.CREATE, `comments/${item.id}`);
            }
          });
          setComments(initialComments);
        }
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, 'comments');
      }
    );

    return () => unsubComments();
  }, []);

  // 6. FIRESTORE REAL-TIME LISTENER: TASKS
  useEffect(() => {
    const unsubTasks = onSnapshot(
      collection(db, 'tasks'),
      (snapshot) => {
        if (!snapshot.empty) {
          const list: ActivityTask[] = [];
          snapshot.forEach(docSnap => {
            list.push({ ...(docSnap.data() as ActivityTask), id: docSnap.id });
          });
          setTasks(list);
        } else {
          initialTasks.forEach(async (item) => {
            try {
              await setDoc(doc(db, 'tasks', item.id), item);
            } catch (err) {
              handleFirestoreError(err, OperationType.CREATE, `tasks/${item.id}`);
            }
          });
          setTasks(initialTasks);
        }
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, 'tasks');
      }
    );

    return () => unsubTasks();
  }, []);

  // Lead CRUD & Auto Meeting Synchronization with Firestore
  const addLead = async (leadData: Omit<Lead, 'id' | 'createdAt'>): Promise<Lead> => {
    const newLead: Lead = {
      ...leadData,
      id: `lead-${Date.now()}`,
      createdAt: new Date().toISOString().split('T')[0],
    };

    setLeads(prev => [newLead, ...prev]);

    try {
      await setDoc(doc(db, 'leads', newLead.id), newLead);
      await syncKanbanCard(newLead);
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, `leads/${newLead.id}`);
    }

    // Create automatic task in Firestore if follow-up exists
    if (leadData.followUpDate) {
      const newTask: ActivityTask = {
        id: `task-${Date.now()}`,
        leadId: newLead.id,
        leadName: newLead.name,
        type: 'Follow-up',
        dueDate: newLead.followUpDate,
        completed: false,
        priority: leadData.temperature === 'Hot' ? 'High' : 'Medium',
        details: `Scheduled follow-up for ${newLead.company}`,
      };
      setTasks(prev => [newTask, ...prev]);
      try {
        await setDoc(doc(db, 'tasks', newTask.id), newTask);
      } catch (err) {
        handleFirestoreError(err, OperationType.CREATE, `tasks/${newTask.id}`);
      }
    }

    // Auto-sync meeting in Firestore if status is "Meeting Booked"
    if (leadData.status === 'Meeting Booked') {
      const todayStr = new Date().toISOString().split('T')[0];
      const newMeet: MeetingTask = {
        id: `meet-${Date.now()}`,
        leadId: newLead.id,
        leadName: newLead.name,
        company: newLead.company,
        date: leadData.followUpDate || todayStr,
        time: '14:00',
        status: 'Booked',
        outcome: 'Pending',
        meetingLink: 'https://meet.google.com',
      };
      setMeetings(prev => [newMeet, ...prev]);
      try {
        await setDoc(doc(db, 'events', newMeet.id), newMeet);
      } catch (err) {
        handleFirestoreError(err, OperationType.CREATE, `events/${newMeet.id}`);
      }
    }

    return newLead;
  };

  const updateLead = async (id: string, updates: Partial<Lead>): Promise<void> => {
    setLeads(prev => prev.map(l => (l.id === id ? { ...l, ...updates } : l)));

    try {
      await updateDoc(doc(db, 'leads', id), updates);
      const targetLead = leads.find(l => l.id === id);
      if (targetLead) {
        await syncKanbanCard({ ...targetLead, ...updates });
      }
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `leads/${id}`);
    }

    // If status changed to "Meeting Booked", auto-sync meeting if not already created
    if (updates.status === 'Meeting Booked') {
      const targetLead = leads.find(l => l.id === id);
      if (targetLead) {
        const exists = meetings.some(m => m.leadId === id && m.status === 'Booked');
        if (!exists) {
          const todayStr = new Date().toISOString().split('T')[0];
          const newMeet: MeetingTask = {
            id: `meet-${Date.now()}`,
            leadId: targetLead.id,
            leadName: targetLead.name,
            company: targetLead.company,
            date: targetLead.followUpDate || todayStr,
            time: '15:00',
            status: 'Booked',
            outcome: 'Pending',
            meetingLink: 'https://meet.google.com',
          };
          setMeetings(prev => [newMeet, ...prev]);
          try {
            await setDoc(doc(db, 'events', newMeet.id), newMeet);
          } catch (err) {
            handleFirestoreError(err, OperationType.CREATE, `events/${newMeet.id}`);
          }
        }
      }
    }
  };

  const deleteLead = async (id: string): Promise<void> => {
    setLeads(prev => prev.filter(l => l.id !== id));
    setTasks(prev => prev.filter(t => t.leadId !== id));
    setMeetings(prev => prev.filter(m => m.leadId !== id));

    try {
      await deleteDoc(doc(db, 'leads', id));
      await deleteDoc(doc(db, 'kanban', id));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `leads/${id}`);
    }
  };

  const bulkUpdateStatus = async (ids: string[], newStatus: LeadStatus): Promise<void> => {
    setLeads(prev =>
      prev.map(l => (ids.includes(l.id) ? { ...l, status: newStatus } : l))
    );

    for (const leadId of ids) {
      try {
        await updateDoc(doc(db, 'leads', leadId), { status: newStatus });
        const targetLead = leads.find(l => l.id === leadId);
        if (targetLead) {
          await syncKanbanCard({ ...targetLead, status: newStatus });
        }
      } catch (err) {
        handleFirestoreError(err, OperationType.UPDATE, `leads/${leadId}`);
      }
    }
  };

  // Client Operations
  const addClient = async (clientData: Omit<ClientProfile, 'id'>): Promise<ClientProfile> => {
    const newClient: ClientProfile = {
      ...clientData,
      id: `cli-${Date.now()}`,
    };
    setClients(prev => [newClient, ...prev]);

    try {
      await setDoc(doc(db, 'clients', newClient.id), newClient);
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, `clients/${newClient.id}`);
    }

    return newClient;
  };

  const updateClient = async (id: string, updates: Partial<ClientProfile>): Promise<void> => {
    setClients(prev => prev.map(c => (c.id === id ? { ...c, ...updates } : c)));

    try {
      await updateDoc(doc(db, 'clients', id), updates);
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `clients/${id}`);
    }
  };

  const deleteClient = async (id: string): Promise<void> => {
    setClients(prev => prev.filter(c => c.id !== id));

    try {
      await deleteDoc(doc(db, 'clients', id));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `clients/${id}`);
    }
  };

  const createClientFromWonLead = async (
    lead: Lead,
    serviceCategory: string,
    monthlyRetainer: number
  ): Promise<ClientProfile> => {
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

    try {
      await setDoc(doc(db, 'clients', newClient.id), newClient);
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, `clients/${newClient.id}`);
    }

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

    try {
      await setDoc(doc(db, 'invoices', autoInvoice.id), autoInvoice);
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, `invoices/${autoInvoice.id}`);
    }

    return newClient;
  };

  // Invoices & Finance
  const addInvoice = async (inv: Omit<Invoice, 'id' | 'dueDate' | 'invoiceNumber'>): Promise<Invoice> => {
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

    try {
      await setDoc(doc(db, 'invoices', newInv.id), newInv);
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, `invoices/${newInv.id}`);
    }

    return newInv;
  };

  const updateInvoiceStatus = async (id: string, status: PaymentStatus): Promise<void> => {
    const todayStr = new Date().toISOString().split('T')[0];
    const updates: Partial<Invoice> = {
      status,
      datePaid: status === 'Paid' ? todayStr : undefined,
    };

    setInvoices(prev =>
      prev.map(inv => {
        if (inv.id === id) {
          return {
            ...inv,
            status,
            datePaid: status === 'Paid' ? (inv.datePaid || todayStr) : undefined,
          };
        }
        return inv;
      })
    );

    try {
      await updateDoc(doc(db, 'invoices', id), updates);
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `invoices/${id}`);
    }
  };

  const deleteInvoice = async (id: string): Promise<void> => {
    setInvoices(prev => prev.filter(inv => inv.id !== id));

    try {
      await deleteDoc(doc(db, 'invoices', id));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `invoices/${id}`);
    }
  };

  // LinkedIn Comment Operations
  const addCommentTask = async (task: Omit<LinkedInCommentTask, 'id'>): Promise<LinkedInCommentTask> => {
    const newTask: LinkedInCommentTask = {
      ...task,
      id: `comm-${Date.now()}`,
      profileUrl: task.profileUrl || `https://linkedin.com/in/${task.leadName.toLowerCase().replace(/\s+/g, '-')}`,
      pipelineStatus: task.pipelineStatus || 'Pending',
    };
    setComments(prev => [newTask, ...prev]);

    try {
      await setDoc(doc(db, 'comments', newTask.id), newTask);
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, `comments/${newTask.id}`);
    }

    return newTask;
  };

  const toggleCommentStatus = async (id: string): Promise<void> => {
    let nextStatus: 'Pending' | 'Completed' = 'Completed';
    let nextPipeline = 'Commented';

    setComments(prev =>
      prev.map(c => {
        if (c.id === id) {
          nextStatus = c.status === 'Completed' ? 'Pending' : 'Completed';
          nextPipeline = nextStatus === 'Completed' ? 'Commented' : 'Pending';
          return {
            ...c,
            status: nextStatus,
            pipelineStatus: nextPipeline,
          };
        }
        return c;
      })
    );

    try {
      await updateDoc(doc(db, 'comments', id), {
        status: nextStatus,
        pipelineStatus: nextPipeline,
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `comments/${id}`);
    }
  };

  const convertCommentToLead = async (commentId: string, leadData?: Partial<Lead>): Promise<void> => {
    const targetComment = comments.find(c => c.id === commentId);
    if (!targetComment) return;

    // Create lead in Firestore
    await addLead({
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

    try {
      await updateDoc(doc(db, 'comments', commentId), {
        pipelineStatus: 'Converted to Lead',
        status: 'Completed',
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `comments/${commentId}`);
    }
  };

  const markCommentDead = async (commentId: string): Promise<void> => {
    setComments(prev =>
      prev.map(c => (c.id === commentId ? { ...c, pipelineStatus: 'Dead', status: 'Completed' } : c))
    );

    try {
      await updateDoc(doc(db, 'comments', commentId), {
        pipelineStatus: 'Dead',
        status: 'Completed',
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `comments/${commentId}`);
    }
  };

  const deleteCommentTask = async (id: string): Promise<void> => {
    setComments(prev => prev.filter(c => c.id !== id));

    try {
      await deleteDoc(doc(db, 'comments', id));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `comments/${id}`);
    }
  };

  // Meeting Operations
  const addMeeting = async (meetingData: Omit<MeetingTask, 'id'>): Promise<MeetingTask> => {
    const newMeeting: MeetingTask = {
      ...meetingData,
      id: `meet-${Date.now()}`,
      meetingLink: meetingData.meetingLink || 'https://meet.google.com',
      status: meetingData.status || 'Booked',
      outcome: meetingData.outcome || 'Pending',
    };
    setMeetings(prev => [newMeeting, ...prev]);

    try {
      await setDoc(doc(db, 'events', newMeeting.id), newMeeting);
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, `events/${newMeeting.id}`);
    }

    // Also add to tasks
    const newTask: ActivityTask = {
      id: `task-${Date.now()}`,
      leadId: meetingData.leadId,
      leadName: meetingData.leadName,
      type: 'Meeting',
      dueDate: meetingData.date,
      completed: false,
      priority: 'High',
      details: `Scheduled Pitch / Demo Call (${meetingData.time})`,
    };
    setTasks(prev => [newTask, ...prev]);

    try {
      await setDoc(doc(db, 'tasks', newTask.id), newTask);
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, `tasks/${newTask.id}`);
    }

    return newMeeting;
  };

  const updateMeetingOutcome = async (
    id: string,
    status: MeetingTask['status'],
    outcome?: MeetingTask['outcome']
  ): Promise<void> => {
    setMeetings(prev =>
      prev.map(m => (m.id === id ? { ...m, status, outcome: outcome || m.outcome } : m))
    );

    try {
      await updateDoc(doc(db, 'events', id), {
        status,
        ...(outcome ? { outcome } : {}),
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `events/${id}`);
    }
  };

  const deleteMeeting = async (id: string): Promise<void> => {
    setMeetings(prev => prev.filter(m => m.id !== id));

    try {
      await deleteDoc(doc(db, 'events', id));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `events/${id}`);
    }
  };

  // Action Center Operations
  const toggleTaskComplete = async (id: string): Promise<void> => {
    let nextVal = false;
    setTasks(prev =>
      prev.map(t => {
        if (t.id === id) {
          nextVal = !t.completed;
          return { ...t, completed: nextVal };
        }
        return t;
      })
    );

    try {
      await updateDoc(doc(db, 'tasks', id), { completed: nextVal });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `tasks/${id}`);
    }
  };

  const rescheduleTask = async (id: string, newDate: string): Promise<void> => {
    setTasks(prev =>
      prev.map(t => (t.id === id ? { ...t, dueDate: newDate, completed: false } : t))
    );

    try {
      await updateDoc(doc(db, 'tasks', id), { dueDate: newDate, completed: false });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `tasks/${id}`);
    }
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
        isSyncing,
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
