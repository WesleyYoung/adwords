/**
 * Created by i97143 on 7/1/2016.
 */
(function(){
    angular.module('leadFactory', [])
        .factory('leadFactory', leadFactory);

    leadFactory.$inject=["$http"];

    function leadFactory($http){

        var times = ["0:00am", "0:15am", "0:30am", "0:45am", "1:00am", "1:15am", "1:30am", "1:45am", "2:00am", "2:15am", "2:30am", "2:45am", "3:00am", "3:15am", "3:30am", "3:45am", "4:00am", "4:15am", "4:30am", "4:45am", "5:00am", "5:15am", "5:30am", "5:45am", "6:00am", "6:15am", "6:30am", "6:45am", "7:00am", "7:15am", "7:30am", "7:45am", "8:00am", "8:15am", "8:30am", "8:45am", "9:00am", "9:15am", "9:30am", "9:45am", "10:00am", "10:15am", "10:30am", "10:45am", "11:00am", "11:15am", "11:30am", "11:45am", "12:00pm", "12:15pm", "12:30pm", "12:45pm", "1:00pm", "1:15pm", "1:30pm", "1:45pm", "2:00pm", "2:15pm", "2:30pm", "2:45pm", "3:00pm", "3:15pm", "3:30pm", "3:45pm", "4:00pm", "4:15pm", "4:30pm", "4:45pm", "5:00pm", "5:15pm", "5:30pm", "5:45pm", "6:00pm", "6:15pm", "6:30pm", "6:45pm", "7:00pm", "7:15pm", "7:30pm", "7:45pm", "8:00pm", "8:15pm", "8:30pm", "8:45pm", "9:00pm", "9:15pm", "9:30pm", "9:45pm", "10:00pm", "10:15pm", "10:30pm", "10:45pm", "11:00pm", "11:15pm", "11:30pm", "11:45pm"];

        function convertToHourly(stats){
            //console.log(stats);
            var output=[];
            for(var i=0;i<stats.length;i++){
                var hr = stats[i].time.split(":")[0];
                if(output[output.length-1]==undefined||output[output.length-1].time!==hr){
                    output.push({leads: stats[i].leads, time: hr+":00", makeUp: stats[i].makeUp, contacted: stats[i].contacted})
                }else{
                    output[output.length-1].leads=parseInt(output[output.length-1].leads)+parseInt(stats[i].leads);
                    output[output.length-1].contacted=parseInt(output[output.length-1].contacted)+parseInt(stats[i].contacted);
                    output[output.length-1].makeUp=parseFloat(output[output.length-1].makeUp)+parseFloat(stats[i].makeUp);
                }
            }

            return output;
        }

        function convertToHalfHour(stats){
            var output=[];
            //console.log(stats);
            for(var i=0;i<stats.length;i++){
                var hr = stats[i].time.split(":")[0],
                    hlf = stats[i].time.split(":")[1],
                    newHlf=(parseInt(hlf)-15).toString();

                //console.log(makeup);
                if(newHlf=="0")newHlf="00";
                if(output[output.length-1]==undefined||parseInt(hlf)==0||hlf=="30"){
                    if(parseInt(hlf)==0||hlf=="30"){
                        output.push({leads: stats[i].leads, time: hr+":"+hlf, makeUp: stats[i].makeUp, contacted: stats[i].contacted})
                    }else{
                        output.push({leads: stats[i].leads, time: hr+":"+newHlf, makeUp: stats[i].makeUp, contacted: stats[i].contacted})
                    }
                }else{
                    if(output[output.length-1].time==hr+":"+newHlf){
                        output[output.length-1].leads=parseInt(output[output.length-1].leads)+parseInt(stats[i].leads);
                        output[output.length-1].contacted=parseInt(output[output.length-1].contacted)+parseInt(stats[i].contacted);
                        output[output.length-1].makeUp=parseFloat(output[output.length-1].makeUp)+parseFloat(stats[i].makeUp);
                    }else{
                        output.push({leads: stats[i].leads, time: hr+":"+newHlf, makeUp: stats[i].makeUp, contacted: stats[i].contacted})
                    }
                }
            }
            //console.log(output);
            return output;
        }
        
        function fixTime(stats, type){
            if(type=="hourly"){
                for(var i=0;i<stats.length;i++){
                    stats[i].time=parseInt(stats[i].time);
                    if(stats[i].time>12){
                        stats[i].time-=12;
                        stats[i].time+=":00pm"
                    }else if(stats[i].time==12){
                        stats[i].time+=":00pm"
                    }else{
                        stats[i].time+=":00am";
                    }
                }
            }else{
                for(var i=0;i<stats.length;i++){
                    var hr = parseInt(stats[i].time.split(":")[0]),
                        min = stats[i].time.split(":")[1],
                        ext = "";
                    if(hr>12){
                        hr-=12;
                        ext="pm"
                    }else if(hr==12){
                        ext="pm"
                    }else{
                        ext="am";
                    }
                    //console.log("Time fuck up: " + hr+":"+min+ext);
                    stats[i].time=hr+":"+min+ext;
                }
            }
            return stats;
        }
        
        function getSpecificDay(day, interval){
            var timeLabels = times.filterTime(interval);
            var found=false;
            var output = {data: [], labels: timeLabels, total: 0, makeup: [], contacted: []};
            var report = interval=="hourly"?"statsByHr":interval=="quarterly"?"statsBy15":"statsBy30";
            return $http.get('/leadData').then((results)=>{
                //console.log(results.data);
                var data = results.data.leadData;
                for(var i=0;i<data.length;i++){
                    if(data[i].date==day){
                        for(var j=0;j<timeLabels.length;j++){
                            if(data[i][report][timeLabels[j]]!==undefined){
                                output.data.push(data[i][report][timeLabels[j]].leads);
                                output.contacted.push(data[i][report][timeLabels[j]].contacted);
                                output.makeup.push(data[i][report][timeLabels[j]].makeup);
                            }
                        }
                        output.total=data[i].total;

                        i=data.length;
                    }
                }
                //console.log(output);
                return output;
            });
        }

        function getSpecificRange(startDay, endDay, interval){
            var timeLabels = times.filterTime(interval),
                day1 = new Date(startDay)/1000,
                day2 = new Date(endDay)/1000;
            var found=false;
            var output = {
                data: [], 
                labels: timeLabels, 
                totals: 0,
                makeup: [], 
                contacted: [], 
                individualData: [], 
                individualContacted: [], 
                individualMakeup: [],
                individualSeries: []
            };
            var report = interval=="hourly"?"statsByHr":interval=="quarterly"?"statsBy15":"statsBy30";
            return $http.get('/leadData').then((results)=>{
                //console.log(results.data);
                var data = results.data.leadData;
                for(var i=0;i<data.length;i++){
                    var testDate = new Date(data[i].date)/1000;
                    if(testDate>=day1&&testDate<=day2){
                        output.individualData.push([]);
                        output.individualContacted.push([]);
                        output.individualMakeup.push([]);
                        var index = output.individualData.length-1;
                        for(var j=0;j<timeLabels.length;j++){
                            if(data[i][report][timeLabels[j]]!==undefined){
                                output.individualData[index].push(data[i][report][timeLabels[j]].leads);
                                output.individualContacted[index].push(data[i][report][timeLabels[j]].contacted);
                                output.individualMakeup[index].push(data[i][report][timeLabels[j]].makeup);
                            }
                        }
                        output.individualSeries.push(data[i].date.shortDate());
                        output.totals+=data[i].total;
                    }
                }
                for(var i=0;i<output.individualData.length;i++){
                    for(var j=0;j<output.individualData[i].length;j++){
                        if(output.data[j]==undefined){
                            output.data.push(output.individualData[i][j])
                        }else{
                            output.data[j]+=output.individualData[i][j];
                        }
                    }
                }
                //console.log(output);
                return output;
            });
        }

        Array.prototype.filterTime=function(int){
            var t = this;
            if(int=="quarterly"){
                return t;
            }else if(int=="hourly"){
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

        String.prototype.shortDate=function(){
            var t = new Date(this),
                monthNames = [
                    "January", "February", "March",
                    "April", "May", "June", "July",
                    "August", "September", "October",
                    "November", "December"
                ];

            return monthNames[parseInt(t.getMonth())] + " " + t.getDate()

        };
        
        function getLeadData(){
            return $http.get('/leadData').then(results=>{
                return results.data;
            })
        }
        
        return {
            leadsByDate: function(){
                return $http.get('/leadData').then(function(results){
                    console.log(results.data);
                    return results.data.byDate;
                });
            },
            getMetaData: function(){
                    return getLeadData().then(results=>{
                        return results.metaData;
                    })
            },
            convertDate: function(d){
                var yr=d.getFullYear(), 
                    mn=d.getMonth().length>1?(parseInt(d.getMonth())+1).toString():"0"+(parseInt(d.getMonth())+1).toString(),
                    day=parseInt(d.getDate())>9?d.getDate():"0"+d.getDate();
                return yr+"/"+mn+"/"+day;
            },
            getSpecificDay: getSpecificDay,
            getSpecificRange: getSpecificRange
        }
    }

})();