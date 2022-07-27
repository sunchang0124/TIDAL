# Hello, SOLID

Start Date: 17-05-2020
Update Date: 13-06-2020

Editor: [Chang Sun](chang.sun@maastrichtuniversity.nl)

Abstract: This repository shows how to build a SOLID application to fetch/create/modify data in your SOLID Pod, start a data request (for research), and participate in researchers' data request. This is my first SOLID application built in a very limited time. I will learn from others and improve it step by step. Welcome to contact me if you have any questions :)

***
### How to use ###
Here is a running prototype version: https://sunchang0124.github.io/dist/homepage.html 
You can log in TIDAL with your SOLID account with your WebID and credential (how to create a [SOLID account](https://solidproject.org/developers/tutorials/getting-started#existing-provider)
On TIDAL: 
* You can fetch the existing data from your pod on [Fetch Page](https://sunchang0124.github.io/dist/fetch.html)
* You can create a new data file and add data into the file on [Create Page](https://sunchang0124.github.io/dist/create.html)
* You can check published data requests on [Participate Page](https://sunchang0124.github.io/dist/participate.html)
* You can publish a new data request on [Request Page](https://sunchang0124.github.io/dist/request.html) (Demo)

### How to run TIDAL ###
Run TIDAL web application locally, if you to first install Node.js and npm. For installation in different machines, please refer to the [instruction of instalation](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm). 

Then, install the packages [npx](https://www.npmjs.com/package/npx), [webpack](https://webpack.js.org/guides/installation/), [http-server](https://www.npmjs.com/package/http-server)
```
npm install -g npx
npm install --save-dev webpack
npm install http-server
```

Then run the following command in the home folder of the project:
```
npx webpack                                                    
http-server -c-1
```

<!--
### How does it look like? ###
You can try the [SOLID App](https://sunchang0124.github.io/dist/homepage.html) by yourself. The following functions are implemented in my Solid app so far. You can watch [this video](https://youtu.be/oVFDoKmbpUg) to get the first impression.

You can also jump to the function which you are interested in particular:
1. [Introduction](https://youtu.be/oVFDoKmbpUg)
2. [Login with your Solid account](https://www.youtube.com/watch?v=oVFDoKmbpUg&t=2m21s)
3. [Fetch public data from Solid Pod](https://www.youtube.com/watch?v=oVFDoKmbpUg&t=4m19s)
4. [Fetch private data from Solid Pod](https://www.youtube.com/watch?v=oVFDoKmbpUg&t=6m52s)
5. [Create new data files to Solid Pod](https://www.youtube.com/watch?v=oVFDoKmbpUg&t=8m50s)
6. [Start a data request](https://www.youtube.com/watch?v=oVFDoKmbpUg&t=11m03s)
7. [Provide data to a request from Solid Pod](https://www.youtube.com/watch?v=oVFDoKmbpUg&t=17m50s)
8. [Analyze requested data in regular analysis setting](https://www.youtube.com/watch?v=oVFDoKmbpUg&t=23m01s)
9. [Participate in a privacy-preserving data request](https://www.youtube.com/watch?v=oVFDoKmbpUg&t=24m44s) 
10. [Analysis in the privacy-preserving data request](https://www.youtube.com/watch?v=oVFDoKmbpUg&t=27m50s)
-->

### How has it been built? ###
Please go to [Wiki page](https://github.com/sunchang0124/sunchang0124.github.io/wiki) for: 
1. [What is SOLID?](https://github.com/sunchang0124/sunchang0124.github.io/wiki/1.-About-SOLID)
2. [Get started with SOLID](https://github.com/sunchang0124/sunchang0124.github.io/wiki/2.-Get-Started)
3. [Build your first SOLID App (without Web App experience)](https://github.com/sunchang0124/sunchang0124.github.io/wiki/3.-Background-Learning)
