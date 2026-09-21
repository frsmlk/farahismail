import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Book Club',
  description: 'Book Club',
};

const availableBooks = [
  ['Magazine', 'POP Magazine: September Issue', 'POP Magazine', 'Available'],
  ['Book', 'The Spirit of Cities', 'Daniel A. Bell & Avner de-Shalit', 'Available'],
  ['Book', 'Design in Conservative Times', 'Joannette van der Veer', 'Available'],
  ['Book', 'Art and Beauty in the Middle Ages', 'Umberto Eco', 'Available'],
  ['Book', 'You Glow in the Dark', 'Liliana Colanzi', 'Available'],
];

export default function BookClubPage() {
  return (
    <main className="bcSite">
      <header className="bcHero">
        <div>
          <h1>Book Club</h1>
          <p className="bcIntroText">
            Helloooo, Farah here. This is a small, growing archive of books from my library, open to be read if you&apos;re in Kuala Lumpur. The list is still being filled in, but everything marked available is welcome to be borrowed.
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
          <article className="bcListItem">
            <div className="bcType">Novel</div>
            <div className="bcTitle">The Vegetarian</div>
            <div className="bcAuthor">Han Kang</div>
            <div className="bcStatus">Lent</div>
          </article>
          <article className="bcListItem">
            <div className="bcType">Essays</div>
            <div className="bcTitle">In the Garden: Essays on Nature and Growing</div>
            <div className="bcAuthor">Daunt Books, ed.</div>
            <div className="bcStatus">Lent</div>
          </article>
          <article className="bcListItem">
            <div className="bcType">Novel</div>
            <div className="bcTitle">The Curious Incident of the Dog in the Night-Time</div>
            <div className="bcAuthor">Mark Haddon</div>
            <div className="bcStatus">Lent</div>
          </article>
        </div>
      </section>

      <section className="bcSection" id="available">
        <div className="bcSectionHead"><h2>Available</h2></div>
        <div className="bcList">
          {availableBooks.map(([type, title, author, status]) => (
            <article className="bcListItem" key={title}>
              <div className="bcType">{type}</div>
              <div className="bcTitle">{title}</div>
              <div className="bcAuthor">{author}</div>
              <div className="bcStatus">{status}</div>
            </article>
          ))}
        </div>
      </section>

      <footer className="bcFooter">
        <div>Book Club</div>
        <div><a href="https://farahainismail.substack.com" target="_blank" rel="noopener noreferrer">@farahainismail</a> · <a href="https://instagram.com/kingfrh" target="_blank" rel="noopener noreferrer">@kingfrh</a></div>
      </footer>
    </main>
  );
}
