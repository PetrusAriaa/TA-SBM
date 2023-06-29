const missionList = document.getElementById('missionList');
const tempChart = document.getElementById('temperature');
const humChart = document.getElementById('humidity');
const distChart = document.getElementById('distance');
const tiltChart = document.getElementById('tilt');
const veloChart = document.getElementById('velocity');

var tempData = [];
var humData = [];
var distData = [];
var tiltData = [];
var veloData = [];
var timestamp = [];

var t = new Chart(tempChart, {
	type: 'line',
	data: {
		labels: timestamp,
		datasets: [
			{
				label: 'Temperature (Celcius)',
				data: tempData,
				borderWidth: 1,
			},
		],
	},
	options: {
		scales: {
			y: {
				beginAtZero: true,
			},
		},
	},
});

var h = new Chart(humChart, {
	type: 'line',
	data: {
		labels: timestamp,
		datasets: [
			{
				label: 'Humidity',
				data: humData,
				borderWidth: 1,
			},
		],
	},
	options: {
		scales: {
			y: {
				beginAtZero: true,
			},
		},
	},
});

var d = new Chart(distChart, {
	type: 'line',
	data: {
		labels: timestamp,
		datasets: [
			{
				label: 'Traveled Distance (m)',
				data: distData,
				borderWidth: 1,
			},
		],
	},
	options: {
		scales: {
			y: {
				beginAtZero: true,
			},
		},
	},
});

var ti = new Chart(tiltChart, {
	type: 'line',
	data: {
		labels: timestamp,
		datasets: [
			{
				label: 'Tilt Degree',
				data: tiltData,
				borderWidth: 1,
			},
		],
	},
	options: {
		scales: {
			y: {
				beginAtZero: true,
			},
		},
	},
});

var v = new Chart(veloChart, {
	type: 'line',
	data: {
		labels: timestamp,
		datasets: [
			{
				label: 'Velocity (m/s)',
				data: veloData,
				borderWidth: 1,
			},
		],
	},
	options: {
		scales: {
			y: {
				beginAtZero: true,
			},
		},
	},
});

cache = [];

const handleDelete = async (mission_id) => {
	const res = await fetch(
		`https://ta-sbm-backend-6p95.vercel.app/api/data/${mission_id}`,
		{
			method: 'DELETE',
		}
	);
	window.location.reload();
};

const handleMissionLoad = async (mission_id) => {
	const res = await fetch(
		`https://ta-sbm-backend-6p95.vercel.app/api/data/${mission_id}`
	);
	const jsonRes = await res.json();
	console.log(jsonRes);
	tempData = [];
	humData = [];
	distData = [];
	tiltData = [];
	veloData = [];
	timestamp = [];
	jsonRes.forEach((item) => {
		let temperature = parseFloat(item.temperature);
		let humidity = parseFloat(item.humidity);
		let distance = parseFloat(item.distance);
		let tilt = parseFloat(item.tilt);
		let velocity = parseFloat(item.velocity);
		let _timestamp = parseInt(item.timestamp);
		tempData.push(temperature);
		humData.push(humidity);
		distData.push(distance);
		tiltData.push(tilt);
		veloData.push(velocity);
		timestamp.push(_timestamp);
	});

	if (t) {
		t.destroy();
	}
	if (h) {
		h.destroy();
	}
	if (d) {
		d.destroy();
	}
	if (ti) {
		ti.destroy();
	}
	if (v) {
		v.destroy();
	}

	t = new Chart(tempChart, {
		type: 'line',
		data: {
			labels: timestamp,
			datasets: [
				{
					label: 'Temperature (Celcius)',
					data: tempData,
					borderWidth: 1,
				},
			],
		},
		options: {
			scales: {
				y: {
					beginAtZero: true,
				},
			},
		},
	});

	h = new Chart(humChart, {
		type: 'line',
		data: {
			labels: timestamp,
			datasets: [
				{
					label: 'Humidity',
					data: humData,
					borderWidth: 1,
				},
			],
		},
		options: {
			scales: {
				y: {
					beginAtZero: true,
				},
			},
		},
	});

	d = new Chart(distChart, {
		type: 'line',
		data: {
			labels: timestamp,
			datasets: [
				{
					label: 'Traveled Distance (m)',
					data: distData,
					borderWidth: 1,
				},
			],
		},
		options: {
			scales: {
				y: {
					beginAtZero: true,
				},
			},
		},
	});

	ti = new Chart(tiltChart, {
		type: 'line',
		data: {
			labels: timestamp,
			datasets: [
				{
					label: 'Tilt Degree',
					data: tiltData,
					borderWidth: 1,
				},
			],
		},
		options: {
			scales: {
				y: {
					beginAtZero: true,
				},
			},
		},
	});

	v = new Chart(veloChart, {
		type: 'line',
		data: {
			labels: timestamp,
			datasets: [
				{
					label: 'Velocity (m/s)',
					data: veloData,
					borderWidth: 1,
				},
			],
		},
		options: {
			scales: {
				y: {
					beginAtZero: true,
				},
			},
		},
	});
};

const loadData = async () => {
	const response = await fetch(
		'https://ta-sbm-backend-6p95.vercel.app/api/mission_data'
	);
	const dataJson = await response.json();
	console.log(dataJson);
	dataJson.forEach((item) => {
		if (!cache.includes(item.mission_id)) {
			const listItem = document.createElement('li');
			const missionName = document.createElement('h1');
			const buttonDelete = document.createElement('button');
			const buttonLoad = document.createElement('button');
			listItem.className =
				'bg-slate-800 px-5 py-2.5 rounded-lg border border-slate-200/25 flex justify-between items-center';
			missionName.innerHTML = item.mission_name;
			buttonDelete.className =
				'text-red-700 hover:text-white border border-red-700 hover:bg-red-800 active:scale-95 font-medium rounded-lg text-sm px-5 py-2.5 text-center mr-2 mb-2';
			buttonDelete.textContent = 'Delete Mission';
			buttonDelete.addEventListener('click', () => {
				handleDelete(item.mission_id);
			});
			buttonLoad.className =
				'text-amber-400 hover:text-white border border-amber-400 hover:bg-amber-400 active:scale-95 font-medium rounded-lg text-sm px-5 py-2.5 text-center mr-2 mb-2';
			buttonLoad.textContent = 'Display Mission';
			buttonLoad.addEventListener('click', () => {
				handleMissionLoad(item.mission_id);
			});
			const holder = document.createElement('div');
			holder.append(buttonLoad);
			holder.append(buttonDelete);
			listItem.append(missionName);
			listItem.append(holder);

			missionList.append(listItem);

			cache.push(item.mission_id);
		}
	});
};

const handleClickLoad = () => {
	loadData();
};

const loadButton = document.getElementById('LoadButton');
loadButton.addEventListener('click', handleClickLoad);
