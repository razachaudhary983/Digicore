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
import { generateGoogleMeetLink } from '../utils/calendarUtils';
import {
  collection,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  deleteField,
  onSnapshot,
} from 'firebase/firestore';

/**
 * Utility to strip undefined properties recursively so Firestore SDK never rejects writes.
 */
export const cleanForFirestore = <T extends Record<string, any>>(obj: T): Record<string, any> => {
  const result: Record<string, any> = {};
  for (const [key, value] of Object.entries(obj)) {
    if (value !== undefined) {
      if (value !== null && typeof value === 'object' && !Array.isArray(value) && !(value instanceof Date)) {
        result[key] = cleanForFirestore(value);
      } else {
        result[key] = value;
      }
    }
  }
  return result;
};

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
  updateInvoice: (id: string, updates: Partial<Invoice>) => Promise<void>;
  updateInvoiceStatus: (id: string, status: PaymentStatus) => Promise<void>;
  deleteInvoice: (id: string) => Promise<void>;
  
  // LinkedIn Commenting Operations
  addCommentTask: (task: Omit<LinkedInCommentTask, 'id'>) => Promise<LinkedInCommentTask>;
  updateCommentTask: (id: string, updates: Partial<LinkedInCommentTask>) => Promise<void>;
  toggleCommentStatus: (id: string) => Promise<void>;
  convertCommentToLead: (commentId: string, leadData?: Partial<Lead>) => Promise<void>;
  markCommentDead: (commentId: string) => Promise<void>;
  deleteCommentTask: (id: string) => Promise<void>;
  
  // Meeting Operations
  addMeeting: (meeting: Omit<MeetingTask, 'id'>) => Promise<MeetingTask>;
  updateMeeting: (id: string, updates: Partial<MeetingTask>) => Promise<void>;
  updateMeetingOutcome: (id: string, status: MeetingTask['status'], outcome?: MeetingTask['outcome']) => Promise<void>;
  deleteMeeting: (id: string) => Promise<void>;
  
  // Task Operations
  addTask: (task: Omit<ActivityTask, 'id'>) => Promise<ActivityTask>;
  updateTask: (id: string, updates: Partial<ActivityTask>) => Promise<void>;
  toggleTaskComplete: (id: string) => Promise<void>;
  rescheduleTask: (id: string, newDate: string) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;

  // Kanban sync
  syncKanbanCard: (lead: Lead) => Promise<void>;
}

