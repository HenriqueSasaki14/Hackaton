// Ícones SVG inline para as tecnologias e UI
export const Icons = {
  HTML: () => (
    <svg viewBox="0 0 32 32" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg">
      <path d="M5 3l1.6 18L16 23l9.4-2L27 3z" fill="#E44D26"/>
      <path d="M16 21.5l7.6-2.1 1.3-14.4H16z" fill="#F16529"/>
      <path d="M16 13.5H11.8l-.3-3.5H16v-3.4H8.1l.1 1.4.9 10.1H16zm0 6l-.1.1-3.8-1-.2-2.7H8.4l.5 5.2 7.1 2z" fill="#EBEBEB"/>
      <path d="M16 13.5v3.4h3.9l-.4 4-3.5 1v3.5l7.1-2 .1-1 .8-9H16zm0-7v3.4h7.5l.1-.8.2-2.6H16z" fill="#fff"/>
    </svg>
  ),
  CSS: () => (
    <svg viewBox="0 0 32 32" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg">
      <path d="M5 3l1.6 18L16 23l9.4-2L27 3z" fill="#1572B6"/>
      <path d="M16 21.5l7.6-2.1 1.3-14.4H16z" fill="#33A9DC"/>
      <path d="M16 13.5H11.2l.2 2.5H16v-2.5zm0-7H8.2l.2 2.5H16V6.5z" fill="#EBEBEB"/>
      <path d="M16 18.4l-3.4-.9-.2-2.5H9.9l.4 4.7 5.7 1.6v-2.9zm0-11.9v2.5h7.3l-.2-2.5H16z" fill="#EBEBEB"/>
      <path d="M16 13.5v2.5h3.4l-.3 3.4-3.1.8v3l5.7-1.6.4-4.7.1-.9.2-2.5H16z" fill="#fff"/>
    </svg>
  ),
  JS: () => (
    <svg viewBox="0 0 32 32" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg">
      <rect width="32" height="32" rx="2" fill="#F7DF1E"/>
      <path d="M19.4 22.8c.5.8 1.2 1.4 2.4 1.4 1 0 1.6-.5 1.6-1.2 0-.8-.7-1.1-1.8-1.6l-.6-.3c-1.8-.8-3-1.8-3-3.9 0-1.9 1.5-3.4 3.8-3.4 1.6 0 2.8.6 3.6 2l-2 1.3c-.4-.8-1-1.1-1.6-1.1s-1 .4-1 .9c0 .6.4.9 1.4 1.3l.6.3c2.1.9 3.3 1.8 3.3 4 0 2.3-1.8 3.6-4.2 3.6-2.3 0-3.8-1.1-4.5-2.6l2-.8zm-8.7.2c.4.6.7 1.2 1.4 1.2.7 0 1.1-.3 1.1-1.3v-7.2h2.5V23c0 2.1-1.2 3.1-3 3.1-1.6 0-2.5-.8-3-1.8l2-.7z" fill="#111"/>
    </svg>
  ),
  Python: () => (
    <svg viewBox="0 0 32 32" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg">
      <path d="M16 3C9.4 3 10 5.7 10 5.7V8.5h6.2v.9H7.5S3 8.9 3 15.6c0 6.7 3.7 6.4 3.7 6.4h2.2v-3.1S8.7 15 12 15h6c0 0 3.5.1 3.5-3.4V7.1S22.1 3 16 3zm-3.4 2c.6 0 1.1.5 1.1 1.1s-.5 1.1-1.1 1.1-1.1-.5-1.1-1.1.5-1.1 1.1-1.1z" fill="#3771A1"/>
      <path d="M16 29c6.6 0 6-2.7 6-2.7v-2.8h-6.2v-.9h8.7S29 23.1 29 16.4c0-6.7-3.7-6.4-3.7-6.4h-2.2v3.1s.2 3.9-3.1 3.9h-6C14 17 10.5 16.9 10.5 20.4v4.5S10 29 16 29zm3.4-2c-.6 0-1.1-.5-1.1-1.1s.5-1.1 1.1-1.1 1.1.5 1.1 1.1-.5 1.1-1.1 1.1z" fill="#FFC331"/>
    </svg>
  ),
  Star: ({ filled = true }) => (
    <svg viewBox="0 0 20 20" width="1em" height="1em" fill={filled ? '#FFD43B' : 'none'} stroke="#FFD43B" strokeWidth="1.5" xmlns="http://www.w3.org/2000/svg">
      <path d="M10 1.5l2.4 4.9 5.4.8-3.9 3.8.9 5.4L10 13.8l-4.8 2.5.9-5.4-3.9-3.8 5.4-.8L10 1.5z" strokeLinejoin="round"/>
    </svg>
  ),
  Fire: () => <span style={{ fontSize: '1em' }}>🔥</span>,
  Bolt: () => <span style={{ fontSize: '1em' }}>⚡</span>,
  Trophy: () => <span style={{ fontSize: '1em' }}>🏆</span>,
  Medal: () => <span style={{ fontSize: '1em' }}>🥇</span>,
  Lock: () => (
    <svg viewBox="0 0 20 20" width="1em" height="1em" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <path fillRule="evenodd" d="M10 2a4 4 0 00-4 4v2H5a2 2 0 00-2 2v7a2 2 0 002 2h10a2 2 0 002-2v-7a2 2 0 00-2-2h-1V6a4 4 0 00-4-4zm0 2a2 2 0 012 2v2H8V6a2 2 0 012-2zm0 9a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" clipRule="evenodd"/>
    </svg>
  ),
  Check: () => (
    <svg viewBox="0 0 20 20" width="1em" height="1em" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <path fillRule="evenodd" d="M16.7 5.3a1 1 0 010 1.4l-8 8a1 1 0 01-1.4 0l-4-4a1 1 0 011.4-1.4L8 12.6l7.3-7.3a1 1 0 011.4 0z" clipRule="evenodd"/>
    </svg>
  ),
  Heart: ({ filled = true }) => (
    <svg viewBox="0 0 20 20" width="1em" height="1em" fill={filled ? '#FF4757' : 'none'} stroke="#FF4757" strokeWidth="1.5" xmlns="http://www.w3.org/2000/svg">
      <path d="M10 17.5S2 12 2 6.5a4 4 0 018-1 4 4 0 018 1C18 12 10 17.5 10 17.5z" strokeLinejoin="round"/>
    </svg>
  ),
  Code: () => (
    <svg viewBox="0 0 20 20" width="1em" height="1em" fill="none" stroke="currentColor" strokeWidth="2" xmlns="http://www.w3.org/2000/svg">
      <path d="M6 8L2 12l4 4M14 8l4 4-4 4M11 4l-2 12" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  Globe: () => (
    <svg viewBox="0 0 20 20" width="1em" height="1em" fill="none" stroke="currentColor" strokeWidth="1.5" xmlns="http://www.w3.org/2000/svg">
      <circle cx="10" cy="10" r="8"/>
      <path d="M10 2a14 14 0 010 16M2 10h16" strokeLinecap="round"/>
    </svg>
  ),
  Users: () => (
    <svg viewBox="0 0 20 20" width="1em" height="1em" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zm5 10a6 6 0 10-12 0h12z"/>
    </svg>
  ),
  XP: () => <span style={{ fontSize: '0.9em', fontWeight: 900 }}>XP</span>,
  Crown: () => <span style={{ fontSize: '1em' }}>👑</span>,
  ChevronRight: () => (
    <svg viewBox="0 0 20 20" width="1em" height="1em" fill="none" stroke="currentColor" strokeWidth="2.5" xmlns="http://www.w3.org/2000/svg">
      <path d="M7 4l6 6-6 6" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  ChevronLeft: () => (
    <svg viewBox="0 0 20 20" width="1em" height="1em" fill="none" stroke="currentColor" strokeWidth="2.5" xmlns="http://www.w3.org/2000/svg">
      <path d="M13 4l-6 6 6 6" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  Menu: () => (
    <svg viewBox="0 0 20 20" width="1em" height="1em" fill="none" stroke="currentColor" strokeWidth="2" xmlns="http://www.w3.org/2000/svg">
      <path d="M3 5h14M3 10h14M3 15h14" strokeLinecap="round"/>
    </svg>
  ),
  X: () => (
    <svg viewBox="0 0 20 20" width="1em" height="1em" fill="none" stroke="currentColor" strokeWidth="2.5" xmlns="http://www.w3.org/2000/svg">
      <path d="M4 4l12 12M16 4L4 16" strokeLinecap="round"/>
    </svg>
  ),
}

// Mapeia slug/title de trilha para ícone + cor
export function getTrailIcon(title = '') {
  const t = title.toLowerCase()
  if (t.includes('html')) return { Icon: Icons.HTML, color: '#E44D26', bg: '#FFF0EC' }
  if (t.includes('css'))  return { Icon: Icons.CSS,  color: '#1572B6', bg: '#EBF5FF' }
  if (t.includes('java') || t.includes('js')) return { Icon: Icons.JS, color: '#F7DF1E', bg: '#FFFCE0' }
  if (t.includes('python')) return { Icon: Icons.Python, color: '#3771A1', bg: '#EEF4FF' }
  return { Icon: Icons.Code, color: '#845EF7', bg: '#F0EBFF' }
}
