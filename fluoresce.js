const net = require('net');
const fs = require('fs');
const zlib = require('zlib');
const path = require('path');
let IsForceSave = 0;

let MasterObject = {};
if (!fs.existsSync('./saved/')) { fs.mkdirSync('./saved'); }
const ReloadDir = fs.readdirSync('./saved/');
for (let e in ReloadDir) {
	MasterObject[ReloadDir[e]] = {};
}
async function Delay(Time) {
	await new Promise(resolve => setTimeout(resolve, Time));
	return;
}

function ReadUserData(Parsed) {
	if (MasterObject[Parsed['destination']][String(Parsed['userid'])] == undefined) {
		if (fs.existsSync(path.join(process.cwd(), "saved", Parsed['destination'], String(Parsed['userid'])))) {
			MasterObject[Parsed['destination']][String(Parsed['userid'])] = zlib.gunzipSync(fs.readFileSync(path.join(process.cwd(), "saved", Parsed['destination'], String(Parsed['userid']))));
		}
		else {
			MasterObject[Parsed['destination']][String(Parsed['userid'])] = {};
		}
	}
	MasterObject[Parsed['destination']][String(Parsed['userid'])]['lastinteraction'] = Math.floor(Date.now() / 1000);
	return JSON.stringify({ 'result': 0, 'data': MasterObject[Parsed['destination']][String(Parsed['userid'])]['data'] });
}
function WriteUserData(Parsed) {
	const Destination = Parsed['destination'];
	const UserID = Parsed['userid'];
	if (MasterObject[Destination][String(UserID)] == undefined) { MasterObject[Destination][String(UserID)] = {}; }
	MasterObject[Destination][String(UserID)]['data'] = Parsed['data'];
	while (typeof MasterObject[Destination][String(UserID)]['data'] == Object) { Delay(30); }
	if (MasterObject[Destination][String(UserID)]['lastinteraction'] < Parsed['lastinteraction']) {
		MasterObject[Destination][String(UserID)]['lastinteraction'] = Parsed['lastinteraction'];
	}
	return JSON.stringify({ 'result': 0 });
}
async function ForceSaveDatabases() {
	IsForceSave = 1;
	const DBList = Object.keys(MasterObject);
	for (let ent in DBList) {
		const ExistData = MasterObject[DBList[ent]];
		const ExpectPath = path.join(process.cwd(), "saved", DBList[ent]);
		const UserList = Object.keys(ExistData);
		for (let u in UserList) {
			const UserData = ExistData[UserList[u]];
			const UserName = UserList[u] + ".gz";
			const UserPath = path.join(process.cwd(), "saved", DBList[ent], UserName);
			fs.writeFileSync(UserPath, zlib.gzipSync(JSON.stringify(UserData)));
		}
	}
	IsForceSave = 0;
	return 0;
}

async function ColdLoop() {
	while (true) {
	while (IsForceSave == 0) {
		Delay(600000);
		const DBList = Object.keys(MasterObject);
		for (let ent in DBList) {
			const ExistData = MasterObject[DBList[ent]];
			const ExpectPath = path.join(process.cwd(), "saved", DBList[ent]);
			const UserList = Object.keys(ExistData);
			for (let u in UserList) {
				if (ExistData[UserList[u]]['lastinteraction'] < (Math.floor(Date.now() / 1000) - 600)) {
					const UserData = ExistData[UserList[u]];
					const UserName = UserList[u] + ".gz";
					const UserPath = path.join(process.cwd(), "saved", DBList[ent], UserName);
					fs.writeFileSync(UserPath, zlib.gzipSync(JSON.stringify(UserData)));
					
					delete MasterObject[DBList[ent][UserList[u]];
				}
			}
		}
	}}
}

net.createServer((socket) => {
	socket.on('data', (Input) => {
		// Expected input: { 'type': "write", 'destination': "xyz", 'userid': 1000, 'data': {} }
		let Result = { 'result': false };
		const Parsed = JSON.parse(Input);
		const Destination = Parsed['destination'];
		const UserID = Parsed['userid'];
		switch(Parsed['type']) {
			case "create":
				MasterObject[Destination] = {};
				const ExpectPath = path.join(process.cwd(), "saved", Parsed['destination']);
				if (!fs.existsSync(ExpectPath)) { fs.mkdirSync(ExpectPath); }
				Result['result'] = 0;
				Result = JSON.stringify(Result);
				break;
			case "destroy":
				delete MasterObject[Destination];
				Result['result'] = 0;
				Result = JSON.stringify(Result);
				break;
			case "forcesave":
				ForceSaveDatabases();
				Result['result'] = 0;
				Result = JSON.stringify(Result);
				break;
			case "shutdown":
				Result['result'] = 0;
				Result = JSON.stringify(Result);
				break;
			case "read":
				Result = ReadUserData(Parsed);
				break;
			case "write":
				Result = WriteUserData(Parsed);
				break;
		}
		socket.write(Result);
	});
}).listen(4781, "localhost");
ColdLoop();