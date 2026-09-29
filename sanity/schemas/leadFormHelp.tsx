/**
 * The help text shown inside the Studio on the Lead Form tab.
 *
 * Sanity accepts a JSX element as a field `description`, not just a
 * string — which matters here, because a plain string collapses numbered
 * steps into one unreadable paragraph. These are plain elements with no
 * hooks or state, so they're safe to build at module load and hand to the
 * schema in sanity/schemas/pageContent.ts.
 */

const list: React.CSSProperties = {
  margin: "0.5em 0 0",
  paddingLeft: "1.25em",
  display: "grid",
  gap: "0.35em",
};

const box: React.CSSProperties = {
  margin: "0.6em 0 0",
  padding: "0.7em 0.9em",
  border: "1px solid rgba(128,128,128,.28)",
  borderRadius: "6px",
};

const code: React.CSSProperties = {
  fontFamily: "monospace",
  fontSize: "0.92em",
  padding: "0.1em 0.35em",
  borderRadius: "3px",
  background: "rgba(128,128,128,.16)",
};

/** Sits on the "Questions" array — what the form is made of and what
 * each setting on a question actually controls. */
export const questionsHelp = (
  <div>
    <p style={{ margin: 0 }}>
      Everything the form asks <strong>below Name and Email</strong>. Add,
      remove and drag to reorder freely — each page has its own list, so the
      New Sellers page can ask completely different questions from the
      homepage. Leave the list empty to fall back to the three built-in
      dropdowns (revenue, products, budget).
    </p>

    <div style={box}>
      <strong>Question</strong> vs <strong>Placeholder</strong> — the two bits
      of text on every field:
      <ul style={list}>
        <li>
          <strong>Question</strong> is the small label <em>above</em> the box.
          It is always visible, including after the visitor has typed. This is
          the actual question, e.g. “Monthly Revenue on Amazon”.
        </li>
        <li>
          <strong>Placeholder</strong> is the faint grey example text{" "}
          <em>inside</em> an empty box. It disappears the moment they start
          typing, so it is a hint — never put anything important in it. E.g.
          “+1 555 0100” under a phone question.
        </li>
      </ul>
      <p style={{ margin: "0.5em 0 0" }}>
        Dropdowns have no placeholder — they open on their first choice
        instead. Leave Placeholder blank if you don’t want a hint.
      </p>
    </div>

    <div style={box}>
      <strong>Getting answers into GoHighLevel</strong> — each question has a
      “Where does the answer go” setting, and if you pick “Into a custom
      field” you’ll be asked for that field’s key. Full instructions are on
      that setting.
      <p style={{ margin: "0.5em 0 0" }}>
        Whatever you pick, <strong>every answer is also written onto the
        contact’s timeline as a note</strong>, so nothing is ever lost — even
        if a key is wrong or you chose “Nowhere”.
      </p>
    </div>
  </div>
);

/** Sits on the "GoHighLevel custom field key" input — the actual
 * step-by-step for wiring a question to a field in GHL. */
