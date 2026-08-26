import { MeetingTask } from '../types/crm';

/**
 * Generates a standard formatted Google Meet link (e.g., https://meet.google.com/abc-defg-hij)
 * using random unique 3-4-3 lowercase alphanumeric character sets.
 */
export function generateGoogleMeetLink(): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz';
  const getRandomString = (length: number) => {
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  const part1 = getRandomString(3);
  const part2 = getRandomString(4);
  const part3 = getRandomString(3);

  return `https://meet.google.com/${part1}-${part2}-${part3}`;
}

/**
 * Formats a Date object or date + time string into UTC ISO string for Google Calendar & iCal
 * Format: YYYYMMDDTHHmmSSZ
 */
export function formatToGCalUTC(dateStr: string, timeStr: string, offsetMinutes: number = 0): string {
  try {
    // If dateStr is YYYY-MM-DD and timeStr is HH:MM
    const [year, month, day] = dateStr.split('-').map(Number);
    const [hours, minutes] = (timeStr || '15:00').split(':').map(Number);

    const localDate = new Date(year, month - 1, day, hours, minutes, 0);
    if (offsetMinutes) {
      localDate.setMinutes(localDate.getMinutes() + offsetMinutes);
    }

    const pad = (n: number) => n.toString().padStart(2, '0');
    const y = localDate.getUTCFullYear();
    const m = pad(localDate.getUTCMonth() + 1);
    const d = pad(localDate.getUTCDate());
    const h = pad(localDate.getUTCHours());
    const min = pad(localDate.getUTCMinutes());
    const s = pad(localDate.getUTCSeconds());

    return `${y}${m}${d}T${h}${min}${s}Z`;
  } catch (err) {
    const now = new Date();
    return now.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  }
}

/**
 * Builds direct Google Calendar event creation URL (action=TEMPLATE)
 */
export function createGoogleCalendarUrl(meeting: {
  title?: string;
  leadName?: string;
  clientName?: string;
  company?: string;
  date: string;
  time: string;
  durationMinutes?: number;
  meetUrl?: string;
  meetingLink?: string;
  description?: string;
}): string {
  const targetName = meeting.clientName || meeting.leadName || 'Client';
  const company = meeting.company ? ` (${meeting.company})` : '';
  const title = meeting.title || `Strategy & Demo Call: ${targetName}${company}`;
  const meetLink = meeting.meetUrl || meeting.meetingLink || 'https://meet.google.com';
  const duration = meeting.durationMinutes || 45;

  const startGCal = formatToGCalUTC(meeting.date, meeting.time, 0);
  const endGCal = formatToGCalUTC(meeting.date, meeting.time, duration);

  const fullDescription = [
    meeting.description || `DigiCore CRM Scheduled Presentation & Strategy Call.`,
    ``,
    `----------------------------------------`,
    `Client: ${targetName}`,
    `Company: ${meeting.company || 'N/A'}`,
    `Scheduled Date & Time: ${meeting.date} at ${meeting.time}`,
    `Google Meet URL: ${meetLink}`,
    `----------------------------------------`,
    `Managed via DigiCore CRM Automated Calendar Sync`,
  ].join('\n');

  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: title,
    dates: `${startGCal}/${endGCal}`,
    details: fullDescription,
    location: meetLink,
  });

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

/**
 * Generates standard RFC 5545 compliant iCalendar (.ics) string content
 */
export function generateICSContent(meeting: {
  id?: string;
  title?: string;
  leadName?: string;
  clientName?: string;
  company?: string;
  date: string;
  time: string;
  durationMinutes?: number;
  meetUrl?: string;
  meetingLink?: string;
  description?: string;
}): string {
  const targetName = meeting.clientName || meeting.leadName || 'Client';
  const company = meeting.company ? ` (${meeting.company})` : '';
  const title = meeting.title || `Strategy & Demo Call: ${targetName}${company}`;
  const meetLink = meeting.meetUrl || meeting.meetingLink || 'https://meet.google.com';
  const duration = meeting.durationMinutes || 45;
  const uid = meeting.id || `meet-${Date.now()}`;

  const dtStart = formatToGCalUTC(meeting.date, meeting.time, 0);
  const dtEnd = formatToGCalUTC(meeting.date, meeting.time, duration);
  const dtStamp = new Date().toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';

  const cleanDescription = (
    meeting.description ||
    `DigiCore CRM Scheduled Presentation & Strategy Call with ${targetName}. Join via Google Meet: ${meetLink}`
  )
    .replace(/\n/g, '\\n')
    .replace(/,/g, '\\,')
    .replace(/;/g, '\\;');

  const cleanSummary = title.replace(/\n/g, ' ').replace(/,/g, '\\,').replace(/;/g, '\\;');

  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//DigiCore CRM//Client Meeting Automation//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${uid}@digicorecrm.com`,
    `DTSTAMP:${dtStamp}`,
    `DTSTART:${dtStart}`,
    `DTEND:${dtEnd}`,
    `SUMMARY:${cleanSummary}`,
    `DESCRIPTION:${cleanDescription}\\n\\nGoogle Meet Link: ${meetLink}`,
    `LOCATION:${meetLink}`,
    'STATUS:CONFIRMED',
    'BEGIN:VALARM',
    'TRIGGER:-PT15M',
    'ACTION:DISPLAY',
    'DESCRIPTION:Reminder: Upcoming DigiCore Client Meeting',
    'END:VALARM',
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n');
}

/**
 * Initiates direct browser download of standard .ics calendar file
 */
export function downloadICSFile(meeting: {
  id?: string;
  title?: string;
  leadName?: string;
  clientName?: string;
  company?: string;
  date: string;
  time: string;
  durationMinutes?: number;
  meetUrl?: string;
  meetingLink?: string;
  description?: string;
}): void {
  const icsContent = generateICSContent(meeting);
  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  const safeName = (meeting.company || meeting.leadName || 'Meeting').replace(/[^a-zA-Z0-9_-]/g, '_');
  link.setAttribute('download', `${safeName}_GoogleMeet_${meeting.date}.ics`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
