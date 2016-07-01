/**
 * Created by wesleyyoung1 on 4/23/16.
 */

var express = require('express');
var app = express();
var bodyParser = require('body-parser');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use('/', express.static(__dirname + '/client'));
app.use('/node_modules', express.static(__dirname + '/node_modules'));

var async = require('async');
var http = require('http');
var server = http.createServer(app);

var io = require('socket.io').listen(server);

var AdWords = require('googleads-node-lib');

var parseString=require('xml2js').parseString;

var Converter = require("csvtojson").Converter;

var converter = new Converter({});

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

var adGroupService = new AdWords.AdGroupService(adWordsCredentials);



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
                res.end(JSON.stringify({error: err}))
            }else{
                cModels=results.entries.models;
                cById=results.entries._byId;
                res.end(JSON.stringify({models: cModels, byId: cById}));
            }
    });
}

function returnAdGroups(req, res){
    var cModels, cById;
    var reqError=false;
    var selector = new AdWords.Selector.model({
        fields: adGroupService.selectable,
        ordering: [{field: 'Name', sortOrder: 'ASCENDING'}],
        paging: {startIndex: 0, numberResults: 100}
    });
    adGroupService.get(clientCustomerId,
        selector,
        function(err, results) {
            if (err){
                console.log(err);
                reqError=true;
                res.end(JSON.stringify({error: err}))
            }else{
                cModels=results.entries;
                var byId = {};
                for(var i=0;i<results.entries.models.length;i++){
                    byId[results.entries.models[i].id]=results.entries.models[i];
                }
                res.end(JSON.stringify({models: cModels, byId: byId}));
            }
        });
}

function returnReports(req, res){
    var output = {};
    var count = 0;
    function sendGet(x){
        count++;
        reports[x].getReport({
            dateRangeType: 'CUSTOM_DATE',
            dateMin: '20160501',
            dateMax: '20160520',
            downloadFormat: 'XML',
            fieldNames: reports[x].defaultFieldNames,
            clientCustomerId: clientCustomerId
        }, function(error, response, body){
            if(error){
                console.log(error);
                res.end(JSON.stringify({error: error}))
            }else{
                parseString(body, function(err, result){
                    if(err){
                        console.log(err);
                    }
                    var n = "report-name";
                    console.log(result.report[n][0].$.name);
                    output[result.report[n][0].$.name.split(" ").join("_")]=result;
                    if(count<reports.length){
                        sendGet(count);
                    }else{
                        res.end(JSON.stringify(output));
                    }
                })
            }
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
        clientCustomerId,
        selector,
        function(err, results){
            if(err){
                console.log(err);
                res.end(JSON.stringify({error: err}))
            }
            else{
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
                                    message = `There was an error changing campaign: ${campaign.attributes.name} to ${toStatus}, please check the error variable for more information`;
                                    res.end(JSON.stringify({error: err, message: message}))
                                }else{
                                    message = `Campaign: ${campaign.attributes.name}'s status has been changed to ${toStatus}`;
                                    campaignService.get(
                                        clientCustomerId,
                                        selector,
                                        function(err, newSet){
                                            if(err){
                                                console.log(err);
                                                res.end(JSON.stringify({error: err, message: message}))
                                            }else{
                                                res.end(JSON.stringify({error: err, message: message, newCampaignSet: {models: newSet.entries.models, byId: newSet.entries._byId}}))
                                            }
                                        }
                                    );
                                }
                            }
                        )
                    }
                ])
            }
        }
    )
}

