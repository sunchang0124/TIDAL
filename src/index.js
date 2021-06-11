// First version was made on 08/06/2020 - 14/06/2020
import auth from "solid-auth-client";
import { fetchDocument, createDocument } from 'tripledoc';
import { solid, schema, space, rdf, foaf, acl, skos, dc, dct, vcard} from 'rdf-namespaces';

import data from "@solid/query-ldflex";
import { literal, namedNode } from "@rdfjs/data-model";

import { sign } from "tweetnacl";
import {decodeUTF8, encodeBase64, decodeBase64} from "tweetnacl-util";

import fetch from "node-fetch";

// Global variables
var registerFileURL = "https://chang.inrupt.net/registerlist/requestlist.ttl";
var registerParticipationFolder = "https://chang.inrupt.net/registerlist/participationlistv2/";
var registerTriggerMessageFolder = "https://chang.inrupt.net/inbox/triggermessage/";
var podServerURL = "https://chang.inrupt.net/profile/card#me";
var registerIndexRef = "https://chang.inrupt.net/settings/registerIndex.ttl";
var userRegisterRef = "https://chang.inrupt.net/registerlist/userregister.ttl";
var dataFileName = "healthrecord.ttl";

// Global terminology
var requestPurposeClassGlobal = "http://www.w3.org/ns/dpv#hasPurpose";
var requestPurposeLabelGlobal = "http://www.w3.org/2000/01/rdf-schema#label";
var requestDataCategoryGlobal = "http://www.w3.org/ns/dpv#hasPersonalDataCategory";
// var requestOntologyGlobal = "http://www.w3.org/ns/dpv#hasContext";
var requestDataElementGlobal = "http://schema.org/DataFeedItem";
var requestExpiryGlobal = "http://www.w3.org/ns/dpv#hasExpiryTime";
var requestCollectionSizeGlobal = "http://schema.org/collectionSize";
var requestDataProcessGlobal = "http://www.w3.org/ns/dpv#hasProcessing";
var requestAnalysisLogicGlobal = "http://www.w3.org/ns/dpv#hasAlgorithmicLogic";
var requestConsequenceGlobal = "http://www.w3.org/ns/dpv#hasConsequences";
// var requestRecipientGlobal = "http://www.w3.org/ns/dpv#hasRecipient";
var requestDataControllerGlobal = "http://www.w3.org/ns/dpv#hasDataController";
var requestPersonalDataHandlingGlobal = "http://www.w3.org/ns/dpv#PersonalDataHandling"

var joinActionGlobal = "http://schema.org/JoinAction";
var joinConsentGlobal = "http://www.w3.org/ns/dpv#Consent";
var joinConsentNoticeGlobal = "http://www.w3.org/ns/dpv#hasConsentNotice";
var joinDataSubjectGlobal = "http://www.w3.org/ns/dpv#DataSubject";
var joinDataCreatedGlobal = "http://schema.org/dateCreated";
var joinhasProvisionTimeGlobal = "http://www.w3.org/ns/dpv#hasProvisionTime";
var joinhasProvisionMethodGlobal = "http://www.w3.org/ns/dpv#hasProvisionMethod";
var joinhasWithdrawalTimeGlobal = "http://www.w3.org/ns/dpv#hasWithdrawalTime";
var joinhasWithdrawalMethodGlobal= "http://www.w3.org/ns/dpv#hasWithdrawalMethod";
var joinDataRecipientGlobal = "http://www.w3.org/ns/dpv#hasRecipient";
var joinhasExpiryGlobal= "http://www.w3.org/ns/dpv#hasExpiry";
var joinhasExpiryTimeGlobal= "http://www.w3.org/ns/dpv#hasExpiryTime";




// query all button values
const btns = document.querySelectorAll(".listen.button");
const btn_login = document.querySelectorAll(".login.button");
const searchIcons= document.querySelectorAll(".link");

/* Auto-run based on different page (START) */
var page = window.location.pathname.split("/").pop();
if (page === "participate.html"){

  fetchRequestURL(registerFileURL).then(fetchRegisterRecord => {
    fetchRegisterList(fetchRegisterRecord).then(fetchedRequestAndWebId =>{
      const requestURIList = fetchedRequestAndWebId[0]
      const requestWebIdDocList = fetchedRequestAndWebId[1]
      const requestProfileIdList = fetchedRequestAndWebId[2]

      auth.currentSession().then(session=>{
        const participant_webID = session.webId;
        const participant_dataFile = participant_webID.split("profile/card#")[0]+"private/"+dataFileName;
        const participant_basket = []

        fetchRequestURL(participant_dataFile).then(fetchedParticipantDataFileRef=> {
          const participant_triple = fetchedParticipantDataFileRef.getTriples()
          participant_triple.forEach(eachDataItem=>{
            participant_basket.push(eachDataItem.predicate.id);
          });
          plotCardsOnPage(requestWebIdDocList, requestProfileIdList, requestURIList, "fromPageEntrance", "participant", session, participant_basket).then(outcome => {
            respondToRequest(outcome[0], outcome[1]);

          });
        });
        
      });
    }).catch(error =>console.log(error));;
  });
}else if (page === "yourRequest.html"){
  getWebId().then(profileWebID => {
    getRequestList(profileWebID).then(fetchedRequestListRef => {
      // const findAllSubjects = fetchedRequestListRef.findSubjects(rdf.type, "http://schema.org/AskAction");
      const findAllSubjects = fetchedRequestListRef.findSubjects(rdf.type, requestPersonalDataHandlingGlobal);

      fetchRequestURL(profileWebID).then(webIdDoc => {
        plotCardsOnPage(webIdDoc, profileWebID, findAllSubjects, "fromWebID", "requester").then(outcome => {
          respondToRequest(outcome[0], outcome[1]);
        });
      });
    }).catch((err)=> {alert(err.message);});
  });
}
/* Auto-run based on different page (END) */

//ARRANGE
//*** Research sends trigger msg to server (START) ***//
async function sendTriggerMsg(msgLocation, selectedRequest){

  // Create a new message ttl file in inbox
  data[msgLocation].put()
  // Create the message content
  await data[msgLocation][schema.actionStatus].add(namedNode(schema.ActivateAction));
  await data[msgLocation][schema.target].add(namedNode(selectedRequest.url));
  await data[msgLocation][schema.creator].add(namedNode(selectedRequest.webid));
  await data[msgLocation][requestDataControllerGlobal].add(namedNode(selectedRequest.webid));
  const currentDateTime = new Date(Date.now())
  await data[msgLocation][schema.dateCreated].add(literal(currentDateTime.toISOString(), "http://www.w3.org/2001/XMLSchema#dateTime"));
  await data[selectedRequest.url][schema.actionStatus].add(namedNode(schema.ActivateAction));
  return "Got it! Your analysis request has been sent to the Pod Serve!"
}
//*** Research sends trigger msg to server (END) ***//

//*** Participant sends feedback msg to researcher (START) ***//
async function sendFeedbackMsg(feedback_request_ID, feedback_researcher_webid, feedback_participant_webid, feedback_text){

  // Create a new message ttl file in inbox
  const feedbackMsgLocation = feedback_researcher_webid.split("profile/card#")[0]+"inbox/"+feedback_request_ID.split("#")[1]+".ttl";
  data[feedbackMsgLocation].put()
  // Create the message content
  let random_sub = '';
  for(i=0; i<19; ++i) random_sub += Math.floor(Math.random() * 10);

  await data[random_sub][rdf.type].add(namedNode(schema.Message));
  await data[random_sub][schema.text].add(literal(feedback_text));
  await data[random_sub][schema.about].add(namedNode(feedback_request_ID));
  await data[random_sub][schema.sender].add(namedNode(feedback_participant_webid));
  await data[random_sub][schema.recipient].add(namedNode(feedback_researcher_webid));
  const currentDateTime = new Date(Date.now())
  await data[random_sub][schema.dateSent].add(literal(currentDateTime.toISOString(), "http://www.w3.org/2001/XMLSchema#dateTime"));
  return "Got it! Your feedback message has been sent to the researchers pod inbox!"
}
//*** Participant sends feedback msg to researcher (END) ***//

// ****** Log In and Log Out (START) *********//
async function getWebId() {

  /* 1. Check if we've already got the user's WebID and access to their Pod: */
  let session = await auth.currentSession();
  if (session) {
    return session.webId;
  }
  else{
    /* 2. User has not logged in; ask for their Identity Provider: */
    const identityProvider = await getIdentityProvider();

    /* 3. Initiate the login process - this will redirect the user to their Identity Provider: */
    auth.login(identityProvider);
  }
}

// login using inrupt or solid community identity providers 
function getIdentityProvider() {
  const idpPromise = new Promise((resolve, _reject) => {
    btns.forEach(function(btn) {
      btn.addEventListener("click", function(e){
        e.preventDefault();
        const styles = e.currentTarget.classList;
        
        if (styles.contains('inrupt')) {
          resolve("https://inrupt.net");
          console.log("Login Inrupt");
        }
        else if (styles.contains('solid')) {
          resolve("https://solidcommunity.net");
          console.log("Login Solid Community");
        }
      });
    });
  });
  return idpPromise
}

getWebId().then(webId => {

  const homeMessageElement = document.getElementById("homeMessage");
  if (webId){
    if (window.location.pathname == "/dist/login.html"){window.location.href = "homepage.html";}
    if (homeMessageElement){homeMessageElement.textContent = "Welcome! "+ webId;}

    document.getElementById("logStatusPage").textContent = "Log Out";
    document.getElementById("logStatusFollowing").textContent = "Log Out";

    // ***** Log out ***** //
    btn_login.forEach(function(btn) {
      btn.addEventListener("click", function(e){
        e.preventDefault();
        const styles = e.currentTarget.classList;
        if (styles.contains('login')) {
          auth.logout().then(()=> alert('See you soon!'))
          window.location.href = "homepage.html";
        }
      });
    });
  }
  else{
    if (homeMessageElement){homeMessageElement.textContent = "Contribute your data in SOLID to research with full control and privacy preserved."}
    document.getElementById("logStatusPage").textContent = "Log In";
    document.getElementById("logStatusFollowing").textContent = "Log In";
  }
});
// ****** Log In and Log Out (END) *********//


// ****** Fetch data from Pod (START) *********//
async function getTriplesObjects(fetchFrom, fetchSubject, fetchPredicate, option) {

  /* 1. Fetch the Document at `webId`: */
  try{
    const fetchFromDoc = await fetchDocument(fetchFrom);
  }
  catch(err) {
    alert(err.message) ;
  }
  finally{

    const fetchFromDoc = await fetchDocument(fetchFrom);

    if (option){
      /* 2. Read the Subject representing the current user's profile: */
      const getTriples = fetchFromDoc.getTriples();
      return getTriples
    }
    
    else{
      /* 3. Get their triples or objects */
      const getSubject = fetchFromDoc.getSubject(fetchSubject);
      if (fetchPredicate) {
        const getObjects = getSubject.getAllLiterals(fetchPredicate).concat(getSubject.getAllRefs(fetchPredicate));
        return getObjects
      }
      else{
        const getObjects = getSubject.getTriples()
        return getObjects
      }
    }
  }
}
// ****** Fetch data from Pod (END) *********//


