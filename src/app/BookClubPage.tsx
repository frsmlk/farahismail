import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Book Club',
  description: 'Book Club',
};

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

function Row({ item }: { item: string[] }) {
  const [type, title, author, status] = item;
  return (
    <article className="bcListItem">
      <div className="bcType">{type}</div>
      <div className="bcTitle">{title}</div>
      <div className="bcAuthor">{author}</div>
      <div className="bcStatus">{status}</div>
    </article>
  );
}

export default function BookClubPage() {
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

      <section className="bcSection" id="playing-now">
        <div className="bcSectionHead"><h2>Playing Now</h2></div>
        <div className="bcList">
          <article className="bcListItem">
            <div className="bcType">Song</div>
            <a className="bcTitle" href="https://open.spotify.com/track/1zNXF2svmdlNxfS5XeNUgr?si=a40c6b9f5e83483c" target="_blank" rel="noopener noreferrer">Don&apos;t Know Why</a>
            <div className="bcAuthor">Norah Jones</div>
            <div className="bcStatus">Playing now</div>
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
          {availableBooks.map((book) => <Row key={book[1]} item={book} />)}
        </div>
      </section>

      <footer className="bcFooter">
        <div>Book Club</div>
        <div><a href="https://farahainismail.substack.com" target="_blank" rel="noopener noreferrer">@farahainismail</a> · <a href="https://instagram.com/kingfrh" target="_blank" rel="noopener noreferrer">@kingfrh</a></div>
      </footer>
    </main>
  );
}