export const ghlFieldHelp = (
  <div>
    <p style={{ margin: 0 }}>
      The key of the field in GoHighLevel this answer should fill in. The
      field has to exist in GoHighLevel first — this box does not create it.
    </p>

    <div style={box}>
      <strong>How to connect this question to GoHighLevel</strong>
      <ol style={list}>
        <li>
          In GoHighLevel, open <strong>Settings → Custom Fields</strong> and
          click <strong>Add Field</strong>.
        </li>
        <li>
          Choose <strong>Text</strong> as the field type. Text works for every
          answer type here — dropdown, short text, long text and phone — and
          saves the answer exactly as the visitor gave it.
        </li>
        <li>
          Name it whatever makes sense to your team, e.g. “Monthly Amazon
          Revenue”. The name is only for you; it is not what you paste here.
        </li>
        <li>
          Save it, then reopen it and copy its{" "}
          <strong>unique key</strong> — the machine-readable name, e.g.{" "}
          <span style={code}>monthly_amazon_revenue</span>. If GoHighLevel
          shows it with a <span style={code}>contact.</span> prefix, leave that
          prefix off and paste only the part after the dot.
        </li>
        <li>
          Paste it into this box and hit <strong>Publish</strong> on this page.
        </li>
        <li>
          Submit the form once on the live site and check the contact in
          GoHighLevel — the answer should be sitting in that field.
        </li>
      </ol>
      <p style={{ margin: "0.6em 0 0" }}>
        The key has to match <strong>exactly</strong> — same spelling, same
        underscores, no spaces or capitals.
      </p>
    </div>

    <div style={box}>
      <strong>If the key is wrong</strong>, nothing breaks and no lead is
      lost: the contact is still created, and the answer still appears on
      their timeline as a note. It just won’t fill the field. So if an answer
      shows up in the note but not in the field, the key is the thing to
      check.
    </div>

    <div style={box}>
      <strong>Answers stopped appearing in a field that used to work?</strong>{" "}
      That almost always means the field was renamed or deleted in
      GoHighLevel, which changes or destroys its key while this box still
      points at the old one. To fix it:
      <ol style={list}>
        <li>
          In GoHighLevel, check <strong>Settings → Custom Fields</strong> — is
          the field still there?
        </li>
        <li>
          If it was deleted, create it again (Text type). Then copy its key:
          it may <em>not</em> be the same as before, so copy it rather than
          retyping the old one from memory.
        </li>
        <li>Paste the new key here and Publish this page.</li>
        <li>
          Do the same on the <strong>other</strong> page if it asks the same
          question — each page has its own list, so fixing one does not fix
          the other.
        </li>
      </ol>
      <p style={{ margin: "0.6em 0 0" }}>
        Note that deleting a custom field in GoHighLevel also deletes the
        answers already stored in it on every contact, and recreating the
        field does not bring them back. Any submissions that came in while
        the field was missing are still readable on each contact’s timeline
        note.
      </p>
    </div>

    <div style={box}>
      <strong>Can both pages use the same field?</strong> Yes — custom fields
      belong to the GoHighLevel account, not to a page or a form, so the
      homepage and the New Sellers page can both point at one key and it
      works.
      <p style={{ margin: "0.5em 0 0" }}>
        Only do it when both pages are asking the <em>same</em> question. A
        contact holds one value per field, so if someone submits both forms
        the second answer overwrites the first, and if the two pages ask
        different questions you can no longer tell which one the value
        answers. Different question → give it its own field.
      </p>
      <p style={{ margin: "0.5em 0 0" }}>
        To tell the two audiences apart in GoHighLevel, use the{" "}
        <strong>Tags</strong> setting further down this tab rather than
        separate fields — that is exactly what it is for.
      </p>
    </div>
  </div>
);

/** Sits on the "Tags added in GoHighLevel" array. */
export const tagsHelp = (
  <div>
    <p style={{ margin: 0 }}>
      Tags applied to the contact in GoHighLevel on every submission from this
      page. <strong>This is what your GoHighLevel workflows should trigger
      off</strong> — a workflow set to “Contact Tag Added → strategy-call-request”
      fires the moment someone submits.
    </p>

    <div style={box}>
      <strong>How to connect tags to a workflow</strong>
      <ol style={list}>
        <li>Type the tags you want here, one per row, and Publish.</li>
        <li>
          In GoHighLevel, open <strong>Automation → Workflows</strong> and add
          a trigger of <strong>Contact Tag</strong>.
        </li>
        <li>
          Type the tag exactly as you wrote it here — GoHighLevel creates the
          tag on first use, so it may not appear in the dropdown until the
          first lead comes in.
        </li>
      </ol>
      <p style={{ margin: "0.6em 0 0" }}>
        Each page has its own list, so homepage leads and New Sellers leads
        can start completely different workflows. Leave this empty to use the
        built-in tags (<span style={code}>website-lead</span>,{" "}
        <span style={code}>strategy-call-request</span>).
      </p>
    </div>
  </div>
);
