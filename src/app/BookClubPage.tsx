import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { db } from '@/lib/db';
import { sseEvents } from '@/lib/db/schema';

export const metadata: Metadata = {
  title: 'Book Index',
  description: 'Book Index',
  openGraph: {
    title: 'Book Index',
    description: 'Book Index',
    siteName: 'Book Index',
  },
  twitter: {
    card: 'summary',
    title: 'Book Index',
    description: 'Book Index',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-snippet': 0,
      'max-image-preview': 'none',
    },
  },
};


async function submitBorrowRequest(formData: FormData) {
  'use server';

  const bookTitle = String(formData.get('bookTitle') ?? '').trim();
  const name = String(formData.get('name') ?? '').trim();
  const address = String(formData.get('address') ?? '').trim();
  const phone = String(formData.get('phone') ?? '').trim();

  if (!bookTitle || !name || !address || !phone) {
    redirect(`/?borrow=${encodeURIComponent(bookTitle)}&error=missing#borrow-card`);
  }

  await db.insert(sseEvents).values({
    type: 'borrow_request',
    payload: {
      bookTitle,
      name,
      address,
      phone,
      submittedAt: new Date().toISOString(),
    },
  });

  redirect('/?borrow=submitted#borrow-card');
}

const lentBooks = [
  ['Novel', 'The Vegetarian', 'Han Kang', 'Lent to Shyafika S.'],
  ['Essays', 'In the Garden: Essays on Nature and Growing', 'Daunt Books, ed.', 'Lent to Irdina N.'],
  ['Book', 'Common Treasures Vol 2. Housing, Planning and Construction', 'Amica Dall, Giles Smith, James Binning & Sara Pereira', 'Lent by Adam R.'],
];