// *** Generate table for request cards (START) ***//
function generateTableHead(table, data) {
  let thead = table.createTHead();
  let row = thead.insertRow();
  for (let key of data) {
    let th = document.createElement("th");
    let text = document.createTextNode(key);
    th.appendChild(text);
    row.appendChild(th);
  }
}

function generateTable(table, data) {
  for (let element of data) {
    let row = table.insertRow();
    for (let key in element) {
      let cell = row.insertCell();
      let text = document.createTextNode(element[key]);
      cell.appendChild(text);
    }
  }
}

function printTable(table, tripleResults, append) {
  let data = Object.keys(tripleResults[0]);
  if (!append){
    while(table.hasChildNodes()){table.removeChild(table.firstChild);}
  }
  if (!table.hasChildNodes()){
    generateTableHead(table, data);
  }
  generateTable(table, tripleResults);
}
// *** Generate table for request cards (END) ***//

// *** Setting up a reading and creating data model (START) ***//
async function getNotesList(profileHead, fileLocation, fileName) {
  const fetchProfile = profileHead + "profile/card#me";
  const webIdDoc = await fetchDocument(fetchProfile);
  const profile = webIdDoc.getSubject(fetchProfile);

  /* 1. Check if a Document tracking our notes already exists. */
  if (fileLocation.includes("public")){
    var pubPriTypeIndexRef = profile.getRef(solid.publicTypeIndex);
    var predicateIndex =  "public/" + fileName;
  }
  else if (fileLocation.includes("private")){
    var pubPriTypeIndexRef = profile.getRef(solid.privateTypeIndex);
    var predicateIndex =  "private/" + fileName;
  }

  const pubPriTypeIndex = await fetchDocument(pubPriTypeIndexRef); 
  const notesListEntry = pubPriTypeIndex.findSubject(solid.instance, profileHead+predicateIndex);//schema.TextDigitalDocument

  /* 2. If it doesn't exist, create it. */
  if (notesListEntry === null) {
    // We will define this function later:
    return initialiseNotesList(profile, pubPriTypeIndex, predicateIndex).then(()=> alert("New file "+predicateIndex+" is created!"));
  }

  /* 3. If it does exist, fetch that Document. */
  const notesListRef = notesListEntry.getRef(solid.instance);

  return await fetchDocument(notesListRef);
}


async function initialiseNotesList(profile, typeIndex, predicateIndex) {
  // Get the root URL of the user's Pod:
  const storage = profile.getRef(space.storage);

  // Decide at what URL within the user's Pod the new Document should be stored:
  const notesListRef = storage + predicateIndex;

  // Create the new Document:
  const notesList = createDocument(notesListRef);
  await notesList.save();

  // Store a reference to that Document in the public Type Index for `schema:dataFeedElement`:
  const typeRegistration = typeIndex.addSubject();
  typeRegistration.addRef(rdf.type, solid.TypeRegistration)
  typeRegistration.addRef(solid.instance, notesList.asRef())
  typeRegistration.addRef(solid.forClass, schema.dataFeedElement)
  await typeIndex.save([ typeRegistration ]);

  // And finally, return our newly created (currently empty) notes Document:
  return notesList;
}

// Add note in the file 
async function addNote(profileHead, addedTableDict, notesList) {

  const fetchProfile = profileHead + "profile/card#me";
  // Initialise the new Subject:
  const newDataElement = notesList.addSubject();
  // Indicate that the Subject is a schema:dataFeedElement:
  newDataElement.addRef(rdf.type, schema.dataFeedElement);
  // Set the Subject's `schema:text` to the actual note contents:
  // Store the date the note was created (i.e. now):
  newDataElement.addDateTime(schema.dateCreated, new Date(Date.now()));
  
  newDataElement.addRef(schema.creator, fetchProfile);
  newDataElement.addRef(requestDataControllerGlobal, fetchProfile);

  for (let i=0; i<addedTableDict.length; i++){
    let predicateItem = addedTableDict[i].Predicate
    let objectItem = addedTableDict[i].Object
    if (Number(objectItem)){
      if (Number(objectItem) === parseInt(objectItem, 10)){
        newDataElement.addInteger(predicateItem, parseInt(objectItem));
      }
      else{
        newDataElement.addDecimal(predicateItem, parseFloat(objectItem));
      }
    }
    else if (objectItem.includes("http://") || objectItem.includes("https://")){
      newDataElement.addRef(predicateItem, objectItem);
    }
    else {
      try{
        newDataElement.addDateTime(predicateItem, new Date(objectItem));
      }catch{
        newDataElement.addString(predicateItem, objectItem);
      }
    };
  }
  const success = await notesList.save([newDataElement]);
  return success;
}
// *** Setting up a reading and creating data model (END) ***//

// *** Register a new user and generate key pairs (START) ***//
async function generatePublicKeyPair(fetchProfile, userName, affiliance) {

  const webIdDoc = await fetchDocument(fetchProfile);
  const profile = webIdDoc.getSubject(fetchProfile);

  /* 1. Check if a Document tracking our registration already exists. */
  const privateTypeIndexRef = profile.getRef(solid.privateTypeIndex);
  const privateTypeIndex = await fetchDocument(privateTypeIndexRef); 
  const userAuthEntryList = privateTypeIndex.findSubjects(solid.forClass, schema.RegisterAction);//schema.TextDigitalDocument

  /* 2. If it doesn't exist, create it. */
  if (userAuthEntryList.length == 0) {
    initialiseRegisteredUser(profile, privateTypeIndex, userName, affiliance).then(response => {
      alert(response)
      return response;
    });
  }
  else{
    return "You have registered already!"
  }
}

async function initialiseRegisteredUser(profile, typeIndex, userName, affiliance) {

  // Generate public-private key pairs
  const publicPrivateKeyPair = sign.keyPair();
  const publicKey = encodeBase64(publicPrivateKeyPair.publicKey);
  const privateKey = encodeBase64(publicPrivateKeyPair.secretKey);

  // Get the root URL of the user's Pod:
  const storage = profile.getRef(space.storage);

  // Create the new Document:
  const registerList = createDocument(storage + 'private/registration.ttl');
  const registerUser = registerList.addSubject();
  registerUser.addRef(rdf.type, schema.RegisterAction);
  registerUser.addString(schema.name, userName);
  registerUser.addString(schema.affiliation, affiliance);
  registerUser.addString("http://schema.org/hasCredential", privateKey);
  await registerList.save([registerUser]);

  // Add public key to app server pod
  await data[userRegisterRef+'#'+ storage + 'profile/card#me']["http://schema.org/hasCredential"].add(literal(publicKey));

  // Store a reference to that Document in the public Type Index for `schema:dataFeedElement`:
  const typeRegistration = typeIndex.addSubject();
  typeRegistration.addRef(rdf.type, solid.TypeRegistration);
  typeRegistration.addRef(solid.instance, registerList.asRef());
  typeRegistration.addRef(solid.forClass, schema.RegisterAction);
  await typeIndex.save([ typeRegistration ]);
  return "Successfully registered!";
}
// *** Register a new user and generate key pairs (END) ***//


// *** Read and create data request (START) *** //
async function getRequestList(fetchProfile) {

  const webIdDoc = await fetchDocument(fetchProfile);
  const profile = webIdDoc.getSubject(fetchProfile);

  /* 1. Check if a Document tracking our notes already exists. */
  const publicTypeIndexRef = profile.getRef(solid.publicTypeIndex);
  const publicTypeIndex = await fetchDocument(publicTypeIndexRef); 
  // const requestListEntryList = publicTypeIndex.findSubjects(solid.forClass, "http://schema.org/AskAction");//schema.TextDigitalDocument
  const requestListEntryList = publicTypeIndex.findSubjects(solid.forClass, requestPersonalDataHandlingGlobal)

  if (requestListEntryList.length > 0) {
    for (let i=0;i<requestListEntryList.length;i++){
      const requestListRef = requestListEntryList[i].getRef(solid.instance);
      if (requestListRef){
        if (requestListRef.toString()===fetchProfile.slice(0, fetchProfile.length-15)+'public/request.ttl'){
          return await fetchDocument(requestListRef);
        }
      }
    }
  }/* 2. If it doesn't exist, create it. */
  return initialiseRequestList(profile, publicTypeIndex).then(()=> {
    alert("New file 'public/request.ttl'is created!")
  });
}

async function initialiseRequestList(profile, typeIndex) {
  // Get the root URL of the user's Pod:
  const storage = profile.getRef(space.storage);

  // Decide at what URL within the user's Pod the new Document should be stored:
  const requestListRef = storage + 'public/request.ttl';

  // Create the new Document:
  const requestList = createDocument(requestListRef);
  await requestList.save();

  // Store a reference to that Document in the public Type Index for `schema:dataFeedElement`:
  const typeRegistration = typeIndex.addSubject();
  typeRegistration.addRef(rdf.type, solid.TypeRegistration)
  typeRegistration.addRef(solid.instance, requestList.asRef())
  // typeRegistration.addRef(solid.forClass, "http://schema.org/AskAction")
  typeRegistration.addRef(solid.forClass, requestPersonalDataHandlingGlobal)
  await typeIndex.save([ typeRegistration ]);

  // And finally, return our newly created (currently empty) notes Document:
  const firstRequestMessage = document.getElementById("firstRequestMessage");
  firstRequestMessage.textContent = "New file 'public/request.ttl' is created and initialized in your Solid Pod. -> "+ storage + 'public/request.ttl';
  return requestList;
}


