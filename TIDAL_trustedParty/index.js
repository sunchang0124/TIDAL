const express = require('express')
const app = express()
const perf_hooks = require('perf_hooks')
const performance = perf_hooks.performance

const $rdf = require('rdflib');
const solidNode = require("solid-node-client")
const client = new solidNode.SolidNodeClient();
const store = $rdf.graph();
const fetcher = $rdf.fetcher(store,{fetch:client.fetch.bind(client)});

const fs = require('fs');
const yaml = require('js-yaml');

const {Docker} = require('node-docker-api');
const docker = new Docker({ socketPath: '/var/run/docker.sock' });

const sign = require('tweetnacl').sign;
const decodeUTF8 = require('tweetnacl-util').decodeUTF8;
const decodeBase64 = require('tweetnacl-util').decodeBase64;

/* Hardcode file location */
var inboxFolder = "https://chang.inrupt.net/inbox/triggermessage/";
var registerParticipationFolder = "https://chang.inrupt.net/registerlist/participationlist/";
var registerFileURL = "https://chang.inrupt.net/registerlist/requestlist.ttl";
var userRegisterRef = "https://chang.inrupt.net/registerlist/userregister.ttl";
var dockerRunFolder = "/Users/changsun/surfdrive/GitHub/solid_app_server";


/* Fetch each trigger message from inbox folder */
async function fetchRequestInfo(file){
    let requestID = null
    let creator = null
    await fetcher.load($rdf.sym(file.value)).then(response=> {
        const validateObj = store.any($rdf.sym(file.value), store.sym("http://schema.org/actionStatus")).value;
        if (validateObj == "http://schema.org/ActivateAction"){
            requestID = store.any($rdf.sym(file.value), store.sym("http://schema.org/target")).value;
            creator = store.any($rdf.sym(file.value), store.sym("http://schema.org/creator")).value;  
        }
    },e => console.log("Error fetching : "+e))
    return {requestID:requestID, creator:creator}
    
}

/* Fetch the object from the an object which is from the same subject */
async function fetchObjectFromObject(fileURL, inter_object, expected_predicate){
    let outputObj = [];
    await fetcher.load($rdf.sym(fileURL)).then(response=> {
        store.match(null, null,  $rdf.sym(inter_object), $rdf.sym(fileURL)).forEach(statement=>{
            store.match(statement.subject,  $rdf.sym(expected_predicate), null, $rdf.sym(fileURL)).forEach(signatureStatement=>{
                outputObj.push(signatureStatement.object.value);
            });
        })
    },e => console.log("Error fetching : "+e))
    return outputObj
}

/* Generatlly fetch sub/predi/object from a file */
async function fetchGeneralProperty(fileURL, knownSubject, knownPredicate){
    let outputObj = [];
    await fetcher.load($rdf.sym(fileURL)).then(response=> {
        store.match($rdf.sym(knownSubject), $rdf.sym(knownPredicate), null, $rdf.sym(fileURL)).forEach(statement=>{
            outputObj.push(statement.object.value)
        });
    },e => console.log("Error fetching : "+e))
    return outputObj
}

