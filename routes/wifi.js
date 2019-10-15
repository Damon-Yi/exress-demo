var express = require('express')
var router = express.Router()
var URL = require('url')
var fs = require('fs')
var path = require('path')
var xlsx = require('node-xlsx')

var async = require('async')

//mysql
var mysql = require('mysql')
var dbConfig = require('../db/DBconfig')
var wifiSql = require('../db/wifiSQL')
var pool = mysql.createPool(dbConfig.mysql)

var repJSON = function (res, ret) { //返回结果
	if(typeof ret === 'undefined') { 
		res.json({code:1,msg: '操作失败',data:''})
	} else { 
		res.json(ret)
	}
}

/***********************文件存储 接口****************************/
router.post('/wifiApi', function(req, res, next) {
	console.log(req.body.data);
	var wifiTxt = req.body.data;
	var response = {status:1,data:'上传失败'};
	var macRec=/[A-F\d]{2}:[A-F\d]{2}:[A-F\d]{2}:[A-F\d]{2}:[A-F\d]{2}:[A-F\d]{2}/;
	var excelData = [];
	var date = new Date();
	var fileName = 'wifi-'+ date.getFullYear() + '-' + (date.getMonth()+1) + '-' + date.getDate() + '.xlsx';

	/*wifiTxt = `7D:24:F7:0B:3E|02|08|3|-92||0|0
	84:20:96:C2:D5:D8|CC:81:DA:F0:0B:58|02|04|3|-93|就这样|0|0
	5C:03:39:4E:CB:2D|CC:81:DA:F0:0B:58|02|04|3|-89|就这样|0|0
	78:11:DC:65:A0:DE|FF:FF:FF:FF:FF:FF|00|04|3|-94|vivo Xplay5A|0|0
	A0:CC:2B:BF:77:CD|FF:FF:FF:FF:FF:FF|00|04|4|-16|TL-WR886R|0|0
	A0:CC:2B:BF:77:CD|FF:FF:FF:FF:FF:FF|00|04|7|-63|TL-WR886R|0|0
	04:E5:36:5A:DF:D9|34:CE:00:25:15:8E|02|08|7|-93||0|0
	3:07:99:62:A4|70:AF:6A:F2:11:9E|01|09|11|-95||0|0
	38:21:87:FC:5D:F7|FF:FF:FF:FF:FF:FF|00|04|12|-90|TP-LINK_090A|0|0
	A0:CC:2B:BF:77:CD|FF:FF:FF:FF:FF:FF|00|04|12|-67|TL-WR886R|0|0:81:DA:F0:0B:58|02|04|3|-88|就这样|1|0
	9C:FB:D5:E4:71:23|CC:81:DA:F0:0B:58|02|04|3|-82|就这样|1|0
	00:EC:0A:1B:2D:1E|D8:C8:E9:04:2A:28|02|0c|3|-96|yangfan|0|0
	10:48:B1:C3:32:C9|CC:81:DA:EF:40:C8|02|00|4|-82|HDX|0|0
	00:08:22:8A:D9:FB|CC:81:DA:F0:0B:58|02|04|3|-79|就这样|0|0
	70:EF:00:5E:24:BF|5C:63:BF:D9:A1:CA|02|04|6|-54|MERCURY_D9A1CA|1|0
	18:4F:32:59:A2:4B|50:BD:5F:09:97:7A|02|08|6|-91|F2-602|0|1
	04:E5:36:5A:DF:D9|34:CE:00:25:15:8E|02|08|7|-92||0|0
	A0:CC:2B:BF:77:CD|FF:FF:FF:FF:FF:FF|00|04|7|-61|WR886N|0|0
	A0:CC:2B:BF:77:CD|FF:FF:FF:FF:FF:FF|00|04|10|-50|TP-LINK_D06E|0|0
	5C:C3:07:99:62:A4|70:AF:6A:F2:11:9E|01|09|11|-91||0|0
	70:AF:6A:F2:11:9E|5C:C3:07:99:62:A4|01|08|11|-93||0|0
	BC:3A:EA:5F:32:03|74:7D:24:AD:29:E0|02|0c|11|-69|tianjun|0|1`*/
	
	if(wifiTxt){
		

		//var txt = '\r\n\r\n\r\n----'+ date.getFullYear() + '-' + (date.getMonth()+1) + '-' + date.getDate() + ' ' + date.getHours() + ':' + date.getMinutes() + ':' + date.getSeconds()  + '----\r\n\r\n' + req.body.data;
		var txt = '';

		var tmpArr = wifiTxt.split('\n');
		var macJsonObj = JSON.parse(fs.readFileSync('./wifiData/mac.json'));
		fs.exists(wifiFun.dirPath  + fileName,function(exists){
			if(!exists){
				excelData.push(['Frame源MAC','Frame目的MAC','ssid']);
			}else{
				excelData = xlsx.parse(wifiFun.dirPath  + fileName)[0].data;
				/*excelData = excelData.filter(v => {
					return macRec.test(v[0])&&macRec.test(v[1])&&v[6]!='Direct_Probe'
				});*/
			}
			var orLength = excelData.length;

			//console.log(wifiTxt)
			
			for(var i=0;i<tmpArr.length;i++){
				var dataItem = tmpArr[i].split('|');
				
				if(dataItem.length==9&&macRec.test(dataItem[0])&&macRec.test(dataItem[1])&&dataItem[6]&&dataItem[6]!='Direct_Probe'){

					var flag = excelData.some(v => {
						return v[0]==dataItem[0]&&v[1]==dataItem[1]&&v[2]==dataItem[6]
					})
					
					console.log(flag);
					
					if(!flag){
						var brand = ''
						for(var key in macJsonObj){
							if(macJsonObj[key].indexOf(dataItem[0].substring(0,8))>=0){
								brand = key;
							}
						}
						if(brand){
							excelData.push([dataItem[0],dataItem[1],dataItem[6],brand]);
							txt += dataItem[0] + '|' + dataItem[1] + '|' + dataItem[6] + '|' + brand + '\r\n';
						}
					}
				}
			}
			console.log(txt);
			fs.appendFile(wifiFun.dirPath + date.getFullYear() + '-' + (date.getMonth()+1) + '-' + date.getDate() +'data.txt', txt,function(err){
				if(err) console.log('写txt文件失败');
				else console.log('写txt文件成功');
			});

			if(excelData.length>orLength){
				var buffer = xlsx.build([{
						name:'wifi',
						data:excelData
					}
				]);

				fs.writeFile(wifiFun.dirPath  + fileName, buffer,function(err){
					if(err){
						console.log('写文件失败');
					}else{
						console.log('写文件成功');
						response.status = 0;
						response.data = '上传成功,0';
					} 
					res.send(JSON.stringify(response));
				});
			}else{
				response.status = 0;
				response.data = '上传成功,1';
				res.send(JSON.stringify(response));
			}
		});
		
	}else{
		res.send(JSON.stringify(response));
	}
})


