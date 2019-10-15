var express = require('express');
var router = express.Router();
var URL = require('url'); 
var fs = require('fs');

router.post('/wifiApi', function(req, res, next) {
	console.log(req.body.data);
	var date = new Date();
	var name = 'WIFI-' + date.getTime();
	var txt = '\r\n\r\n\r\n----'+ date.getFullYear() + '-' + (date.getMonth()+1) + '-' + date.getDate() + ' ' + date.getHours() + ':' + date.getMinutes() + ':' + date.getSeconds()  + '----\r\n\r\n' + req.body.data;

	//fs.writeFile('./wifiData/data.txt', req.body.data,function(err){
	fs.appendFile('./wifiData/data.txt', txt,function(err){
		if(err) console.log('写文件失败');
		else console.log('写文件成功');
	});
	
	var response = {status:0,data:''};
  	res.send(JSON.stringify(response));
});

module.exports = router;
