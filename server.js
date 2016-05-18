/**
 * Created by wesleyyoung1 on 4/23/16.
 */

var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var async = require('async');

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
    var cModels, cById;
    var reqError=false;
    var selector = new AdWords.Selector.model({
        fields: campaignService.selectable,
        ordering: [{field: 'Name', sortOrder: 'ASCENDING'}],
        paging: {startIndex: 0, numberResults: 100}
    });
    campaignService.get(clientCustomerId,
        selector,
        function(err, results) {
            if (err){
                console.log(err);
                reqError=true;
            }
            cModels=results.entries.models;
            cById=results.entries._byId;
            res.end(JSON.stringify({models: cModels, byId: cById}));
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

function BlanketCampaignChange(req, res){
    var toStatus = req.body.toStatus;
    var campaignArray;
    var errorList=[];
    var successfulStateChanges=0;
    var selector = new AdWords.Selector.model({
        fields: campaignService.selectable,
        ordering: [{field: 'Name', sortOrder: 'ASCENDING'}],
        paging: {startIndex: 0, numberResults: 100}
    });
    campaignService.get(
        adWordsCredentials.ADWORDS_CLIENT_CUSTOMER_ID,
        selector,
        function(err, results) {
            campaignArray=results.entries.models;
            async.series([
                function(cb){
                    var count = 0;
                    function callGoogle(i){
                        count++;
                        campaignArray[i].set("status", toStatus);
                        campaignService.mutateSet(
                            adWordsCredentials.ADWORDS_CLIENT_CUSTOMER_ID,
                            campaignArray[i],
                            function(err, results){
                                if(err){
                                    parseString(err.body, function(err, results){
                                        errorList.push({errorBody: results, campaignName: campaignArray[i].attributes.name})
                                    });
                                    console.log(`There was an issue trying to set the status of campaign: ${campaignArray[i].attributes.name} to ${toStatus}`);
                                }else{
                                    successfulStateChanges++;
                                }
                                if(count<campaignArray.length){
                                    callGoogle(count);
                                }else{
                                    res.end({errors: errorList, message: `${successfulStateChanges} out of ${campaignArray.length} successfully changed to ${toStatus}`});
                                    cb(err);
                                }
                            }
                        )
                    }
                    callGoogle(count);
                }
            ]);
        }
    );
}

function changeCampaignStatus(req, res){
    var toStatus = req.body.toStatus;
    var id = req.body.id;
    var campaign;
    var selector = new AdWords.Selector.model({
        fields: campaignService.selectable,
        ordering: [{field: 'Name', sortOrder: 'ASCENDING'}],
        paging: {startIndex: 0, numberResults: 100}
    });
    campaignService.get(
        adWordsCredentials.ADWORDS_CLIENT_CUSTOMER_ID,
        selector,
        function(err, results){
            campaign=results.entries._byId[id];
            async.series([
                function(cb){
                    campaign.set('status', toStatus);
                    campaignService.mutateSet(
                        adWordsCredentials.ADWORDS_CLIENT_CUSTOMER_ID,
                        campaign,
                        function(err, response){
                            var message;
                            if(err){
                                console.log(err);
                                message = `There was an error changing campaign: ${campaign.attributes.name} to ${toStatus}, please check the error variable for more information`
                            }else{
                                message = `Campaign: ${campaign.attributes.name}'s status has been changed to ${toStatus}`;
                            }
                            res.end(JSON.stringify({error: err, message: message}))
                        }
                    )
                }
            ])
        }
    )
}

app.get('/getcampaigns', returnCampaigns);

app.get('/getreports', returnReports);

app.post('/changeallcampaignstates', BlanketCampaignChange);

app.post('/changecampaignstatus', changeCampaignStatus);


var port = 3343;
app.listen(port, function() {
    console.log(`App listening on port ${port}...`);
});

