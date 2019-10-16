let express = require('express');
let router = express.Router();
let URL = require('url'); 
let fs = require('fs');

let common = require('./../utils/index');

//mysql
let mysql = require('mysql')
let dbConfig = require('../db/DBconfig')
let wifiSql = require('../db/wifiSQL')
let pool = mysql.createPool(dbConfig.mysql)

router.post('/addReport', function(req, res, next){	//新增
	let params = req.body; 
	console.log(req)
	if(params.name && params.mobile && common.verifySqlKeys(params)){
		let sqlValueTxt = `${wifiSql.reportData.insert} ("${params.proId}","${params.proName||''}","${params.name}","${params.mobile}","${params.address||''}","${params.convenientTime||''}")`
		dbFun.insertReport(sqlValueTxt, res)
	}else{
		repJSON(res, '提交失败！'); 
	}
})

router.post('/queryReport', function(req, res, next){	//新增
	let {pageNum = 0, pageSize = 0} = req.body; 
	let sqlValueTxt = '';
	if(pageNum&&pageSize){
		let offset = (pageNum - 1)*pageSize;
		sqlValueTxt = `${wifiSql.reportData.queryAll} limit ${offset}, ${pageSize}`;
	}else{
		sqlValueTxt = `${wifiSql.reportData.queryAll}`;
	}
	dbFun.queryReport(sqlValueTxt, res)
})

router.post('/queryReportByDate', function(req, res, next){	//新增
	let {startTime, endTime} = req.body; 
	let sqlValueTxt = wifiSql.reportData.queryByDate(startTime, endTime);
	dbFun.queryReportByDate(sqlValueTxt, res)
})

let dbFun = {
	insertReport: function(sqlValueTxt, res){	//新增
		console.log(sqlValueTxt) 
		pool.getConnection(function(err, connection) {
			connection.query(sqlValueTxt, function(err, result) {
				console.log(err, result)
				if(result) {      
					result = '提交成功！';
				}     
				repJSON(res, result);   
				connection.release();  
		   });
		});
	},
	queryReport: function(sqlValueTxt, res){	//查询
		console.log(sqlValueTxt)
		pool.getConnection(function(err, connection) { 
			connection.query(wifiSql.reportData.queryTotal, function(err, result) {
				if(result){
					let count = result.length > 0 ? result[0]["COUNT(*)"] : 0
					connection.query(sqlValueTxt, function(err, result1) {
						console.log(err, result1)
						repJSON(res, { 
							code: 0,   
							msg:'操作成功',
							data: result1, 
							total: count
						});   
						connection.release();  
					});
				}else{
					repJSON(res, { 
						code: 1,   
						msg:'操作失败'
					}); 
				}
			 });
		}); 
	},
	queryReportByDate: function(sqlValueTxt, res){	//查询
		console.log(sqlValueTxt)
		pool.getConnection(function(err, connection) {
			connection.query(sqlValueTxt, function(err, result) {
				console.log(err, result)
				if(result){

					repJSON(res, { 
						code: 0,   
						msg:'操作成功',
						data: result, 
					});   
				}else{
					repJSON(res, { 
						code: 1,   
						msg:'操作失败'
					}); 
				}
				connection.release(); 
			}); 
		}); 
	}
}

let repJSON = function (res, ret) { //返回结果
	if(typeof ret === 'undefined') { 
		res.json({code:1,msg: '操作失败',data:''})
	} else { 
		res.json(ret)
	}
}

module.exports = router;
