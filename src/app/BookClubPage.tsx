import type { Metadata } from 'next';
import CoffeeTable from './CoffeeTable';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { db } from '@/lib/db';
import { sseEvents } from '@/lib/db/schema';

const siteTitle = 'Book Index';
const siteDescription = 'Book Index';

export const metadata: Metadata = {
  title: siteTitle,
  description: siteDescription,
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: siteTitle,
    description: siteDescription,
    siteName: siteTitle,
    url: '/',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: siteTitle,
    description: siteDescription,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      noarchive: true,
      'max-snippet': 160,
    },
  },
};


type BorrowRequestPayload = {
  type: 'borrow_request';
  bookTitle: string;
  name: string;
  address: string;
  phone: string;
  submittedAt: string;
};

function formatBorrowRequestMessage(payload: BorrowRequestPayload) {
  return [
    'New Book Index borrow request',
    `Book: ${payload.bookTitle}`,
    `Name: ${payload.name}`,
    `Phone: ${payload.phone}`,
    `Address: ${payload.address}`,
  ].join('\n');
}

async function notifyBorrowRequestWebhook(payload: BorrowRequestPayload) {
  const webhookUrl = process.env.BOOK_CLUB_BORROW_WEBHOOK_URL;
  if (!webhookUrl) return;

  try {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (process.env.BOOK_CLUB_BORROW_WEBHOOK_SECRET) {
      headers.Authorization = `Bearer ${process.env.BOOK_CLUB_BORROW_WEBHOOK_SECRET}`;
    }

    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
      cache: 'no-store',
    });

    if (!response.ok) {
      console.error('Borrow request webhook failed.');
    }
  } catch {
    console.error('Borrow request webhook failed.');
  }
}

async function notifyBorrowRequestTelegram(payload: BorrowRequestPayload) {
  const botToken = process.env.BOOK_CLUB_TELEGRAM_BOT_TOKEN;
  const chatId = process.env.BOOK_CLUB_TELEGRAM_CHAT_ID;
  if (!botToken || !chatId) return;

  try {
    const response = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: formatBorrowRequestMessage(payload),
        disable_web_page_preview: true,
      }),
      cache: 'no-store',
    });

    if (!response.ok) {
      console.error('Borrow request Telegram notification failed.');
    }
  } catch {
    console.error('Borrow request Telegram notification failed.');
  }
}

async function notifyBorrowRequest(payload: BorrowRequestPayload) {
  await Promise.all([
    notifyBorrowRequestWebhook(payload),
    notifyBorrowRequestTelegram(payload),
  ]);
}

async function submitBorrowRequest(formData: FormData) {
  'use server';

  const bookTitle = String(formData.get('bookTitle') ?? '').trim();
  const name = String(formData.get('name') ?? '').trim();
  const address = String(formData.get('address') ?? '').trim();
  const phone = String(formData.get('phone') ?? '').trim();

  if (!bookTitle || !name || !address || !phone) {
    redirect(`/?borrow=${encodeURIComponent(bookTitle)}&error=missing#borrow-card`);
  }

  const payload: BorrowRequestPayload = {
    type: 'borrow_request',
    bookTitle,
    name,
    address,
    phone,
    submittedAt: new Date().toISOString(),
  };

  await db.insert(sseEvents).values({
    type: 'borrow_request',
    payload,
  });

  await notifyBorrowRequest(payload);

  redirect('/?borrow=submitted#borrow-card');
}

const currentReads = [
  ['Memoir', 'I Saw Ramallah', 'Mourid Barghouti', 'Current read'],
];

const lentBooks = [
  ['Novel', 'The Vegetarian', 'Han Kang', 'Lent to Shyafika S.'],
  ['Essays', 'In the Garden: Essays on Nature and Growing', 'Daunt Books, ed.', 'Lent to Irdina N.'],
  ['Book', 'Common Treasures Vol 2. Housing, Planning and Construction', 'Amica Dall, Giles Smith, James Binning & Sara Pereira', 'Lent to Adam R.'],
  ['Book', 'Soups, Salads, Sandwiches', 'Matty Matheson', 'Lent to Faris M.'],
];

