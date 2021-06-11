---
id: 5-writing-data
title: Step 5: Writing data
---

Now that the user's Pod is all set up, it's time to store some actual notes. Luckily, [now that we
already have our `notesList`](4-data-model), most of the heavy lifting is already done:

```javascript
async function addNote(note, notesList) {
  // Initialise the new Subject:
  const newNote = notesList.addSubject();

  // Indicate that the Subject is a schema:TextDigitalDocument:
  newNote.addRef(rdf.type, schema.TextDigitalDocument);

  // Set the Subject's `schema:text` to the actual note contents:
  newNote.addString(schema.text, note);

  // Store the date the note was created (i.e. now):
  newNote.addDateTime(schema.dateCreated, new Date(Date.now()));

  const success = await notesList.save([newNote]);
  return success;
}
```

With the user's Pod fully set up, the above is all there is to it, really! [Play around with the
completed
app](https://codesandbox.io/s/github/Vinnl/notepod/tree/5-writing-data/?module=%2Fsrc%2FApp.tsx).

So what's next? Start writing your own App! Find a Vocabulary that matches your use case; we've used
Schema.org here, but you can find many more at [Linked Open
Vocabularies](https://lov.linkeddata.es/dataset/lov/). And if you're stuck and need help, please don't
hesitate to ask questions at the [Solid Forum](https://forum.solidproject.org/).


Good luck!