// fileURL 
async function validationProcess(requestSubjectURL, signature, publicKey){

    let requestTripleString = '';
    await fetcher.load($rdf.sym(requestSubjectURL)).then(response=> {

        const request_type = store.any($rdf.sym(requestSubjectURL), store.sym("http://www.w3.org/1999/02/22-rdf-syntax-ns#type")).value
        const request_algorithm = store.any($rdf.sym(requestSubjectURL), store.sym("http://schema.org/algorithm")).value
        const request_size = store.any($rdf.sym(requestSubjectURL), store.sym("http://schema.org/collectionSize")).value
        const request_creator = store.any($rdf.sym(requestSubjectURL), store.sym("http://schema.org/creator")).value
        // const request_dateCreated = store.any($rdf.sym(requestSubjectURL), store.sym("http://schema.org/dateCreated")).value
        // const request_endDate = store.any($rdf.sym(requestSubjectURL), store.sym("http://schema.org/endDate")).value
        const request_purpose = store.any($rdf.sym(requestSubjectURL), store.sym("http://schema.org/purpose")).value
        const request_dataElement = store.each($rdf.sym(requestSubjectURL), store.sym("http://schema.org/DataFeedItem"))

        requestTripleString = `<${requestSubjectURL}> <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <${request_type}>.`;
        requestTripleString += `<${requestSubjectURL}> <http://schema.org/algorithm> ${request_algorithm}.`;
        requestTripleString += `<${requestSubjectURL}> <http://schema.org/collectionSize> ${request_size}.`;
        requestTripleString += `<${requestSubjectURL}> <http://schema.org/creator> <${request_creator}>.`;
        // requestTripleString += `<${requestSubjectURL}> <http://schema.org/dateCreated> ${request_dateCreated.toString().split(" (")[0]}.`; //.split(" (")[0]
        // requestTripleString += `<${requestSubjectURL}> <http://schema.org/endDate> ${request_endDate.toString().split(" (")[0]}.`; //.split(" (")[0]
        requestTripleString += `<${requestSubjectURL}> <http://schema.org/purpose> ${request_purpose}.`;
        
        if (request_dataElement) {
            const sort_request_dataElement = request_dataElement.sort()
            // for (let i=request_dataElement.length-1; i>=0; i--){
            for (let i=0;i<request_dataElement.length; i++){
                requestTripleString += `<${requestSubjectURL}> <http://schema.org/DataFeedItem> <${sort_request_dataElement[i].value}>.`;
            } 

            // requestTripleString += `<${requestSubjectURL}> <http://schema.org/DataFeedItem> <${sort_request_dataElement[2].value}>.`;
            // requestTripleString += `<${requestSubjectURL}> <http://schema.org/DataFeedItem> <${sort_request_dataElement[0].value}>.`;
            // requestTripleString += `<${requestSubjectURL}> <http://schema.org/DataFeedItem> <${sort_request_dataElement[1].value}>.`;
        }

    },e => console.log("Error fetching : "+e))
    // console.log(requestTripleString)
    const verficiationOutput = sign.detached.verify(decodeUTF8(requestTripleString), decodeBase64(signature), decodeBase64(publicKey))
    return verficiationOutput
  }

function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}