const availableBooks = [
  ['Novel', 'The Curious Incident of the Dog in the Night-Time', 'Mark Haddon', 'Available'],
  ['Essay', 'The Book of Tea', 'Okakura Kakuzō', 'Available'],
  ['Essays', 'Reluctant Capital: Essays on Kuala Lumpur', 'Badrul Hisham Ismail', 'Available'],
  ['Magazine', 'POP Magazine: September Issue', 'POP Magazine', 'Available'],
  ['Book', 'Townscape Revisited: Unraveling the Character of the Historic Townscape in Malaysia', 'Shuhana Shamsuddin', 'Available'],
  ['Book', 'The Spirit of Cities', 'Daniel A. Bell & Avner de-Shalit', 'Available'],
  ['Book', 'Design in Conservative Times', 'Joannette van der Veer', 'Available'],
  ['Book', 'Art and Beauty in the Middle Ages', 'Umberto Eco', 'Available'],
  ['Book', 'You Glow in the Dark', 'Liliana Colanzi', 'Available'],
  ['Magazine', 'Penang Monthly: September Issue', 'Penang Institute', 'Available'],
  ['Magazine', 'Noia Magazine Issue 4: Absurd Rituals', 'Noia Magazine', 'Available'],
  ['Zine', 'Nyampah', 'Emte', 'Available'],
  ['Book', 'Cyberfeminism Index', 'Mindy Seu', 'Available'],
  ['Book', 'Ornament and Crime', 'Adolf Loos', 'Available'],
  ['Book', 'After Accountability: A Critical Genealogy of a Concept', 'Pinko', 'Available'],
  ['Zine', 'Dejavu', 'Leandro Quintero', 'Available'],
  ['Book', 'Valley of the Dolls', 'Jacqueline Susann', 'Available'],
  ['Book', 'Butter', 'Asako Yuzuki', 'Available'],
  ['Book', 'The Body Keeps the Score', 'Bessel van der Kolk', 'Available'],
  ['Manga', 'Blame!', 'Tsutomu Nihei', 'Available'],
];

const coverPaths = ['/book-covers/ramallah.jpg', '/book-covers/vegetarian.jpg', '/book-covers/garden.jpg', '/book-covers/treasures.jpg', '/book-covers/soups.jpg', '/book-covers/curious.jpg', '/book-covers/tea.jpg', '/book-covers/reluctant.png', null, '/book-covers/townscape.jpg', '/book-covers/cities.jpg', '/book-covers/design.jpg', '/book-covers/eco.jpg', '/book-covers/glow.jpg', null, '/book-covers/noia.jpg', '/book-covers/nyampah.jpg', '/book-covers/cyber.jpg', '/book-covers/ornament.jpg', '/book-covers/accountability.jpg', null, '/book-covers/valley.jpg', '/book-covers/butter.jpg', '/book-covers/body.jpg', '/book-covers/blame.jpg'];

type BookClubPageProps = {
  searchParams?: Promise<{ about?: string; borrow?: string; lent?: string; current?: string; playlist?: string; error?: string }>;
};

