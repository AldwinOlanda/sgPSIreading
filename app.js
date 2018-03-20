'use strict';
const express = require('express');
const bodyParser = require("body-parser");

const weather = express();

const https = require('https');
const host = 'api.data.gov.sg';

weather.use(
  bodyParser.urlencoded({
    extended: true
  })
);

weather.use(bodyParser.json());

/* GET home page. */
weather.post('/', function (req, res) {
  
    let sglocation = req.body.result.parameters['location'];
  
    let date = '';
    let datetime = '';
  
  /* Check if the Datetime parameter exist */
    if (req.body.result.parameters['date']) {
        /* Include time inside the datetime parameter */
        datetime = req.body.result.parameters['date']+'T12:00:00';
        date  = req.body.result.parameters['date'];
    }
  /* execute the callWeatherAPI function   */
  callWeatherApi(datetime,date,sglocation).then((output) => {
        // Return the results of the weather API to Dialogflow
       res.setHeader('Content-Type', 'application/json');
        res.send(JSON.stringify({ 'speech': output, 'displayText': output }));
    }).catch((error) => {
        // If there is an error let the user know
        res.setHeader('Content-Type', 'application/json');
        res.send(JSON.stringify({ 'speech': error, 'displayText': error }));
        
    });
    
});

//function to launch http call and check for the weather forecast on a given Singapore location 
function callWeatherApi(datetime,date,location) {
    return new Promise((resolve, reject) => {
        // Create the path for the HTTP request to get the weather
      let path = '/v1/environment/2-hour-weather-forecast' +
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
                let forecasts = [];
                forecasts = items[0]['forecasts'];
              
                //Loop through the data and check for the weather for the location given
                let i = 0;
                let output = '';
                for (i = 0; i != forecasts.length; i++) {
                  
                    if (forecasts[i]['area']==location){
                         output = 'The condition in Singapore, ' + forecasts[i]['area'] +' is '+ forecasts[i]['forecast'];
                         break;                 
                      }
                                           
                  }
                  // in the event that the location is not existing, do another check and default the location to City  
                  if (output==''){
                   i = 0;
                   for (i = 0; i != forecasts.length; i++) {
                           if (forecasts[i]['area']=='City'){
                               output = 'The condition in ' + forecasts[i]['area'] +' is '+ forecasts[i]['forecast'];
                               break;                 
                         }
                   }
                  }
              
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


weather.listen(process.env.PORT || 8000, function() {
  console.log("Server up and listening");
});
