/**
 * Created by wesleyyoung1 on 4/23/16.
 */

var express = require('express');
var app = express();
var bodyParser = require('body-parser');

var AdWords = require('googleads-node-lib');

var parseString=require('xml2js').parseString;

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

var campaignReportService = new AdWords.CampaignPerformanceReport(adWordsCredentials);
var adGroupReportService = new AdWords.AdGroupPerformanceReport(adWordsCredentials);
var accReportService = new AdWords.AccountPerformanceReport(adWordsCredentials);
//var budgetReportService = new AdWords.BudgetPerformanceReport(adWordsCredentials);
//var clickReportService = new AdWords.ClickPerformanceReport(adWordsCredentials);

var reports = [
    campaignReportService,
    adGroupReportService,
    accReportService
    //budgetReportService,
    //clickReportService
];

var campaignService = new AdWords.CampaignService(adWordsCredentials);





function returnCampaigns(req, res){
    var campaignObj;
    var reqError=false;
    var selector = new AdWords.Selector.model({
        fields: campaignService.selectable,
        ordering: [{field: 'Name', sortOrder: 'ASCENDING'}],
        paging: {startIndex: 0, numberResults: 100}
    });
    campaignService.get(clientCustomerId, selector, function(err, results) {
        if (err){
            console.log(err);
            reqError=true;
        }
        campaignObj=JSON.stringify(results.entries);
        //console.log(JSON.stringify(results.entries));
        var iter = JSON.parse(campaignObj);
        console.log(iter);

        res.end(campaignObj);
    });
}

function returnReports(req, res){
    var output = {};
    var count = 0;
    function sendGet(x){
        count++;
        reports[x].getReport({
            dateRangeType: 'CUSTOM_DATE',
            dateMin: '19700101',
            dateMax: '20380101',
            downloadFormat: 'XML',
            fieldNames: reports[x].defaultFieldNames,
            clientCustomerId: clientCustomerId
        }, function(error, response, body){
            if(error){
                console.log(error);
            }
            parseString(body, function(err, result){
                if(err){
                    console.log(err);
                }
                var n = "report-name";
                console.log(result.report[n][0].$.name);
                output[result.report[n][0].$.name]=result;
                if(count<reports.length){
                    sendGet(count);
                }else{
                    res.end(JSON.stringify(output));
                }
            })
        });
    }
    sendGet(count);
}

app.get('/getcampaigns', returnCampaigns);

app.get('/getreports', returnReports);


var port = 3343;
app.listen(port, function() {
    console.log(`App listening on port ${port}...`);
});