// Add request to the file 
async function addRequest(fetchProfile, content, requestList) {

  // User read his signing key from his pod
  const userRegisterKeyRef = "https://"+fetchProfile.substring(fetchProfile.lastIndexOf("https://") + 8, fetchProfile.lastIndexOf("/profile/card#me"))+"/private/registration.ttl";
  const userRegisterKeyDoc = await fetchDocument(userRegisterKeyRef); 
  const userRegisterKeyTriples = userRegisterKeyDoc.getTriples();
  let privateKey = "";
  for (let i=0; i<userRegisterKeyTriples.length; i++){
    if (userRegisterKeyTriples[i].predicate.id == "http://schema.org/hasCredential"){
      privateKey = decodeBase64(userRegisterKeyTriples[i].object.value);
    }
  }

  if (privateKey.length==0){
    alert("Cannot find valid credential. Please register first!")
  }else{
    
    // Initialise the new Subject:
    var newDataElement = requestList.addSubject();
    // Indicate that the Subject is a schema:dataFeedElement:
    newDataElement.addRef(rdf.type, "http://schema.org/AskAction");
    newDataElement.addRef(rdf.type, requestPersonalDataHandlingGlobal);
    // Set the Subject's `schema:text` to the actual note contents:
    // Store the date the note was created (i.e. now):
    
    // Use the schema as you want 
    newDataElement.addRef(schema.creator, fetchProfile);
    newDataElement.addRef(requestDataControllerGlobal, fetchProfile);

    if (content.purposeClass) {
      for (let i=0; i<content.purposeClass.length; i++){
        newDataElement.addRef(requestPurposeClassGlobal, content.purposeClass[i]);
      } 
    }
    if (content.purpose) {newDataElement.addString(requestPurposeLabelGlobal, content.purpose);}

    if (content.personalDataCategory) {
      for (let i=0; i<content.personalDataCategory.length; i++){
        newDataElement.addRef(requestDataCategoryGlobal, content.personalDataCategory[i]);
      } 
    }

    // if (content.ontology) {
    //   for (let i=0; i<content.ontology.length; i++){
    //     newDataElement.addRef(requestOntologyGlobal, content.ontology[i]);
    //   } 
    // }
    if (content.data) {
      for (let i=0; i<content.data.length; i++){
        newDataElement.addRef(requestDataElementGlobal, content.data[i]);
      } 
    }
    if (content.period) {newDataElement.addDateTime(requestExpiryGlobal, content.period);}
    if (content.numInstance) {newDataElement.addInteger(requestCollectionSizeGlobal, parseInt(content.numInstance));}
    
    if (content.dataProcessingCategory) {
      for (let i=0; i<content.dataProcessingCategory.length; i++){
        newDataElement.addRef(requestDataProcessGlobal, content.dataProcessingCategory[i]);
      } 
    }
    
    if (content.model) {newDataElement.addString(requestAnalysisLogicGlobal, content.model);}
    if (content.consequence) {newDataElement.addString(requestConsequenceGlobal, content.consequence);}
    // if (content.recipient) {newDataElement.addString(requestRecipientGlobal, content.recipient);}

    const createdDate = new Date(Date.now())
    newDataElement.addDateTime(schema.dateCreated, createdDate);

    await requestList.save([newDataElement]);

    // add request to register list 
    const fetchRegisterLinkFile = await fetchDocument(registerFileURL)
    
    const newRegisterRecord = fetchRegisterLinkFile.addSubject();
    newRegisterRecord.addRef(schema.recordedAs, newDataElement.asRef());
    newRegisterRecord.addRef(schema.creator, fetchProfile);
    
    const requestContent = saveRequestLocally(newDataElement, content, fetchProfile, createdDate);
    const signature = sign.detached(decodeUTF8(requestContent), privateKey);
    newRegisterRecord.addString(schema.validIn, encodeBase64(signature));
    
    await fetchRegisterLinkFile.save([newRegisterRecord])
    return "Thank you for posting a new data request! You can find the RDF file of the request in the public/request.ttl in your SOLID pod";
  };
}
// *** Read and create data request (END) *** //

// ARRANGE
// *** Customize time format (START) *** //
function formatTime (dateTime){
  var dd = String(dateTime.getDate()).padStart(2, '0');
  var mm = String(dateTime.getMonth() + 1).padStart(2, '0'); //January is 0!
  var yyyy = dateTime.getFullYear();
  var hr = String(dateTime.getHours()+(dateTime.getTimezoneOffset())/60).padStart(2, '0');
  var min = String(dateTime.getMinutes()).padStart(2, '0');
  var sec = String(dateTime.getSeconds()).padStart(2, '0');
  return yyyy + '-' + mm + '-' + dd + 'T' + hr + ':' + min + ':'+ sec+'Z'
}
// *** Customize time format (END) *** //

// *** Save data request locally for signing the request (START) *** //
function saveRequestLocally(newDataElement, content, fetchProfile, createdDate){

  const subject = newDataElement.asRef(); // `<${}> <${}> <${}>.\n`
  let requestTripleString = `<${subject}> <${rdf.type}> <http://schema.org/AskAction>.`;
  requestTripleString += `<${subject}> <${rdf.type}> ${requestPersonalDataHandlingGlobal}.`;
  // requestTripleString += `<${subject}> ${requestRecipientGlobal} ${content.recipient}.`;
  requestTripleString += `<${subject}> ${requestAnalysisLogicGlobal} ${content.model}.`;
  requestTripleString += `<${subject}> ${requestCollectionSizeGlobal} ${content.numInstance}.`;
  requestTripleString += `<${subject}> <${schema.creator}> <${fetchProfile}>.`;
  requestTripleString += `<${subject}> <${requestDataControllerGlobal}> <${fetchProfile}>.`;
  // requestTripleString += `<${subject}> <${schema.dateCreated}> ${formatTime(createdDate)}.`; //${createdDate.toString().split(" (")[0]}
  // requestTripleString += `<${subject}> <${schema.endDate}> ${formatTime(content.period)}.`;//${content.period.toString().split(" (")[0]}
  requestTripleString += `<${subject}> <http://schema.org/purpose> ${content.purpose}.`;
  if (content.data) {
    let sort_content_data = content.data.sort()
    for (let i=0; i<content.data.length; i++){
      requestTripleString += `<${subject}> <${requestDataElementGlobal}> <${sort_content_data[i]}>.`;
    } 
  }
  if (content.purposeClass) {
    let sort_purposeClass = content.purposeClass.sort()
    for (let i=0; i<content.purposeClass.length; i++){
      requestTripleString += `<${subject}> <${requestPurposeClassGlobal}> <${sort_purposeClass[i]}>.`;
    } 
  }
  if (content.personalDataCategory) {
    let sort_personalDataCategory = content.personalDataCategory.sort()
    for (let i=0; i<content.personalDataCategory.length; i++){
      requestTripleString += `<${subject}> <${requestDataCategoryGlobal}> <${sort_personalDataCategory[i]}>.`;
    } 
  }
  if (content.dataProcessingCategory) {
    let sort_dataProcessingCategory = content.dataProcessingCategory.sort()
    for (let i=0; i<content.dataProcessingCategory.length; i++){
      requestTripleString += `<${subject}> <${requestDataProcessGlobal}> <${sort_dataProcessingCategory[i]}>.`;
    } 
  }
  // console.log(requestTripleString)
  return requestTripleString
}
// *** Save data request locally for signing the request (END) *** //

// *** Fetch document function (START) ***//
async function fetchRequestURL(fetchRequest) {
  return await fetchDocument(fetchRequest)
}
// *** Fetch document function (END) ***//

// *** Create a participation record (START) ***//
async function getParticipateList(fetchProfile) {

  const webIdDoc = await fetchDocument(fetchProfile);
  const profile = webIdDoc.getSubject(fetchProfile);

  /* 1. Check if a Document tracking our notes already exists. */
  const privateTypeIndexRef = profile.getRef(solid.privateTypeIndex);
  const privateTypeIndex = await fetchDocument(privateTypeIndexRef); 
  // const participateListEntryList = privateTypeIndex.findSubjects(solid.forClass, joinActionGlobal);//schema.TextDigitalDocument
  const participateListEntryList = privateTypeIndex.findSubjects(solid.forClass, joinConsentGlobal)

  /* 2. If it doesn't exist, create it. */
  if (participateListEntryList.length == 0) {
    initialiseParticipateList(profile, privateTypeIndex).then(participateList => {
      alert("As this is your first time to participate in a data request, we have created 'private/participation.ttl'is for you! Please approve the request again. ");
      return participateList;
    });
  }
  else{
    // 3. If it exists, fetch the participation.ttl data
    for (let i=0;i<participateListEntryList.length;i++){
      const participateListRef = participateListEntryList[i].getRef(solid.instance);
      if (participateListRef){
        if (participateListRef.toString()===fetchProfile.slice(0, fetchProfile.length-15)+'private/participation.ttl'){
          return await fetchDocument(participateListRef);
        }
      }
    }
  }
}

async function initialiseParticipateList(profile, typeIndex) {
  // Get the root URL of the user's Pod:
  const storage = profile.getRef(space.storage);

  // Decide at what URL within the user's Pod the new Document should be stored:
  const participateListRef = storage + 'private/participation.ttl';

  // Create the new Document:
  const participateList = createDocument(participateListRef);
  await participateList.save();

  // Store a reference to that Document in the public Type Index for `schema:dataFeedElement`:
  const typeRegistration = typeIndex.addSubject();
  typeRegistration.addRef(rdf.type, solid.TypeRegistration)
  typeRegistration.addRef(solid.instance, participateList.asRef())
  typeRegistration.addRef(solid.forClass, joinActionGlobal)
  typeRegistration.addRef(solid.forClass, joinConsentGlobal)
  await typeIndex.save([ typeRegistration ]);

  // And finally, return our newly created (currently empty) notes Document:
  return participateList;
}


