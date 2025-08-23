import ical from 'ical';
import { marked } from 'marked';
import purify from '../utils/purify';

export const prerender = false;

let url = 'https://www.meetup.com/web-and-wine/events/ical/';

/**
 * Fetches and parses the Meetup events from their iCal feed
 */
export async function GET() {
  let feed = await fetch(url, { method: 'GET' });
  let text = await feed.text();
  let parsed = ical.parseICS(text);
  let events = Object.values(parsed)
    .filter((event) => event.type === 'VEVENT' && event.start && event.summary)
    .map((event) => ({
      ...event,
      descriptionRaw: event.description,
      description: purify(marked(event.description)),
    }));

  return new Response(JSON.stringify(events), {
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'public, max-age=3600', // Cache for 1 hour
    },
  });
}
