/**
 * Fired once each time the VERA video output goes from idle to drawing, so the
 * right-hand panel can open the VERA monitor for a title that started drawing
 * without asking for it. Titles launched with `tab=vera` in their parameters
 * (the New Releases list) also ask for the tab directly; a disk picked from the
 * Internet Archive Software Library or a local file carries no parameters, so
 * the first frame is the only signal the UI gets.
 */
export const VERA_VIDEO_STARTED_EVENT = "apple2ts-vera-video-started"