const availableBooks = [
  ['Novel', 'The Curious Incident of the Dog in the Night-Time', 'Mark Haddon', 'Available'],
  ['Essay', 'The Book of Tea', 'Okakura Kakuzō', 'Available'],
  ['Magazine', 'POP Magazine: September Issue', 'POP Magazine', 'Available'],
  ['Book', 'The Spirit of Cities', 'Daniel A. Bell & Avner de-Shalit', 'Available'],
  ['Book', 'Design in Conservative Times', 'Joannette van der Veer', 'Available'],
  ['Book', 'Art and Beauty in the Middle Ages', 'Umberto Eco', 'Available'],
  ['Book', 'You Glow in the Dark', 'Liliana Colanzi', 'Available'],
  ['Book', 'Soups, Salads, Sandwiches', 'Matty Matheson', 'Available'],
  ['Magazine', 'Penang Monthly: September Issue', 'Penang Institute', 'Available'],
  ['Magazine', 'Noai Issue 4: Absurd Rituals', 'Noai', 'Available'],
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

function Row({ item, borrowable = false }: { item: string[]; borrowable?: boolean }) {
  const [type, title, author, status] = item;
  return (
    <article className="bcListItem">
      <div className="bcType">{type}</div>
      <div className="bcTitle">{title}</div>
      <div className="bcAuthor">{author}</div>
      <div className="bcStatus">
        {borrowable ? (
          <a className="bcBorrowStatus" href={`?borrow=${encodeURIComponent(title)}#borrow-card`} aria-label={`Borrow ${title}`}>
            <span className="bcAvailableText">{status}</span>
            <span className="bcBorrowText">Borrow</span>
          </a>
        ) : status}
      </div>
    </article>
  );
}

type BookClubPageProps = {
  searchParams?: Promise<{ borrow?: string; error?: string }> | { borrow?: string; error?: string };
};

export default async function BookClubPage({ searchParams }: BookClubPageProps) {
  const params = searchParams ? await Promise.resolve(searchParams) : {};
  const borrowTitle = params.borrow && params.borrow !== 'submitted' ? params.borrow : '';
  const submitted = params.borrow === 'submitted';
  const missing = params.error === 'missing';

  return (
    <main className="bcSite">
      <header className="bcHero">
        <div>
          <h1>Book Index</h1>
          <p className="bcIntroText">
            This is a small, growing archive of books from my library, open to be read if you&apos;re in Kuala Lumpur. The list is still being filled in, but everything marked available is welcome to be borrowed.
          </p>
        </div>
      </header>

      <section className="bcSection" id="playlist">
        <div className="bcSectionHead"><h2>Playlist</h2></div>
        <div className="bcList">
          <article className="bcListItem">
            <div className="bcType">Playlist</div>
            <a className="bcTitle" href="https://open.spotify.com/playlist/64pIJTT6N8h2lDk3uUg9g2?si=r81ZHn4UQq2zamqJecAiLQ&utm_source=copy-link&pi=kcZrELpMREKPI" target="_blank" rel="noopener noreferrer">Fun Pop</a>
            <div className="bcAuthor">Spotify</div>
            <div className="bcStatus">Playlist</div>
          </article>
        </div>
      </section>

      <section className="bcSection" id="current">
        <div className="bcSectionHead"><h2>Current Reads</h2></div>
        <div className="bcList">
          <article className="bcListItem">
            <div className="bcType">Memoir</div>
            <div className="bcTitle">I Saw Ramallah</div>
            <div className="bcAuthor">Mourid Barghouti</div>
            <div className="bcStatus">Current read</div>
          </article>
        </div>
      </section>

      <section className="bcSection" id="lent">
        <div className="bcSectionHead"><h2>Lent Books</h2></div>
        <div className="bcList">
          {lentBooks.map((book) => <Row key={book[1]} item={book} />)}
        </div>
      </section>

      <section className="bcSection" id="available">
        <div className="bcSectionHead"><h2>Available</h2></div>
        <div className="bcList">
          {availableBooks.map((book) => <Row key={book[1]} item={book} borrowable />)}
        </div>
      </section>

      {(borrowTitle || submitted || missing) ? (
        <div className="bcBorrowModal" id="borrow-card" role="dialog" aria-modal="true" aria-labelledby="borrow-card-title">
          <Link className="bcBorrowBackdrop" href="/" aria-label="Close borrow form" />
          <div className="bcLibraryCard">
            <div className="bcCardTopline">
              <span>Book Index</span>
              <Link href="/" aria-label="Close borrow form">×</Link>
            </div>
            <form className="bcBorrowForm" action={submitBorrowRequest}>
              <div className="bcCardHeader">
                <p>Library Card</p>
                <h2 id="borrow-card-title">Book Index</h2>
              </div>
              {submitted ? <p className="bcFormMessage">Borrow request received.</p> : null}
              {missing ? <p className="bcFormMessage">Please fill in name, address, and phone.</p> : null}
              <label className="bcCardRow bcBookRow">
                <span>Title</span>
                <input name="bookTitle" defaultValue={borrowTitle} readOnly={Boolean(borrowTitle)} placeholder="Book title" required />
              </label>
              <label className="bcCardRow">
                <span>Borrower&apos;s Name</span>
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
                  <span>Date Due</span>
                  <strong>OPEN</strong>
                </div>
              </div>
              <button type="submit">Submit Request</button>
            </form>
          </div>
        </div>
      ) : null}

      <style>{`
        .bcBorrowStatus { position: relative; display: inline-block; min-width: 70px; }
        .bcBorrowText { display: none; text-decoration: underline; }
        .bcBorrowStatus:hover .bcAvailableText { display: none; }
        .bcBorrowStatus:hover .bcBorrowText { display: inline; }
        .bcBorrowModal { position: fixed; inset: 0; z-index: 20; display: grid; place-items: center; padding: 18px; }
        .bcBorrowBackdrop { position: absolute; inset: 0; background: rgba(40, 34, 28, 0.28); backdrop-filter: blur(3px); }
        .bcLibraryCard { position: relative; width: min(620px, 100%); color: #1b1712; filter: drop-shadow(0 20px 45px rgba(0, 0, 0, 0.22)); }
        .bcCardTopline { display: flex; justify-content: space-between; align-items: center; padding: 10px 14px; border: 1px solid #16130f; border-bottom: 0; background: #efe2ba; font: 8pt Arial, Helvetica, sans-serif; text-transform: uppercase; letter-spacing: 0.1em; }
        .bcCardTopline a { color: #1b1712; font: 18pt Arial, Helvetica, sans-serif; line-height: 1; text-decoration: none; }
        .bcBorrowForm { position: relative; display: grid; gap: 0; padding: 0; border: 1px solid #16130f; background: #f3e7c4; background-image: radial-gradient(circle at 20% 12%, rgba(110, 82, 43, 0.13) 0 1px, transparent 1px), linear-gradient(rgba(255,255,255,0.2), rgba(133, 96, 45, 0.07)); background-size: 12px 12px, 100% 100%; font-family: 'Courier New', Courier, monospace; }
        .bcCardHeader { display: grid; grid-template-columns: 150px 1fr; border-bottom: 1px solid #16130f; }
        .bcCardHeader p, .bcCardHeader h2 { margin: 0; padding: 14px 16px; }
        .bcCardHeader p { border-right: 1px solid #16130f; font: 9pt Arial, Helvetica, sans-serif; text-transform: uppercase; letter-spacing: 0.08em; }
        .bcCardHeader h2 { font-family: Arial, Helvetica, sans-serif; font-size: clamp(34pt, 9vw, 72pt); line-height: 0.9; font-weight: 400; letter-spacing: -0.06em; white-space: nowrap; }
        .bcCardRow { display: grid; grid-template-columns: 150px 1fr; min-height: 58px; border-bottom: 1px solid #16130f; }
        .bcCardRow span, .bcDateDue span { padding: 12px 16px; border-right: 1px solid #16130f; font: 8pt Arial, Helvetica, sans-serif; text-transform: uppercase; letter-spacing: 0.08em; }
        .bcCardRow input { width: 100%; min-width: 0; border: 0; border-radius: 0; background: transparent; padding: 12px 16px; font: 14pt 'Courier New', Courier, monospace; color: #1b1712; outline: none; }
        .bcCardRow input:focus { background: rgba(255, 255, 255, 0.25); }
        .bcCardRow input[readonly] { cursor: default; }
        .bcCardGrid { display: grid; grid-template-columns: 1fr 170px; border-bottom: 1px solid #16130f; }
        .bcCardGrid .bcCardRow { border-bottom: 0; }
        .bcDateDue { display: grid; grid-template-rows: auto 1fr; border-left: 1px solid #16130f; text-align: center; }
        .bcDateDue span { border-right: 0; border-bottom: 1px solid #16130f; }
        .bcDateDue strong { display: grid; place-items: center; min-height: 57px; font-size: 18pt; letter-spacing: 0.08em; }
        .bcBorrowForm button { justify-self: stretch; border: 0; background: transparent; padding: 16px; font: 9pt Arial, Helvetica, sans-serif; text-transform: uppercase; letter-spacing: 0.1em; cursor: pointer; }
        .bcBorrowForm button:hover { background: rgba(27, 23, 18, 0.08); }
        .bcFormMessage { margin: 0; padding: 12px 16px; border-bottom: 1px solid #16130f; font: 12pt Arial, Helvetica, sans-serif; }
        @media (max-width: 640px) {
          .bcCardHeader, .bcCardRow, .bcCardGrid { grid-template-columns: 1fr; }
          .bcCardHeader p, .bcCardRow span, .bcDateDue span { border-right: 0; border-bottom: 1px solid #16130f; }
          .bcDateDue { display: none; }
        }
      `}</style>

      <footer className="bcFooter">
        <div>Book Index</div>
        <div><a href="https://farahainismail.substack.com" target="_blank" rel="noopener noreferrer">@farahainismail</a> · <a href="https://instagram.com/kingfrh" target="_blank" rel="noopener noreferrer">@kingfrh</a></div>
      </footer>
    </main>
  );
}