export default async function BookClubPage({ searchParams }: BookClubPageProps) {
  const params = searchParams ? await Promise.resolve(searchParams) : {};
  const borrowTitle = params.borrow && params.borrow !== 'submitted' ? params.borrow : '';
  const lentTitle = params.lent ?? '';
  const currentTitle = params.current ?? '';
  const playlistOpen = params.playlist === 'fun-pop';
  const aboutOpen = params.about === 'book-index';
  const lentBook = lentBooks.find((book) => book[1] === lentTitle);
  const currentBook = currentReads.find((book) => book[1] === currentTitle);
  const lentName = lentBook?.[3].replace(/^Lent to\s+/, '') ?? '';
  const submitted = params.borrow === 'submitted';
  const missing = params.error === 'missing';

  return (
    <main className="bcSite">
      <header className="bcHero" id="about">
        <div>
          <h1>BOOK INDEX</h1>
          <p className="bcIntroText">
            Book Index is a small, growing archive of books, open to readers in Kuala Lumpur. The index grows over time, and everything marked available is welcome to be borrowed at no cost. Book Index occasionally invites guests to curate special selections.
          </p>
        </div>
      </header>

      <CoffeeTable books={[...currentReads, ...lentBooks, ...availableBooks].map((book, i) => ({ title: book[1], author: book[2], status: book[3], cover: coverPaths[i], href: `?${book[3] === 'Available' ? 'borrow' : book[3] === 'Current read' ? 'current' : 'lent'}=${encodeURIComponent(book[1])}#${book[3] === 'Available' ? 'borrow' : book[3] === 'Current read' ? 'current' : 'lent'}-card` }))} />

      {aboutOpen ? (
        <div className="bcBorrowModal" id="about-card" role="dialog" aria-modal="true" aria-labelledby="about-card-title">
          <Link className="bcBorrowBackdrop" href="/" aria-label="Close about card" />
          <div className="bcLibraryCard bcAboutCard">
            <Link className="bcCardClose" href="/" aria-label="Close about card">×</Link>
            <div className="bcBorrowForm">
              <div className="bcCardHeader bcAboutCardHeader">
                <p id="about-card-title">ABOUT</p>
              </div>
              <div className="bcAboutCardText">
                <p>Book Index is part archive, part library by Farah Ismail.</p>
                <p>Farah works across <a className="bcAboutHoverLink" href="https://instagram.com/aaakl.co" target="_blank" rel="noopener noreferrer">architecture</a> &amp; <a className="bcAboutHoverLink" href="https://instagram.com/aaakl.co" target="_blank" rel="noopener noreferrer">design</a>, <a className="bcAboutHoverLink" href="https://instagram.com/kontekstkl" target="_blank" rel="noopener noreferrer">urban life</a>, and the quiet details that make up how people live.</p>
                <p>Books sit somewhere in the middle of all of it.</p>
                <p className="bcAboutHosted">Hosted on <a href="http://farahismail.com/">farahismail.com</a>.</p>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {playlistOpen ? (
        <div className="bcBorrowModal" id="playlist-card" role="dialog" aria-modal="true" aria-labelledby="playlist-card-title">
          <Link className="bcBorrowBackdrop" href="/" aria-label="Close playlist" />
          <div className="bcLibraryCard">
            <Link className="bcCardClose" href="/" aria-label="Close playlist">×</Link>
            <div className="bcBorrowForm">
              <div className="bcCardHeader">
                <p id="playlist-card-title">Book Index: Fun Pop</p>
              </div>
              <div className="bcPlaylistEmbedRow">
                <iframe
                  className="bcSpotifyEmbed"
                  title="Fun Pop Spotify playlist"
                  src="https://open.spotify.com/embed/playlist/64pIJTT6N8h2lDk3uUg9g2?utm_source=generator&theme=0"
                  width="100%"
                  height="352"
                  allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                  loading="lazy"
                />
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {(borrowTitle || submitted || missing) ? (
        <div className="bcBorrowModal" id="borrow-card" role="dialog" aria-modal="true" aria-labelledby="borrow-card-title">
          <Link className="bcBorrowBackdrop" href="/" aria-label="Close borrow form" />
          <div className="bcLibraryCard">
            <Link className="bcCardClose" href="/" aria-label="Close borrow form">×</Link>
            <form className="bcBorrowForm" action={submitBorrowRequest}>
              <div className="bcCardHeader">
                <p id="borrow-card-title">Book Index Library Card</p>
              </div>
              {submitted ? <p className="bcFormMessage">Borrow request received.</p> : null}
              {missing ? <p className="bcFormMessage">Please fill in name, address, and phone.</p> : null}
              <label className="bcCardRow bcBookRow">
                <span>Title</span>
                <input name="bookTitle" defaultValue={borrowTitle} readOnly={Boolean(borrowTitle)} placeholder="Book title" required />
              </label>
              <label className="bcCardRow">
                <span>Name</span>
                <input name="name" placeholder="Name" required />
              </label>
              <label className="bcCardRow">
                <span>Address</span>
                <input name="address" placeholder="Address" required />
              </label>
              <div className="bcCardGrid">
                <label className="bcCardRow">
                  <span>Phone</span>
                  <input name="phone" placeholder="Phone" required />
                </label>
                <div className="bcDateDue" aria-hidden="true">
                  <span>Return Date</span>
                  <strong>45 Days</strong>
                </div>
              </div>
              <button type="submit">Confirm Details</button>
            </form>
          </div>
        </div>
      ) : null}

      {currentBook ? (
        <div className="bcBorrowModal" id="current-card" role="dialog" aria-modal="true" aria-labelledby="current-card-title">
          <Link className="bcBorrowBackdrop" href="/" aria-label="Close current read card" />
          <div className="bcLibraryCard">
            <Link className="bcCardClose" href="/" aria-label="Close current read card">×</Link>
            <div className="bcBorrowForm">
              <div className="bcCardHeader">
                <p id="current-card-title">Book Index: Currently Reading</p>
              </div>
              <div className="bcCardRow">
                <span>Title</span>
                <div className="bcCardValue">{currentBook[1]}</div>
              </div>
              <div className="bcCardRow">
                <span>Author</span>
                <div className="bcCardValue">{currentBook[2]}</div>
              </div>
              <div className="bcCardRow bcNoteRow">
                <span>Note</span>
                <div className="bcCardValue">Mourid Barghouti&apos;s impeccable writing, heart and rage unravels the emotions of exile and where grief goes when it has no vessel to take place.</div>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {lentBook ? (
        <div className="bcBorrowModal" id="lent-card" role="dialog" aria-modal="true" aria-labelledby="lent-card-title">
          <Link className="bcBorrowBackdrop" href="/" aria-label="Close lent card" />
          <div className="bcLibraryCard">
            <Link className="bcCardClose" href="/" aria-label="Close lent card">×</Link>
            <div className="bcBorrowForm">
              <div className="bcCardHeader">
                <p id="lent-card-title">Book Index Library Card</p>
              </div>
              <div className="bcCardRow">
                <span>Title</span>
                <div className="bcCardValue">{lentBook[1]}</div>
              </div>
              <div className="bcCardRow">
                <span>Lent to</span>
                <div className="bcCardValue">{lentName}</div>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      <style>{`
        .bcButterflies { position: fixed; inset: 0; z-index: 1; pointer-events: none; overflow: hidden; }
        .bcButterfly { position: absolute; width: 34px; height: auto; opacity: 0.7; transform-origin: center; animation: bcFlutter 18s linear infinite, bcPulse 1.1s ease-in-out infinite alternate; filter: drop-shadow(0 2px 4px rgba(146, 48, 112, 0.18)); }
        .bcButterflyOne { top: 14%; left: -4%; animation-duration: 22s, 1.1s; animation-delay: -4s, 0s; }
        .bcButterflyTwo { top: 34%; left: -6%; width: 26px; animation-duration: 26s, 1.3s; animation-delay: -13s, -0.4s; opacity: 0.54; }
        .bcButterflyThree { top: 56%; left: -5%; width: 42px; animation-duration: 30s, 1s; animation-delay: -8s, -0.2s; opacity: 0.62; }
        .bcButterflyFour { top: 72%; left: -8%; width: 30px; animation-duration: 24s, 1.4s; animation-delay: -17s, -0.8s; opacity: 0.5; }
        .bcButterflyFive { top: 22%; left: -10%; width: 22px; animation-duration: 34s, 1.2s; animation-delay: -23s, -0.5s; opacity: 0.48; }
        .bcCursorButterfly { position: fixed; left: 0; top: 0; z-index: 30; width: 26px; height: auto; pointer-events: none; opacity: 0; transform: translate3d(-100px, -100px, 0); transition: opacity 0.18s ease; filter: drop-shadow(0 2px 5px rgba(146, 48, 112, 0.24)); }
        .bcCursorButterfly.isVisible { opacity: 0.86; }
        @keyframes bcFlutter { 0% { transform: translate3d(-8vw, 0, 0) rotate(7deg); } 20% { transform: translate3d(24vw, -28px, 0) rotate(-9deg); } 42% { transform: translate3d(48vw, 34px, 0) rotate(11deg); } 68% { transform: translate3d(78vw, -18px, 0) rotate(-6deg); } 100% { transform: translate3d(112vw, 24px, 0) rotate(8deg); } }
        @keyframes bcPulse { from { scale: 0.88; } to { scale: 1.08; } }
        @media (prefers-reduced-motion: reduce) { .bcButterflies, .bcCursorButterfly { display: none; } .bcButterfly { animation: none; } }
        @media (pointer: coarse) { .bcCursorButterfly { display: none; } }
        .bcSite { --bc-paper: #f7f5ef; background: #f7f5ef; }
        .bcSite > header, .bcSite > section, .bcSite > footer, .bcHostingNote { position: relative; z-index: 2; }
        .bcTopTabs { position: fixed; top: 0; right: 18px; z-index: 10; display: flex; align-items: flex-end; gap: 0; padding-top: 5px; }
        .bcTopTabs::before { content: ''; position: fixed; top: 35px; left: 0; right: 0; border-top: 1.5px solid rgba(0, 0, 0, 0.62); pointer-events: none; }
        .bcTopTab { position: relative; display: flex; align-items: center; justify-content: center; box-sizing: border-box; width: 82px; height: 30px; padding: 8px 10px 6px; border: 1.5px solid rgba(0, 0, 0, 0.62); border-bottom: 0; border-radius: 16px 16px 0 0; background: var(--bc-paper); color: #000000; font: 700 8pt Arial, Helvetica, sans-serif; letter-spacing: 0.04em; text-transform: uppercase; box-shadow: none; }
        .bcTopTab + .bcTopTab { margin-left: -1.5px; }
        .bcTopTab:first-child { transform: rotate(-0.4deg); }
        .bcTopTab:nth-child(2) { width: 104px; transform: rotate(0.4deg); }
        .bcTopTab:hover, .bcTopTab:focus-visible { background: rgba(255, 255, 255, 0.18); outline: 0; }
        .bcHero h1 { font-family: Arial, Helvetica, sans-serif; letter-spacing: -0.05em; }
        .bcSectionHead h2 { font-family: Arial, Helvetica, sans-serif; color: #000000; }
        .bcListItem { position: relative; }
        .bcListItemLink { position: absolute; inset: 0; z-index: 1; }
        .bcScreenReaderText { position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip: rect(0, 0, 0, 0); white-space: nowrap; border: 0; }
        .bcListItemClickable { cursor: pointer; }
        .bcListItemClickable > :not(.bcListItemLink) { position: relative; z-index: 2; pointer-events: none; }
        .bcTitle { transition: color 0.16s ease; }
        .bcListItemClickable:hover .bcTitle,
        .bcListItemClickable:focus-within .bcTitle,
        .bcListItemClickable:active .bcTitle { color: #fff44f; }
        .bcListItemLink:focus-visible { outline: 1px solid #fff44f; outline-offset: -4px; }
        #current,
        #current * { color: #000000; font-weight: 400; }
        #current .bcSectionHead h2 { font-weight: 700; }
        #current .bcSectionHead h2,
        #current .bcTitle { transition: color 0.16s ease; }
        #current .bcSectionHead:hover h2,
        #current .bcListItemClickable:hover .bcTitle,
        #current .bcListItemClickable:focus-within .bcTitle,
        #current .bcListItemClickable:active .bcTitle { color: #b00068; }
        #current .bcListItemLink:focus-visible { outline-color: #b00068; }
        .bcBorrowModal { position: fixed; inset: 0; z-index: 20; display: grid; place-items: center; padding: 18px; }
        .bcBorrowBackdrop { position: absolute; inset: 0; background: rgba(40, 34, 28, 0.28); backdrop-filter: blur(3px); }
        .bcPlaylistEmbedRow { padding: 16px; }
        .bcSpotifyEmbed { display: block; width: 100%; border: 0; border-radius: 0; background: #111; }
        .bcAboutCard { width: min(520px, 100%); }
        .bcAboutCard .bcBorrowForm { background: var(--bc-paper); background-image: none; font-family: Arial, Helvetica, sans-serif; color: #9d1b1e; }
        .bcAboutCard .bcBorrowForm, .bcAboutCard .bcBorrowForm * { font-family: Arial, Helvetica, sans-serif; }
        .bcAboutCard .bcCardClose { color: #9d1b1e; font-family: Arial, Helvetica, sans-serif; }
        .bcAboutCardHeader { background: var(--bc-paper); }
        .bcAboutCardHeader p { color: #9d1b1e; font: 700 11pt Arial, Helvetica, sans-serif; letter-spacing: 0.06em; }
        .bcAboutCardText { display: grid; gap: 4px; min-height: 290px; padding: 18px 20px 20px; font: 11pt/1.15 Arial, Helvetica, sans-serif; letter-spacing: 0.01em; }
        .bcAboutCardText p { margin: 0; }
        .bcAboutHosted { align-self: end; margin-top: 24px; }
        .bcAboutCardText a { color: inherit; text-decoration: underline; text-underline-offset: 2px; transition: color 0.16s ease; }
        .bcAboutCardText .bcAboutHoverLink:hover,
        .bcAboutCardText .bcAboutHoverLink:focus-visible { color: #fff44f; outline: 0; }
        .bcLibraryCard { position: relative; width: min(620px, 100%); color: #1b1712; filter: drop-shadow(0 20px 45px rgba(0, 0, 0, 0.22)); }
        .bcCardClose { position: absolute; top: 10px; right: 14px; z-index: 2; color: #1b1712; font: 10pt Arial, Helvetica, sans-serif; line-height: 1; text-decoration: none; }
        .bcBorrowForm { position: relative; display: grid; gap: 0; padding: 0; border: 1px solid #16130f; background: #f3e7c4; background-image: radial-gradient(circle at 20% 12%, rgba(110, 82, 43, 0.13) 0 1px, transparent 1px), linear-gradient(rgba(255,255,255,0.2), rgba(133, 96, 45, 0.07)); background-size: 12px 12px, 100% 100%; font-family: 'Courier New', Courier, monospace; }
        .bcCardHeader { border-bottom: 1px solid #16130f; }
        .bcCardHeader p { margin: 0; padding: 14px 16px; font: 10pt 'Times New Roman', Times, serif; letter-spacing: 0.04em; }
        .bcCardRow { display: grid; grid-template-columns: 150px 1fr; min-height: 58px; border-bottom: 1px solid #16130f; }
        .bcCardRow span, .bcDateDue span { padding: 12px 16px; border-right: 1px solid #16130f; font: 10pt Arial, Helvetica, sans-serif; letter-spacing: 0.04em; }
        .bcCardRow input, .bcCardValue { width: 100%; min-width: 0; border: 0; border-radius: 0; background: transparent; padding: 12px 16px; font: 10pt 'Courier New', Courier, monospace; color: #1b1712; outline: none; }
        .bcNoteRow .bcCardValue { line-height: 1.35; }
        .bcCardRow input:focus { background: rgba(255, 255, 255, 0.25); }
        .bcCardRow input[readonly] { cursor: default; }
        .bcCardGrid { display: grid; grid-template-columns: 1fr 170px; border-bottom: 1px solid #16130f; }
        .bcCardGrid .bcCardRow { border-bottom: 0; }
        .bcDateDue { display: grid; grid-template-rows: auto 1fr; border-left: 1px solid #16130f; text-align: center; }
        .bcDateDue span { border-right: 0; border-bottom: 1px solid #16130f; }
        .bcDateDue strong { display: grid; place-items: center; min-height: 57px; font-size: 10pt; letter-spacing: 0.08em; }
        .bcBorrowForm button { justify-self: stretch; border: 0; background: transparent; padding: 16px; font: 10pt Arial, Helvetica, sans-serif; letter-spacing: 0.04em; cursor: pointer; }
        .bcBorrowForm button:hover { background: rgba(27, 23, 18, 0.08); }
        .bcFormMessage { margin: 0; padding: 12px 16px; border-bottom: 1px solid #16130f; font: 10pt Arial, Helvetica, sans-serif; }
        .bcHostingNote { padding: 18px 22px 0; font-family: Arial, Helvetica, sans-serif; font-size: 8pt; line-height: 1.35; text-transform: uppercase; letter-spacing: 0.08em; color: #9d1b1e; }
        .bcHostingNote a { color: inherit; text-decoration: underline; text-underline-offset: 2px; }
        @media (max-width: 640px) {
          .bcTopTabs { right: 10px; padding-top: 5px; }
          .bcTopTabs::before { top: 32px; }
          .bcTopTab { width: 72px; height: 27px; padding: 7px 8px 5px; border-radius: 14px 14px 0 0; font-size: 7.5pt; }
          .bcTopTab:nth-child(2) { width: 94px; }
          .bcCardRow, .bcCardGrid { grid-template-columns: 1fr; }
          .bcCardRow span, .bcDateDue span { border-right: 0; border-bottom: 1px solid #16130f; }
          .bcDateDue { display: none; }
        }

        .bcHero, .bcSection, .bcSectionHead, .bcListItem { border: 0; }
        .bcHero { padding: 70px 5vw 48px; min-height: auto; }
        .bcHero h1 { font-size: clamp(42px, 8vw, 96px); white-space: normal; }
        .bcIntroText { max-width: 650px; font-size: 16px; line-height: 1.5; }
        .bcSection { padding: 20px 5vw 45px; }
        .bcSectionHead { padding: 0 0 24px; }
        .bcSectionHead h2 { font-size: 13px; }
        .bcList { display: flex; align-items: flex-end; flex-wrap: wrap; gap: 7px; row-gap: 28px; }
        .bcListItem { position: relative; display: flex; flex-direction: column; align-items: center; justify-content: space-between; flex: 0 0 var(--spine-width, 65px); width: var(--spine-width, 65px); height: var(--spine-height, 300px); padding: 16px 8px; gap: 10px; background: var(--spine-color, #d9d6c9); color: var(--spine-ink, #171717); border-radius: 2px; box-shadow: inset 3px 0 5px #00000013, inset -2px 0 3px #00000012, 2px 3px 5px #00000012; transition: transform .2s ease; }
        .bcListItem:hover, .bcListItem:focus-within { background: var(--spine-color, #d9d6c9); transform: translateY(-10px); }
        .bcListItem .bcTitle { writing-mode: vertical-rl; text-orientation: mixed; font-size: 15px; line-height: 1.2; flex: 1; min-height: 0; overflow-wrap: normal; color: inherit; }
        .bcListItem .bcAuthor { writing-mode: vertical-rl; font-size: 9px; text-transform: none; letter-spacing: 0; color: inherit; max-height: 90px; }
        .bcListItem .bcType { display: none; }
        .bcListItem .bcStatus { font-size: 8px; text-transform: none; letter-spacing: 0; text-align: center; color: inherit; }
        #current .bcListItem, #current .bcListItem * { color: var(--spine-ink, #171717); }
        #playlist .bcListItem { --spine-color: #c8919e; --spine-height: 240px; --spine-width: 76px; }
        .bcFooter { padding: 20px 5vw 40px; border: 0; }
        @media (max-width: 600px) {
          .bcHero { padding-top: 38px; }
          .bcSection { padding-bottom: 30px; }
          .bcList { gap: 5px; row-gap: 22px; }
          .bcListItem { flex-basis: 52px; width: 52px; height: calc(var(--spine-height, 300px) * .8); padding: 12px 6px; }
          .bcListItem .bcTitle { font-size: 13px; }
        }

        .bcShelfStrip { display: flex; align-items: flex-end; gap: 36px; overflow-x: auto; overflow-y: hidden; padding: 16px 5vw 40px; max-width: 100%; -webkit-overflow-scrolling: touch; }
        .bcShelfStrip .bcSection { flex: 0 0 auto; padding: 0; }
        .bcShelfStrip .bcSectionHead { padding: 0 0 24px; }
        .bcShelfStrip .bcList { flex-wrap: nowrap; align-items: flex-end; height: 370px; }
        .bcShelfStrip .bcListItem { flex-shrink: 0; }
        .bcShelfStrip .bcSectionHead h2 { white-space: nowrap; }
        @media (max-width: 600px) { .bcShelfStrip { gap: 24px; } .bcShelfStrip .bcList { height: 300px; } }
      `}</style>


      <script
        dangerouslySetInnerHTML={{
          __html: `
            (() => {
              const butterfly = document.querySelector('.bcCursorButterfly');
              if (!butterfly || window.matchMedia('(pointer: coarse)').matches) return;
              let x = -100;
              let y = -100;
              let tx = -100;
              let ty = -100;
              const move = (event) => {
                tx = event.clientX + 10;
                ty = event.clientY + 10;
                butterfly.classList.add('isVisible');
              };
              const animate = () => {
                x += (tx - x) * 0.18;
                y += (ty - y) * 0.18;
                butterfly.style.transform = 'translate3d(' + x + 'px, ' + y + 'px, 0) rotate(' + Math.sin(Date.now() / 220) * 8 + 'deg)';
                requestAnimationFrame(animate);
              };
              window.addEventListener('pointermove', move, { passive: true });
              window.addEventListener('pointerleave', () => butterfly.classList.remove('isVisible'));
              animate();
            })();
          `,
        }}
      />

      <div className="bcHostingNote">
        <a href="http://farahismail.com/">FARAHISMAIL.COM</a> IS CURRENTLY HOSTING: BOOK INDEX
      </div>

      <footer className="bcFooter" id="contact">
        <div>Book Index</div>
        <div><a href="https://farahainismail.substack.com" target="_blank" rel="noopener noreferrer">SUBSTACK</a> · <a href="https://instagram.com/kingfrh" target="_blank" rel="noopener noreferrer">INSTAGRAM</a></div>
      </footer>
    </main>
  );
}