async function queryData(files, time_record, time_readTriggerMsg){
// let inboxListOrderSubjects = []
await Promise.all(files.map(async(file)=>{
    // files.forEach(function(file){
        let each_time_record = time_record
        fetchRequestInfo(file).then(requestInfo=>{
            if (requestInfo && !completedReqeust.includes(requestInfo.requestID)){
                // Found the signature from the requestList.ttl
                const registerResponseFileURL = registerParticipationFolder + requestInfo.requestID.split("#")[1] + '.ttl';
                fetchObjectFromObject(registerFileURL, requestInfo.requestID, "http://schema.org/validIn").then(outputSignature=>{
                    const signature = outputSignature[0]
                    if (signature){
                        // Found the verification key to verify request signature
                        fetchGeneralProperty(userRegisterRef, userRegisterRef+"#"+requestInfo.creator, "http://schema.org/hasCredential").then(outputProperty=>{
                            const publicKey = outputProperty[0]
                            if(publicKey){
                                const time_findKeys = performance.now();
                                // console.log("Find all keys for verification takes (ms): ", time_findKeys-time_readTriggerMsg);
                                each_time_record = each_time_record + "Find all keys for verification takes (ms)" +requestInfo.requestID.split("#")[1]+": "+ (time_findKeys-time_readTriggerMsg).toString() + '\n';

                                validationProcess(requestInfo.requestID, signature, publicKey).then(verficiationOutput=>{
                                    const time_verify = performance.now();
                                    // console.log("Verification takes (ms): ", time_verify-time_findKeys);
                                    each_time_record = each_time_record + "Verification takes (ms)" +requestInfo.requestID.split("#")[1]+": "+ (time_verify-time_findKeys).toString() + '\n';

                                    if (verficiationOutput){
                                        fetchGeneralProperty(requestInfo.requestID.split("#")[0], requestInfo.requestID, "http://schema.org/DataFeedItem").then(requestDataItem=>{
                                            console.log("Verification Success")
                                            fetchObjectFromObject(registerResponseFileURL, requestInfo.requestID, "http://schema.org/participant").then(participantID=>{
                                                
                                                // Here should add participant's credential verification!

                                                // generate yaml file to app server as docker yaml input file
                                                let data = {
                                                    task_ID:requestInfo.requestID.split("#")[1],
                                                    check_missing:false,
                                                    data_description:false,
                                                    correlation_matrix:false,
                                                    requestURL:requestInfo.requestID,
                                                    requestDataItem:requestDataItem,
                                                    analysis_model_name:'linear regression',
                                                    participation:participantID, //.slice(0,256),
                                                    analysis_model_target:requestDataItem[0]
                                                };
                                                // console.log(data)
                                                const time_createYaml = performance.now();
                                                // console.log("Generate the config.yaml takes (ms): ", time_createYaml-time_verify);
                                                each_time_record = each_time_record + "Generate the config.yaml takes (ms)"+requestInfo.requestID.split("#")[1]+": "+ (time_createYaml-time_verify).toString() + '\n';

                                                let yamlStr = yaml.safeDump(data);
                                                const requestIDFolder = dockerRunFolder+'/test/'+requestInfo.requestID.split("#")[1] 
                                                const inputFolder = requestIDFolder+'/input';
                                                const outputFolder = requestIDFolder+'/output';

                                                if (!fs.existsSync(requestIDFolder)){
                                                    fs.mkdirSync(requestIDFolder);
                                                    fs.mkdirSync(inputFolder);
                                                    fs.mkdirSync(outputFolder);
                                                }
                                                fs.writeFileSync(inputFolder+'/config.yaml', yamlStr, 'utf8');
                                                console.log("Execution config file is saved at server.")
                                                completedReqeust.push(requestInfo.requestID)

                                                const time_writeYaml = performance.now();
                                                // console.log("Write out the config.yaml takes (ms): ", time_writeYaml-time_createYaml);
                                                each_time_record = each_time_record + "Write out the config.yaml takes (ms): " + (time_writeYaml-time_createYaml).toString() + '\n';
                                
                                                // const outpur_file_path = './output_' + (requestInfo.requestID).toString().slice(id.length - 5) + '/time_part1.txt'
                                                fs.writeFile(outputFolder+'/time_part1.txt', each_time_record, (err) => {if (err) throw err})
                                                // Triggle docker container 
                                                randomNumName = getRandomInt(1000,1000000)
                                                docker.container.create({
                                                    Image: 'docforsolid:v3.0',//'sophia921025/docforsolid:v1.0',
                                                    name: 'test_run_'+randomNumName.toString(),
                                                    HostConfig: {Binds:[inputFolder+":/input", outputFolder+":/output", dockerRunFolder+"/login:/login"]}})///$(pwd)/output //dockerRunFolder+"/input:/input"
                                                    .then(container => container.start())
                                                    // .then(container => container.stop())
                                                    // .then(container => container.restart())
                                                    // .then(container => container.delete({ force: true }))
                                                    .catch(error => console.log(error))//error

                                            });
                                        })
                                    }else{
                                        console.log("Verification failed! Request URL:" + requestInfo.requestID)
                                    }
                                });
                            }else{console.log("This requester does not have a credential. Execution interrupted!")}
                        });
                    }else{console.log("Sorry, this request does not have a valid signature! Execution interrupted!")}  
                });
            }else{
                console.log("No trigger message.")
            }
        });
    // });
    }));   
}


async function main(login_yaml){

    const time_start = performance.now();
    console.log(time_start)
    let session = await client.login({
        idp : login_yaml.SOLID_IDP, //"https://inrupt.net"
        username : login_yaml.SOLID_USERNAME, //"https://chang.inrupt.net/profile/card#me"
        password : login_yaml.SOLID_PASSWORD //"sophia383842"
    })
    const time_login = performance.now();
    console.log(time_login)
    if( session.isLoggedIn ) {
        const time_login = performance.now();
        // console.log("Login action takes (ms): ", time_login-time_start)
        var time_record = "Login action takes (ms): " + (time_login-time_start).toString() + '\n'

        fetcher.load($rdf.sym(inboxFolder)).then(response=> {
            const files = store.each($rdf.sym(inboxFolder), store.sym("http://www.w3.org/ns/ldp#contains"));
            const time_readTriggerMsg = performance.now();
            // console.log("Read trigger MSG from Server Pod takes (ms): ", time_readTriggerMsg-time_login)
            time_record = time_record + "Read trigger MSG from Server Pod takes (ms): " + (time_readTriggerMsg-time_login).toString() + '\n';

            queryData(files, time_record, time_readTriggerMsg).then(()=>console.log('Done'))
                                
        },e => console.log("Error fetching : "+e))
    }
}

var completedReqeust = []
app.get('/solid', function (req, res) {
    /* Read solid login information (confidential) */
    let fileContents = fs.readFileSync(dockerRunFolder+'/login/solid_login.yaml', 'utf8');
    let login_yaml = yaml.load(fileContents);
    // process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0"
    main(login_yaml);
})

// // Launch listening server on port 8081
app.listen(5000, function () {
  console.log('app listening on port 5000!')
})