router.get('/download',function(req, res, next){
    var currDir = path.normalize(wifiFun.dirPath),
    	date = new Date(),
    	fileName = req.query.name?req.query.name:'wifi-'+ date.getFullYear() + '-' + (date.getMonth()+1) + '-' + date.getDate() + '.xlsx',
    	currFile = path.join(currDir,fileName),
        fReadStream;

    console.log(currFile);
    fs.exists(currFile,function(exist) {
        if(exist){
            res.set({
                "Content-type":"application/octet-stream",
                "Content-Disposition":"attachment;filename="+encodeURI(fileName)
            });
            fReadStream = fs.createReadStream(currFile);
            fReadStream.on("data",(chunk) => res.write(chunk,"binary"));
            fReadStream.on("end",function () {
                res.end();
            });
        }else{
            res.set("Content-type","text/html");
            res.send("file not exist!");
            res.end();
        }
    });
})

router.get('/download1',function(req, res, next){
	var currDir = path.normalize(wifiFun.dirPath),
    	date = new Date(),
    	fileName = req.query.name?req.query.name:date.getFullYear() + '-' + (date.getMonth()+1) + '-' + date.getDate(),
    	currTxtFile = './wifiData/' + fileName + 'data.txt',
    	currXlsxFile = path.join(currDir,fileName + '.xlsx'),
        fReadStream;

	console.log(currTxtFile);
	fs.readFile(currTxtFile, 'utf-8', function (err, data) {
		if (err) {
			res.set("Content-type","text/html");
            res.send("file not exist!");
            res.end();
		} else {
			console.log(data);
			var tmpArr = data.split('\n'),
				excelData = [];
			for(var i=0;i<tmpArr.length;i++){
				var dataItem = tmpArr[i].split('|');
				excelData.push(dataItem);
			}

			var buffer = xlsx.build([{
					name:'wifi',
					data:excelData
				}
			]);

			fs.writeFileSync(wifiFun.dirPath  + fileName +'.xlsx', buffer,function(err){
				if(err){
					console.log('写文件失败');
				}else{
					console.log('写文件成功');
				} 
			});
			res.set({
				"Content-type":"application/octet-stream",
				"Content-Disposition":"attachment;filename="+encodeURI(fileName +'.xlsx')
			});
			fReadStream = fs.createReadStream(currXlsxFile);
			fReadStream.on("data",(chunk) => res.write(chunk,"binary"));
			fReadStream.on("end",function () {
				res.end();
			});
		}
	});
})

