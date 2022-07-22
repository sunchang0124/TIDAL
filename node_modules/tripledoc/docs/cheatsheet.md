---
id: cheatsheet
title: Cheatsheet
---

Most examples on these page are for simple operations. For a more extensive comparison bringing many
of these operations together, see the example [Setting up a data model](#setting-up-a-data-model).

## Reading a single value for a property

### Tripledoc

```javascript
import { fetchDocument } from "tripledoc";

async function getName(webId) {
  const profileDoc = await fetchDocument(webId);
  const profile = profileDoc.getSubject(webId);
  return profile.getString('http://xmlns.com/foaf/0.1/name');
}
```

https://codesandbox.io/s/goofy-darwin-shvq5?fontsize=14

### rdflib

```javascript
import { graph, Fetcher, sym } from "rdflib";

async function getName(webId) {
  const store = graph();
  const fetcher = new Fetcher(store, {});
  await fetcher.load(webId);
  const me = sym(webId);
  const name = store.any(me, sym('http://xmlns.com/foaf/0.1/name'), null, me.doc());
  // Note that this will also return invalid Literal data (integers, dates, etc.)
  return (name && name.termType === 'Literal') ? name.value : null;
}
```

https://codesandbox.io/s/vigilant-napier-i3tf4?fontsize=14

### LDflex for Solid

```javascript
import data from "@solid/query-ldflex";

async function getName(webId) {
  // Note that this will also return invalid data (e.g. non-Literals, integers, etc.)
  return data[webId].name.value;
}
```

which is a [condensed](https://www.npmjs.com/package/@solid/query-ldflex#specifying-properties) version of:

```javascript
import data from "@solid/query-ldflex";

async function getName(webId) {
  const person = data[webId];
  const name = await person['http://xmlns.com/foaf/0.1/name'];
  return (name && name.termType === 'Literal' && name.datatype.value === 'http://www.w3.org/2001/XMLSchema#string')
    ? name.value
    : null;
}
```

[CodeSandbox link not possible](https://github.com/codesandbox/codesandbox-client/issues/2368)

## Reading values for multiple properties

### Tripledoc

```javascript
import { fetchDocument } from "tripledoc";

async function getNameAndNick(webId) {
  const profileDoc = await fetchDocument(webId);
  const profile = profileDoc.getSubject(webId);
  return {
    name: profile.getString('http://xmlns.com/foaf/0.1/name'),
    nick: profile.getString('http://xmlns.com/foaf/0.1/nick'),
 };
}
```

https://codesandbox.io/s/gracious-feather-msref?fontsize=14

### rdflib

```javascript
import { graph, Fetcher, sym } from "rdflib";

async function getName(webId) {
  const store = graph();
  const fetcher = new Fetcher(store, {});
  await fetcher.load(webId);
  const me = sym(webId);
  const name = store.any(me, sym('http://xmlns.com/foaf/0.1/name'), null, me.doc());
  const nick = store.any(me, sym('http://xmlns.com/foaf/0.1/nick'), null, me.doc());
  return {
    // Note that this will also return invalid Literal data (integers, dates, etc.)
    name: (name && name.termType === 'Literal') ? name.value : null,
    nick: (nick && nick.termType === 'Literal') ? nick.value : null,
  };
}
```

https://codesandbox.io/s/polished-brook-j03uo?fontsize=14

### LDflex for Solid

```javascript
import data from "@solid/query-ldflex";

async function getNameAndNick(webId) {
  return {
    // The following two lines will perform just one HTTP request; the response is cached by LDflex.
    // Also note that this will also return invalid data (e.g. non-Literals, integers, etc.)
    name: await data[webId].name.value,
    nick: await data[webId].nick.value,
  };
}
```

which is a [condensed](https://www.npmjs.com/package/@solid/query-ldflex#specifying-properties) version of:

```javascript
import data from "@solid/query-ldflex";

async function getNameAndNick(webId) {
  const person = data[webId];
  // The following two lines will perform just one HTTP request; the response is cached by LDflex.
  const name = await person['http://xmlns.com/foaf/0.1/name'];
  const nick = await person['http://xmlns.com/foaf/0.1/nick'];

  return {
    name: (name && name.termType === 'Literal' && name.datatype.value === 'http://www.w3.org/2001/XMLSchema#string')
      ? name.value
      : null,
    nick: (nick && nick.termType === 'Literal' && nick.datatype.value === 'http://www.w3.org/2001/XMLSchema#string')
      ? nick.value
      : null,
  };
}
```

[CodeSandbox link not possible](https://github.com/codesandbox/codesandbox-client/issues/2368)

## Reading multiple values for a property

### Tripledoc

```javascript
import { fetchDocument } from "tripledoc";

async function getNicknames(webId) {
  const profileDoc = await fetchDocument(webId);
  const profile = profileDoc.getSubject(webId);
  return profile.getAllStrings('http://xmlns.com/foaf/0.1/nick');
}
```

https://codesandbox.io/s/peaceful-payne-su5t6?fontsize=14

### rdflib

```javascript
import { graph, Fetcher, sym } from "rdflib";

async function getNicknames(webId) {
  const store = graph();
  const fetcher = new Fetcher(store, {});
  await fetcher.load(webId);
  const me = sym(webId);
  const nicknames = store.each(me, sym('http://xmlns.com/foaf/0.1/nick'), null, me.doc());
  return nicknames
    // Note that this will also return invalid Literal data (integers, dates, etc.)
    .filter(node => node.termType === "Literal")
    .map(nickname => nickname.value);
}
```

https://codesandbox.io/s/festive-currying-z6s3n?fontsize=14

### LDflex for Solid

```javascript
import data from "@solid/query-ldflex";

async function getNicknames(webId) {
  // Note that this will also return invalid data (e.g. non-Literals, integers, etc.)
  return data[webId].nick.values;
}
```

which is a [condensed](https://www.npmjs.com/package/@solid/query-ldflex#specifying-properties) version of:

```javascript
import data from "@solid/query-ldflex";

async function getNicknames(webId) {
  const person = data[webId];
  const nicknames = [];
  for await (const nickname of person['http://xmlns.com/foaf/0.1/nick']) {
    nicknames.push(nickname);
  }
  return nicknames
    .filter(node => node.termType === 'Literal' && node.datatype.value === 'http://www.w3.org/2001/XMLSchema#string')
    .map(nickname => nickname.value);
}
```

[CodeSandbox link not possible](https://github.com/codesandbox/codesandbox-client/issues/2368)

## Adding multiple literals for the same property

Note: the examples below assume the user [is logged in](writing-a-solid-app/1-authentication) and is
allowed to write to their profile.

### Tripledoc

```javascript
import { fetchDocument } from "tripledoc";

async function addNicknames(webId, nicknames) {
  const profileDoc = await fetchDocument(webId);
  const profile = profileDoc.getSubject(webId);

  nicknames.forEach((nickname) => profile.addString('http://xmlns.com/foaf/0.1/nick', nickname));
  await webIdDoc.save();
}
```

### rdflib

```javascript
import { graph, Fetcher, sym, UpdateManager, Literal } from "rdflib";

async function addNicknames(webId, nicknames) {
  const store = graph();
  const fetcher = new Fetcher(store, {});
  await fetcher.load(currentSession.webId);
  const me = sym(currentSession.webId);
  const updater = new UpdateManager(store);
  const updatePromise = new Promise((resolve) => {
    const deletions = [];
    const additions = nicknames.map(nickname => st(me, sym('http://xmlns.com/foaf/0.1/nick'), new Literal(nickname), me.doc()));
    updater.update(deletions, additions, resolve);
  });
  await updatePromise;
}
```

### LDflex for Solid

```javascript
import data from "@solid/query-ldflex";

async function addNicknames(webId, nicknames) {
  return data[webId].nick.add(...nicknames);
}
```

which is a [condensed](https://www.npmjs.com/package/@solid/query-ldflex#specifying-properties) version of:

```javascript
import data from "@solid/query-ldflex";
import { literal } from "@rdfjs/data-model";

async function addNicknames(webId, nicknames) {
  const person = data[webId];
  await person['http://xmlns.com/foaf/0.1/nick'].add(...nicknames.map(nickname => literal(nickname)));
}
```

## Adding values for multiple properties

Note: the examples below assume the user [is logged in](writing-a-solid-app/1-authentication) and is
allowed to write to their profile.

### Tripledoc

```javascript
import { fetchDocument } from "tripledoc";

async function addNameAndNickname(webId, name, nickname) {
  const profileDoc = await fetchDocument(webId);
  const profile = profileDoc.getSubject(webId);

  profile.addString('http://xmlns.com/foaf/0.1/name', name);
  profile.addString('http://xmlns.com/foaf/0.1/nick', nickname);
  await webIdDoc.save();
}
```

### rdflib

```javascript
import { graph, Fetcher, sym, UpdateManager, Literal } from "rdflib";

async function addNameAndNickname(webId, name, nickname) {
  const store = graph();
  const fetcher = new Fetcher(store, {});
  await fetcher.load(currentSession.webId);
  const me = sym(currentSession.webId);
  const updater = new UpdateManager(store);
  const updatePromise = new Promise((resolve) => {
    const deletions = [];
    const additions = [
      st(me, sym('http://xmlns.com/foaf/0.1/name'), new Literal(name), me.doc()),
      st(me, sym('http://xmlns.com/foaf/0.1/nick'), new Literal(nickname), me.doc()),
    ];
    updater.update(deletions, additions, resolve);
  });
  await updatePromise;
}
```

### LDflex for Solid

```javascript
import data from "@solid/query-ldflex";

async function addNameAndNickname(webId, name, nickname) {
  // Note: this will execute two HTTP requests instead of one:
  await data[webId].name.add(name);
  await data[webId].nick.add(nickname);
}
```

which is a [condensed](https://www.npmjs.com/package/@solid/query-ldflex#specifying-properties) version of:

```javascript
import data from "@solid/query-ldflex";
import { literal } from "@rdfjs/data-model";

async function addNameAndNickname(webId, name, nickname) {
  const person = data[webId];
  // Note: this will execute two HTTP requests instead of one:
  await person['http://xmlns.com/foaf/0.1/name'].add(literal(name));
  await person['http://xmlns.com/foaf/0.1/nick'].add(literal(nickname));
}
```

## Replacing existing values with new ones

Note: the examples below assume the user [is logged in](writing-a-solid-app/1-authentication) and is
allowed to write to their profile.

### Tripledoc

```javascript
import { fetchDocument } from "tripledoc";

async function setNicknames(webId, nicknames) {
  const profileDoc = await fetchDocument(webId);
  const profile = profileDoc.getSubject(webId);

  profile.removeAll('http://xmlns.com/foaf/0.1/nick');
  nicknames.forEach((nickname) => profile.addString('http://xmlns.com/foaf/0.1/nick', nickname));
  await webIdDoc.save();
}
```

### rdflib

```javascript
import { graph, Fetcher, sym, UpdateManager, Literal } from "rdflib";

async function setNicknames(webId, nicknames) {
  const store = graph();
  const fetcher = new Fetcher(store, {});
  await fetcher.load(currentSession.webId);
  const me = sym(currentSession.webId);
  const updater = new UpdateManager(store);
  const updatePromise = new Promise((resolve) => {
    const deletions = store.statementsMatching(me, sym('http://xmlns.com/foaf/0.1/nick'), null, me.doc());
    const additions = nicknames.map(nickname => st(me, sym('http://xmlns.com/foaf/0.1/nick'), new Literal(nickname), me.doc()));
    updater.update(deletions, additions, resolve);
  });
  await updatePromise;
}
```

### LDflex for Solid

```javascript
import data from "@solid/query-ldflex";

async function setNicknames(webId, nicknames) {
  return data[webId].nick.set(...nicknames);
}
```

which is a [condensed](https://www.npmjs.com/package/@solid/query-ldflex#specifying-properties) version of:

```javascript
import data from "@solid/query-ldflex";
import { literal } from "@rdfjs/data-model";

async function setNicknames(webId, nicknames) {
  const person = data[webId];
  await person['http://xmlns.com/foaf/0.1/nick'].set(...nicknames.map(nickname => literal(nickname)));
}
```

## Removing all values for a property

Note: the examples below assume the user [is logged in](writing-a-solid-app/1-authentication) and is
allowed to write to their profile.

### Tripledoc

```javascript
import { fetchDocument } from "tripledoc";

async function removeNicknames(webId) {
  const profileDoc = await fetchDocument(webId);
  const profile = profileDoc.getSubject(webId);

  profile.removeAll('http://xmlns.com/foaf/0.1/nick');
  await webIdDoc.save();
}
```

### rdflib

```javascript
import { graph, Fetcher, sym, UpdateManager } from "rdflib";

async function removeNicknames(webId) {
  const store = graph();
  const fetcher = new Fetcher(store, {});
  await fetcher.load(currentSession.webId);
  const me = sym(currentSession.webId);
  const updater = new UpdateManager(store);
  const updatePromise = new Promise((resolve) => {
    const deletions = store.statementsMatching(me, sym('http://xmlns.com/foaf/0.1/nick'), null, me.doc());
    const additions = [];
    updater.update(deletions, additions, resolve);
  });
  await updatePromise;
}
```


### LDflex for Solid

```javascript
import data from "@solid/query-ldflex";

async function removeNicknames(webId) {
  return data[webId].nick.delete();
}
```

which is a [condensed](https://www.npmjs.com/package/@solid/query-ldflex#specifying-properties) version of:

```javascript
import data from "@solid/query-ldflex";

async function removeNicknames(webId) {
  const person = data[webId];
  await person['http://xmlns.com/foaf/0.1/nick'].delete();
}
```

## Removing a single specific value for a property

Note: the examples below assume the user [is logged in](writing-a-solid-app/1-authentication) and is
allowed to write to their profile.

### Tripledoc

```javascript
import { fetchDocument } from "tripledoc";

async function removeNickname(webId, nickname) {
  const profileDoc = await fetchDocument(webId);
  const profile = profileDoc.getSubject(webId);

  profile.removeString('http://xmlns.com/foaf/0.1/nick', nickname);
  await webIdDoc.save();
}
```

### rdflib

```javascript
import { graph, Fetcher, sym, UpdateManager, Literal } from "rdflib";

async function removeNickname(webId, nickname) {
  const store = graph();
  const fetcher = new Fetcher(store, {});
  await fetcher.load(currentSession.webId);
  const me = sym(currentSession.webId);
  const updater = new UpdateManager(store);
  const updatePromise = new Promise((resolve) => {
    const deletions = store.statementsMatching(me, sym('http://xmlns.com/foaf/0.1/nick'), Literal(nickname), me.doc());
    const additions = [];
    updater.update(deletions, additions, resolve);
  });
  await updatePromise;
}
```

### LDflex for Solid

```javascript
import data from "@solid/query-ldflex";

async function removeNickname(webId, nickname) {
  return data[webId].nick.delete(nickname);
}
```

which is a [condensed](https://www.npmjs.com/package/@solid/query-ldflex#specifying-properties) version of:

```javascript
import data from "@solid/query-ldflex";
import { literal } from "@rdfjs/data-model";

async function removeNickname(webId, nickname) {
  const person = data[webId];
  await person['http://xmlns.com/foaf/0.1/nick'].delete(literal(nickname));
}
```

## Create a new Document

Note: the examples below assume the user [is logged in](writing-a-solid-app/1-authentication) and is allowed to
write to their profile.

### Tripledoc

```javascript
import { createDocument } from "tripledoc";

async function createEmptyDocument(location) {
  const document = createDocument(location);
  await document.save();
}
```

### rdflib

```javascript
import { graph, sym, UpdateManager } from "rdflib";

async function createEmptyDocument(location) {
  const store = graph();
  const updater = new UpdateManager(store);
  const creationPromise = new Promise((resolve, reject) => {
    updater.put(sym(location), [], 'text/turtle', (_url, success, message) => {
      if (success) {
        resolve();
      } else {
        reject(new Error(message));
      }
    });
  });
  await creationPromise;
}
```

### LDflex for Solid

LDflex [does not have explicit support for creating a new Document
yet](https://github.com/solid/query-ldflex/issues/7), so we can create the required HTTP request
ourselves:

```javascript
// Note: this is not ldflex-specific, as ldflex has no specific functionality for this use case.
// We manually send the required HTTP request.
async function createEmptyDocument(location) {
  const options = {
    body: '',
    // Make sure to include credentials with the request, set by solid-auth-client:
    credentials: 'include',
    headers: {
      'Content-Type': 'text/turtle'
    },
    method: 'PUT',
  };
  await fetch(location, options);
};
```

Alternatively, we can simply tell LDFlex to add a value to a Document that does not exist yet, which
will cause it to be created:

```javascript
import data from "@solid/query-ldflex";

async function createDocument(location) {
  // Adding a value to a non-existing Document will create it for us:
  return data[location].name.add('Dummy name');
};
```

## Setting up a data model

The following examples bring together many different concepts used to perform a common operation:
finding a Document to store data of a specific type in (in this case `schema:TextDigitalDocument`),
creating it if it doesn't exist.

At a high level, each example performs the following tasks:

1. On the user's profile, find a reference to their Public Type Index, and fetch that Document.
2. In that type index, see if there's a type registration for the type `schema:TextDigitalDocument`.
   If there is, return the reference listed as its `solid:instance`.
3. If no such type registration exists, find a reference to the user's storage root on their
   profile. In that root, create a new Document. Then, add a type registration to the Public Type
   Index referring to that Document as its `solid:instance`.

(This might look familiar — indeed, it's the steps described in the [documentation on setting up
your data model](writing-a-solid-app/4-data-model).)

### Tripledoc

Note that there's a companion project to Tripledoc called Plandoc that streamlines the fetching and
creation of Documents. An example of an alternative approach using Plandoc can be found after this one.

```javascript
import { fetchDocument, createDocumentInContainer } from "tripledoc";
import { solid, schema, space, rdf } from "rdf-namespaces";

async function getReviewDocUrl(webId) {
  // 1. Find the Public Type Index, then fetch it.
  const profileDocument = await fetchDocument(webId);
  const profile = profileDocument.getSubject(webId);
  const publicTypeIndexRef = profile.getRef(solid.publicTypeIndex);
  if (typeof publicTypeIndexRef !== "string") {
    return null;
  }
  const publicTypeIndexDocument = await fetchDocument(publicTypeIndexRef);
  // 2. If there is a type registration for TextDigitalDocuments, return the instance reference.
  const existingTypeRegistration = publicTypeIndexDocument.findSubject(
    solid.forClass,
    schema.TextDigitalDocument
  );
  if (existingTypeRegistration) {
    return existingTypeRegistration.getRef(solid.instance);
  } else {
    // 3. If no type registration exists, create a new Document in the storage root, and register it
    //    for TextDigitalDocuments.
    const storageRef = profile.getRef(space.storage);
    const document = createDocumentInContainer(storageRef);
    const newDocument = await document.save();

    const newTypeRegistration = publicTypeIndexDocument.addSubject();
    newTypeRegistration.addRef(rdf.type, solid.TypeRegistration);
    newTypeRegistration.addRef(solid.instance, newDocument.asRef());
    newTypeRegistration.addRef(solid.forClass, schema.TextDigitalDocument);
    publicTypeIndexDocument.save([newTypeRegistration]);

    return newDocument.asRef();
  }
}
```

### Tripledoc with Plandoc

```javascript
import { fetchDocument, describeSubject, describeContainer, describeDocument } from "plandoc";
import { solid, schema, space, rdf } from "rdf-namespaces";

async function getReviewDocUrl(webId) {
  // 1. Tell Plandoc where the public type index can be found
  const virtualProfile = describeSubject().isFoundAt(webId);

  const virtualStorage = describeContainer().isFoundOn(virtualProfile, space.storage);

  const virtualPublicTypeIndex = describeDocument().isFoundOn(virtualProfile, solid.publicTypeIndex);

  // 2. Tell Plandoc what the type registration should look like,
  // 3. and that it should be created if it does not exist yet (`isEnsured…`).
  const virtualNotesTypeRegistration = describeSubject()
    .isEnsuredIn(virtualPublicTypeIndex)
    .withRef(rdf.type, solid.TypeRegistration)
    .withRef(solid.forClass, schema.TextDigitalDocument);

  const virtualNotesDoc = describeDocument()
    .isEnsuredOn(virtualNotesTypeRegistration, solid.instance, virtualStorage);

  // Let Plandoc fetch the described Documents, creating everything that's needed:
  const notesDoc = await fetchDocument(virtualNotesDoc);
  return notesDoc.asRef();
}
```

### rdflib

Still to do — [contributions welcome](https://gitlab.com/vincenttunru/tripledoc/-/edit/master/docs/cheatsheet.md).

### LDflex for Solid

```javascript
import data from "@solid/query-ldflex";
import { namedNode } from "@rdfjs/data-model";
import { solid, schema } from "rdf-namespaces";

async function getReviewDocUrl(webId) {
  // 1. Find the Public Type Index, then fetch it.
  const publicTypeIndex = await data[webId].publicTypeIndex;

  // 2. If there is a type registration for TextDigitalDocuments, return the instance reference.
  let notesDoc = undefined;
  for await (const typeRegistration of data[publicTypeIndex].subjects) {
    const forClass = await data[typeRegistration.value][solid.forClass];
    if (forClass && forClass.value === schema.TextDigitalDocument) {
      notesDoc = await typeRegistration[solid.instance];
      break;
    }
  }

  if (notesDoc) {
    return notesDoc.value;
  } else {
    // 3. If no type registration exists, create a new Document in the storage root, and register it
    //    for TextDigitalDocuments.
    const storageContainer = await data[webId].storage;
    // Generate a random name for the Document that is to contain the Reviews:
    const documentName = Math.random().toString().substring(2);
    const newDocumentUrl = new URL(documentName, storageContainer.value).href;
    // Create a dummy value, then remove it, to create the Document:
    await data[newDocumentUrl].name.add('Dummy value');
    await data[newDocumentUrl].name.delete();
    // Generate a random name for the Subject that links from the Public Type Index
    // to the Document that is to contain the Reviews:
    const typeRegistrationName = new URL(
      '#' + Math.random().toString().substring(2),
      publicTypeIndex.value
    ).href;
    await data[typeRegistrationName][solid.forClass].set(schema.TextDigitalDocument)
    await data[typeRegistrationName][solid.instance].set(namedNode(newDocumentUrl));
    await data[typeRegistrationName].type.set(solid.TypeRegistration);
    return newDocumentUrl;
  }
}
```
