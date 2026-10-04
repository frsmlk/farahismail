import type { Metadata } from 'next';
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

const bookCoverPhotos: Record<string, string> = {
  "The Vegetarian": "/book-covers/vegetarian-user-v2.jpg",
  "Soups, Salads, Sandwiches": "/book-covers/soups-user.png",
  "In the Garden: Essays on Nature and Growing": "/book-covers/in-garden-user.jpg",
  "Cyberfeminism Index": "/book-covers/cyberfeminism-user.png",
  "Valley of the Dolls": "/book-covers/valley-dolls-user.png",
  "The Body Keeps the Score": "/book-covers/body-score-user-v5.png",
  "Noia Magazine Issue 4: Absurd Rituals": "/book-covers/noia-user.png",
  "The Book of Tea": "/book-covers/book-tea-user.png",
  "Penang Monthly: September Issue": "/book-covers/penang-monthly-user.png",
  "Art and Beauty in the Middle Ages": "/book-covers/art-beauty-user.png",
  "The Spirit of Cities": "/book-covers/spirit-cities-user.png",
  "Blame!": "/book-covers/blame-user.png",
  "Reluctant Capital: Essays on Kuala Lumpur": "/book-covers/reluctant-capital-user.png",
  "You Glow in the Dark": "/book-covers/glow-user.png",
  "Common Treasures Vol 2. Housing, Planning and Construction": "/book-covers/common-treasures-user.png",
  "Townscape Revisited: Unraveling the Character of the Historic Townscape in Malaysia": "/book-covers/townscape-user.png",
  "Pop Magazine: September Issue": "/book-covers/pop-user.png",
  "Butter": "/book-covers/butter-user-v3.png",
  "Dejavu": "/book-covers/dejavu-user-v3.png",
  "After Accountability: A Critical Genealogy of a Concept": "/book-covers/after-accountability-user.png",
  "Nyampah": "/book-covers/nyampah-user.png",
  "Design in Conservative Times": "/book-covers/design-conservative-user.png",
  "I Saw Ramallah": "/book-covers/ramallah-user.png",
  "Ornament and Crime": "/book-covers/ornament-user.png",
};

