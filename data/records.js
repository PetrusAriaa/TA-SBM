const missionList = document.getElementById('missionList');

cache = [];

const handleDelete = async (mission_id) => {
	const res = await fetch(`http://127.0.0.1:3300/api/data/${mission_id}`, {
		method: 'DELETE',
	});
	const resJson = res.json();
	console.log(resJson);
};

const loadData = async () => {
	const response = await fetch('http://127.0.0.1:3300/api/mission_data');
	const dataJson = await response.json();
	console.log(dataJson);
	dataJson.forEach((item) => {
		if (!cache.includes(item.mission_id)) {
			const listItem = document.createElement('li');
			const missionName = document.createElement('h1');
			const buttonDelete = document.createElement('button');
			listItem.className =
				'bg-slate-800 px-5 py-2.5 rounded-lg border border-slate-200/25 flex justify-between items-center';
			missionName.innerHTML = item.mission_name;
			buttonDelete.className =
				'text-red-700 hover:text-white border border-red-700 hover:bg-red-800 active:scale-95 font-medium rounded-lg text-sm px-5 py-2.5 text-center mr-2 mb-2';
			buttonDelete.textContent = 'Delete Mission';
			buttonDelete.addEventListener('click', () => {
				handleDelete(item.mission_id);
			});
			listItem.append(missionName);
			listItem.append(buttonDelete);

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
