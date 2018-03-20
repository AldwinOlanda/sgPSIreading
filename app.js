'use strict';
const express = require('express');
const bodyParser = require("body-parser");

const psiread = express();

const https = require('https');
const host = 'api.data.gov.sg';

psiread.use(
  bodyParser.urlencoded({
    extended: true
  })
);

psiread.use(bodyParser.json());

/* GET home page. */
psiread.post('/', function (req, res) {
  
    //let sglocation = req.body.result.parameters['location'];
  
    let date = '';
    let datetime = '';
  
  /* Check if the Datetime parameter exist */
    if (req.body.result.parameters['date']) {
        /* Include time inside the datetime parameter */
        datetime = req.body.result.parameters['date']+'T12:00:00';
        date  = req.body.result.parameters['date'];
    }
  /* execute the callPsiAPI function   */
  callPSIApi(datetime,date).then((output) => {
        // Return the results of the PSI API to Dialogflow
       res.setHeader('Content-Type', 'application/json');
        res.send(JSON.stringify({ 'speech': output, 'displayText': output }));
    }).catch((error) => {
        // If there is an error let the user know
        res.setHeader('Content-Type', 'application/json');
        res.send(JSON.stringify({ 'speech': error, 'displayText': error }));
        
    });
    
});

//function to launch http call and check for the Psi of Singapore 
function callPSIApi(datetime,date) {
    return new Promise((resolve, reject) => {
        // Create the path for the HTTP request to get the weather
      let path = '/v1/environment/psi' +
            '?date_time=' + encodeURIComponent(datetime) + '&date=' + date;
             console.log('API Request: ' + host + path);
      
         //res.setHeader('Content-Type', 'application/json');
         //res.send(JSON.stringify({ 'speech': host, 'displayText': path }));
         //return 
      
        // Make the HTTP request to get the weather
        https.get({ host: host, path: path }, (res) => {
            let body = ''; // var to store the response chunks
            res.on('data', (d) => { body += d; }); // store each response chunk
            res.on('end', () => {
                // After all the data has been received parse the JSON for desired data
                let response = JSON.parse(body);
                let items = response.items;
                let readings = [];
                readings = items[0]['readings'];
                let psitwentyfourhourly = [];
                psitwentyfourhourly = readings['psi_twenty_four_hourly'];
              
                //Loop through the data and check for the weather for the location given
                //let i = 0;
                let output = '';
                //for (i = 0; i != psitwentyfourhourly.length; i++) {
                  
                    //if (psitwentyfourhourly[i]['area']==location){
                  output = 'Here are the PSI reading in Singapore \n'+
                           '  National : '+psitwentyfourhourly['national'] +' \n'+
                           '  North : '+ psitwentyfourhourly['north'] +' \n'+
                           '  South : '+ psitwentyfourhourly['south'] +' \n'+
                           '  East : '+ psitwentyfourhourly['east'] +' \n'+
                           '  West : '+ psitwentyfourhourly['west'] +' \n'+
                           '  Central : '+ psitwentyfourhourly['central'];
                                            
                         //break;                 
                      //}
                                           
                  //}
                  
              
                // Resolve the promise with the output text
                console.log(output);
                resolve(output);
            });
            res.on('error', (error) => {
                reject(error);
            });
        });
    });
};


psiread.listen(process.env.PORT || 8000, function() {
  console.log("Server up and listening");
});