function BookCover({ title }: { title: string }) {
  const src = bookCoverPhotos[title];
  return <div className="bcBookCoverSpace" aria-label="Book cover space">{src ? <img src={src} alt={`${title} book cover`} className="bcModalCover" /> : null}</div>;
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
  ['Magazine', 'Pop Magazine: September Issue', 'Pop Magazine', 'Available'],
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



function Row({ item, borrowable = false, currentReadable = false }: { item: string[]; borrowable?: boolean; currentReadable?: boolean }) {
  const [type, title, author, status] = item;
  const lent = status.startsWith('Lent to ');
  const modalHref = borrowable
    ? `?borrow=${encodeURIComponent(title)}`
    : currentReadable
      ? `?current=${encodeURIComponent(title)}`
      : lent
        ? `?lent=${encodeURIComponent(title)}`
        : '';

  return (
    <article data-book-title={title} className={modalHref ? 'bcListItem bcListItemClickable' : 'bcListItem'}>
      {modalHref ? (
        <Link scroll={false} className="bcListItemLink" href={modalHref} aria-label={`${borrowable ? 'Borrow' : currentReadable ? 'View current read card for' : 'View lent card for'} ${title}`}>
          <span className="bcScreenReaderText">{borrowable ? 'Borrow' : currentReadable ? 'View current read card for' : 'View lent card for'} {title}</span>
        </Link>
      ) : null}
      <div className="bcType">{type}</div>
      <div className="bcBookDetails"><div className="bcTitle">{title}</div><div className="bcAuthor">{author}</div></div>
      <div className="bcStatus">
        {status}
      </div>
    </article>
  );
}

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
  const borrowBook = availableBooks.find((book) => book[1] === borrowTitle);
  const lentName = lentBook?.[3].replace(/^Lent to\s+/, '') ?? '';
  const submitted = params.borrow === 'submitted';
  const missing = params.error === 'missing';

  return (
    <main className="bcSite">
      <header className="bcHero" id="about">
        <div>
          <h1>Book Index</h1>
          <p className="bcIntroText">
            Book Index is a shared bookshelf in Kuala Lumpur. The index grows over time, and everything marked available is welcome to be borrowed for 45-days at no cost. Please browse the following list, and click borrow to start reading.
          </p>
        </div>
      </header>

      <section className="bcSection" id="playlist">
        <div className="bcSectionHead"><h2>Playlist</h2></div>
        <div className="bcList">
          <article className="bcListItem bcListItemClickable">
            <Link scroll={false} className="bcListItemLink" href="?playlist=fun-pop" aria-label="Play Fun Pop playlist">
              <span className="bcScreenReaderText">Play Fun Pop playlist</span>
            </Link>
            <div className="bcType">Playlist</div>
            <div className="bcBookDetails"><div className="bcTitle">Fun Pop</div><div className="bcAuthor">Spotify</div></div>
            <div className="bcStatus">Playlist</div>
          </article>
        </div>
      </section>

      <section className="bcSection" id="current">
        <div className="bcSectionHead"><h2>Currently Reading</h2></div>
        <div className="bcList">
          {currentReads.map((book) => <Row key={book[1]} item={book} currentReadable />)}
        </div>
      </section>

      <section className="bcSection" id="lent">
        <div className="bcSectionHead"><h2>Lent Books</h2></div>
        <div className="bcList">
          {lentBooks.map((book) => <Row key={book[1]} item={book} />)}
        </div>
      </section>

      <section className="bcSection" id="available">
        <div className="bcSectionHead"><h2>Available Books</h2></div>
        <div className="bcList">
          {availableBooks.map((book) => <Row key={book[1]} item={book} borrowable />)}
        </div>
      </section>



      {aboutOpen ? (
        <div className="bcBorrowModal" id="about-card" role="dialog" aria-modal="true" aria-labelledby="about-card-title">
          <Link scroll={false} className="bcBorrowBackdrop" href="/" aria-label="Close about card" />
          <div className="bcLibraryCard bcAboutCard">
            <Link scroll={false} className="bcCardClose" href="/" aria-label="Close about card">×</Link>
            <div className="bcBorrowForm">
              <div className="bcCardHeader bcAboutCardHeader">
                <p id="about-card-title">Book Index</p>
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
          <Link scroll={false} className="bcBorrowBackdrop" href="/" aria-label="Close playlist" />
          <div className="bcLibraryCard">
            <Link scroll={false} className="bcCardClose" href="/" aria-label="Close playlist">×</Link>
            <div className="bcBorrowForm">
              <div className="bcCardHeader">
                <p id="playlist-card-title">Book Index</p>
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
          <Link scroll={false} className="bcBorrowBackdrop" href="/" aria-label="Close borrow form" />
          <div className="bcLibraryCard">
            <Link scroll={false} className="bcCardClose" href="/" aria-label="Close borrow form">×</Link>
            <form className="bcBorrowForm" action={submitBorrowRequest}>
              <div className="bcCardHeader">
                <p id="borrow-card-title">Book Index</p>
              </div>
              <div className="bcSplitCardBody"><div className="bcCardDetails">
              {submitted ? <p className="bcFormMessage" data-borrow-success="true">Borrow request received.</p> : null}
              {missing ? <p className="bcFormMessage">Please fill in name, address, and phone.</p> : null}
              <div className="bcCardRow bcBookRow bcIdentityRow">
                {borrowTitle ? <><input type="hidden" name="bookTitle" value={borrowTitle} /><div className="bcCardValue bcFullBookTitle">{borrowTitle}</div></> : <input aria-label="Book title" name="bookTitle" placeholder="Book title" required />}
                {borrowBook ? <div className="bcCardValue bcIdentityAuthor">{borrowBook[2]}</div> : null}
              </div>
              <label className="bcCardRow">
                <input aria-label="Name" name="name" placeholder="Name" required />
              </label>
              <label className="bcCardRow">
                <input aria-label="Address" name="address" placeholder="Address" required />
              </label>
              <div className="bcCardGrid">
                <label className="bcCardRow">
                  <input aria-label="Phone" name="phone" placeholder="Phone" required />
                </label>
                <div className="bcDateDue" aria-hidden="true">
                  <span>Return Date</span>
                  <strong>45 Days</strong>
                </div>
              </div>
              <button type="submit">Confirm Details</button>
            
              </div><BookCover title={borrowTitle} /></div>
</form>
          </div>
        </div>
      ) : null}

      {currentBook ? (
        <div className="bcBorrowModal" id="current-card" role="dialog" aria-modal="true" aria-labelledby="current-card-title">
          <Link scroll={false} className="bcBorrowBackdrop" href="/" aria-label="Close current read card" />
          <div className="bcLibraryCard">
            <Link scroll={false} className="bcCardClose" href="/" aria-label="Close current read card">×</Link>
            <div className="bcBorrowForm">
              <div className="bcCardHeader">
                <p id="current-card-title">Book Index</p>
              </div>
              <div className="bcSplitCardBody"><div className="bcCardDetails">
              <div className="bcCardRow bcIdentityRow">
                <div className="bcCardValue">{currentBook[1]}</div>
                <div className="bcCardValue bcIdentityAuthor">{currentBook[2]}</div>
              </div>
              <div className="bcCardRow bcNoteRow">
                <span>Note</span>
                <div className="bcCardValue">Mourid Barghouti&apos;s impeccable writing, heart and rage unravels the emotions of exile and where grief goes when it has no vessel to take place.</div>
              </div>

              </div><BookCover title={currentBook[1]} /></div>
            </div>
          </div>
        </div>
      ) : null}

      {lentBook ? (
        <div className="bcBorrowModal" id="lent-card" role="dialog" aria-modal="true" aria-labelledby="lent-card-title">
          <Link scroll={false} className="bcBorrowBackdrop" href="/" aria-label="Close lent card" />
          <div className="bcLibraryCard">
            <Link scroll={false} className="bcCardClose" href="/" aria-label="Close lent card">×</Link>
            <div className="bcBorrowForm">
              <div className="bcCardHeader">
                <p id="lent-card-title">Book Index</p>
              </div>
              <div className="bcSplitCardBody"><div className="bcCardDetails">
              <div className="bcCardRow bcIdentityRow">
                <div className="bcCardValue">{lentBook[1]}</div>
                <div className="bcCardValue bcIdentityAuthor">{lentBook[2]}</div>
              </div>
              <div className="bcCardRow">
                <span>Lent to</span>
                <div className="bcCardValue">{lentName}</div>
              </div>

              <button type="button" className="bcReturnBook">Return Book</button>
              </div><BookCover title={lentBook[1]} /></div>
            </div>
          </div>
        </div>
      ) : null}

      <style>{`
        @media (pointer: fine) { .bcSite, .bcSite * { cursor: url("data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2229%22%20height%3D%2229%22%20viewBox%3D%220%200%2024%2024%22%3E%3Cpath%20d%3D%22M2%202%20L2%2020%20L7%2015%20L11%2023%20L15%2021%20L11%2013%20L19%2013%20Z%22%20fill%3D%22%23c2188b%22%20stroke%3D%22%23000000%22%20stroke-width%3D%221.4%22%20stroke-linejoin%3D%22round%22%2F%3E%3C%2Fsvg%3E") 2 2, auto !important; } }
        .bcReturnBook { display: block; width: 100%; padding: 12px 8px; border: 0; border-top: 1px solid #16130f; background: transparent; color: #16130f; font: inherit; cursor: pointer; }
        .bcReturnBook:hover, .bcReturnBook:focus-visible { color: var(--bc-accent); }
        .bcReturnConfetti { position: fixed; inset: 0; pointer-events: none; z-index: 9999; overflow: hidden; }
        .bcReturnConfetti i { position: absolute; top: -20px; width: 8px; height: 13px; background: var(--bc-accent); animation: bcConfettiFall 2.8s ease-in forwards; }
        @keyframes bcConfettiFall { from { transform: translateY(-20px) rotate(0deg); } to { transform: translateY(110vh) rotate(720deg); } }
        @media (prefers-reduced-motion: reduce) { .bcReturnConfetti i { animation-duration: 0.3s; } }
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
        .bcSite { --bc-paper: #f7f5ef; --bc-accent: #c2188b; background: #f7f5ef; }
        .bcSite > header, .bcSite > section, .bcSite > footer, .bcHostingNote { position: relative; z-index: 2; }
        .bcTopTabs { position: fixed; top: 0; right: 18px; z-index: 10; display: flex; align-items: flex-end; gap: 0; padding-top: 5px; }
        .bcTopTabs::before { content: ''; position: fixed; top: 35px; left: 0; right: 0; border-top: 1.5px solid rgba(0, 0, 0, 0.62); pointer-events: none; }
        .bcTopTab { position: relative; display: flex; align-items: center; justify-content: center; box-sizing: border-box; width: 82px; height: 30px; padding: 8px 10px 6px; border: 1.5px solid rgba(0, 0, 0, 0.62); border-bottom: 0; border-radius: 16px 16px 0 0; background: var(--bc-paper); color: #000000; font: 700 8pt Arial, Helvetica, sans-serif; letter-spacing: 0.04em; text-transform: capitalize; box-shadow: none; }
        .bcTopTab + .bcTopTab { margin-left: -1.5px; }
        .bcTopTab:first-child { transform: rotate(-0.4deg); }
        .bcTopTab:nth-child(2) { width: 104px; transform: rotate(0.4deg); }
        .bcTopTab:hover, .bcTopTab:focus-visible { background: rgba(255, 255, 255, 0.18); outline: 0; }
        .bcHero h1 { font-family: Arial, Helvetica, sans-serif; letter-spacing: -0.05em; transform: translateX(-0.065em); }
        .bcSectionHead h2 { font-family: Arial, Helvetica, sans-serif; color: #000000; }
        .bcListItem { position: relative; }
        .bcListItemLink { position: absolute; inset: 0; z-index: 1; }
        .bcScreenReaderText { position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip: rect(0, 0, 0, 0); white-space: nowrap; border: 0; }
        .bcListItemClickable { cursor: pointer; }
        .bcListItemClickable > :not(.bcListItemLink) { position: relative; z-index: 2; pointer-events: none; }
        .bcTitle { transition: color 0.16s ease; }
        .bcListItemClickable:hover .bcTitle,
        .bcListItemClickable:focus-within .bcTitle,
        .bcListItemClickable:active .bcTitle { color: var(--bc-accent); }
        .bcListItemLink:focus-visible { outline: 1px solid #c2188b; outline-offset: -4px; }
        #current,
        #current * { color: #000000; font-weight: 400; }
        #current .bcSectionHead h2 { font-weight: 700; }
        #current .bcSectionHead h2,
        #current .bcTitle { transition: color 0.16s ease; }
        #current .bcSectionHead:hover h2,
        #current .bcListItemClickable:hover .bcTitle,
        #current .bcListItemClickable:focus-within .bcTitle,
        #current .bcListItemClickable:active .bcTitle { color: var(--bc-accent); }
        #current .bcListItemLink:focus-visible { outline-color: var(--bc-accent); }
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
        .bcAboutCardText .bcAboutHoverLink:focus-visible { color: var(--bc-accent); outline: 0; }
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
        .bcHostingNote { padding: 18px 5vw 0; font-family: Arial, Helvetica, sans-serif; font-size: 8pt; line-height: 1.35; text-transform: none; letter-spacing: 0; color: var(--bc-accent); }
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

        .bcLibraryCard { width: min(440px, 100%); }
        .bcLibraryCard .bcBorrowForm { background: var(--bc-paper); background-image: none; font-family: Arial, Helvetica, sans-serif; }
        .bcLibraryCard .bcBorrowForm * { font-family: Arial, Helvetica, sans-serif; font-size: 14.421px; letter-spacing: 0; }
        .bcLibraryCard .bcCardHeader p { font-weight: 700; font-size: 15.14205px; color: var(--bc-accent); padding: 12px 14px; padding-right: 36px; }
        .bcLibraryCard .bcCardRow { grid-template-columns: 100px minmax(0, 1fr); min-height: 42px; }
        .bcLibraryCard .bcCardRow span, .bcLibraryCard .bcCardRow input, .bcLibraryCard .bcCardValue { padding: 10px 12px; }
        .bcLibraryCard .bcCardGrid { grid-template-columns: minmax(0, 1fr) 100px; }
        .bcLibraryCard .bcDateDue strong { min-height: 42px; }
        .bcLibraryCard .bcBorrowForm button { padding: 12px; }
        .bcLibraryCard .bcCardClose { font-family: Arial, Helvetica, sans-serif; font-size: 15.96px; }
        @media (max-width: 640px) {
          .bcLibraryCard .bcCardRow, .bcLibraryCard .bcCardGrid { grid-template-columns: 1fr; }
        }

        .bcSectionHead:hover h2,
        .bcListItemClickable:hover .bcTitle,
        .bcListItemClickable:focus-within .bcTitle,
        .bcFooter a:hover, .bcFooter a:focus-visible,
        .bcHostingNote a:hover, .bcHostingNote a:focus-visible { color: var(--bc-accent); }

        .bcSite, .bcSite * { font-family: Helvetica, "Helvetica Neue", sans-serif !important; }
        .bcSite { line-height: 1.15; }
        .bcLibraryCard .bcBorrowForm * { line-height: 1.15; }
        .bcSectionHead h2 { line-height: 1.1; }
        .bcType, .bcAuthor, .bcStatus, .bcFooter { text-transform: capitalize; }
        .bcListItem .bcType, .bcListItem .bcTitle, .bcListItem .bcAuthor, .bcListItem .bcStatus { font-family: Arial, Helvetica, sans-serif; font-size: 18.24px; font-weight: 400; line-height: 1.15; letter-spacing: 0; }
        .bcBookDetails { min-width: 0; }
        .bcBookDetails .bcAuthor, #current .bcBookDetails .bcAuthor { font-weight: 700; margin-top: 2px; }
        .bcHostingNote, .bcFooter { font-size: 18.24px; letter-spacing: 0; }
        .bcEnquiries { margin: 8px 5vw 0; color: #000; font-size: 18.24px; font-weight: 700; line-height: 1.15; letter-spacing: 0; }
        .bcEnquiries a { color: inherit; font-weight: inherit; text-decoration: underline; text-underline-offset: 2px; }
        .bcFooter, .bcFooter a { color: var(--bc-accent); font-weight: 700; }
        .bcLibraryCard .bcFormMessage { font-size: 13.11pt; }

        #borrow-card .bcLibraryCard, #current-card .bcLibraryCard, #lent-card .bcLibraryCard { width: min(680px, 100%); max-height: calc(100dvh - 36px); overflow-y: auto; }
        .bcSplitCardBody { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); }
        .bcCardDetails { min-width: 0; display: flex; flex-direction: column; }
        .bcLibraryCard .bcIdentityRow { grid-template-columns: 1fr; min-height: 42px; }
        .bcLibraryCard .bcIdentityRow .bcCardValue, .bcLibraryCard .bcIdentityRow input { font-weight: 700; }
        .bcBookRow.bcIdentityRow input, .bcBookRow.bcIdentityRow .bcIdentityAuthor, #lent-card .bcIdentityRow .bcCardValue { padding-top: 0; padding-bottom: 0; line-height: 1.15; }
        @media(max-width:640px) { .bcLibraryCard .bcIdentityRow { min-height: 67.15625px; } }
        .bcModalCover { display: block; width: 100%; height: auto; object-fit: contain; }
        .bcBookCoverSpace { border-left: 1px solid #16130f; min-height: 220px; }
        .bcCardDetails .bcCardValue { overflow-wrap: anywhere; box-sizing: border-box; }
        .bcCardDetails button { width: 100%; margin-top: auto; flex-shrink: 0; border-top: 1px solid #16130f; }
        .bcCardDetails > .bcCardRow:has(+ button), .bcCardDetails > .bcCardGrid:has(+ button) { border-bottom: 0; }
        .bcCardDetails .bcCardRow:last-child { border-bottom: 0; }
        @media(max-width:640px) { .bcCardDetails .bcCardRow span, .bcCardDetails .bcCardRow input, .bcCardDetails .bcCardValue { padding: 8px; } }

        .bcLibraryCard .bcBorrowForm { line-height: 1.15; }
        .bcLibraryCard .bcCardValue, .bcLibraryCard .bcAboutCardText, .bcLibraryCard .bcNoteRow .bcCardValue { line-height: 1.15; white-space: normal; overflow-wrap: anywhere; }
        #borrow-card .bcBookRow { padding: 7.2px 0 8px; }
        #borrow-card .bcCardRow:not(.bcBookRow) { grid-template-columns: 1fr; }
        #borrow-card .bcCardRow input:not([type="hidden"]) { box-sizing: border-box; }
        #current-card .bcIdentityRow { padding: 7.2px 0 8px; align-content: start; }
        #current-card .bcIdentityRow .bcCardValue { padding-top: 0; padding-bottom: 0; }
        #current-card .bcIdentityAuthor { margin-top: 4px; }
        #borrow-card .bcCardGrid { flex: 1; align-items: stretch; }
        #current-card .bcNoteRow, #lent-card .bcCardRow:not(.bcIdentityRow) { flex: 1; align-items: stretch; }
        @media(max-width:640px) { #current-card .bcNoteRow, #lent-card .bcCardRow:not(.bcIdentityRow) { grid-template-rows: auto 1fr; } }
        .bcFullBookTitle { font-weight: 700; }
        .bcHero, .bcSection, .bcSectionHead, .bcListItem { border: 0; }
        .bcHero { padding: 39.2px 5vw 19.6px; min-height: auto; }
        .bcHero h1 { font-size: clamp(55.44px, 10.56vw, 126.72px); white-space: normal; color: var(--bc-accent); line-height: 0.85; }
        .bcIntroText { margin: 18.2px 0 0; max-width: 650px; font-size: 18.24px; font-weight: 700; line-height: 1.15; }
        .bcSection { padding: 9.8px 5vw 16.8px; }
        .bcSectionHead { padding: 0 0 8.4px; }
        .bcSectionHead h2 { font-size: 18.24px; font-weight: 700; }
        .bcList { display: block; }
        .bcListItem { display: grid; grid-template-columns: 100px minmax(0, 1fr) 180px; gap: 16px; padding: 8.4px 0; background: transparent; box-shadow: none; height: auto; width: auto; align-items: start; }
        .bcType, .bcStatus { font: 18.24px/1.15 Arial, sans-serif; }
        .bcTitle { font: 18.24px/1.15 Arial, sans-serif; }
        .bcAuthor { font: 18.24px/1.15 Arial, sans-serif; }
        .bcFooter { padding: 20px 5vw 40px; border: 0; }
        @media (max-width: 640px) {
          .bcHero { padding-top: 26.6px; }
          .bcSection { padding-bottom: 14px; }
          .bcListItem { grid-template-columns: minmax(0, 1fr) auto; gap: 2.1px 14px; padding: 7px 0; }
          .bcBookDetails { grid-column: 1; grid-row: 1; }
          .bcType { grid-column: 1; grid-row: 2; }
          .bcStatus { grid-column: 2; grid-row: 1 / span 3; max-width: 95px; text-align: right; }
        }
        .bcCoverWall { display: none; z-index: 3; }
        .bcCoverSquare { border: 0; padding: 0; background: transparent; pointer-events: auto; cursor: pointer; }
        .bcCoverSquare:focus-visible { outline: 2px solid #c2188b; outline-offset: 2px; }
        @media(max-width:640px) {
          .bcCoverWall { display: grid; position: relative; grid-template-columns: repeat(3,minmax(0,1fr)); gap: 8px; padding: 10px 4px calc(10px + env(safe-area-inset-bottom)); background: var(--bc-paper); pointer-events: none; opacity: 1; overflow: hidden; }
          .bcCoverSquare { display: flex; justify-content: center; align-items: center; min-width: 0; aspect-ratio: 1 / 1.2; }
          .bcCoverSquare:nth-child(n+4) { display: none; }
          .bcCoverSquare img { display: block; width: 120%; height: 100%; flex-shrink: 0; object-fit: contain; }
        }
        @media(min-width:1100px) {
          .bcHero, .bcSection { padding-right: 39vw; }
          .bcListItem { grid-template-columns: 80px minmax(0,1fr) max-content; gap: 12px; }
          .bcStatus { text-align: right; white-space: nowrap; }
          .bcCoverWall { display: grid; position: fixed; right: 3vw; top: 4vh; width: 31vw; height: 92vh; grid-template-columns: repeat(2,minmax(0,1fr)); grid-template-rows: repeat(3,minmax(0,1fr)); gap: 16px; pointer-events: none; }
          .bcCoverSquare { display: flex; justify-content: center; align-items: center; min-height: 0; }
          .bcCoverSquare img { display: block; width: 130%; height: 130%; flex-shrink: 0; max-width: min(18.2vw,31.2vh); max-height: min(18.2vw,31.2vh); object-fit: contain; }
        }
      `}</style>


      <script
        dangerouslySetInnerHTML={{
          __html: `
            (() => {
              if (!window.bcCoverClickBound) {
                window.bcCoverClickBound = true;
                const coverTitles = ${JSON.stringify(Object.fromEntries(Object.entries(bookCoverPhotos).map(([title,src]) => [src,title])))};
                document.addEventListener('click', event => {
                  const button = event.target.closest?.('.bcCoverSquare');
                  if (!button) return;
                  const title = coverTitles[button.querySelector('img').getAttribute('src')];
                  const row = [...document.querySelectorAll('[data-book-title]')].find(row => row.dataset.bookTitle === title);
                  if (!row) return;
                  row.scrollIntoView({block:'center',behavior:'instant'});
                  row.querySelector('.bcListItemLink')?.click();
                });
              }
              if (!window.bcCoverWallTimer) {
                const covers = ${JSON.stringify(Object.values(bookCoverPhotos))};
                window.bcCoverWallTimer = setInterval(() => {
                  if ((!matchMedia('(min-width:1100px)').matches && !matchMedia('(max-width:640px)').matches) || matchMedia('(prefers-reduced-motion: reduce)').matches || document.hidden) return;
                  const slots = [...document.querySelectorAll('.bcCoverSquare img')].filter(img => getComputedStyle(img.parentElement).display !== 'none');
                  if (!slots.length) return;
                  const visible = slots.map(img => img.getAttribute('src'));
                  slots.forEach((slot, slotIndex) => {
                  const choices = covers.filter(src => !visible.includes(src));
                  const next = choices[Math.floor(Math.random() * choices.length)];
                  if (!next) return;
                  visible.push(next);
                  const preload = new Image();
                  preload.onload = async () => {
                    await new Promise(resolve => setTimeout(resolve, slotIndex * 180));
                    await slot.animate([{opacity:1,transform:'scale(1)'},{opacity:0,transform:'scale(.92)'}], {duration:500,fill:'forwards'}).finished;
                    slot.src = next;
                    const title = ${JSON.stringify(Object.fromEntries(Object.entries(bookCoverPhotos).map(([title,src]) => [src,title])))}[next];
                    slot.alt = title;
                    slot.parentElement.setAttribute("aria-label", "View " + title);
                    slot.animate([{opacity:0,transform:'scale(.92)'},{opacity:1,transform:'scale(1)'}], {duration:700,fill:'forwards'});
                  };
                  preload.src = next;
                  });
                }, 4000);
              }
              if (!window.bcReturnConfettiBound) {
                window.bcReturnConfettiBound = true;
                const celebrate = () => {
                  document.querySelector('.bcReturnConfetti')?.remove();
                  const confetti = document.createElement('div');
                  confetti.className = 'bcReturnConfetti';
                  const site = document.querySelector('.bcSite');
                  if (site) confetti.style.setProperty('--bc-accent', getComputedStyle(site).getPropertyValue('--bc-accent'));
                  confetti.setAttribute('aria-hidden', 'true');
                  for (let i = 0; i < 100; i++) {
                    const piece = document.createElement('i');
                    piece.style.left = Math.random() * 100 + '%';
                    piece.style.animationDelay = Math.random() * 0.6 + 's';
                    piece.style.animationDuration = 2 + Math.random() * 1.2 + 's';
                    confetti.appendChild(piece);
                  }
                  document.body.appendChild(confetti);
                  setTimeout(() => confetti.remove(), 4000);
                };
                document.addEventListener('click', (event) => {
                  if (event.target instanceof Element && event.target.closest('.bcReturnBook')) celebrate();
                });
                const celebrateBorrow = () => {
                  const success = document.querySelector('[data-borrow-success]');
                  if (success && !success.hasAttribute('data-celebrated')) {
                    success.setAttribute('data-celebrated', 'true');
                    celebrate();
                  }
                };
                new MutationObserver(celebrateBorrow).observe(document.body, { childList: true, subtree: true });
                celebrateBorrow();
              }
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
        Book Index is a shared bookshelf by <a href="http://farahismail.com/">farahismail.com</a>.
      </div>

      <p className="bcEnquiries">For enquiries &amp; collaborations, please contact via <a href="https://instagram.com/kingfrh" target="_blank" rel="noopener noreferrer">Instagram</a></p>

      <footer className="bcFooter" id="contact">
        <div>Book Index</div>
        <div><a href="https://substack.com/@bookindex" target="_blank" rel="noopener noreferrer">Substack</a> · <a href="https://instagram.com/kingfrh" target="_blank" rel="noopener noreferrer">Instagram</a></div>
      </footer>
      <aside className="bcCoverWall" aria-label="Explore book covers">
        {Object.entries(bookCoverPhotos).slice(0, 6).map(([title, src], index) => (
          <button type="button" className="bcCoverSquare" key={index} aria-label={`View ${title}`}><img src={src} alt={title} /></button>
        ))}
      </aside>
    </main>
  );
}
