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

const espIP = window.location.host;
var cache = [];
var toggleRecord = false;
const socket = new WebSocket(`ws://${espIP}:81`);

socket.onmessage = (event) => {
	console.log('[socket] ' + event.data);
	var response = JSON.parse(event.data);

	const d = new Date();
	let curtime = d.getTime();

	var resData = {
		time: curtime,
		temperature: parseFloat(response.temperature),
		humidity: parseFloat(response.humidity),
		distance: parseFloat(response.potentiometer),
		velocity: parseFloat(response.velocity),
		tilt: parseFloat(response.tilt),
	};

	gaugeHum.value = resData.humidity;
	gaugeTemp.value = resData.temperature;

	document.getElementById('distance').textContent = resData.distance;
	document.getElementById('velocity').textContent = resData.velocity;
	document.getElementById('tilt').textContent = resData.tilt;
	if (toggleRecord) {
		cache.push(resData);
	}
};

const handlePost = async (mission_name) => {
	const response = await fetch(
		'https://ta-sbm-backend-6p95.vercel.app/api/data',
		{
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({
				mission_name: mission_name,
				data: cache,
			}),
		}
	);
	const responseJson = await response.json();
	console.log(responseJson);
};

const recData = () => {
	toggleRecord = !toggleRecord;
	button1.classList.remove('hover:bg-slate-700/50');
	button1.classList.add('bg-sky-500');
	button1.classList.add('hover:bg-sky-600');
	console.log(toggleRecord);
	if (cache != [] && toggleRecord == false) {
		button1.classList.remove('bg-sky-500');
		button1.classList.remove('hover:bg-sky-600');
		button1.classList.add('hover:bg-slate-700/50');
		console.log(cache);
		var mission_name = prompt('Simpan misi:');
		handlePost(mission_name);
		cache = [];
	}
};

const button1 = document.getElementById('fetch_button');
button1.addEventListener('click', recData);
