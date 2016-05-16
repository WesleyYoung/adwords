/**
 * Created by wesleyyoung1 on 4/23/16.
 */

var express = require('express');
var app = express();
var bodyParser = require('body-parser');

var AdWords = require('googleads-node-lib');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use('/', express.static(__dirname + '/client'));
app.use('/node_modules', express.static(__dirname + '/node_modules'));

const fs = require('fs');

var assert = require('assert');

var clientCustomerId = "403-762-1647";

var adWordsCredentials = {
    ADWORDS_CLIENT_ID: '1029228575607-v1uo3r25s1q1hvm9crdj2cmirpq"Name1ndb1.apps.googleusercontent.com',
    ADWORDS_SECRET: 'SkIeigyoNjTUAETvQbMBKLT3',
    ADWORDS_DEVELOPER_TOKEN: 'VobDWYcEt2llfXIAjOHDtg',
    ADWORDS_REFRESH_TOKEN: '1/22noNp0i70anuQmNuDbaSpjp7iftx-JFoVRmTsIV9dYMEudVrK5jSpoR30zcRFq6',
    ADWORDS_CLIENT_CUSTOMER_ID: clientCustomerId,
    ADWORDS_USER_AGENT: 'Bask'
};

var Service = new AdWords.ManagedCustomerService(adWordsCredentials);

//var service = new AdWords.CampaignService(adWordsCredentials);
//console.log(service.selectable);
//var selector = new AdWords.Selector.model({
//    dateRange: {min: '19700101', max: '20160505'},
//    fields: service.selectable,
//    ordering: [{field: 'Name', sortOrder: 'ASCENDING'}],
//    paging: {startIndex: 1, numberResults: 1},
//    predicates: []
//});

function returnCampaigns(res){

    //service.get(clientCustomerId, selector, function(err, results) {
    //    if (err) console.log(err);
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

