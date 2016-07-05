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
                    output.push({leads: stats[i].leads, time: hr+":00"})
                }else{
                    output[output.length-1].leads=parseInt(output[output.length-1].leads)+parseInt(stats[i].leads);
                }
            }

            return output;
        }

        function convertToHalfHour(stats){
            var output=[];
            for(var i=0;i<stats.length;i++){
                var hr = stats[i].time.split(":")[0],
                    hlf = stats[i].time.split(":")[1],
                    newHlf=(parseInt(hlf)-15).toString();
                if(newHlf=="0")newHlf="00";
                if(output[output.length-1]==undefined||parseInt(hlf)==0||hlf=="30"){
                    if(parseInt(hlf)==0||hlf=="30"){
                        output.push({leads: stats[i].leads, time: hr+":"+hlf})
                    }else{
                        output.push({leads: stats[i].leads, time: hr+":"+newHlf})
                    }
                }else{
                    if(output[output.length-1].time==hr+":"+newHlf){
                        output[output.length-1].leads=parseInt(output[output.length-1].leads)+parseInt(stats[i].leads);
                    }else{
                        output.push({leads: stats[i].leads, time: hr+":"+newHlf})
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
            var output = {data: [], labels: timeLabels, total: 0};
            return $http.get('/leadData').then((results)=>{
                console.log(results.data);
                var data = results.data.byDate;
                for(var i=0;i<data.length;i++){
                    if(data[i].date==day){
                        found=true;
                        var stats = interval=="quarterly"?data[i].stats:interval=="hourly"?convertToHourly(data[i].stats):convertToHalfHour(data[i].stats);
                        stats = fixTime(stats, interval);
                        var tempObj={};
                        for(var j=0;j<stats.length;j++){
                            //output.data.push(stats[j].leads);
                            if(tempObj[stats[j].time]==undefined){
                                tempObj[stats[j].time]=stats[j].leads
                            }else{
                                tempObj[stats[j].time]=parseInt(tempObj[stats[j].time])+parseInt(stats[j].leads)
                            }
                        }
                        for(var j=0;j<timeLabels.length;j++){
                            if(tempObj[timeLabels[j]]==undefined){
                                output.data.push("0")
                            }else{
                                output.data.push(tempObj[timeLabels[j]])
                            }
                        }
                        output.total+=data[i].totalLeads;
                        i=data.length;
                    }
                }
                return output;
            });
        }

        function getSpecificRange(startDay, endDay, interval){
            var timeLabels = times.filterTime(interval);
            //console.log(timeLabels);
            var start = new Date(startDay)/1000,
                end = new Date(endDay)/1000,
                outputData={},
                output = {data: [], labels: timeLabels, total: 0},
                total=0;
            return $http.get('leadData').then(function(results){
                var data = results.data.byDate;
                for(var i=0;i<data.length;i++){
                    var epochStart = new Date(data[i].date)/1000;
                    if(epochStart>=start&&epochStart<=end){
                        //console.log(dataDay);
                        var stats = interval=="quarterly"?data[i].stats:interval=="hourly"?convertToHourly(data[i].stats):convertToHalfHour(data[i].stats);
                        //console.log(stats);
                        stats = fixTime(stats, interval);
                        for(var j=0;j<stats.length;j++){
                            if(outputData[stats[j].time.replace(":", ".")]==undefined){
                                outputData[stats[j].time.replace(":", ".")]=stats[j].leads;
                            }else{
                                outputData[stats[j].time.replace(":", ".")]=(parseInt(outputData[stats[j].time.replace(":", ".")]) + parseInt(stats[j].leads)).toString()
                            }

                        }

                    }
                }
                //console.log(outputData);
                for(var i=0;i<timeLabels.length;i++){
                    if(outputData[timeLabels[i].replace(":", ".")]==undefined){
                        output.data.push("0")
                    }else{
                        output.data.push(outputData[timeLabels[i].replace(":", ".")]);
                        output.total+=parseInt(outputData[timeLabels[i].replace(":", ".")]);
                    }
                }
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
            metaData: function(){
                    getLeadData().then(results=>{
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