router.post('/convMacXlsxToJson',function(req, res, next){

	var response = {status:1,data:'上传失败'};
	var macData = [];
	var macJson = {};
	var fileName ='mac.xlsx';
	var fileNameJson ='mac.json';


    macData = xlsx.parse('./wifiData/' + fileName)[0].data;

    for(var i=0;i<macData.length;i++){
    	var macItem = macData[i];
    	var jsonKey = macItem[1];

    	if(macJson[jsonKey]){
			macJson[jsonKey] += '|' + macItem[0];
    	}else{
			macJson[jsonKey] = macItem[0];
    	}
    }
    console.log(macJson)

	fs.writeFile(wifiFun.dirPath  + fileNameJson, JSON.stringify(macJson) ,function(err){
		if(err){
			console.log('写文件失败');
		}else{
			console.log('写文件成功');
			response.status = 0;
			response.data = '上传成功,0';
		} 
		res.send(JSON.stringify(response));
	});
})

router.post('/fixOldData',function(req, res, next){

	var response = {status:1,data:'上传失败'};
	//var fileName ='wifi-2018-3-15.xlsx';
	var fileName = req.body.fileName;
    if(fileName){
		fs.exists(wifiFun.dirPath  + fileName,function(exists){
			if(exists){
				var oldData = xlsx.parse(wifiFun.dirPath  + fileName)[0].data;
				var macJsonObj = JSON.parse(fs.readFileSync('./wifiData/mac.json'));
				var newData = [];
				for(var i=0;i<oldData.length;i++){
					var item = oldData[i];
					var brand = '';
					for(var key in macJsonObj){
						if(macJsonObj[key].indexOf(item[0].substring(0,8))>=0){
							brand = key;
						}
					}
					
					if(brand!=''){
						newData.push([item[0],item[1],item[2],brand]);
					}
				}
				
				var buffer = xlsx.build([{
						name:'wifi',
						data:newData
					}
				]);
				fs.writeFile(wifiFun.dirPath  + fileName, buffer ,function(err){
					if(err){
						console.log('写文件失败');
					}else{
						console.log('写文件成功');
						response.status = 0;
						response.data = '上传成功,0';
					} 
					res.send(JSON.stringify(response));
				});
			}
		});
	}
})

router.post('/convTxtToXlsx',function(req, res, next){

	var response = {status:1,data:'上传失败'};
	//var fileName ='wifi-2018-3-15.xlsx';
	var fileName = req.body.fileName;
    if(fileName){
		fs.exists('./wifiData/' + fileName,function(exists){
			if(exists){
				var oldData = xlsx.parse('./wifiData/' + fileName)[0].data;
				var macJsonObj = JSON.parse(fs.readFileSync('./wifiData/mac.json'));
				var newData = [];
				for(var i=0;i<oldData.length;i++){
					var item = oldData[i];
					var brand = '';
					for(var key in macJsonObj){
						if(macJsonObj[key].indexOf(item[0].substring(0,8))>=0){
							brand = key;
						}
					}
					
					if(brand!=''){
						newData.push([item[0],item[1],item[2],brand]);
					}
				}
				
				var buffer = xlsx.build([{
						name:'wifi',
						data:newData
					}
				]);
				fs.writeFile(wifiFun.dirPath  + fileName, buffer ,function(err){
					if(err){
						console.log('写文件失败');
					}else{
						console.log('写文件成功');
						response.status = 0;
						response.data = '上传成功,0';
					} 
					res.send(JSON.stringify(response));
				});
			}
		});
	}
})


/***********************数据库存储 接口****************************/
router.post('/addMac', function(req, res, next){	//新增mac基础数据
	var params = req.body; 
	if(params.mac&&params.macCH&&params.macEN){
		var sqlValueTxt = wifiSql.Manufacturer.insert + '("'+ params.mac +'","'+ params.macEN +'","'+ params.macCH +'")'
		wifiFun.insertMacManufacturer(sqlValueTxt,res)
	}else{
		repJSON(res, {
			code:1,
			msg:'参数错误'
		}); 
	}
})

