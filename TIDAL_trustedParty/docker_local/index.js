/**************************************** 
 * This file reads config.yaml file 
 * and retrieves participants personal 
 * data. This file will be composed with
 * analysis python file in a docker image
 * sophia921025/docforsolid:v1.0
****************************************/

/**************************************** 
* 11-04-2021 Updated the code to the new
* Solid node client
****************************************/

/* Import all required package */
const $rdf = require('rdflib');
const solidNode = require("solid-node-client")
const fs = require('fs');
const yaml = require('js-yaml');
const perf_hooks = require('perf_hooks')
const performance = perf_hooks.performance

const client = new solidNode.SolidNodeClient();
const store = $rdf.graph();
const fetcher = $rdf.fetcher(store,{fetch:client.fetch.bind(client)}, 50000);

var time_wasted = 0;

process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0"

/* Read solid login information (confidential) */
let fileContents = fs.readFileSync('./login/solid_login.yaml', 'utf8');
let login_yaml = yaml.load(fileContents);

/* Retrieve participants' data and write to CSV file for analysis */
const createCsvWriter = require('csv-writer').createObjectCsvWriter;
const { rejects } = require('assert');

async function fetchMultiple(participation_dataItem, MAX_PARALLEL_REQUESTS, dataset, time_readYaml, time_record, data_header){
  //https://medium.com/swlh/paralel-processing-requests-with-async-await-2cbf463d8eb1 
  let requestQ = []
  // participation_dataItem.map(each=>{
  for (let i = 0; i < participation_dataItem.length; i++) {
    if (requestQ.length >= MAX_PARALLEL_REQUESTS) {
      let nextRequest = requestQ.shift()
      await nextRequest.then((response) => {
      }) 
    }
    requestQ.push(parallelFetch(participation_dataItem[i]).then((tempObjOutcome) => {
      if (tempObjOutcome != null){dataset.push(tempObjOutcome)}
    }));
  }
  
  while (nextRequest = requestQ.shift()){
    await nextRequest.then((response) => {
    }) 
    if (requestQ.length==0){
      const time_fetchData = performance.now();
      time_record = time_record + "Fetch required variables from all participants takes (ms): " + (time_fetchData-time_readYaml).toString() + '\n';

      const csvWriter = createCsvWriter({
        path: './input/data_file.csv',
        header: data_header});
      
      await csvWriter.writeRecords(dataset).then(()=> {
        // console.log(dataset)
        console.log('The CSV file was written successfully');
        const time_createDataFile = performance.now();
        time_record = time_record + "Write data to CSV file takes (ms): " + (time_createDataFile-time_fetchData).toString() + '\n';
        fs.writeFile('./output/time.txt', time_record, (err) => {if (err) throw err});
      }).catch(error => {tempObjOutcome=null;console.log(error)});
    }
  }
} 

async function fetchVarEachUser(client, store, fetcher, fileURL, new_requestDataItem){
  let tempObjOutcome = {};
  await fetcher.load($rdf.sym(fileURL)).then(response=> {
    new_requestDataItem.map(async(item)=>{
      store.statementsMatching(null, $rdf.sym(item), null).map(statement=>{
        tempObjOutcome[item] = statement.object.value;
      });
    },e => {console.log("Error matching : "+e);});
  }).catch(error => {tempObjOutcome=null;console.log(error)})
  return tempObjOutcome
}

async function SecfetchVarEachUser(fileURL, new_requestDataItem, tempObjOutcome){
  // const time_relogin = performance.now()
  const client = new solidNode.SolidNodeClient();
  const store = $rdf.graph();
  const fetcher = $rdf.fetcher(store,{fetch:client.fetch.bind(client)}, 50000);

  let session = await client.login({
    idp : login_yaml.SOLID_IDP, //"https://inrupt.net"
    username : login_yaml.SOLID_USERNAME, //"https://chang.inrupt.net/profile/card#me"
    password : login_yaml.SOLID_PASSWORD //"sophia383842"
  });

  if (session.isLoggedIn){
    console.log("Re-started client node")
    // time_wasted = time_wasted + (performance.now() - time_relogin);
    tempObjOutcome = await fetchVarEachUser(client, store, fetcher, fileURL, new_requestDataItem);
  };

  return tempObjOutcome
}

