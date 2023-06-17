// Create Temperature Gauge
var gaugeTemp = new LinearGauge({
	renderTo: 'gauge-temperature',
	width: 120,
	height: 400,
	units: 'Temperature C',
	minValue: 0,
	startAngle: 90,
	ticksAngle: 180,
	maxValue: 50,
	colorValueBoxRect: '#049faa',
	colorValueBoxRectEnd: '#049faa',
	colorValueBoxBackground: '#f1fbfc',
	valueDec: 2,
	valueInt: 2,
	majorTicks: [
		'0',
		'5',
		'10',
		'15',
		'20',
		'25',
		'30',
		'35',
		'40',
		'45',
		'50',
	],
	minorTicks: 4,
	strokeTicks: true,
	highlights: [
		{
			from: 38,
			to: 50,
			color: 'rgb(250, 48, 48)',
		},
		{
			from: 32,
			to: 38,
			color: 'rgb(250, 121, 48)',
		},
		{
			from: 28,
			to: 32,
			color: 'rgb(250, 237, 48)',
		},
	],
	colorPlate: '#fff',
	colorBarProgress: '#CC2936',
	colorBarProgressEnd: '#049faa',
	borderShadowWidth: 0,
	borders: false,
	needleType: 'arrow',
	needleWidth: 2,
	needleCircleSize: 7,
	needleCircleOuter: true,
	needleCircleInner: false,
	animationDuration: 1500,
	animationRule: 'linear',
	barWidth: 10,
}).draw();

// Create Humidity Gauge
var gaugeHum = new RadialGauge({
	renderTo: 'gauge-humidity',
	width: 300,
	height: 300,
	units: 'Humidity (%)',
	minValue: 0,
	maxValue: 100,
	colorValueBoxRect: '#049faa',
	colorValueBoxRectEnd: '#049faa',
	colorValueBoxBackground: '#f1fbfc',
	valueInt: 2,
	majorTicks: ['0', '20', '40', '60', '80', '100'],
	minorTicks: 4,
	strokeTicks: true,
	highlights: [
		{
			from: 80,
			to: 100,
			color: '#03C0C1',
		},
	],
	colorPlate: '#fff',
	borderShadowWidth: 0,
	borders: false,
	needleType: 'line',
	colorNeedle: '#007F80',
	colorNeedleEnd: '#007F80',
	needleWidth: 2,
	needleCircleSize: 3,
	colorNeedleCircleOuter: '#007F80',
	needleCircleOuter: true,
	needleCircleInner: false,
	animationDuration: 1500,
	animationRule: 'linear',
}).draw();

// * * * * * * * * * * * * * * * * * * * * * * * * * *
// * PERHATIAN KEPADA KELUARGA BESAR JENDELA TRAVEL  *
// * * * * * * * * * * * * * * * * * * * * * * * * * *
// section ini tolong dibiarkan tercomment dan jangan dihapus
// sebab akan digunakan untuk kasus-kasus berikutnya
// terima kasih.

// Create Potentio Gauge
// var gaugePot = new RadialGauge({
// 	renderTo: 'gauge-pot',
// 	width: 300,
// 	height: 300,
// 	units: 'Potentiometer (V)',
// 	minValue: 0,
// 	maxValue: 4095,
// 	colorValueBoxRect: '#049faa',
// 	colorValueBoxRectEnd: '#049faa',
// 	colorValueBoxBackground: '#f1fbfc',
// 	valueInt: 2,
// 	majorTicks: ['0', '1000', '2000', '3000', '4095'],
// 	minorTicks: 4,
// 	strokeTicks: true,
// 	highlights: [
// 		{
// 			from: 3000,
// 			to: 4095,
// 			color: '#FFB6C1',
// 		},
// 	],
// 	colorPlate: '#fff',
// 	borderShadowWidth: 0,
// 	borders: false,
// 	needleType: 'line',
// 	colorNeedle: '#ff1493',
// 	colorNeedleEnd: '#ff1493',
// 	needleWidth: 2,
// 	needleCircleSize: 3,
// 	colorNeedleCircleOuter: '#ff1493',
// 	needleCircleOuter: true,
// 	needleCircleInner: false,
// 	animationDuration: 1500,
// 	animationRule: 'linear',
// }).draw();
// gaugePot.value = 0;

const espIP = window.location.host;
var cache = [];
var toggleRecord = false;
const socket = new WebSocket(`ws://${espIP}:81`);

socket.onmessage = (event) => {
	// console.log('[socket] ' + event.data);
	var response = JSON.parse(event.data);
	var resData = {
		temperature: parseFloat(response.temperature),
		humidity: parseFloat(response.humidity),
		potentiometer: parseInt(response.potentiometer),
	};
	if (toggleRecord) {
		cache.push(resData);
	}
	gaugeTemp.value = parseFloat(resData.temperature);
	gaugeHum.value = parseFloat(resData.humidity);

	// gaugePot.value = parseInt(resData.potentiometer);

	var velocity = resData.potentiometer / 292.5;
	document.getElementById('messageHolder').textContent = velocity.toFixed(2);
};

const getData = () => {
	// var data = await fetch('http://127.0.0.1:3300/api/mission_data');
	// var dataJson = await data.json();
	// console.log(dataJson);
	toggleRecord = !toggleRecord;
	console.log(toggleRecord);
	if (cache != [] && toggleRecord == false) {
		console.log(cache);
		cache = [];
	}
};

const button1 = document.getElementById('fetch_button');
button1.addEventListener('click', getData);