const CRMContext = createContext<CRMContextType | undefined>(undefined);

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

  // Main Live Cloud State - Firestore is the single source of truth (Empty Firestore = Empty CRM)
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
      const data = cleanForFirestore({
        id: lead.id,
        leadId: lead.id,
        name: lead.name,
        company: lead.company,
        stage: lead.status,
        status: lead.status,
        value: lead.estimatedValue,
        temperature: lead.temperature,
        updatedAt: new Date().toISOString(),
      });
      await setDoc(doc(db, 'kanban', lead.id), data);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `kanban/${lead.id}`);
    }
  };

  // 1. FIRESTORE REAL-TIME LISTENER: LEADS & KANBAN
  useEffect(() => {
    const unsubLeads = onSnapshot(
      collection(db, 'leads'),
      (snapshot) => {
        const list: Lead[] = [];
        snapshot.forEach(docSnap => {
          list.push({ ...(docSnap.data() as Lead), id: docSnap.id });
        });
        setLeads(list);
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
        const list: Invoice[] = [];
        snapshot.forEach(docSnap => {
          list.push({ ...(docSnap.data() as Invoice), id: docSnap.id });
        });
        setInvoices(list);
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
        const list: MeetingTask[] = [];
        snapshot.forEach(docSnap => {
          const data = docSnap.data() as any;
          const targetName = data.clientName || data.leadName || 'Client';
          const meetUrl = data.meetUrl || data.meetingLink || generateGoogleMeetLink();
          const title = data.title || `Strategy & Demo Call: ${targetName} (${data.company || 'Client Org'})`;
          
          list.push({
            ...data,
            id: docSnap.id,
            title,
            leadName: targetName,
            clientName: targetName,
            company: data.company || 'Organization',
            date: data.date || new Date().toISOString().split('T')[0],
            time: data.time || '15:00',
            durationMinutes: data.durationMinutes || 45,
            meetUrl,
            meetingLink: meetUrl,
            status: data.status || 'Booked',
            outcome: data.outcome || 'Pending',
            description: data.description || `DigiCore CRM Client Presentation Call. Google Meet: ${meetUrl}`,
            createdByName: data.createdByName || 'Ali Raza (Admin)',
          });
        });
        setMeetings(list);
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
        const list: ClientProfile[] = [];
        snapshot.forEach(docSnap => {
          list.push({ ...(docSnap.data() as ClientProfile), id: docSnap.id });
        });
        setClients(list);
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
        const list: ActivityTask[] = [];
        snapshot.forEach(docSnap => {
          list.push({ ...(docSnap.data() as ActivityTask), id: docSnap.id });
        });
        setTasks(list);
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
      await setDoc(doc(db, 'leads', newLead.id), cleanForFirestore(newLead));
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
        await setDoc(doc(db, 'tasks', newTask.id), cleanForFirestore(newTask));
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
        await setDoc(doc(db, 'events', newMeet.id), cleanForFirestore(newMeet));
      } catch (err) {
        handleFirestoreError(err, OperationType.CREATE, `events/${newMeet.id}`);
      }
    }

    return newLead;
  };

  const updateLead = async (id: string, updates: Partial<Lead>): Promise<void> => {
    setLeads(prev => prev.map(l => (l.id === id ? { ...l, ...updates } : l)));

    try {
      await updateDoc(doc(db, 'leads', id), cleanForFirestore(updates));
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
            await setDoc(doc(db, 'events', newMeet.id), cleanForFirestore(newMeet));
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

      // Clean up linked tasks in Firestore
      const linkedTasks = tasks.filter(t => t.leadId === id);
      for (const t of linkedTasks) {
        deleteDoc(doc(db, 'tasks', t.id)).catch(() => {});
      }
      // Clean up linked meetings in Firestore
      const linkedMeetings = meetings.filter(m => m.leadId === id);
      for (const m of linkedMeetings) {
        deleteDoc(doc(db, 'events', m.id)).catch(() => {});
      }
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
      await setDoc(doc(db, 'clients', newClient.id), cleanForFirestore(newClient));
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, `clients/${newClient.id}`);
    }

    return newClient;
  };

  const updateClient = async (id: string, updates: Partial<ClientProfile>): Promise<void> => {
    setClients(prev => prev.map(c => (c.id === id ? { ...c, ...updates } : c)));

    try {
      await updateDoc(doc(db, 'clients', id), cleanForFirestore(updates));
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
      await setDoc(doc(db, 'clients', newClient.id), cleanForFirestore(newClient));
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
      await setDoc(doc(db, 'invoices', autoInvoice.id), cleanForFirestore(autoInvoice));
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
      await setDoc(doc(db, 'invoices', newInv.id), cleanForFirestore(newInv));
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, `invoices/${newInv.id}`);
    }

    return newInv;
  };

  const updateInvoice = async (id: string, updates: Partial<Invoice>): Promise<void> => {
    setInvoices(prev => prev.map(inv => (inv.id === id ? { ...inv, ...updates } : inv)));

    try {
      await updateDoc(doc(db, 'invoices', id), cleanForFirestore(updates));
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `invoices/${id}`);
    }
  };

  const updateInvoiceStatus = async (id: string, status: PaymentStatus): Promise<void> => {
    const todayStr = new Date().toISOString().split('T')[0];

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
      if (status === 'Paid') {
        await updateDoc(doc(db, 'invoices', id), {
          status: 'Paid',
          datePaid: todayStr,
        });
      } else {
        await updateDoc(doc(db, 'invoices', id), {
          status,
          datePaid: deleteField(),
        });
      }
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
      await setDoc(doc(db, 'comments', newTask.id), cleanForFirestore(newTask));
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, `comments/${newTask.id}`);
    }

    return newTask;
  };

  const updateCommentTask = async (id: string, updates: Partial<LinkedInCommentTask>): Promise<void> => {
    setComments(prev => prev.map(c => (c.id === id ? { ...c, ...updates } : c)));

    try {
      await updateDoc(doc(db, 'comments', id), cleanForFirestore(updates));
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `comments/${id}`);
    }
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
    const targetName = meetingData.clientName || meetingData.leadName || 'Client';
    const meetUrl = meetingData.meetUrl || meetingData.meetingLink || generateGoogleMeetLink();
    const title = meetingData.title || `Strategy & Demo Call: ${targetName} (${meetingData.company || 'Client Org'})`;
    const durationMinutes = meetingData.durationMinutes || 45;

    const dateStr = meetingData.date || new Date().toISOString().split('T')[0];
    const timeStr = meetingData.time || '15:00';
    
    let startTime = `${dateStr}T${timeStr}:00`;
    let endTime = `${dateStr}T${timeStr}:00`;
    try {
      const [year, month, day] = dateStr.split('-').map(Number);
      const [hours, minutes] = timeStr.split(':').map(Number);
      const startObj = new Date(year, month - 1, day, hours, minutes, 0);
      const endObj = new Date(startObj.getTime() + durationMinutes * 60 * 1000);
      startTime = startObj.toISOString();
      endTime = endObj.toISOString();
    } catch {
      // fallback
    }

    const newMeeting: MeetingTask = {
      ...meetingData,
      id: `meet-${Date.now()}`,
      title,
      leadName: targetName,
      clientName: targetName,
      company: meetingData.company || 'Client Org',
      date: dateStr,
      time: timeStr,
      durationMinutes,
      startTime: meetingData.startTime || startTime,
      endTime: meetingData.endTime || endTime,
      meetUrl,
      meetingLink: meetUrl,
      status: meetingData.status || 'Booked',
      outcome: meetingData.outcome || 'Pending',
      description: meetingData.description || `DigiCore CRM Presentation & Strategy Call with ${targetName}. Join via Google Meet: ${meetUrl}`,
      createdByName: meetingData.createdByName || 'Ali Raza (Admin)',
      createdAt: new Date().toISOString(),
    };
    
    setMeetings(prev => [newMeeting, ...prev]);

    try {
      await setDoc(doc(db, 'events', newMeeting.id), cleanForFirestore(newMeeting));
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, `events/${newMeeting.id}`);
    }

    // Also add to tasks
    const newTask: ActivityTask = {
      id: `task-${Date.now()}`,
      leadId: meetingData.leadId,
      leadName: targetName,
      type: 'Meeting',
      dueDate: dateStr,
      completed: false,
      priority: 'High',
      details: `${title} (${timeStr}) - ${meetUrl}`,
    };
    setTasks(prev => [newTask, ...prev]);

    try {
      await setDoc(doc(db, 'tasks', newTask.id), cleanForFirestore(newTask));
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, `tasks/${newTask.id}`);
    }

    return newMeeting;
  };

  const updateMeeting = async (id: string, updates: Partial<MeetingTask>): Promise<void> => {
    setMeetings(prev => prev.map(m => (m.id === id ? { ...m, ...updates } : m)));

    try {
      await updateDoc(doc(db, 'events', id), cleanForFirestore(updates));
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `events/${id}`);
    }
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
      const updates: any = { status };
      if (outcome) updates.outcome = outcome;
      await updateDoc(doc(db, 'events', id), cleanForFirestore(updates));
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
  const addTask = async (taskData: Omit<ActivityTask, 'id'>): Promise<ActivityTask> => {
    const newTask: ActivityTask = {
      ...taskData,
      id: `task-${Date.now()}`,
    };
    setTasks(prev => [newTask, ...prev]);

    try {
      await setDoc(doc(db, 'tasks', newTask.id), cleanForFirestore(newTask));
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, `tasks/${newTask.id}`);
    }

    return newTask;
  };

  const updateTask = async (id: string, updates: Partial<ActivityTask>): Promise<void> => {
    setTasks(prev => prev.map(t => (t.id === id ? { ...t, ...updates } : t)));

    try {
      await updateDoc(doc(db, 'tasks', id), cleanForFirestore(updates));
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `tasks/${id}`);
    }
  };

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

  const deleteTask = async (id: string): Promise<void> => {
    setTasks(prev => prev.filter(t => t.id !== id));

    try {
      await deleteDoc(doc(db, 'tasks', id));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `tasks/${id}`);
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
        updateInvoice,
        updateInvoiceStatus,
        deleteInvoice,
        addCommentTask,
        updateCommentTask,
        toggleCommentStatus,
        convertCommentToLead,
        markCommentDead,
        deleteCommentTask,
        addMeeting,
        updateMeeting,
        updateMeetingOutcome,
        deleteMeeting,
        addTask,
        updateTask,
        toggleTaskComplete,
        rescheduleTask,
        deleteTask,
        syncKanbanCard,
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