async function parallelFetch(each_participation_dataItem){
  // let tempObjOutcome ={}
  let new_participation_webid = each_participation_dataItem["participant"];
  let new_requestDataItem = each_participation_dataItem["requestDataItem"];
  var fileURL = new_participation_webid.split('profile')[0]+'private/healthrecord.ttl'
  // const time_firstTry = performance.now();
  let tempObjOutcome = await fetchVarEachUser(client, store, fetcher, fileURL, new_requestDataItem);
  if (tempObjOutcome==null){
    // time_wasted = time_wasted+(performance.now() - time_firstTry);
    tempObjOutcome = await SecfetchVarEachUser(fileURL, new_requestDataItem, tempObjOutcome);
  }

  // await fetchVarEachUser(fileURL, new_requestDataItem).then(tempObjOutcome=>{
    
  //   if (tempObjOutcome == null){
  //     const client = new solidNode.SolidNodeClient();
  //     const store = $rdf.graph();
  //     const fetcher = $rdf.fetcher(store,{fetch:client.fetch.bind(client)}, 50000);

  //     loginfunc().then(session=>{
  //       if (session.isLoggedIn){
  //         console.log("Re-started client node")
  //         fetchVarEachUser(fileURL, new_requestDataItem).then(tempObjOutcome=>{
  //           return tempObjOutcome;
  //         });
  //       };
  //     });

  //     // let session = await client.login({
  //     //   idp : login_yaml.SOLID_IDP, //"https://inrupt.net"
  //     //   username : login_yaml.SOLID_USERNAME, //"https://chang.inrupt.net/profile/card#me"
  //     //   password : login_yaml.SOLID_PASSWORD //"sophia383842"
  //     // });

  //     // if (session.isLoggedIn){
  //     //   console.log("Re-started client node")
  //     //   await fetchVarEachUser(fileURL, new_requestDataItem).then(tempObjOutcome=>{
  //     //     return tempObjOutcome;
  //     //   })
  //       // await fetcher.load($rdf.sym(fileURL)).then(response=> {
  //       //   new_requestDataItem.map(async(item)=>{
  //       //     store.statementsMatching(null, $rdf.sym(item), null).map(statement=>{
  //       //       tempObjOutcome[item] = statement.object.value;
  //       //       resolve()
  //       //     });
  //       //   },e => {console.log("Error matching : "+e);});
  //       // }).catch(error => {console.log(error);reject();return null;})    
  //     // };
  //   };
  //   return tempObjOutcome
  // });
  return tempObjOutcome
}


async function fetchParticipantData(participation, requestDataItem, participation_dataItem, time_readYaml, time_record, data_header){
  
  // let error
  let dataset = []
  // if there is only one participant (this case is just for testing. this should not happen in reality.)
  if (typeof participation === 'string' || participation instanceof String){
    console.log("There is only one participants! We cannot proceed the execution because of the risk of breaching personal privacy!")
    // if there are many participants
  }else{
    // 1. Parallel running
    await fetchMultiple(participation_dataItem, 64, dataset, time_readYaml, time_record, data_header).then((dataset)=>{

    });
  }
}
async function newParticipationDataItemList(participation, requestDataItem){
  const participation_dataItem = []
  for (let each=0; each<participation.length; each++){
    each_participant = {};
    each_participant["participant"] = participation[each];
    each_participant["requestDataItem"] = requestDataItem;
    participation_dataItem.push(each_participant)
  }
  await Promise.all(participation_dataItem).then(()=>console.log(requestDataItem.length, participation_dataItem.length));

  return participation_dataItem
}

async function main(){
  const time_start = performance.now();
  let session =   await client.login({
    idp : login_yaml.SOLID_IDP, //"https://inrupt.net"
    username : login_yaml.SOLID_USERNAME, //"https://chang.inrupt.net/profile/card#me"
    password : login_yaml.SOLID_PASSWORD //"sophia383842"
  });
  const time_login = performance.now();
  var time_record = "Login action takes (ms): " + (time_login-time_start).toString() + '\n';

  if( session.isLoggedIn ) {

    console.log (`logged in as <${session.webId}>`);

    /* Read config.yaml file for retrieving data and setting analysis parameter */
    let fileContents = fs.readFileSync('./input/config.yaml', 'utf8');
    let config_yaml = yaml.load(fileContents);
    const requestDataItem = config_yaml.requestDataItem;
    const participation = config_yaml.participation;
    const time_readYaml = performance.now();
    time_record = time_record + "Read config.yaml file takes (ms): " + (time_readYaml-time_login).toString() + '\n';


    /* Write CSV hearder */
    var data_header = [];
    if (typeof requestDataItem === 'string' || requestDataItem instanceof String){
      data_header.push({id:requestDataItem,title:requestDataItem})
    }else{
      for (let i=0;i<requestDataItem.length;i++){
        data_header.push({id:requestDataItem[i],title:requestDataItem[i]})
      }
    }

    /* Write CSV data */
    newParticipationDataItemList(participation, requestDataItem).then(participation_dataItem=>{
      fetchParticipantData(participation, requestDataItem, participation_dataItem, time_readYaml, time_record, data_header).then(time_record=>{

      });
    });
  }
}

main()