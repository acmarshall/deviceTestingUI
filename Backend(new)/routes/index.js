var express = require('express');
var router = express.Router();
var parser = require('xml2js').parseString
var decompress = require('decompress')
var mongo_client = require('mongodb').MongoClient
var fs = require('fs')
// var app = require('../app');

var buildArray = [];
var globalReturn = [];
var parsedInfo = [];
var fileArray = ['JunitReport1.tar.gz']

function importxml(fileArray) {
    fileArray.map((data, index)=>{
        decompress(data, './').then((files)=>{
            var filepath = files[0].path;
            console.log(files[0].path, index);
            fs.readFile(filepath, function (err, data) {
                if (err) {
                    console.log(err)
                }

                parser(data, function (err2, result) {
                    if (err2) {
                        console.log(err)
                    }
                    let length = globalReturn.length;
                    if(length <= 0) {
                        console.log('first test')
                        globalReturn.push(result);
                    } else {
                        let prev_date = globalReturn[length - 1].testsuites.$.date;
                        let prev_timestamp = globalReturn[length - 1].testsuites.$.time;
                        if(prev_date == result.testsuites.$.date) {
                            console.log('same date')
                            if(prev_timestamp == result.testsuites.$.time) {
                                console.log('same time: not push')
                            } else {
                                console.log('different time: push')
                                globalReturn.push(result);
                            }
                        } else {
                            console.log('different date: push')
                            globalReturn.push(result);
                        }
                    }
                })
            })   
        })   
    })       
}

importxml(fileArray);


function getHeader(globalReturn) {
    let all_info;
    let total_tests;
    let total_failed;
    let total_passed;
    let total_time;
    let platform;
    let version;
    let property;
    let date;
    let time_stamp;
    let header = {};

    for(let i = globalReturn.length - 1; i >= 0; i--) {
        all_info = globalReturn[i].testsuites.testsuite[0];
        date = globalReturn[globalReturn.length - 1].testsuites.$.date;
        time_stamp = globalReturn[globalReturn.length - 1].testsuites.$.time;
        platform = all_info.properties[0].property[3].$.value;
        version = all_info.properties[0].property[2].$.value;
        property = platform + ' ' + version;
        if(i == 0) {
            total_tests = parseInt(all_info.$.tests);
            total_failed = parseInt(all_info.$.failures);
            total_time = parseFloat(all_info.$.time);
        } else {
            total_tests += parseInt(all_info.$.tests);
            total_failed += parseInt(all_info.$.failures);
            total_time += parseFloat(all_info.$.time);
        }
    }   
    total_passed = total_tests - total_failed;

    header['tests'] = total_tests;
    header['passed'] = total_passed;
    header['failed'] = total_failed;
    header['time'] = total_time;
    header['property'] = property;
    header['date'] = date;
    header['timestamp'] = time_stamp;

    return header;
}

function getObject(globalReturn) {
    let all_info;
    let map;
    let body = {};
    let isCalled = false;

    for(let i = globalReturn.length - 1; i >= 0; i--) {
        all_info = globalReturn[i].testsuites.testsuite[0].testcase;
        map = getNumPassAndFailOfEachTest(all_info)
        for(let key in all_info) {
            let device_name;
            let test_name = '';
            let steps = all_info[key].steps[0].step;
            let parsed_step = [];
            let step_passed = 0;
            let step_failed = 0;
            let time;

            all_info[key].$.name.split('_').map((data, index)=>{
                if(index == 0) device_name = data;
                else test_name += data + ' ';
            })
            time = parseFloat(all_info[key].$.time);

            if(checkNullOrUndefined(body[device_name])) {
                body[device_name] = {
                    build: 0,
                    tests: []
                }
            }
            
            
            if(checkNullOrUndefined(body[device_name]['tests'][body[device_name]['build']])) {
                body[device_name]['tests'][body[device_name]['build']] = {
                    pass: map[device_name]['pass'],
                    fail: map[device_name]['fail'],
                    time: map[device_name]['time'],
                    testcases: []
                }
            }

            steps.map((data, index)=>{
                if(data.$.status === 'pass') step_passed++;
                else step_failed++;
                parsed_step[index] = {};
                parsed_step[index]['description'] = data.stepname[0] + ':' + data.description[0];
                parsed_step[index]['result'] = data.result[0];
                parsed_step[index]['status'] = data.$.status;
            });

            let status;
            if(step_failed === 0) status = 'Passed';
            else status = 'Failed';
            let single_testcase = {
                name: test_name,
                pass: step_passed,
                fail: step_failed,
                time: time,
                status: status,
                steps: parsed_step
            };

            body[device_name]['tests'][body[device_name]['build']]['testcases'].push(single_testcase);
        }

        for(let key in body) {
            body[key]['build']++;
        }
    }

    return body;
}

function getNumPassAndFailOfEachTest(something) {
    let device_map = {};
    let device_name;
    something.map((data, index)=>{
        device_name = data.$.name.split("_")[0];
        if(!(device_name in device_map)) {
            device_map[device_name] = {
                pass: 0,
                fail: 0,
                time: 0
            }
        }    
        if('failure' in data) {
            device_map[device_name]['fail']++;
        } else device_map[device_name]['pass']++;
        device_map[device_name]['time'] += parseFloat(data.$.time);
    })
    return device_map;
}

