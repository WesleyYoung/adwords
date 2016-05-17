/**
 * Created by wesleyyoung1 on 4/23/16.
 */

var express = require('express');
var app = express();
var bodyParser = require('body-parser');

var AdWords = require('googleads-node-lib');

var ga = require('google-adwords');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use('/', express.static(__dirname + '/client'));
app.use('/node_modules', express.static(__dirname + '/node_modules'));

const fs = require('fs');

var assert = require('assert');

var clientCustomerId = "403-762-1647";

var adWordsCredentials = {
    ADWORDS_CLIENT_ID: '1029228575607-v1uo3r25s1q1hvm9crdj2cmirpq1ndb1.apps.googleusercontent.com',
    ADWORDS_SECRET: 'SkIeigyoNjTUAETvQbMBKLT3',
    ADWORDS_DEVELOPER_TOKEN: 'VobDWYcEt2llfXIAjOHDtg',
    ADWORDS_REFRESH_TOKEN: '1/22noNp0i70anuQmNuDbaSpjp7iftx-JFoVRmTsIV9dYMEudVrK5jSpoR30zcRFq6',
    ADWORDS_CLIENT_CUSTOMER_ID: clientCustomerId,
    ADWORDS_USER_AGENT: 'Bask AdWords'
};

function returnCampaigns(res){
    var service = new AdWords.CampaignPerformanceReport(adWordsCredentials);
    var selector = new AdWords.Selector.model({
        fields: service.selectable,
        ordering: [{field: 'Name', sortOrder: 'ASCENDING'}],
        paging: {startIndex: 0, numberResults: 100}
    });
    service.getReport({
        dateRangeType: 'CUSTOM_DATE',
        dateMin: '19700101',
        dateMax: '20380101',
        downloadFormat: 'XML',
        fieldNames: service.defaultFieldNames
    }, function(error, response, body){
        //if (error) console.log(error);
        console.log(body);
    });
    console.log();

    res.end();
    //var service = new AdWords.AdGroupService(adWordsCredentials);


    //service.get(clientCustomerId, selector, function(err, results) {
    //    //if (err) console.log(err);
    //    //else console.log(JSON.stringify(results, null, 2));
    //    res.end(JSON.stringify(results));
    //});
}

app.get('/getcampaigns', function(req, res){
    returnCampaigns(res);
});


var port = 3343;
app.listen(port, function() {
    console.log(`App listening on port ${port}...`);
});

