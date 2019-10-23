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
	console.log(req.body)
	console.log('校验sql', common.verifySqlKeys(params))
	if(params.name && params.mobile && common.verifySqlKeys(params)){
		console.log('add')
		let sqlValueTxt = `${wifiSql.reportData.insert} ("${params.proId}","${params.proName||''}","${params.name}","${params.mobile}","${params.address||''}","${params.convenientTime||''}", "${params.channel||''}")`
		dbFun.insertReport(sqlValueTxt, res)
	}else{
		repJSON(res, '提交失败！'); 
	}
})

router.post('/queryReport', function(req, res, next){	//查询
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

router.post('/queryReportByDate', function(req, res, next){	//按日期查询
	let {startTime, endTime} = req.body; 
	let sqlValueTxt = wifiSql.reportData.queryByDate(startTime, endTime);
	dbFun.queryReportByDate(sqlValueTxt, res)
})

router.post('/deleteReport', function(req, res, next){	//删除
	let {id} = req.body; 
	let sqlValueTxt = wifiSql.reportData.delete(id);
	dbFun.deleteReport(sqlValueTxt, res)
})

router.post('/addRemark', function(req, res, next){	//新增备注
	let params = req.body; 
	console.log(req.body)
	console.log('校验sql', common.verifySqlKeys(params))
	if(params.reportId && params.remark && common.verifySqlKeys(params)){
		console.log('add remark')
		let sqlValueTxt = wifiSql.remarkData.insert({reportId: params.reportId, remark: params.remark})
		dbFun.insertRemark(sqlValueTxt, res)
	}else{
		repJSON(res, '提交失败！'); 
	}
})

router.post('/deleteRemark', function(req, res, next){	//删除备注
	let {id} = req.body; 
	let sqlValueTxt = wifiSql.remarkData.delete(id);
	dbFun.deleteRemark(sqlValueTxt, res)
})

let dbFun = {
	insertReport: function(sqlValueTxt, res){	//新增
		console.log(sqlValueTxt) 
		pool.getConnection(function(err, connection) {
			connection.query(sqlValueTxt, function(err, result) {
				console.log(err, result)
				if(result) {      
					result = { 
						code: 0,   
						msg:'提交成功'
					};
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
					let total = result.length > 0 ? result[0]["COUNT(*)"] : 0
					connection.query(sqlValueTxt, function(err, result1) {
						console.log(err, result1)
						let count = 0
						result1.forEach((v, index) => {
							let sqlTxt = wifiSql.remarkData.queryAllByreportId(v.id)
							connection.query(sqlTxt, function(err, result2) {
								result1[index].remarks = result2
								count++
								if(count == result1.length){
									console.log('111------------', result1)
									repJSON(res, { 
										code: 0,   
										msg:'操作成功',
										data: result1, 
										total
									});
								}
							})
						})
						   
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
	},
	deleteReport: function(sqlValueTxt, res){	//删除
		console.log(sqlValueTxt) 
		pool.getConnection(function(err, connection) {
		    connection.query(sqlValueTxt, function(err, result) {
				console.log(err, result)
				if(result){
					repJSON(res, { 
						code: 0,   
						msg:'操作成功'
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
	},
	insertRemark: function(sqlValueTxt, res){	//新增 备注
		console.log(sqlValueTxt) 
		pool.getConnection(function(err, connection) {
			connection.query(sqlValueTxt, function(err, result) {
				console.log(err, result)
				if(result) {      
					result = { 
						code: 0,   
						msg:'提交成功'
					};
				}     
				repJSON(res, result);   
				connection.release();  
		   });
		});
	},
	deleteRemark: function(sqlValueTxt, res){	//删除 备注
		console.log(sqlValueTxt) 
		pool.getConnection(function(err, connection) {
		    connection.query(sqlValueTxt, function(err, result) {
				console.log(err, result)
				if(result){
					repJSON(res, { 
						code: 0,   
						msg:'操作成功'
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