router.post('/importMac', function(req, res, next){		//导入mac基础数据
	var fileName = req.body.fileName?req.body.fileName:''
	if(fileName){
		var filePath = wifiFun.dirPath + fileName +'.xlsx',
			macData = []
		fs.exists(filePath,function(exist){
			if(exist){
				macData = xlsx.parse(filePath)[0].data
				var sqlValueTxt = ''
				for(var i=0;i<macData.length;i++){
					if(macData[i][0]&&macData[i][1]&&macData[i][2])
						sqlValueTxt += '("'+ macData[i][0] +'","'+ macData[i][1] +'","'+ macData[i][2] +'"),'
				}
				sqlValueTxt = wifiSql.Manufacturer.insert + sqlValueTxt.substr(0,sqlValueTxt.length-1)
				wifiFun.insertMacManufacturer(sqlValueTxt,res)
			}else{
				repJSON(res, {
					code:1,
					msg:'文件不存在'
				}); 
			}
		})
	}else{
		repJSON(res, {
			code:1,
			msg:'参数错误'
		}); 
	}
})

router.post('/addPhoneMac', function(req, res, next) {	//收集手机数据
	//console.log(req.body.data);
	wifiFun.receiveWifiLogData(req.body.data,res);
})

router.post('/importPhoneMac',function(req, res, next){	//导入手机数据
	var fileName = req.body.fileName?req.body.fileName:''
	if(fileName){
		var filePath = wifiFun.dirPath + fileName +'.xlsx',
			phoneMacData = []
		fs.exists(filePath,function(exist){
			if(exist){
				phoneMacData = xlsx.parse(filePath)[0].data
				if(phoneMacData.length>0){
					wifiFun.importWifiLogData(phoneMacData,res)
				}else{
					res.set("Content-type","text/html");
					res.send("导入数据为空");
					res.end();
				}
			}
		})
	}else{
		repJSON(res, {
			code:1,
			msg:'参数错误'
		}); 
	}
})

router.get('/downloadMac',function(req, res, next){		//下载
	//console.log(req.query)
	var date = req.query.date?req.query.date:'all'
	wifiFun.downloadWifiLogData(date,res)
})