// Add participation record to the file 
async function addParticipation(fetchProfile, requestList, participateRequestId, participateList, AccessControlList, collectionSize, endDate, participate_period, data_recipient, privacyOption) {
  // get the number of responses (participants)
  const responseSize = requestList.findSubjects(rdf.type, joinConsentGlobal).length;
  // the current date
  const responseDate = new Date(Date.now());
  // get the webIDs of participants
  const responseUser = participateList.findSubjects(joinDataSubjectGlobal, fetchProfile);
  let responseUserExisted = false;

  // check if the participant already responded to the data request
  for (let i =0;i<responseUser.length;i++){
    if (responseUser[i].getRef(joinConsentNoticeGlobal) == participateRequestId){
      responseUserExisted = true;
    }
  }

  if (responseSize <= collectionSize){
    if (responseDate <= endDate){ 
      if (!responseUserExisted){
        if (participate_period >= new Date(Date.now())){
          if (!privacyOption){
            // User read his signing key from his pod
            const userRegisterKeyRef = "https://"+fetchProfile.substring(fetchProfile.lastIndexOf("https://") + 8, fetchProfile.lastIndexOf("/profile/card#me"))+"/private/registration.ttl";
            const userRegisterKeyDoc = await fetchDocument(userRegisterKeyRef); 
            const userRegisterKeyTriples = userRegisterKeyDoc.getTriples();
            let privateKey = "";
            for (let i=0; i<userRegisterKeyTriples.length; i++){
              if (userRegisterKeyTriples[i].predicate.id == "http://schema.org/hasCredential"){
                privateKey = decodeBase64(userRegisterKeyTriples[i].object.value);
              }
            }
            if (privateKey.length==0){
              alert("Cannot find valid credential. Please register first!")
            }else{
              let expiry_single = "https://schema.org/False"
              if (new Date(Date.now())>endDate){
                let expiry_single = "https://schema.org/True"
              }
              // add participate record to participation.ttl
              const newParticipateDataElement = participateList.addSubject();
              newParticipateDataElement.addRef(rdf.type, joinActionGlobal);
              newParticipateDataElement.addRef(rdf.type, joinConsentGlobal);

              newParticipateDataElement.addRef(joinDataSubjectGlobal, fetchProfile);
              newParticipateDataElement.addRef(joinConsentNoticeGlobal, participateRequestId);
              newParticipateDataElement.addDateTime(joinDataCreatedGlobal, new Date(Date.now()));
              newParticipateDataElement.addDateTime(joinhasProvisionTimeGlobal, new Date(Date.now()));
              newParticipateDataElement.addRef(joinhasProvisionMethodGlobal, "https://sunchang0124.github.io/dist/participate.html");
              newParticipateDataElement.addDateTime(joinhasWithdrawalTimeGlobal, participate_period);
              newParticipateDataElement.addRef(joinDataRecipientGlobal, data_recipient);
              newParticipateDataElement.addRef(joinhasExpiryGlobal, expiry_single);
              newParticipateDataElement.addDateTime(joinhasExpiryTimeGlobal, endDate);


              // add participate record to Pod Server's request-response file 
              const registerRequestResponseFileURL = registerParticipationFolder + participateRequestId.split('#')[1] + ".ttl";
              
              /* 1. Check if a participation register list already exists. */
              const registerIndex = await fetchDocument(registerIndexRef); 
              const registerIndexEntryList = registerIndex.getSubject(registerRequestResponseFileURL).getRef(rdf.type);

              /* 2. If it doesn't exist, create it. */
              if (!registerIndexEntryList) {

                // Create the new Document
                data[registerRequestResponseFileURL].put()

                // Add record in the registerIndex.ttL
                await data[registerIndexRef+'#'+participateRequestId.split('#')[1]]["http://schema.org/RegisterAction"].add(namedNode(registerRequestResponseFileURL));
              }
              
              // 3. If it exists, add participation record in registerParticipation.ttl
              const addSubjectID =  newParticipateDataElement.asRef().split('#')[1];
              await data[registerRequestResponseFileURL+'#'+addSubjectID][rdf.type].add(namedNode(joinActionGlobal));
              await data[registerRequestResponseFileURL+'#'+addSubjectID][rdf.type].add(namedNode(joinConsentGlobal));
              await data[registerRequestResponseFileURL+'#'+addSubjectID][joinDataSubjectGlobal].add(namedNode(fetchProfile));
              await data[registerRequestResponseFileURL+'#'+addSubjectID][joinConsentNoticeGlobal].add(namedNode(participateRequestId));
              const currentDateTime = new Date(Date.now())
              await data[registerRequestResponseFileURL+'#'+addSubjectID][joinDataCreatedGlobal].add(literal(currentDateTime.toISOString(), "http://www.w3.org/2001/XMLSchema#dateTime"));
              await data[registerRequestResponseFileURL+'#'+addSubjectID][joinhasProvisionTimeGlobal].add(literal(currentDateTime.toISOString(), "http://www.w3.org/2001/XMLSchema#dateTime"));
              await data[registerRequestResponseFileURL+'#'+addSubjectID][joinhasProvisionMethodGlobal].add(namedNode("https://sunchang0124.github.io/dist/participate.html"));
              await data[registerRequestResponseFileURL+'#'+addSubjectID][joinhasWithdrawalTimeGlobal].add(literal(participate_period.toISOString(), "http://www.w3.org/2001/XMLSchema#dateTime"));
              await data[registerRequestResponseFileURL+'#'+addSubjectID][joinDataRecipientGlobal].add(namedNode(data_recipient));
              await data[registerRequestResponseFileURL+'#'+addSubjectID][joinhasExpiryGlobal].add(namedNode(expiry_single));
              await data[registerRequestResponseFileURL+'#'+addSubjectID][joinhasExpiryTimeGlobal].add(namedNode("http://www.w3.org/2001/XMLSchema#dateTime"));
                              
              const signature = sign.detached(decodeUTF8(participateRequestId.split('#')[1]), privateKey);
 
              await data[registerRequestResponseFileURL+'#'+addSubjectID][schema.validIn].add(literal(encodeBase64(signature)));
           
              await participateList.save([newParticipateDataElement]);
         
              // add viewer access to the requester automatically (Users have to give control access to the application)
              const newRequestAccessControl= AccessControlList.addSubject("Read");
              // const responserWebId = requestList.getSubject(participateRequestId).getRef(schema.creator);

              newRequestAccessControl.addRef(rdf.type, acl.Authorization);
              newRequestAccessControl.addRef(acl.accessTo, dataFileName);
              newRequestAccessControl.addRef(acl.agent, podServerURL); // Give Pod Server/Provider access to read data (responserWebId)
              newRequestAccessControl.addRef(acl.mode, acl.Read);
              newRequestAccessControl.addDateTime(schema.endDate, participate_period);
      
              await AccessControlList.save([newRequestAccessControl]);
            }
          }
          return true;

        }else{alert("Participation end date has to be later than today.")};
      }else{alert("You are in the participates list already.")};
    }else{alert("Sorry, request end date has expired.")};
  }else{alert("Sorry, request has enough participants.")};
}
// *** Create a participation record (END) ***//

async function getRecommender(input){

  let response = await fetch("http://data.bioontology.org/recommender?input="+input+"&apikey=21646475-b5a0-4e92-8aba-d9fcfcfea388");
  let data = await response.json();
  let item = [];

  for (let i=0; i<5; i++){
    item.push({Text: data[i]['ontologies'][0]['acronym'], FoundURI: data[i]['ontologies'][0]['@id'], Score:data[i]['evaluationScore']}) 
  }
  return item;
}

async function getDataLabels(input){

  let response = await fetch("http://data.bioontology.org/search?q="+input+"&apikey=21646475-b5a0-4e92-8aba-d9fcfcfea388");
  let data = await response.json();
  let item = data['collection'][0]['prefLabel']
  return item;
}

// Namespace Suggestions
// searchIcons.forEach(function(each_search){
//   each_search.addEventListener("click", function(e){
//     e.preventDefault();
//     const styles = e.currentTarget.classList;
//     const tables = document.querySelectorAll(".table");    

//     if (styles.contains('predicateSuggestion')){
//       var addTripleSearch = document.getElementById("addTriplePredicate").value;
//     }else if (styles.contains('objectSuggestion')){
//       var addTripleSearch = document.getElementById("addTripleObject").value;
//     }

//     // GET the URL from the text user put
//     var resultObj = [];
//     if (addTripleSearch){
//       var ontologyDataElement = document.getElementById("input_ontologyDataElement").value;
//       getUsers(addTripleSearch, ontologyDataElement, "searchPurpose").then(resultObj => {
//         if (resultObj.length==0){
//           resultObj.push({Text:addTripleSearch, FoundURI:"Sorry, we couldn't find matched identifiers(URI)."})
//         }
//         tables.forEach(function(table){
//           if (table.classList.contains("searchTable")){
//             printTable(table, resultObj, false);
//           }
//         });
//       });
//     }
//   });
// });
// *** Search URI from text (END) ***//


// *** Write and generate requests to cards (START) ***//
function writeAllRequest(profile, requestTriples, fetchRequest){
  let requestContent = Object();  
  let dataElementList = []
  let purposeClassList = []
  let personalDataCategoryList = []
  let dataProcessingCategoryList = []
  // let ontologyList = []

  for (let i = 0; i < requestTriples.length; i++){
    if (requestTriples[i].subject.id === fetchRequest){
      requestContent.webid = profile.asRef();
      requestContent.name = profile.getString(foaf.name);
      requestContent.organization = profile.getString("http://www.w3.org/2006/vcard/ns#organization-name");
      requestContent.image = profile.getRef(vcard.hasPhoto);

      requestContent.url = fetchRequest;
      if (requestTriples[i].predicate.id === requestPurposeClassGlobal){
        purposeClassList.push(requestTriples[i].object.value);}
        // requestContent.purposeClass = "Class of purpose: "+ requestTriples[i].object.value;}
      if (requestTriples[i].predicate.id === requestPurposeLabelGlobal){
        requestContent.purpose = "Purpose: "+ requestTriples[i].object.value;}
      if (requestTriples[i].predicate.id === requestDataCategoryGlobal){
        personalDataCategoryList.push(requestTriples[i].object.value);}
      if (requestTriples[i].predicate.id === requestDataProcessGlobal){
        dataProcessingCategoryList.push(requestTriples[i].object.value);}
      // if (requestTriples[i].predicate.id === requestOntologyGlobal){
      //   ontologyList.push(requestTriples[i].object.value);}
      if (requestTriples[i].predicate.id === requestExpiryGlobal){
        requestContent.period = "End date: " + requestTriples[i].object.value;}
      if (requestTriples[i].predicate.id === requestAnalysisLogicGlobal){
        requestContent.analysis = "Analysis: " + requestTriples[i].object.value;}
      if (requestTriples[i].predicate.id === requestCollectionSizeGlobal){
        requestContent.numInstance = requestTriples[i].object.value;}
      // if (requestTriples[i].predicate.id === requestRecipientGlobal){
      //   requestContent.recipient = "Data Recipient: " + requestTriples[i].object.value;}
      if (requestTriples[i].predicate.id === requestConsequenceGlobal){
        requestContent.consequence = "Consequence of data process: " + requestTriples[i].object.value;}
      if (requestTriples[i].predicate.id === requestDataElementGlobal){
        dataElementList.push(requestTriples[i].object.value);}
    }
    requestContent.purposeClass = "Class of purpose: " + purposeClassList;
    requestContent.personalDataCategory = "Personal data categories: " + personalDataCategoryList;
    requestContent.dataProcessingCategory = "Data processing categories: " + dataProcessingCategoryList;
    // requestContent.ontology = ontologyList;
    requestContent.dataElement = "Requested data: "+dataElementList;
  } 
  if (Object.keys(requestContent).length < 2){
    requestContent = false;
  }
  return requestContent
}
  
/**************************
 * Generate request cards *
 **************************/
