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

function formatLeadData(){
    var times = [
        "0:00am", "0:15am", "0:30am", "0:45am", "1:00am", "1:15am", "1:30am", "1:45am", "2:00am", "2:15am",
        "2:30am", "2:45am", "3:00am", "3:15am", "3:30am", "3:45am", "4:00am", "4:15am", "4:30am", "4:45am",
        "5:00am", "5:15am", "5:30am", "5:45am", "6:00am", "6:15am", "6:30am", "6:45am", "7:00am", "7:15am",
        "7:30am", "7:45am", "8:00am", "8:15am", "8:30am", "8:45am", "9:00am", "9:15am", "9:30am", "9:45am",
        "10:00am", "10:15am", "10:30am", "10:45am", "11:00am", "11:15am", "11:30am", "11:45am", "12:00pm",
        "12:15pm", "12:30pm", "12:45pm", "1:00pm", "1:15pm", "1:30pm", "1:45pm", "2:00pm", "2:15pm", "2:30pm",
        "2:45pm", "3:00pm", "3:15pm", "3:30pm", "3:45pm", "4:00pm", "4:15pm", "4:30pm", "4:45pm", "5:00pm", "5:15pm",
        "5:30pm", "5:45pm", "6:00pm", "6:15pm", "6:30pm", "6:45pm", "7:00pm", "7:15pm", "7:30pm", "7:45pm", "8:00pm",
        "8:15pm", "8:30pm", "8:45pm", "9:00pm", "9:15pm", "9:30pm", "9:45pm", "10:00pm", "10:15pm", "10:30pm",
        "10:45pm", "11:00pm", "11:15pm", "11:30pm", "11:45pm"
    ];
    converter.fromFile("campaignStats.csv", (err, result)=>{
        if(err)throw err;
        var output=[];
        for(var i=0;i<result.length;i++){
            var date=result[i]['DATE'],
                leads = result[i]['LIST RECORDS'],
                contacted = result[i]['CONTACTED count'],
                quarter= result[i]['QUARTER HOUR'].timeFix(),
                half = result[i]['QUARTER HOUR'].timeFix("halfhour"),
                hour = result[i]['QUARTER HOUR'].timeFix("hour"),
                index = output.length==0?0:output.length-1;
            if(output[index]==undefined||output[index].date!==date){
                output.push({
                    date: date,
                    statsBy15: {[quarter]: {leads: leads, contacted: contacted, time: quarter}},
                    statsBy30: {[half]: {leads: leads, contacted: contacted, time: half}},
                    statsByHr: {[hour]: {leads: leads, contacted: contacted, time: hour}},
                    total: leads
                });
            }else{
                output[index].statsBy15[quarter]={leads: leads, contacted: contacted, time: quarter};
                if(output[index].statsBy30[half]==undefined){output[index].statsBy30[half]={leads: leads, contacted: contacted, time: half};}
                else {output[index].statsBy30[half].leads+=leads;output[index].statsBy30[half].contacted+=contacted;}
                if(output[index].statsByHr[hour]==undefined)output[index].statsByHr[hour]={leads: leads, contacted: contacted, time: hour};
                else {output[index].statsByHr[hour].leads+=leads;output[index].statsByHr[hour].contacted+=contacted;}
                output[index].total+=leads;
            }
        }
        
        var minDate=new Date(output[0].date.split("/")[0], parseInt(output[0].date.split("/")[1])-1, output[0].date.split("/")[2]),
            maxDate=new Date(output[output.length-1].date.split("/")[0], parseInt(output[output.length-1].date.split("/")[1])-1, output[output.length-1].date.split("/")[2]);
        
        for(var i=0;i<output.length;i++){
            var attArr=["statsBy15", "statsBy30", "statsByHr"];
                
            var total = output[i].total;
            for(var j=0;j<attArr.length;j++){
                var dynamicTime = times.filterTime(attArr[j]);
                for(var obj in output[i][attArr[j]]){
                    output[i][attArr[j]][obj].makeup = parseFloat(((output[i][attArr[j]][obj].leads/total)*100).toFixed(2));
                }
                for(var k=0;k<dynamicTime.length;k++){
                    if(output[i][attArr[j]][dynamicTime[k]]==undefined){
                        output[i][attArr[j]][dynamicTime[k]]={leads: 0, contacted: 0, time: 0}
                    }
                }
            }
            
        }
        //console.log(output);
        fs.writeFile('leadData.json', JSON.stringify({metaData: {minDate: minDate, maxDate: maxDate}, leadData: output}))
    })
}

formatLeadData();

Array.prototype.filterTime=function(int){
    var t = this;
    if(int=="statsBy15"){
        return t;
    }else if(int=="statsByHr"){
        return t.filter(function(item){
            return item.split(":")[1][0]=="0"
        })
    }else{
        return t.filter(function(item){
            //console.log(item);
            return item.split(":")[1][0]=="0"||item.split(":")[1][0]=="3"
        })
    }
};

String.prototype.timeFix=function(interval){
    var d = this;
    var hr = parseInt(d.split(":")[0]),
        min = parseInt(d.split(":")[1]),
        ext = "am";
    if(hr>=12){
        ext="pm";
        if(hr>12)hr-=12;
    }
    if(interval=="hour")min=0;
    else if(interval=="halfhour"){
        min==0?min=0:min==15?min=0:min==30?min=30:min=30;
    }
    if(min<10)min="0"+min;
    return hr+":"+min+ext;
};