var wifiFun = {
	dirPath: './wifiData/',
	insertMacManufacturer:function(sqlValueTxt, res){	//新增厂商匹配基础数据
		console.log(sqlValueTxt)
		pool.getConnection(function(err, connection) { 
			connection.query(sqlValueTxt, function(err, result) {
				console.log(result)
				if(result) {      
					result = {   
						code: 0,   
						msg:'添加成功',
						data:result.insertId
					};  
				}     
				repJSON(res, result);   
				connection.release();  
		   });
		});
	},
	getManufacturerIdByMac: function(macObj, callback){	//厂商匹配基础数据	筛选上报日志
		pool.getConnection(function(err, connection) { 
			connection.query(wifiSql.Manufacturer.getManufacturerIdByMac + '"' + macObj.phone_mac.substring(0,8) + '"', function(err, result) {
				callback(err, result)
				connection.release()
		   });
		});
	},
	receiveWifiLogData:function(wifiTxt, res){			//接收 上报日志  筛选入库
		var macRec=/[A-F\d]{2}:[A-F\d]{2}:[A-F\d]{2}:[A-F\d]{2}:[A-F\d]{2}:[A-F\d]{2}/;
		var date = new Date();
		
		if(wifiTxt){
			var tmpArr = wifiTxt.split('\n');
			async.map(tmpArr,function(item,callback){
				var dataItem = item.split('|');
				if(dataItem.length==9&&macRec.test(dataItem[0])&&macRec.test(dataItem[1])&&dataItem[6]&&dataItem[6]!='Direct_Probe'){
					var macObj = {
						phone_mac:dataItem[0],
						router_mac:dataItem[1],
						router_name:dataItem[6]
					}; 
					async.waterfall([
						function(cb){
							wifiFun.getManufacturerIdByMac(macObj,function(err, result){
								cb(err,result)
							})
						},function(data,cb){
							if(data&&data.length>0){
								var sqlTxt = wifiSql.wifiCollectData.insert + '(' + macObj.phone_mac + ',' + macObj.router_mac + ',' + macObj.router_name + ',' + data[0].mac_CH + ')'
								wifiFun.insertWifiLogData(sqlTxt,function(err, result){
									cb(err,result)
								})
							}else{
								cb(null,'')
							}
						}],function(err,result){
							callback(err,result)
						})
				}else{
					callback(null,'')
				}
			},function(err,results){
				var macIds = []
				results.forEach(function(v){
					if(v) macIds.push(v.insertId)
				})
				repJSON(res, {   
					code: 0,   
					msg:'操作成功',
					data:macIds
				});
			})
		}else{
			repJSON(res, result);   
		}
	},
	importWifiLogData:function(importData, res){			//导入 已收集上报日志
		var sqlTxt = wifiSql.wifiCollectData.queryAllPhoneMac
		async.waterfall([function(cb){
			wifiFun.queryWifiLogData(sqlTxt,function(err,result){
				var data = []
				if(result&&result.length>0){  //筛选
					data = result.map(v => {
						return v.phone_mac
					})
				}
				cb(err,data)
			})
		},function(data,cb){
			var insertData = []
			if(data&&data.length>0){  //筛选
				for(var k=0;k<importData.length;k++){
					var isExitst = data.some(v => (v==importData[k][0]))
					if(!isExitst){
						insertData.push(importData[k])
					}
				}
			}else{
				insertData = importData
			}
			//console.log(insertData)
			if(insertData.length>0){
				var insertSqlTxt = ''
				for(var i=0;i<insertData.length;i++){
					if(insertData[i][0]&&insertData[i][1]&&insertData[i][2]&&insertData[i][3])
						insertSqlTxt += '("'+ insertData[i][0] +'","'+ insertData[i][1] +'","'+ insertData[i][2] +'","'+ insertData[i][3] +'"),'
				}
				insertSqlTxt = wifiSql.wifiCollectData.insert + insertSqlTxt.substr(0,insertSqlTxt.length-1)
				console.log(insertSqlTxt)
				wifiFun.insertWifiLogData(insertSqlTxt,function(err,result){
					//console.log(result)
					cb(err,result)
				})
			}else{
				cb(null,null)
			}
		}],function(err,results){
			//console.log(results)
			var msg = (results&&results.affectedRows)?results.affectedRows:0
			repJSON(res, {   
				code: 0,   
				msg:'导入成功' + msg + '条',
			});
		})
	},
	insertWifiLogData: function(sqlTxt, callback){		//插入收集的mac数据
		pool.getConnection(function(err, connection) { 
			connection.query(sqlTxt, function(err, result) {
				console.log(result)
				callback(err, result)
				connection.release() 
			});
		});
	},
	queryWifiLogData:function(sqlTxt, res, callback){			//查询 手机mac数据	"2018-03-20"
		console.log(sqlTxt)
		pool.getConnection(function(err, connection) { 
			connection.query(sqlTxt, function(err, result) {
				if(result&&result.length>0){
					callback(err,result)
				}else{
					res.set("Content-type","text/html");
					res.send("file not exist or no data!");
					res.end();
				}
				connection.release() 
			})
		})
	},
	downloadWifiLogData: function(dateStr,res){			//下载 收集的mac数据 "2018-03-20"
		//var currDir = path.normalize('D:\\damon\\work\\expressDemo\\wifiData'),
		var currDir = path.normalize(wifiFun.dirPath),
			fileName = dateStr + '.xlsx',
			currXlsxFile = path.join(currDir,fileName);

		var sqlTxt = dateStr=='all'?wifiSql.wifiCollectData.queryAll:(wifiSql.wifiCollectData.queryByDate + '"' + dateStr +'"')
		
		wifiFun.queryWifiLogData(sqlTxt,res,function(err,result){
			var excelData = [['手机MAC','路由器MAC','路由器','手机品牌','日期']]
						
			for(var i=0;i<result.length;i++){
				excelData.push([result[i].phone_mac,result[i].router_mac,result[i].router_name,result[i].mac_manufacturer,result[i].create_time]);
			}

			var buffer = xlsx.build([{
					name:'wifi',
					data:excelData
				}
			]);

			/* fs.writeFileSync(wifiFun.dirPath  + fileName, buffer,function(err){
				if(err){
					console.log('写文件失败');
				}else{
					console.log('写文件成功');
				} 
			}); */
			res.set({
				"Content-type":"application/octet-stream",
				"Content-Disposition":"attachment;filename="+encodeURI(fileName)
			});

			//下载文件
			/* fReadStream = fs.createReadStream(currXlsxFile);
			fReadStream.on("data",(chunk) => res.write(chunk,"binary"));
			fReadStream.on("end",function () {
				res.end();
			}); */

			//下载buffer
			res.end(buffer,"binary") 
		})
	}
}

module.exports = router