function changeAdGroupStatus(req, res){
    console.log("We Got Here");
    var toStatus = req.body.toStatus;
    var id = req.body.id;
    var adGroup;
    var selector = new AdWords.Selector.model({
        fields: adGroupService.selectable,
        ordering: [{field: 'Name', sortOrder: 'ASCENDING'}],
        paging: {startIndex: 0, numberResults: 100}
    });
    adGroupService.get(
        clientCustomerId,
        selector,
        function(err, results){
            if(err){
                console.log(err);
                res.end(JSON.stringify({error: err}))
            }
            else{
                for(var i=0;i<results.entries.models.length;i++){
                    if(results.entries.models[i].id==id){
                        adGroup=results.entries.models[i];
                    }
                }
                async.series([
                    function(cb){
                        adGroup.set('status', toStatus);
                        adGroupService.mutateSet(
                            clientCustomerId,
                            adGroup,
                            function(err, response){
                                var message;
                                if(err){
                                    console.log(err);
                                    message = `There was an error changing Ad Group: ${adGroup.attributes.name} to ${toStatus}, please check the error variable for more information`;
                                    res.end(JSON.stringify({error: err, message: message}))
                                }else{
                                    message = `Ad Group: ${adGroup.attributes.name}'s status has been changed to ${toStatus}`;
                                    adGroupService.get(
                                        clientCustomerId,
                                        selector,
                                        function(err, newSet){
                                            if(err){
                                                console.log(err);
                                                res.end(JSON.stringify({error: err, message: message}))
                                            }else{
                                                res.end(JSON.stringify({error: err, message: message, newAdGroupSet: {models: newSet.entries.models, byId: newSet.entries._byId}}))
                                            }
                                        }
                                    );
                                }
                            }
                        )
                    }
                ])
            }
        }
    )
}

app.get('/getcampaigns', returnCampaigns);

app.get('/getadgroups', returnAdGroups);

app.get('/getreports', returnReports);

app.post('/changeallcampaignstates', BlanketCampaignChange);

app.post('/changecampaignstatus', changeCampaignStatus);

app.post('/changeadgroupstatus', changeAdGroupStatus);

io.on('connection', function(socket){
    var autoGrabber = true;
    function campaignGrabber() {
        console.log("Init Campaign Retrieve");
        var cModels, cById;
        var reqError = false;
        var selector = new AdWords.Selector.model({
            fields: campaignService.selectable,
            ordering: [{field: 'Name', sortOrder: 'ASCENDING'}],
            paging: {startIndex: 0, numberResults: 100}
        });
        campaignService.get(
            clientCustomerId,
            selector,
            function (err, results) {
                if (err) {
                    console.log(err);
                    reqError = true;
                    socket.broadcast.emit('error', JSON.stringify({message: "There was an error getting the campaigns from Google", error: err}))
                } else{
                    cModels = results.entries.models;
                    cById = results.entries._byId;
                    socket.broadcast.emit('campaignretrieve', JSON.stringify({models: cModels, byId: cById}));
                    setTimeout(function(){
                        if(autoGrabber){
                            campaignGrabber();
                        }
                    }, 30000)
                }
            });
    }
    if(autoGrabber){
        //campaignGrabber();
    }
});

app.get('/leadData', function(req, res){
    fs.readFile('leadData.json', (err,data)=>{
        res.end(data);
    });

});

var port = 3343;
server.listen(port, function() {
    console.log(`App listening on port ${port}...`);
});

function adjustLeadData(){
    converter.fromFile("campaignStats.csv", (err, result)=>{
        if(err)throw err;
        //console.log(result);
        var results = result,
            leadsByDate = [],
            leadsBy15Monthly = {};
        for(var i=0;i<results.length;i++){
            var goodDate = results[i].DATE;
            if(leadsByDate[leadsByDate.length-1]==undefined||leadsByDate[leadsByDate.length-1].date!==goodDate){
                leadsByDate.push({date: goodDate, stats: [{leads: results[i]['LIST RECORDS'], time: results[i]['QUARTER HOUR']}]})
            }else{
                leadsByDate[leadsByDate.length-1].stats.push({leads: results[i]['LIST RECORDS'], time: results[i]['QUARTER HOUR']})
            }
        }
        for(var i=0;i<leadsByDate.length;i++){
            var count = 0;
            for(var j=0;j<leadsByDate[i].stats.length;j++){
                count+=parseInt(leadsByDate[i].stats[j].leads);
                if(leadsBy15Monthly[leadsByDate[i].stats[j].time.replace(":", ".")]==undefined){
                    leadsBy15Monthly[leadsByDate[i].stats[j].time.replace(":", ".")]=leadsByDate[i].stats[j].leads;
                }else{
                    leadsBy15Monthly[leadsByDate[i].stats[j].time.replace(":", ".")]= parseInt(leadsByDate[i].stats[j].leads + leadsBy15Monthly[leadsByDate[i].stats[j].time.replace(":", ".")]);
                }
            }
            leadsByDate[i].totalLeads=count;
        }

        fs.writeFile('leadData.json', JSON.stringify({byDate: leadsByDate, by15Monthly: leadsBy15Monthly}), (err)=>{
           if(err)throw err;

        });

    });
}

adjustLeadData();