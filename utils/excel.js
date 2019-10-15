/* 
*  excel 根据第一列 去重
*/
var xlsx = require('node-xlsx')
var fs = require('fs')
var path = require('path')

var filePath = path.normalize('F:\\damon\\佰仟\\expressDemo\\wifiData'),
    currXlsxFile = path.join(filePath,'2018-3-16.xlsx')

//读取文件内容
var obj = xlsx.parse(currXlsxFile);
var excelObj=obj[0].data;
console.log(excelObj.length);

var data = [],
    dataKey = []

for(var i in excelObj){
    if(!dataKey.some(v => (v==excelObj[i][0]))){
        dataKey.push(excelObj[i][0])
        data.push([excelObj[i][0],excelObj[i][1],excelObj[i][2],excelObj[i][3]]);
    }
}
console.log(data.length)
var buffer = xlsx.build([
    {
        name:'sheet1',
        data:data
    }        
]);

//将文件内容插入新的文件中
fs.writeFileSync(currXlsxFile,buffer,{'flag':'w'});