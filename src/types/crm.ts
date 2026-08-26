export type LeadTemperature = 'Hot' | 'Warm' | 'Cold';

export type LeadStatus =
  | 'New'
  | 'Qualified'
  | 'Meeting Booked'
  | 'Proposal Sent'
  | 'Won'
  | 'Lost';

export type ConnectionStatus =
  | 'Not Connected'
  | 'Connection Requested'
  | 'Connected'
  | 'Accepted'
  | 'Rejected';

export type LeadChannel =
  | 'LinkedIn'
  | 'Google Maps'
  | 'Meta Ads'
  | 'Cold Email'
  | 'Freelancer / Upwork'
  | 'Referral'
  | 'Custom';

export type ServicePillar =
  | 'AI Automation'
  | 'Social Media Growth'
  | 'Branding & Design'
  | 'Paid Acquisition'
  | 'Web Dev & SEO'
  | string;

export type PaymentMethod =
  | 'Meezan Bank'
  | 'Raqami Bank'
  | 'JazzCash'
  | 'EasyPaisa'
  | 'NayaPay'
  | 'SadaPay'
  | 'Payoneer'
  | 'Wire Transfer'
  | string;

export type PaymentStatus = 'Paid' | 'Pending' | 'Overdue';

export type ClientStatus = 'Active' | 'Dead' | 'Paused';

export interface EngagementLog {
  id: string;
  leadId: string;
  type: 'Profile View' | 'Follow' | 'Like' | 'Comment' | 'DM Sent' | 'Reply Received' | 'Follow-up';
  date: string;
  notes?: string;
}

export interface LinkedInCommentTask {
  id: string;
  leadName: string;
  profileUrl: string; // Direct Profile Link
  postUrl?: string;
  dueDate: string;
  status: 'Pending' | 'Completed' | 'Skipped';
  pipelineStatus?: 'Pending' | 'Commented' | 'Converted to Lead' | 'Dead';
  notes?: string;
  company?: string;
}

export interface MeetingTask {
  id: string;
  leadId?: string;
  clientId?: string;
  title?: string;
  leadName: string;
  clientName?: string;
  company: string;
  date: string;
  time: string;
  startTime?: string;
  endTime?: string;
  durationMinutes?: number;
  status: 'Booked' | 'Completed' | 'No Show';
  outcome?: 'Proposal Required' | 'Negotiation' | 'Won' | 'Lost' | 'Pending';
  meetingLink?: string;
  meetUrl?: string;
  description?: string;
  createdByName?: string;
  createdAt?: string;
}

export interface Lead {
  id: string;
  name: string;
  company: string;
  jobTitle?: string;
  email?: string;
  phone?: string;
  linkedInUrl?: string;
  channel: LeadChannel;
  temperature: LeadTemperature;
  status: LeadStatus;
  estimatedValue: number;
  followUpDate: string;
  createdAt: string;
  notes?: string;
  
  // LinkedIn Specific
  connectionStatus?: ConnectionStatus;
  lastEngagementDate?: string;
  
  // Google Maps / Local Specific
  websiteAvailable?: boolean;
  socialMediaAvailable?: boolean;
  location?: string;
  
  // Custom metadata
  customChannelName?: string;
  customFields?: Record<string, string>;
}

export interface ClientProfile {
  id: string;
  leadId?: string;
  name: string;
  company: string;
  email: string;
  phone: string;
  serviceCategory: ServicePillar;
  monthlyRetainer: number;
  startDate: string;
  status: ClientStatus;
}

export interface Invoice {
  id: string;
  clientId: string;
  clientName: string;
  service: string;
  amount: number;
  sentDate: string;
  dueDate: string; // Sent date + 7 days
  datePaid?: string; // Captured when status is marked Paid
  status: PaymentStatus;
  paymentMethod: PaymentMethod;
  invoiceNumber: string;
}

export interface ActivityTask {
  id: string;
  leadId?: string;
  leadName: string;
  type: 'Follow-up' | 'LinkedIn Comment' | 'DM / Message' | 'Meeting';
  dueDate: string;
  completed: boolean;
  priority: 'High' | 'Medium' | 'Low';
  details: string;
}
