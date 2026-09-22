import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { db } from '@/lib/db';
import { sseEvents } from '@/lib/db/schema';

export const metadata: Metadata = {
  title: 'Book Club',
  description: 'Book Club',
  openGraph: {
    title: 'Book Club',
    description: 'Book Club',
    siteName: 'Book Club',
  },
  twitter: {
    card: 'summary',
    title: 'Book Club',
    description: 'Book Club',
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
    redirect(`/?borrow=${encodeURIComponent(bookTitle)}&error=missing#borrow-form`);
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

  redirect('/?borrow=submitted#borrow-form');
}

const lentBooks = [
  ['Novel', 'The Vegetarian', 'Han Kang', 'Lent to Shyafika S.'],
  ['Essays', 'In the Garden: Essays on Nature and Growing', 'Daunt Books, ed.', 'Lent to Irdina N.'],
  ['Novel', 'The Curious Incident of the Dog in the Night-Time', 'Mark Haddon', 'Lent to John D.'],
  ['Essay', 'The Book of Tea', 'Okakura Kakuzō', 'Lent to ??'],
];

const availableBooks = [
  ['Magazine', 'POP Magazine: September Issue', 'POP Magazine', 'Available'],
  ['Book', 'The Spirit of Cities', 'Daniel A. Bell & Avner de-Shalit', 'Available'],
  ['Book', 'Design in Conservative Times', 'Joannette van der Veer', 'Available'],
  ['Book', 'Art and Beauty in the Middle Ages', 'Umberto Eco', 'Available'],
  ['Book', 'You Glow in the Dark', 'Liliana Colanzi', 'Available'],
  ['Book', 'Soups, Salads, Sandwiches', 'Matty Matheson', 'Available'],
  ['Magazine', 'Penang Monthly: September Issue', 'Penang Institute', 'Available'],
  ['Magazine', 'Noai Issue 4: Absurd Rituals', 'Noai', 'Available'],
  ['Book', 'Common Treasures Vol 2. Housing, Planning and Construction', 'Amica Dall, Giles Smith, James Binning & Sara Pereira', 'Available'],
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
          <a className="bcBorrowStatus" href={`?borrow=${encodeURIComponent(title)}#borrow-form`} aria-label={`Borrow ${title}`}>
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
          <h1>Book Club</h1>
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

      <section className="bcSection" id="borrow-form">
        <div className="bcSectionHead"><h2>Borrow</h2></div>
        <form className="bcBorrowForm" action={submitBorrowRequest}>
          {submitted ? <p className="bcFormMessage">Borrow request received.</p> : null}
          {missing ? <p className="bcFormMessage">Please fill in name, address, and phone.</p> : null}
          <label>
            <span>Book</span>
            <input name="bookTitle" defaultValue={borrowTitle} readOnly={Boolean(borrowTitle)} placeholder="Book title" required />
          </label>
          <label>
            <span>Name</span>
            <input name="name" placeholder="Name" required />
          </label>
          <label>
            <span>Address</span>
            <input name="address" placeholder="Address" required />
          </label>
          <label>
            <span>Phone</span>
            <input name="phone" placeholder="Phone" required />
          </label>
          <button type="submit">Submit</button>
        </form>
      </section>

      <style>{`
        .bcBorrowStatus { position: relative; display: inline-block; min-width: 70px; }
        .bcBorrowText { display: none; text-decoration: underline; }
        .bcBorrowStatus:hover .bcAvailableText { display: none; }
        .bcBorrowStatus:hover .bcBorrowText { display: inline; }
        .bcBorrowForm { display: grid; grid-template-columns: repeat(4, 1fr) auto; gap: 20px; align-items: end; padding: 22px; border-bottom: 1px solid var(--bc-line); }
        .bcBorrowForm label { display: grid; gap: 8px; font-family: Arial, Helvetica, sans-serif; font-size: 8pt; text-transform: uppercase; letter-spacing: 0.06em; }
        .bcBorrowForm input { width: 100%; border: 1px solid var(--bc-line); border-radius: 0; background: transparent; padding: 10px; font: 12pt Arial, Helvetica, sans-serif; color: #000000; }
        .bcBorrowForm button { border: 1px solid var(--bc-line); background: transparent; padding: 10px 14px; font: 8pt Arial, Helvetica, sans-serif; text-transform: uppercase; letter-spacing: 0.06em; cursor: pointer; }
        .bcBorrowForm button:hover { background: rgba(0, 0, 0, 0.06); }
        .bcFormMessage { grid-column: 1 / -1; margin: 0; font: 12pt Arial, Helvetica, sans-serif; }
        @media (max-width: 900px) { .bcBorrowForm { grid-template-columns: 1fr; padding-left: 16px; padding-right: 16px; } }
      `}</style>

      <footer className="bcFooter">
        <div>Book Club</div>
        <div><a href="https://farahainismail.substack.com" target="_blank" rel="noopener noreferrer">@farahainismail</a> · <a href="https://instagram.com/kingfrh" target="_blank" rel="noopener noreferrer">@kingfrh</a></div>
      </footer>
    </main>
  );
}
