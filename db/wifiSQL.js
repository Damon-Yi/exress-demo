var wifiSql = {
	Manufacturer:{
		insert:'INSERT INTO mac_manufacturer(mac,mac_EN,mac_CH) VALUE',
		queryAll:'SELECT * FROM mac_manufacturer',
		getManufacturerIdByMac:'SELECT * FROM mac_manufacturer WHERE mac_manufacturer.mac='
	},
	wifiCollectData:{
		insert:'INSERT INTO wifi_collect_data(phone_mac,router_mac,router_name,mac_manufacturer) VALUE',
		queryAll:'SELECT * FROM wifi_collect_data',
		queryAllPhoneMac:'SELECT phone_mac FROM wifi_collect_data',
		queryByDate:'SELECT * FROM wifi_collect_data WHERE date_format(wifi_collect_data.create_time,"%Y-%m-%d")='
	},
	reportData:{
		insert:'INSERT INTO report_info(proId,proName,name,mobile,address,convenientTime) VALUE',
		queryAll:'SELECT * FROM report_info ORDER BY createTime DESC',
		queryTotal: 'SELECT COUNT(*) FROM report_info',
		queryByDate:'SELECT * FROM report_info WHERE date_format(report_info.create_time,"%Y-%m-%d")='
	}
}

module.exports = wifiSql;