async function generateCards(requestContentList, userRole, session, participant_basket){
    
  var cleanContainer = document.getElementById("Container");
  cleanContainer.innerHTML = "";
  
  const div_cardsContainer = document.createElement("div");
  div_cardsContainer.className = "ui fluid fixed cards";
  div_cardsContainer.id = "cardsContainer";
  document.getElementById('Container').appendChild(div_cardsContainer);

  let purpose_label = {CommercialInterest:"red", 
                        ResearchAndDevelopment: "blue", 
                        Security: "teal", 
                        ServiceOptimization: "orange", 
                        ServicePersonalization: "green", 
                        ServiceProvision: "yellow", 
                        LegalObligation: "purple"}

  for(var i=0; i < requestContentList.length; i++){

    // Generate request cards
    const div_card = document.createElement("div");
    div_card.className = "card";
    div_card.id = "cardID"+i.toString();
    document.getElementById('cardsContainer').appendChild(div_card);

    const div_label = document.createElement("a");
    let purpose_label_content = requestContentList[i].purposeClass.split(",")[0].toString().split(": ")[1].split("#")[1];
    div_label.className = "ui " + purpose_label[purpose_label_content] +" ribbon label";
    div_label.id = "labelID"+i.toString();
    div_label.textContent =  purpose_label_content;
    document.getElementById('cardID'+i.toString()).appendChild(div_label);
  
    const div_content = document.createElement("a");
    div_content.href = requestContentList[i].url; 
    div_content.className = "content";
    div_content.id = "contentID"+i.toString();
    document.getElementById('cardID'+i.toString()).appendChild(div_content);
  
    const div_img = document.createElement("img");
    div_img.className = "right floated mini ui image";
    div_img.src = requestContentList[i].image; //requestContentList[i].image; //
    div_img.id = "imgID"+i.toString();
    document.getElementById('contentID'+i.toString()).appendChild(div_img);
  
    const div_header = document.createElement("div");
    div_header.className = "header";
    div_header.id = "headerID"+i.toString();
    div_header.textContent = requestContentList[i].name; //"Chang Sun"
    document.getElementById('contentID'+i.toString()).appendChild(div_header);
  
    const div_meta = document.createElement("div");
    div_meta.className = "meta";
    div_meta.id = "metaID"+i.toString();
    div_meta.textContent = requestContentList[i].organization; //"IDS";
    document.getElementById('contentID'+i.toString()).appendChild(div_meta);
  
    const div_classPurpose = document.createElement("div");
    div_classPurpose.className = "description";
    div_classPurpose.id = "classPurposeID"+i.toString();
    div_classPurpose.textContent = "Class of purpose: "; //equestContentList[i].purposeClass; //"Purpose Class";
    document.getElementById('contentID'+i.toString()).appendChild(div_classPurpose);


    const listofpurpose = requestContentList[i].purposeClass.split(",");
    let href_classpurpose = document.createElement("a");
    let link_classpurpose = document.createTextNode(listofpurpose[0].toString().split(": ")[1].split("#")[1]);
    href_classpurpose.appendChild(link_classpurpose);
    href_classpurpose.href = listofpurpose[0].toString().split(": ")[1];
    document.getElementById('classPurposeID'+i.toString()).appendChild(href_classpurpose);

    
    for (let itr=1;itr<3;itr++){
      if (itr<listofpurpose.length){
        document.getElementById('classPurposeID'+i.toString()).appendChild(document.createElement("div"));
        let href_classpurpose_1 = document.createElement("a");

        let link_classpurpose = document.createTextNode(listofpurpose[itr].toString().split("#")[1]);
        href_classpurpose_1.appendChild(link_classpurpose);
        href_classpurpose_1.href = listofpurpose[itr];
        document.getElementById('classPurposeID'+i.toString()).appendChild(href_classpurpose_1);
      }
      if (listofpurpose.length>3 && itr==2){
        const div_endPurpose = document.createElement("div");
        div_endPurpose.textContent = "... ... " + (listofpurpose.length-3).toString() + " more classes of purpose";
        document.getElementById('classPurposeID'+i.toString()).appendChild(div_endPurpose);
      }
    }





    const div_description = document.createElement("div");
    div_description.className = "description";
    div_description.id = "descriptionID"+i.toString();
    div_description.textContent = requestContentList[i].purpose; //"Purpose";
    document.getElementById('contentID'+i.toString()).appendChild(div_description);

    const div_personalDataCategory = document.createElement("div");
    div_personalDataCategory.className = "description";
    div_personalDataCategory.id = "div_personalDataCategoryID"+i.toString();
    div_personalDataCategory.textContent = "Personal Data Category: "; //requestContentList[i].personalDataCategory; //"Personal Data Category";
    document.getElementById('contentID'+i.toString()).appendChild(div_personalDataCategory);


    const listofpersonalDataCategory = requestContentList[i].personalDataCategory.split(",");
    let href_personalDataCategory = document.createElement("a");
    let link_personalDataCategory = document.createTextNode(listofpersonalDataCategory[0].toString().split(": ")[1].split("#")[1]);
    href_personalDataCategory.appendChild(link_personalDataCategory);
    href_personalDataCategory.href = listofpersonalDataCategory[0].toString().split(": ")[1];
    document.getElementById('div_personalDataCategoryID'+i.toString()).appendChild(href_personalDataCategory);

    
    for (let itr=1;itr<3;itr++){
      if (itr<listofpersonalDataCategory.length){
        document.getElementById('div_personalDataCategoryID'+i.toString()).appendChild(document.createElement("div"));
        let href_personalDataCategory_1 = document.createElement("a");
        let link_personalDataCategory = document.createTextNode(listofpersonalDataCategory[itr].toString().split("#")[1]);
        href_personalDataCategory_1.appendChild(link_personalDataCategory);
        href_personalDataCategory_1.href = listofpersonalDataCategory[itr];
        document.getElementById('div_personalDataCategoryID'+i.toString()).appendChild(href_personalDataCategory_1);
      }
      if (listofpersonalDataCategory.length>3 && itr==2){
        const div_endDataCategory = document.createElement("div");
        div_endDataCategory.textContent = "... ... " + (listofpersonalDataCategory.length-3).toString() + " more personal data categories"; 
        document.getElementById('div_personalDataCategoryID'+i.toString()).appendChild(div_endDataCategory);
      }
    }


    const div_dataProcessingCategory = document.createElement("div");
    div_dataProcessingCategory.className = "description";
    div_dataProcessingCategory.id = "div_dataProcessingCategoryID"+i.toString();
    div_dataProcessingCategory.textContent = "Data Processing Category: "; //requestContentList[i].dataProcessingCategory; //"Data Processing Category";
    document.getElementById('contentID'+i.toString()).appendChild(div_dataProcessingCategory);


    const listofdataProcessingCategory = requestContentList[i].dataProcessingCategory.split(",");
    let href_dataProcessingCategory = document.createElement("a");
    let link_dataProcessingCategory = document.createTextNode(listofdataProcessingCategory[0].toString().split(": ")[1].split("#")[1]);
    href_dataProcessingCategory.appendChild(link_dataProcessingCategory);
    href_dataProcessingCategory.href = listofdataProcessingCategory[0].toString().split(": ")[1];
    document.getElementById('div_dataProcessingCategoryID'+i.toString()).appendChild(href_dataProcessingCategory);

    
    for (let itr=1;itr<3;itr++){
      if (itr<listofdataProcessingCategory.length){
        document.getElementById('div_dataProcessingCategoryID'+i.toString()).appendChild(document.createElement("div"));
        let href_dataProcessingCategory_1 = document.createElement("a");
        let link_dataProcessingCategory = document.createTextNode(listofdataProcessingCategory[itr].toString().split("#")[1]);
        href_dataProcessingCategory_1.appendChild(link_dataProcessingCategory);
        href_dataProcessingCategory_1.href = listofdataProcessingCategory[itr];
        document.getElementById('div_dataProcessingCategoryID'+i.toString()).appendChild(href_dataProcessingCategory_1);
      }
      if (listofdataProcessingCategory.length>3 && itr==2){
        const div_endDataProcessing = document.createElement("div");
        div_endDataProcessing.textContent = "... ... " + (listofdataProcessingCategory.length-3).toString() + " more data elements"; //"period";
        document.getElementById('div_dataProcessingCategoryID'+i.toString()).appendChild(div_endDataProcessing);
      }
    }


    // Request data elements
    
    const div_dataElement = document.createElement("div");
    div_dataElement.className = "description";
    div_dataElement.id = "dataElementID"+i.toString();
    div_dataElement.textContent = "Requested data: " //requestContentList[i].dataElement; //"Data Element";
    document.getElementById('contentID'+i.toString()).appendChild(div_dataElement);

    const listofElement = requestContentList[i].dataElement.split(",");
    let href_dataElement_0 = document.createElement("a");
    let displayLabel = await getDataLabels(listofElement[0].toString().split(": ")[1].split("/").pop())
      // let linkText = document.createTextNode(listofElement[0].toString().split(": ")[1].split("//")[1]);
    let linkText = document.createTextNode(displayLabel)
    href_dataElement_0.appendChild(linkText);
    href_dataElement_0.href = listofElement[0].toString().split(": ")[1];
    document.getElementById('contentID'+i.toString()).appendChild(href_dataElement_0);

    
    for (let itr=1;itr<5;itr++){
      if (itr<listofElement.length){
        document.getElementById('contentID'+i.toString()).appendChild(document.createElement("div"));
        let href_dataElement = document.createElement("a");

        let displayLabel = await getDataLabels(listofElement[itr].toString().split("/").pop())
        // let linkText = document.createTextNode(listofElement[itr].toString().split("//")[1]);
        let linkText = document.createTextNode(displayLabel)
        href_dataElement.appendChild(linkText);
        href_dataElement.href = listofElement[itr];
        document.getElementById('contentID'+i.toString()).appendChild(href_dataElement);
      }
      if (listofElement.length>5 && itr==4){
        const div_endElement = document.createElement("div");
        div_endElement.textContent = "... ... " + (listofElement.length-5).toString() + " more data elements"; //"period";
        document.getElementById('contentID'+i.toString()).appendChild(div_endElement);
      }
    }

    const div_period = document.createElement("div");
    div_period.className = "description";
    div_period.id = "periodID"+i.toString();
    div_period.textContent = requestContentList[i].period; //"period";
    document.getElementById('contentID'+i.toString()).appendChild(div_period);

    const div_numInstance = document.createElement("div");
    div_numInstance.className = "description";
    div_numInstance.id = "instanceID"+i.toString();
    div_numInstance.textContent = "Instances: " + requestContentList[i].numInstance; //"numInstance";
    document.getElementById('contentID'+i.toString()).appendChild(div_numInstance);

    const div_analysis = document.createElement("div");
    div_analysis.className = "description";
    div_analysis.id = "analysisID"+i.toString();
    div_analysis.textContent = requestContentList[i].analysis; //"analysis";
    document.getElementById('contentID'+i.toString()).appendChild(div_analysis);

    const div_consequence = document.createElement("div");
    div_consequence.className = "description";
    div_consequence.id = "consequenceID"+i.toString();
    div_consequence.textContent = requestContentList[i].consequence; //"consequence";
    document.getElementById('contentID'+i.toString()).appendChild(div_consequence);

    // const div_recipient = document.createElement("div");
    // div_recipient.className = "description";
    // div_recipient.id = "recipientID"+i.toString();
    // div_recipient.textContent = requestContentList[i].recipient; //"recipient";
    // document.getElementById('contentID'+i.toString()).appendChild(div_recipient);

    const div_extra = document.createElement("div");
    div_extra.className = "extra content";
    div_extra.id = "extraID"+i.toString();
    document.getElementById('cardID'+i.toString()).appendChild(div_extra);

    if (userRole === "participant"){

      if (session){
        const haveData = participant_basket.some(r=> listofElement.includes(r))
        console.log(haveData)

        if (haveData){

          const div_untilDate_des = document.createElement("div");
          div_untilDate_des.className = "description";
          div_untilDate_des.id = "untilDate_des"+i.toString();
          div_untilDate_des.textContent = "Withdrawal Date: "
          document.getElementById('extraID'+i.toString()).appendChild(div_untilDate_des);

          const div_forDate = document.createElement("div");
          div_forDate.className = "ui transparent input";
          div_forDate.id = "forDate"+i.toString();
          document.getElementById('untilDate_des'+i.toString()).appendChild(div_forDate);

          const div_untilDate = document.createElement("input");
          div_untilDate.type = "date";
          div_untilDate.id = "untilDate"+i.toString();
          document.getElementById("forDate"+i.toString()).appendChild(div_untilDate);

          const div_data_recipient_des = document.createElement("div");
          div_data_recipient_des.className = "description";
          div_data_recipient_des.id = "data_recipient_des"+i.toString();
          div_data_recipient_des.textContent = "Data Recipient: "
          document.getElementById('extraID'+i.toString()).appendChild(div_data_recipient_des);

          const div_data_recipient = document.createElement("select");
          div_data_recipient.className = "ui dropdown";
          div_data_recipient.id = "data_recipient"+i.toString();
          document.getElementById("data_recipient_des"+i.toString()).appendChild(div_data_recipient);
          const div_option_1 = document.createElement("option");
          div_option_1.value = "https://chang.inrupt.net/profile/card#me";
          div_option_1.textContent = "Institute of Data Science";
          document.getElementById("data_recipient"+i.toString()).appendChild(div_option_1);
          const div_option_2 = document.createElement("option");
          div_option_2.value = "https://chang1025.solidcommunity.net/profile/card#me";
          div_option_2.textContent = "Maastricht University";
          document.getElementById("data_recipient"+i.toString()).appendChild(div_option_2);

          const div_buttons = document.createElement("div");
          div_buttons.className = "ui two buttons";
          div_buttons.id = "buttonsID"+i.toString();
          document.getElementById('extraID'+i.toString()).appendChild(div_buttons);
        
          const div_redButton = document.createElement("button");
          div_redButton.className = "ui red toggle Decline button answer index_"+i.toString();
          div_redButton.id = "redButtonID"+i.toString();
          div_redButton.textContent = "Decline";
          document.getElementById('buttonsID'+i.toString()).appendChild(div_redButton);
        
          const div_greenButton = document.createElement("button");
          div_greenButton.className = "ui green toggle Approve button answer index_"+i.toString();
          div_greenButton.id = "greenButtonID"+i.toString();
          div_greenButton.textContent = "Approve";
          document.getElementById('buttonsID'+i.toString()).appendChild(div_greenButton);
        }else{
        
          const div_NoData = document.createElement("h4");
          // div_NoData.className = "content";
          div_NoData.id = "div_NoData_des"+i.toString();
          div_NoData.textContent = "Requested data is not detected in your pod!"
          document.getElementById('extraID'+i.toString()).appendChild(div_NoData);
          
          const div_NoData_buttons = document.createElement("div");
          div_NoData_buttons.className = "ui grey NoDataFeedback button index_"+i.toString();
          div_NoData_buttons.id = "noData_buttonsID"+i.toString();
          div_NoData_buttons.textContent = "Send a message to the researcher."
          document.getElementById('extraID'+i.toString()).appendChild(div_NoData_buttons);

          // document.getElementById("feedback_modal").id = "feedback_modalID"+i.toString(); 
          console.log(1)
          const div_feedback_modal = document.createElement("div");
          div_feedback_modal.className = "ui modal index_"+i.toString();
          div_feedback_modal.id = "feedback_modalID"+i.toString();
          document.getElementById("modal_component").appendChild(div_feedback_modal);
          
          console.log(document.getElementById("feedback_modalID"+i.toString()))

          const div_close_icon = document.createElement("i");
          div_close_icon.className = "close icon";
          document.getElementById("feedback_modalID"+i.toString()).appendChild(div_close_icon); 

          const div_header = document.createElement("div");
          div_header.className = "header";
          div_header.textContent = "Send a message to the researcher";
          document.getElementById("feedback_modalID"+i.toString()).appendChild(div_header); 

          const div_content = document.createElement("div");
          div_content.className = "feedback content";
          div_content.id = "feedback_contentID"+i.toString();
          document.getElementById("feedback_modalID"+i.toString()).appendChild(div_content); 

          const div_form = document.createElement("div");
          div_form.className = "ui form";
          div_form.id = "formID"+i.toString();
          document.getElementById("feedback_contentID"+i.toString()).appendChild(div_form); 

          // const div_extension = document.createElement("grammarly-extension");
          // div_extension.style = "position: absolute; top: 0px; left: 0px; pointer-events: none;";
          // div_extension.className ="cGcvT";
          // div_extension.id = "formID"+i.toString();
          // document.getElementById("formID"+i.toString()).appendChild(div_extension); 
    
          const div_header4 = document.createElement("h4");
          div_header4.className ="ui dividing header";
          div_header4.id = "header4ID"+i.toString();
          div_header4.textContent = "Topic of your message:";
          document.getElementById("formID"+i.toString()).appendChild(div_header4); 

          const div_feedback_dropdown = document.createElement("select");
          div_feedback_dropdown.className = "ui fluid dropdown index_"+i.toString();
          div_feedback_dropdown.id = "dropdownID"+i.toString();
          document.getElementById("header4ID"+i.toString()).appendChild(div_feedback_dropdown);  

          const div_feedback_option_1 = document.createElement("option");
          div_feedback_option_1.value = 0; 
          div_feedback_option_1.textContent = "I think I have the data elements you are requesting but it is not detected. ";
          document.getElementById("dropdownID"+i.toString()).appendChild(div_feedback_option_1);  

          const div_feedback_option_2 = document.createElement("option");
          div_feedback_option_2.value = 1;
          div_feedback_option_2.textContent = "I want to give feedback to your request.";
          document.getElementById("dropdownID"+i.toString()).appendChild(div_feedback_option_2);  

          const div_feedback_message_field = document.createElement("div");
          div_feedback_message_field.className = "field";
          div_feedback_message_field.id = "feedback_fieldID"+i.toString();
          document.getElementById("formID"+i.toString()).appendChild(div_feedback_message_field);

          const div_label = document.createElement("label");
          div_label.textContent = "Message";
          document.getElementById("feedback_fieldID"+i.toString()).appendChild(div_label);

          const div_feedback_textarea = document.createElement("textarea");
          div_feedback_textarea.id = "feedback_from_participantID"+i.toString();
          document.getElementById("feedback_fieldID"+i.toString()).appendChild(div_feedback_textarea);
          
          const div_action = document.createElement("div");
          div_action.className = "actions";
          div_action.id = "feedback_button_fieldID"+i.toString();
          document.getElementById("feedback_modalID"+i.toString()).appendChild(div_action);

          const div_sendFeedback_button = document.createElement("div");
          div_sendFeedback_button.className = "ui green sendFeedback answer button listen index_"+i.toString();
          div_sendFeedback_button.id = "sendFeedback_buttonsID"+i.toString();
          div_sendFeedback_button.textContent = "Send";
          document.getElementById("feedback_button_fieldID"+i.toString()).appendChild(div_sendFeedback_button);    

          $(document)
          .ready(function() {
            let modal_para = ".ui.modal.index_"+i.toString();
            let button_para = ".NoDataFeedback.button.index_"+i.toString();
            $(modal_para)
              .modal('attach events', button_para, 'show')
            ;
          });

          
          // const feebback_btns = document.querySelectorAll("sendFeedback.feedback.button")
          // feebback_btns.forEach(function(each_feedback_btn){
          //   each_feedback_btn.addEventListener("click", function(e){
          //     e.preventDefault();
          //     const style = e.currentTarget.classList
          //     const index = style.value.split(' ').pop().split('_')[1];
          //     console.log(style.value)
              
          //     getWebId().then(participant_webid => {
          //       console.log(document.getElementById("feedback_from_participantID"+i.toString()))
          //       const feedback_text = document.getElementById("feedback_from_participantID"+i.toString()).value;
          //       console.log(3)
          //       const selectedRequest = requestContentList[index]; 
          //       sendFeedbackMsg(selectedRequest.url, selectedRequest.webid, participant_webid, feedback_text).then(response=>{alert(response)});
          //     }).catch((err)=> {alert(err.message);});
          //   });
          // });
        }
      }else{
        const div_disabled_buttons = document.createElement("div");
        div_disabled_buttons.className = "ui fluid disabled buttons";
        div_disabled_buttons.id = "disabled_buttonsID"+i.toString();
        div_greenButton.textContent = "Want to participate? Please login.";
        document.getElementById('extraID'+i.toString()).appendChild(div_disabled_buttons);
      }
      
    }else{
      var dataRequested_numInstance = Number(requestContentList[i].numInstance)
      await getTriplesObjects(registerParticipationFolder+requestContentList[i].url.split('#')[1]+".ttl", null, null, true).then(getTriples => {

        const percent_num = (Math.floor(((getTriples.length/6)/dataRequested_numInstance) * 100)) // Hard code here! 
        let percent = 0
        if (percent_num <= 100){
          percent = percent_num
        }else{
          percent = 100
        }

        // const percent = (Math.floor(Math.random() * 10) * 10).toString()
        const div_progress = document.createElement("div");
        div_progress.className = "ui indicating progress";
        div_progress.dataset.percent = percent;
        div_progress.id = "progressID"+i.toString();
        document.getElementById('extraID'+i.toString()).appendChild(div_progress);

        const div_progressBar = document.createElement("div");
        div_progressBar.className = "bar";
        div_progressBar.style.width = percent+'%';
        div_progressBar.style.transitionDuration = '300ms'
        div_progressBar.id = "progressBarID"+i.toString();
        document.getElementById('progressID'+i.toString()).appendChild(div_progressBar);

        const div_progressLabel = document.createElement("div");
        div_progressLabel.className = "label";
        div_progressLabel.id = "progressLabelID"+i.toString();
        div_progressLabel.textContent = "Data collection progress - " + percent+"%";
        document.getElementById('progressID'+i.toString()).appendChild(div_progressLabel);

        const div_buttons = document.createElement("div");
        div_buttons.className = "ui two buttons";
        div_buttons.id = "buttonsID"+i.toString();
        document.getElementById('extraID'+i.toString()).appendChild(div_buttons);

        if (userRole === "requester"){

          const div_regularButton = document.createElement("button");
          div_regularButton.className = "ui grey stopCollection button answer index_"+i.toString(); //rglLearning
          div_regularButton.id = "stopCollectionButtonID"+i.toString(); //regularButtonID
          div_regularButton.textContent = "Stop collection"//"Regular analysis";
          document.getElementById('buttonsID'+i.toString()).appendChild(div_regularButton);
        
          const div_privacyButton = document.createElement("button");
          div_privacyButton.className = "ui blue triggerAnalysis button answer index_"+i.toString(); //ppLearning
          div_privacyButton.id = "triggerAnalysisButtonID"+i.toString(); //privacyButtonID
          div_privacyButton.textContent = "Trigger analysis" //"Secure analysis";
          document.getElementById('buttonsID'+i.toString()).appendChild(div_privacyButton);

        }else if (userRole === "podProvider"){
          const div_privacyButton = document.createElement("button");
          div_privacyButton.className = "ui grey ppLearning button answer index_"+i.toString(); //ppLearning
          div_privacyButton.id = "privacyButtonID"+i.toString(); 
          div_privacyButton.textContent = "Abortion";
          document.getElementById('buttonsID'+i.toString()).appendChild(div_privacyButton);

          const div_regularButton = document.createElement("button");
          div_regularButton.className = "ui blue proceed button answer index_"+i.toString(); //rglLearning
          div_regularButton.id = "regularButtonID"+i.toString();
          div_regularButton.textContent = "Proceed"; //Regular analysis
          document.getElementById('buttonsID'+i.toString()).appendChild(div_regularButton);
        }
      })//.catch((err)=> {alert(err.message);});
    }
  };
  return requestContentList;
};
// *** Write and generate requests to cards (END) ***//

