var express = require('express');
var router = express.Router();
var URL = require('url'); 
var fs = require('fs');

//mysql
var mysql = require('mysql')
var dbConfig = require('../db/DBconfig')
var wifiSql = require('../db/wifiSQL')
var pool = mysql.createPool(dbConfig.mysql)

router.post('/addReport', function(req, res, next){	//新增mac基础数据
	var params = req.body; 
	console.log(req)
	if(params.name&&params.mobile){
		var sqlValueTxt = `${wifiSql.reportData.insert} ("${params.proId}","${params.proName||''}","${params.name}","${params.mobile}","${params.address||''}","${params.convenientTime||''}")`
		dbFun.insertReport(sqlValueTxt, res)
	}else{
		repJSON(res, '提交失败！'); 
	}
})

let dbFun = {
	insertReport: function(sqlValueTxt, res){	//新增厂商匹配基础数据
		console.log(sqlValueTxt)
		pool.getConnection(function(err, connection) { 
			connection.query(sqlValueTxt, function(err, result) {
				console.log(result)
				if(result) {      
					// result = {   
					// 	code: 0,   
					// 	msg:'添加成功',
					// 	data: { prdId: result.insertId }
					// }; 
					result = '提交成功！';
				}     
				repJSON(res, result);   
				connection.release();  
		   });
		});
	}
}

var repJSON = function (res, ret) { //返回结果
	if(typeof ret === 'undefined') { 
		res.json({code:1,msg: '操作失败',data:''})
	} else { 
		res.json(ret)
	}
}

module.exports = router;
