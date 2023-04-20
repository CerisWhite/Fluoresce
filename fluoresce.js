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

function ReadUserData(Destination, UserID) {
	if (MasterObject[Destination][UserID] == undefined) {
		if (fs.existsSync(path.join(process.cwd(), "saved", Destination, UserID))) {
			MasterObject[Destination][UserID] = zlib.gunzipSync(fs.readFileSync(path.join(process.cwd(), "saved", Destination, UserID)));
		}
		else {
			MasterObject[Destination][UserID] = {};
		}
	}
	MasterObject[Destination][UserID]['lastinteraction'] = Math.floor(Date.now() / 1000);
	return JSON.stringify(MasterObject[Destination][UserID]['data']);
}
function WriteUserData(Destination, UserID, Data) {
	if (MasterObject[Destination] == undefined) { return JSON.stringify({'exists': false}); }
	if (MasterObject[Destination][UserID] == undefined) { MasterObject[Destination][UserID] = {}; }
	MasterObject[Destination][UserID]['data'] = Data;
	MasterObject[Destination][UserID]['lastinteraction'] = Math.floor(Date.now() / 1000);
	return JSON.stringify({});
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
		await Delay(600000);
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
					
					delete MasterObject[DBList[ent]][UserList[u]];
				}
			}
		}
	}}
}

net.createServer((socket) => {
	socket.on('data', (Input) => {
		// Expected input: { 'type': "write", 'destination': "xyz", 'userid': 1000, 'data': {} }
		let Result = {};
		const Parsed = JSON.parse(Input);
		const Destination = Parsed['destination'];
		const UserID = Parsed['userid'];
		switch(Parsed['type']) {
			case "create":
				if (MasterObject[Destination] == undefined) { MasterObject[Destination] = {}; }
				const ExpectPath = path.join(process.cwd(), "saved", Destination);
				if (!fs.existsSync(ExpectPath)) { fs.mkdirSync(ExpectPath); }
				Result = JSON.stringify(Result);
				break;
			case "delete":
				delete MasterObject[Destination][String(UserID)];
				Result = JSON.stringify(Result);
				break;
			case "destroy":
				delete MasterObject[Destination];
				Result = JSON.stringify(Result);
				break;
			case "forcesave":
				ForceSaveDatabases();
				Result = JSON.stringify(Result);
				break;
			case "shutdown":
				Result = JSON.stringify(Result);
				break;
			case "exists":
				Result['exists'] = false;
				if (UserID > 0) {
					try {
						if (MasterObject[Destination][String(UserID)] != undefined) {
							Result['exists'] = true;
						}
					} catch { console.log("error"); }
				}
				else {
					if (MasterObject[Destination] != undefined) {
						Result['exists'] = true;
					}
				}
				Result = JSON.stringify(Result);
				break;
			case "read":
				Result = ReadUserData(Destination, String(UserID));
				break;
			case "write":
				Result = WriteUserData(Destination, String(UserID), Parsed['data']);
				break;
		}
		socket.end(Result);
	});
}).listen(4781, "localhost");
ColdLoop();