// *** Plot cards on the webpage (START) ***//
async function plotCardsOnPage(webIdDoc, profileWebID, findAllSubjects, option, userRole, session, participant_basket){
  var requestContentList = [];

  if (option === "fromPageEntrance"){
    for (let i=0; i<findAllSubjects.length; i++){
      const eachProfile = webIdDoc[i].getSubject(profileWebID[i]);
      const singleRequest = writeAllRequest(eachProfile, findAllSubjects[i].fetchedRequestDoc.getTriples(), findAllSubjects[i].fetchedRequestID)
      if (singleRequest){requestContentList.push(singleRequest);}
    }
  }else if (option === "fromWebID"){
    const profile = webIdDoc.getSubject(profileWebID);
    for (let i=0; i<findAllSubjects.length; i++){
      const singleRequest = writeAllRequest(profile, findAllSubjects[i].getTriples(), findAllSubjects[i].asRef())
      if (singleRequest){requestContentList.push(singleRequest);}
    }
  }else{
    const profile = webIdDoc.getSubject(profileWebID);
    const singleRequest = writeAllRequest(profile, findAllSubjects, option)
    if (singleRequest){requestContentList.push(singleRequest);}
  }

  requestContentList = await generateCards(requestContentList, userRole, session, participant_basket);

  var loader = document.getElementById("loader");
  loader.style.display = "none";

  const answer_btns = document.querySelectorAll(".answer.button");
  const outcome = [answer_btns, requestContentList]

  return outcome
}
// *** Plot cards on the webpage (END) ***//