function getInfo(globalReturn) {
    let device_info = {};
    let all_info;
    let info;
    let splited_info;
    let name;
    let category;
    let model;
    let os;
    let manufacture;
    let version;
    let canProceed = false;

    for(let i = globalReturn.length - 1; i >= 0; i--) {
        all_info = globalReturn[i].testsuites.testsuite[0].testcase;
        all_info.map((data, index)=>{
            data.steps[0].step.map((moreData, innerIndex)=>{
                if(moreData.description[0].includes('Devices Information ')) {
                    info = moreData.result[0].split(':')[1];
                    splited_info = info.split(' ');
                    for(let j = 0; j < splited_info.length; j++) {
                        if(splited_info[j].includes('category')) {
                            category = splited_info[j];
                            category = category.split('=')[1];
                            category = category.substring(1, category.length - 1);
                            canProceed = true;
                        }
                        if(canProceed) {
                            if(splited_info[j].includes('manufacture')) {
                                manufacture = '';
                                while(!splited_info[j].includes('model')) {
                                    manufacture += splited_info[j] + ' ';
                                    j++;
                                }
                                manufacture = manufacture.split('=')[1].trim();
                                manufacture = manufacture.substring(1, manufacture.length - 1).toUpperCase();
                            }
                            if(splited_info[j].includes('model')) {
                                model = splited_info[j];
                                model = model.split('=')[1];
                                model = model.substring(1, model.length - 1);
                                if(model.includes('samsung')) {
                                    model = model.split('-')[1] + model.split('-')[2];
                                } else {
                                    if(model.split('-').length > 1)
                                        model = model.split('-')[0] + model.split('-')[1];
                                }
                                model = model.toUpperCase();
                            }
                            if(splited_info[j].includes('name')) {
                                name = '';
                                while(!splited_info[j].includes('os')) {
                                    name += splited_info[j] + ' ';
                                    j++;
                                }
                                name = name.split('=')[1].trim();
                                name = name.substring(1, name.length - 1)
                            }
                            if(splited_info[j].includes('os')) {
                                os = splited_info[j];
                                os = os.split('=')[1];
                                os = os.substring(1, os.length - 1).toUpperCase();
                            }
                            if(splited_info[j].includes('version=')) {
                                version = splited_info[j];
                                version = version.split('=')[1];
                                version = version.substring(1, version.length - 1);
                            }
                            
                            if(name !== undefined && model !== undefined && category !== undefined && os !== undefined && manufacture !== undefined && version != undefined) {
                                device_info[model] = {
                                    category: category,
                                    name: name,
                                    os: os,
                                    manufacture: manufacture,
                                    version: version
                                };
                                name = undefined;
                                category = undefined;
                                model = undefined;
                                os = undefined;
                                manufacture = undefined;
                                version = undefined;
                                canProceed = false;
                            }
                        }
                    }
                }
            })
        })

    }

    return device_info;
}

function checkNullOrUndefined(something) {
    if(something == null || something == undefined) return true;
    else return false;
}

router.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

router.get('/update', function (req, res, next) {
    importxml(fileArray);
    res.send('updated');
})

router.get('/', function (req, res, next) {
    res.send(globalReturn)
});

router.get('/parsed', function (req, res, next) {
    let body = getObject(globalReturn);
    mongo_client.connect('mongodb://localhost:27017/', { useNewUrlParser: true }, function (err, db) {
        if (err) throw err

        var dbo = db.db("mydb");
        dbo.collection('devices').findOne({}, function(findErr, result) {
            if(findErr) throw findErr;
            else {
                // if(result !== null) {
                //     console.log('already in')
                //     dbo.collection('devices').deleteOne(result, function(deleteErr, deleteDoc) {
                //         if(deleteErr) throw insertErr;
                //         else console.log('deleted')
                //     })
                // }
                dbo.collection('devices').insertOne(body, function(insertErr, insertDoc) {
                    if(insertErr) throw insertErr;
                    else console.log(body)
                     
                })
                
            }
        })
        
    })
    res.send(body);
    
})

router.get('/header', function(req, res, next) {
    let header = getHeader(globalReturn)
    mongo_client.connect('mongodb://localhost:27017/', { useNewUrlParser: true }, function (err, db) {
        if (err) throw err

        var dbo = db.db("mydb");
        dbo.collection('header').findOne({}, function(findErr, result) {
            if(findErr) throw findErr;
            else {
                // if(result !== null) {
                //     console.log('already in')
                //     dbo.collection('header').deleteOne(result, function(deleteErr, deleteDoc) {
                //         if(deleteErr) throw insertErr;
                //         else console.log('deleted')
                //     })
                // }
                dbo.collection('header').insertOne(header, function(insertErr, insertDoc) {
                    if(insertErr) throw insertErr;
                    else console.log(header)
                })
            }
      })
    })
    res.send(header);
})

router.get('/info', function(req, res, next) {
    let info = getInfo(globalReturn)
    mongo_client.connect('mongodb://localhost:27017/', { useNewUrlParser: true }, function (err, db) {
        if (err) throw err

        var dbo = db.db("mydb");
        dbo.collection('info').findOne({}, function(findErr, result) {
            if(findErr) throw findErr;
            else {
                // if(result !== null) {
                //     console.log('already in')
                //     dbo.collection('info').deleteOne(result, function(deleteErr, deleteDoc) {
                //         if(deleteErr) throw insertErr;
                //         else console.log('deleted')
                //     })
                // }
                dbo.collection('info').insertOne(info, function(insertErr, insertDoc) {
                    if(insertErr) throw insertErr;
                    else console.log(info)
                })
            }
        })
                

    })
    res.send(info);
})



module.exports = router;