// *** Fetch registered users (START) ***//
async function fetchRegisterList(fetchRegisterRecord){
  
  const registerRecordSubjects = fetchRegisterRecord.findSubjects();
  
  const requestURIList = [];
  const includedRequest = [];
  const requestWebIdDocList = [];
  const requestProfileIdList = [];
  for (let i=0; i<registerRecordSubjects.length; i++){
    const registeredSingleRequestURL = registerRecordSubjects[i].getRef(schema.recordedAs);
    if (!includedRequest.includes(registeredSingleRequestURL)){
      const registeredSingleRequesterWebId = registerRecordSubjects[i].getRef(schema.creator);

      try{
        const fetchEachRequest = await fetchDocument(registeredSingleRequestURL);
        requestURIList.push({fetchedRequestID:registeredSingleRequestURL, fetchedRequestDoc:fetchEachRequest});

        requestProfileIdList.push(registeredSingleRequesterWebId);
        const webIdDoc = await fetchDocument(registeredSingleRequesterWebId);
        requestWebIdDocList.push(webIdDoc);

        includedRequest.push(registeredSingleRequestURL);
      }catch{console.log(registeredSingleRequestURL, ": cannot retrieve this data request!")}
    }
  }

  const fetchedRequestAndWebId = [requestURIList, requestWebIdDocList, requestProfileIdList];
  return fetchedRequestAndWebId
}
// *** Fetch registered users (END) ***//

// *** Users respond to data request: approve/decline (START) ***//
function respondToRequest(answer_btns, requestContentList){
  answer_btns.forEach(function(ans_btn) {
    ans_btn.addEventListener("click", function(e){
      e.preventDefault();
      const style = e.currentTarget.classList
      // find which request the user is reponding
      const index = style.value.split(' ').pop().split('_')[1];
      const selectedRequest = requestContentList[index]; 

      // Participate in a data request
      if (style.contains('Approve')) {
        const fetchParticipateRequestId = selectedRequest.url;
        const participate_period = new Date(document.getElementById("untilDate"+index).value);
        const data_recipient = document.getElementById("data_recipient"+index).value;

        getWebId().then(webId => {
          fetchRequestURL(fetchParticipateRequestId).then(fetchedRequestListRef=> {
            const collectionSize = fetchedRequestListRef.getSubject(fetchParticipateRequestId).getInteger(requestCollectionSizeGlobal);
            const endDate = fetchedRequestListRef.getSubject(fetchParticipateRequestId).getDateTime(requestExpiryGlobal);
            const requestModel = fetchedRequestListRef.getSubject(fetchParticipateRequestId).getString(requestAnalysisLogicGlobal);
            
            getParticipateList(webId).then(fetchedParticipateListRef=> {
              // if the data request is in the regular analysis mode
              if (requestModel){
                const aclDocument = webId.split("profile")[0] + "private/" + dataFileName + ".acl"
                fetchRequestURL(aclDocument).then(AccessControlList => {
                  
                  addParticipation(webId, fetchedRequestListRef, fetchParticipateRequestId, fetchedParticipateListRef, AccessControlList, collectionSize, endDate, participate_period, data_recipient, false).then(success=> { //requestModel.includes('Privacy')
                    
                    if (success){
                      alert("Your participation is recorded. Access to your " + dataFileName + " is granted for this research request.");
                    }
                  }).catch((err)=> {alert(err.message);});;
                }).catch(()=> {alert("If you have not given this SOLID App 'Control' Access, please turn on specific sharing for your " + dataFileName + " file .");});
              }
              /*********************** PAUSE ************************
              // if the data request is in the privacy-preserving mode 
              else if (requestModel.includes('Privacy')){
                // Query the requested data item 
                fetchRequestURL(fetchParticipateRequestId).then(fetchedParticipateRequest=>{
                  const requestDataItem = fetchedParticipateRequest.getSubject(fetchParticipateRequestId).getRef(schema.DataFeedItem);
                  fetchRequestURL(webId.split('profile')[0]+'private/healthrecord.ttl').then(fetchedParticipantData=> {
                    // get the latest age data 
                    const fetchedParticipantTriple = fetchedParticipantData.getTriples();
        
                    for (let j = 0; j < fetchedParticipantTriple.length; j++){
                      if (fetchedParticipantTriple[j].predicate.id === requestDataItem){
                        const requestedDataResult = parseInt(fetchedParticipantTriple[j].object.value);
  
                        addParticipation(webId, fetchedRequestListRef, fetchParticipateRequestId, fetchedParticipateListRef, null, collectionSize, endDate, participate_period, [true, requestDataItem, requestedDataResult]).then(success=> {
                          if (success){
                            alert("Your participation is in privacy-preserving analysis. Nothing has been recorded except the requested data.");
                          }
                        });
                      }
                    }
                  }).catch((err)=> {alert(err.message);});
                }).catch((err)=> {alert(err.message);});
              } 
              *********************************************************/
            });
          });
        });
      }else if (style.contains('triggerAnalysis')) {
        const requestID = selectedRequest.url.split("#")[1];
        sendTriggerMsg(registerTriggerMessageFolder+requestID+'.ttl', selectedRequest).then(response=>{alert(response)});
      }
      else if (style.contains('sendFeedback')){
        // const feebback_btns = document.querySelectorAll("sendFeedback.feedback.button")
        // feebback_btns.forEach(function(each_feedback_btn){
        //   each_feedback_btn.addEventListener("click", function(e){
            // e.preventDefault();
            // const style = e.currentTarget.classList
            // const index = style.value.split(' ').pop().split('_')[1];
        console.log(style.value)
        
        getWebId().then(participant_webid => {
          console.log(document.getElementById("feedback_from_participantID"+index))
          const feedback_text = document.getElementById("feedback_from_participantID"+index).value;
          console.log(3)
          const selectedRequest = requestContentList[index]; 
          sendFeedbackMsg(selectedRequest.url, selectedRequest.webid, participant_webid, feedback_text).then(response=>{alert(response)});
        }).catch((err)=> {alert(err.message);});
          // });
        // });
      }
    });
  });
}
// *** Users respond to data request: approve/decline (END) ***//



async function dataElement_getRecommender(input){

	let response = await fetch("http://data.bioontology.org/recommender?input="+input+"&apikey=21646475-b5a0-4e92-8aba-d9fcfcfea388");
	let data = await response.json();
	let item = [];
	let asInputOntology = "";

	for (let i=0; i<data.length; i++){
	item.push({Text: data[i]['ontologies'][0]['acronym'], FoundURI: data[i]['ontologies'][0]['@id'], Score:data[i]['evaluationScore']});
	asInputOntology += data[i]['ontologies'][0]['acronym'];
	if (i != data.length-1){
		asInputOntology += ","; 
	}
	}
	return asInputOntology //item
}

async function dataElement_getAnnotator(asInputOntology, input){

	let response = await fetch("https://data.bioontology.org/annotator?text="+input+"&ontologies="+asInputOntology+"&longest_only=false&exclude_numbers=false&whole_word_only=true&exclude_synonyms=false&expand_class_hierarchy=true&class_hierarchy_max_level=999&mapping=all&apikey=21646475-b5a0-4e92-8aba-d9fcfcfea388");
  let data = await response.json();
	let asInputAnnotator = [];


	for (let i=0; i<data.length; i++){
	  asInputAnnotator.push({URI: data[i]['annotatedClass']['@id'], Ont:data[i]['annotatedClass']['links']["ontology"].split("/ontologies/")[1]});
  }
	return asInputAnnotator;
}


async function dataElement_getUsers(annotator, input){

		let response = await fetch("http://data.bioontology.org/search?q="+ input +"&ontology="+annotator['Ont']+"&subtree_root_id="+annotator['URI']+"&apikey=21646475-b5a0-4e92-8aba-d9fcfcfea388");
    let data = await response.json();
  
	return data;
}


// *** Button rections (START) ***//
btns.forEach(function(btn) {
  btn.addEventListener("click", function(e){
    e.preventDefault();
    const styles = e.currentTarget.classList;
    // Get public-private key pairs for new registered users
    if (styles.contains('userRegisterbtn')){
      const userName = document.getElementById("userName").value;
      const affiliance = document.getElementById("affiliance").value;
      getWebId().then(webId => {
        const fetchProfile = webId
        generatePublicKeyPair(fetchProfile, userName, affiliance).then(response => {
          const tokenMessage = document.getElementById("tokenMessage");
          tokenMessage.setAttribute("style", "word-wrap: break-word");
          tokenMessage.textContent = response;
        });
      }).catch(error => alert("To register on TIDAL, please login to your SOLID Account first!"));;
    }

    // Get blockchain user and passwords
    if (styles.contains('bcTokenLogin')){
      const bcTokenUser = document.getElementById("bcTokenUser").value;
      const bcTokenPassword = document.getElementById("bcTokenPassword").value;
      const tokenMessage = document.getElementById("tokenMessage");
      tokenMessage.setAttribute("style", "word-wrap: break-word");
      const requestOptions = {method: 'POST', redirect: 'follow'};

      fetch(`https://blockchain7.kmi.open.ac.uk/rdf/users/signin?username=${bcTokenUser}&password=${bcTokenPassword}`, requestOptions)
        .then(response => response.text())
        .then(result => {
          if (result.includes("token")){
            const bcToken = result.substring(result.lastIndexOf('{"token":"') + 10, result.lastIndexOf('"')); 
            tokenMessage.textContent = " Please save the token and it lasts for 5 hours. \n Your token is " + bcToken;
            // console.log(result)
          }else{
            alert("Username or password is incorrect!")
          }
        }).catch(error => alert('error', error));
    }

    // Fetch data from the files all triples or objects
    else if (styles.contains('fetchObjects') || styles.contains('fetchTriples')) {

      if (styles.contains('fetchTriples')){
        var fetchFrom = document.getElementById("fetchFromTriples").value;
      }
      else{
        var fetchFrom = document.getElementById("fetchFromObjects").value;
      } 

      const fetchSubject = document.getElementById("fetchSubject").value;
      const fetchPredicate = document.getElementById("fetchPredicate").value;
      const getTriplesOption = styles.contains('fetchTriples');
      
      getTriplesObjects(fetchFrom, fetchSubject, fetchPredicate, getTriplesOption).then(getFetchedData => {
        const tables = document.querySelectorAll(".table");

        // print the triples as "subject" "predicate" "object"
        let tripleResults = [];
        if (styles.contains('fetchTriples')){
          for (let i = 0; i < getFetchedData.length; i++){
            tripleResults.push({Subject:getFetchedData[i].subject.id, Predicate:getFetchedData[i].predicate.id, Object:getFetchedData[i].object.id}) 
          }
          tables.forEach(function(table){
            if (table.classList.contains("triples")){
              printTable(table, tripleResults, false);
            }
          });
        }
        else if (styles.contains('fetchObjects') && fetchSubject){
          for (let i = 0; i < getFetchedData.length; i++){
            if (fetchPredicate){
              tripleResults.push({Object:getFetchedData[i]})
            }
            else{
              tripleResults.push({Predicate:getFetchedData[i].predicate.id, Object:getFetchedData[i].object.id}) 
            }
          }
          tables.forEach(function(table){
            if (table.classList.contains("objects")){
              printTable(table, tripleResults, false);
            }
          });
        }
      });
    }

    // check if the user has the data files already (button)
    else if (styles.contains('createModel')) {
      const fileLocation = document.getElementById("fileLocation").value;
      const profileHead = "https://" + fileLocation.substring(fileLocation.lastIndexOf("https://") + 8, fileLocation.lastIndexOf("/")) +"/";
      const fileName = document.getElementById("fileName").value;
      const tables = document.querySelectorAll(".table");

      getNotesList(profileHead, fileLocation, fileName).then(fetchedNotesListRef => {
        var getTriples = fetchedNotesListRef.getTriples();
        const fetchedDoc = document.getElementById("createMessage");
        const table = document.querySelector("table");

        let tripleResults = [];
        for (let i = 0; i < getTriples.length; i++){
          tripleResults.push({Subject:getTriples[i].subject.id, Predicate:getTriples[i].predicate.id, Object:getTriples[i].object.id}) 
        }
        if (tripleResults.length>0){
          fetchedDoc.textContent = "Your file already exists with some triples";
          tables.forEach(function(table){
            if (table.classList.contains("fetchedTable")){
              printTable(table, tripleResults, false);
            }
          });
          
        }
        else{
          fetchedDoc.textContent = "Your file exists but nothing is inside!"
        }
        alert("Your file already exists!");
    
      }).catch((err)=> {
        const fetchedDoc = document.getElementById("createMessage");
        fetchedDoc.textContent = err.message
      });
    }

    else if (styles.contains('addSingleTriple')) {
      let tripleResults = [];
      const tables = document.querySelectorAll(".table");
      const addTriplePredicate = document.getElementById("addTriplePredicate").value;
      const addTripleObject = document.getElementById("addTripleObject").value;

      tripleResults.push({Predicate:addTriplePredicate, Object:addTripleObject});
      tables.forEach(function(table){
        if (table.classList.contains("addedTable")){
          printTable(table, tripleResults, true);
        }
      });
    }

    // Add data/triples to the data file (this can be changed as user wants)
    else if (styles.contains('addData')) {
      const fileLocation = document.getElementById("fileLocation").value;
      const profileHead = "https://" + fileLocation.substring(fileLocation.lastIndexOf("https://") + 8, fileLocation.lastIndexOf("/")) +"/";
      const fileName = document.getElementById("fileName").value;
      
      var addedTableDict = []
      const addedTable = document.getElementById("addedTable");
      var rowLength = addedTable.rows.length; // gets rows of table
      for (let i = 1; i < rowLength; i++){ //loops through rows    
        var oCells = addedTable.rows.item(i).cells; //gets cells of current row  
        addedTableDict.push({Predicate:oCells.item(0).innerHTML, Object:oCells.item(1).innerHTML}) //oCells;
      }

      getNotesList(profileHead, fileLocation, fileName).then(fetchedNotesListRef => {
        addNote(profileHead, addedTableDict, fetchedNotesListRef).then(success => {
        const fetchedDoc = document.getElementById("addTableMessage");
        fetchedDoc.textContent = "Above triples are saved in " + fileName;
        alert("Your editing is successful!")
        }).catch((err)=> {
          const fetchedDoc = document.getElementById("addTableMessage");
          fetchedDoc.textContent = err.message
        });
      });
    }

    // Check if the data request exists already
    else if (styles.contains('checkExtRequest')) {

      getWebId().then(webId => {
        const fetchProfile = webId;
        getRequestList(fetchProfile).then(fetchedRequestListRef => {

          const firstRequestMessage = document.getElementById("firstRequestMessage");
          firstRequestMessage.textContent = "Your have 'public/request.ttl' in your Solid Pod already. Ready to submit a data request!"
        });
      });
    }

    else if (styles.contains('recommender')) {
      const recommenderService = document.getElementById("input_recommender");
      const recommender_button = document.getElementById("recommender button");
      // const addRequestedDataList = addRequestedDataMessage.textContent.split('\r\n');
      recommenderService.setAttribute('style', 'white-space: pre;');

      const recommender_content = document.getElementById("input_purpose").value;
      if (recommender_content.length>5){
        recommender_button.className = "ui icon loading button recommender listen"
        getRecommender(recommender_content).then(request_data_list=>{

          // request_data_list.pop()
          for (let i=0; i<5; i++){
            recommenderService.textContent += "Ontology: " + request_data_list[i]['Text'] + ", Score:" +request_data_list[i]['Score']+ '\r\n';
          }
          ecommender_button.className = "ui icon button recommender listen"
        });
      }else{alert("Please give enought to get the recommendations")}
      
      
    }

    else if (styles.contains('addRequestedData')) {

      if (!document.getElementById("loader") && document.getElementById("input_purpose").value.length>0){
        const loader = document.createElement("div");
        loader.className = "ui active inline loader";
        loader.id = "loader"
        document.getElementById('input_addedField').appendChild(loader);
      }

      if (document.getElementById("loader").className == "ui active inline loader"){
        dataElement_getRecommender(document.getElementById("input_purpose").value).then(asInputOntology => {
          let dataCategoryInput = document.getElementById("input_personaldatacategory").value.split(',');
          let annotatorInput = '';
          if (dataCategoryInput.length > 1){
            for (let n=0;n<dataCategoryInput.length;n++){
              annotatorInput = annotatorInput + ' ' + dataCategoryInput[n]
            }
            
          }else{
            annotatorInput = document.getElementById(document.getElementById("input_personaldatacategory").value).textContent;
            console.log(annotatorInput);
          }
          
          dataElement_getAnnotator(asInputOntology, annotatorInput).then(asInputAnnotator=>{
            let item = [];
            console.log(asInputAnnotator.length)
            asInputAnnotator.map(annotator=>{
              dataElement_getUsers(annotator, document.getElementById("addTriplePredicate").value).then(data=>{
                if (data['collection'].length>0){
                  item.push(data['collection']);
                  console.log(data['collection'])
                }
              }).catch(e=>{})
            })
          })
        })
        const addRequestedDataMessage = document.getElementById("input_addRequestedDataMessage");
        const addRequestedDataList = addRequestedDataMessage.textContent.split('\r\n');
        addRequestedDataMessage.setAttribute('style', 'white-space: pre;');
  
        const request_data = document.getElementById("addTriplePredicate").value;
        
        if (!addRequestedDataList.includes(request_data) && request_data.length>0){
          addRequestedDataList.push(request_data);
          addRequestedDataMessage.textContent += request_data + '\r\n';
        }
        const request_data_list = addRequestedDataMessage.textContent.split('\r\n')
        request_data_list.pop()
      }
    }

    // Submit a new data request 
    else if (styles.contains('submitRequest')) {
      getWebId().then(webId => {

        const fetchProfile = webId

        const request_classPurpose = document.getElementById("input_classPurpose").value.split(',');

        const request_purpose = document.getElementById("input_purpose").value;

        const request_personalDataCategory = document.getElementById("input_personaldatacategory").value.split(',');

        const addRequestedDataMessage = document.getElementById("input_addRequestedDataMessage");
        const request_data = addRequestedDataMessage.textContent.split('\r\n')
        request_data.pop()
        
        const request_period = new Date(document.getElementById("input_period").value);
        const request_numInstance = document.getElementById("input_numInstance").value;
        
        // const request_ontology = document.getElementById("input_ontologyDataElement").value.split(',');

        const request_dataProcessingCategory = document.getElementById("input_dataProcessingCategory").value.split(',');

        const request_selectModelObj = document.getElementById("input_model")
        const request_model = request_selectModelObj.options[request_selectModelObj.selectedIndex].value;
        
        const request_consequence = document.getElementById("input_consequence").value;

        // const request_selectRecipientObj = document.getElementById("data_recipient")
        // const request_recipient = request_selectRecipientObj.options[request_selectRecipientObj.selectedIndex].value;

        const request_input_token = document.getElementById("input_token").value;
    
        const addRequestContent = {'purposeClass':request_classPurpose,
                                    'purpose':request_purpose, 
                                    'personalDataCategory':request_personalDataCategory,
                                    // 'ontology': request_ontology,
                                    'data':request_data, 
                                    'period':request_period, 
                                    'numInstance':request_numInstance, 
                                    'dataProcessingCategory': request_dataProcessingCategory,
                                    'model':request_model, 
                                    'consequence': request_consequence,
                                    // 'recipient':request_recipient,
                                    'token':request_input_token};
        getRequestList(fetchProfile).then(fetchedRequestListRef => {
          addRequest(fetchProfile, addRequestContent, fetchedRequestListRef).then(outcome => {
            alert(outcome);
          });
        });
      });
    }

    // query the existing request
    else if (styles.contains('queryRequest')) {
      const fetchRequest = document.getElementById("fetchRequest").value;

      // if the user give the webID (will query all request of this person made)
      if (fetchRequest.slice(-15).includes('profile/card')){
        getRequestList(fetchRequest).then(fetchedRequestListRef => {
          // const findAllSubjects = fetchedRequestListRef.findSubjects(rdf.type, "http://schema.org/AskAction");
          const findAllSubjects = fetchedRequestListRef.findSubjects(rdf.type, requestPersonalDataHandlingGlobal);
          const profileWebID = fetchRequest;

          fetchRequestURL(profileWebID).then(webIdDoc => {
            plotCardsOnPage(webIdDoc, profileWebID, findAllSubjects, "fromWebID", "participant").then(outcome => {
              respondToRequest(outcome[0], outcome[1]);
            });
          });
        }).catch((err)=> {alert(err.message);});
      }
      else{
        // if the user give the request URL, (it will only query that single request)
        getTriplesObjects(fetchRequest, null, null, true).then(getTriples => {
          // const singleSubject = [];
          // singleSubject.push(getTriples);
          const profileWebID = "https://" + fetchRequest.substring(fetchRequest.lastIndexOf("https://") + 8, fetchRequest.lastIndexOf("/public")) + "/profile/card#me";

          fetchRequestURL(profileWebID).then(webIdDoc => {
            plotCardsOnPage(webIdDoc, profileWebID, getTriples, fetchRequest, "participant").then(outcome => {
              respondToRequest(outcome[0], outcome[1])
            });

          });
        }).catch((err)=> {alert(err.message);});
      } 
    }
  });
});
// *** Button rections (END) ***//