const net = require('net');
const fs = require('fs');
const zlib = require('zlib');
const path = require('path');
const DBDir = "dbdir"
let IsForceSave = 0;

let MasterObject = {};
if (!fs.existsSync(path.join(process.cwd(), DBDir))) { fs.mkdirSync(path.join(process.cwd(), DBDir)); }
const ReloadDir = fs.readdirSync(path.join(process.cwd(), DBDir));
for (let e in ReloadDir) {
	MasterObject[ReloadDir[e]] = {};
}
async function Delay(Time) {
	await new Promise(resolve => setTimeout(resolve, Time));
	return;
}

function ReadUserData(Destination, UserID) {
	if (MasterObject[Destination] == undefined) { return JSON.stringify({'exists': false}); }
	let Response = {};
	if (MasterObject[Destination][UserID] != undefined) {
		MasterObject[Destination][UserID]['lastinteraction'] = Math.floor(Date.now() / 1000);
		Response = MasterObject[Destination][UserID]['data'];
	}
	else if (fs.existsSync(path.join(process.cwd(), DBDir, Destination, UserID + ".gz"))) {
		MasterObject[Destination][UserID] = JSON.parse(zlib.gunzipSync(fs.readFileSync(path.join(process.cwd(), DBDir, Destination, UserID + ".gz"))));
		MasterObject[Destination][UserID]['lastinteraction'] = Math.floor(Date.now() / 1000);
		Response = MasterObject[Destination][UserID]['data'];
	}
	return JSON.stringify(Response);
}
function WriteUserData(Destination, UserID, Data) {
	if (MasterObject[Destination] == undefined) { return JSON.stringify({'exists': false}); }
	if (MasterObject[Destination][UserID] == undefined) { MasterObject[Destination][UserID] = {}; }
	MasterObject[Destination][UserID]['data'] = Data;
	MasterObject[Destination][UserID]['lastinteraction'] = Math.floor(Date.now() / 1000);
	return JSON.stringify({});
}
function DirectReadUserData(Destination, UserID) {
	if (MasterObject[Destination] == undefined) { return JSON.stringify({'exists': false}); }
	let Response = {};
	if (MasterObject[Destination][UserID] != undefined) {
		MasterObject[Destination][UserID]['lastinteraction'] = Math.floor(Date.now() / 1000);
		Response = MasterObject[Destination][UserID]['data'];
	}
	else if (fs.existsSync(path.join(process.cwd(), DBDir, Destination, UserID + ".gz"))) {
		const UserData = JSON.parse(zlib.gunzipSync(fs.readFileSync(path.join(process.cwd(), DBDir, Destination, UserID + ".gz"))));
		Response = UserData['data'];
	}
	return JSON.stringify(Response);
}
function DirectWriteUserData(Destination, UserID, Data) {
	const UserPath = path.join(process.cwd(), DBDir, Destination, UserID + ".gz");
	if (MasterObject[Destination] == undefined) { return JSON.stringify({'exists': false}); }
	if (MasterObject[Destination][UserID] != undefined) {
		MasterObject[Destination][UserID]['data'] = Data;
		MasterObject[Destination][UserID]['lastinteraction'] = Math.floor(Date.now() / 1000);
	}
	else if (fs.existsSync(UserPath)) {
		let UserData = JSON.parse(zlib.gunzipSync(fs.readFileSync(UserPath)));
		UserData['data'] = Data;
		UserData['lastinteraction'] = Math.floor(Date.now() / 1000);
		fs.writeFileSync(UserPath, zlib.gzipSync(JSON.stringify(UserData)));
	}
	return JSON.stringify({});
}
async function ForceSaveDatabases() {
	IsForceSave = 1;
	const DBList = Object.keys(MasterObject);
	for (let ent in DBList) {
		const ExistData = MasterObject[DBList[ent]];
		const ExpectPath = path.join(process.cwd(), DBDir, DBList[ent]);
		const UserList = Object.keys(ExistData);
		for (let u in UserList) {
			const UserData = ExistData[UserList[u]];
			const UserName = UserList[u] + ".gz";
			const UserPath = path.join(process.cwd(), DBDir, DBList[ent], UserName);
			fs.writeFileSync(UserPath, zlib.gzipSync(JSON.stringify(UserData)));
		}
	}
	IsForceSave = 0;
	return 0;
}
async function ForceSaveDatabase(Database) {
	IsForceSave = 1;
	if (MasterObject[String(Database)] == undefined) { IsForceSave = 0; return 0; }
	const UserList = Object.keys(MasterObject[String(Database)]);
	for (let u in UserList) {
		const UserData = MasterObject[String(Database)][UserList[u]];
		const UserName = UserList[u] + ".gz";
		const UserPath = path.join(process.cwd(), DBDir, Database, UserName);
		fs.writeFileSync(UserPath, zlib.gzipSync(JSON.stringify(UserData)));
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
			const ExpectPath = path.join(process.cwd(), DBDir, DBList[ent]);
			const UserList = Object.keys(ExistData);
			for (let u in UserList) {
				if (ExistData[UserList[u]]['lastinteraction'] < (Math.floor(Date.now() / 1000) - 600)) {
					const UserData = ExistData[UserList[u]];
					const UserName = UserList[u] + ".gz";
					const UserPath = path.join(process.cwd(), DBDir, DBList[ent], UserName);
					fs.writeFileSync(UserPath, zlib.gzipSync(JSON.stringify(UserData)));
					
					delete MasterObject[DBList[ent]][UserList[u]];
				}
			}
		}
	}}
}

net.createServer((socket) => {
	let Parsed = "";
	socket.on('data', (Input) => {
		// Expected input: { 'type': "write", 'destination': "xyz", 'userid': 1000, 'data': {} }
		Parsed += Input;
	});
	socket.on('end', () => {
		Parsed = JSON.parse(Parsed);
		const Destination = Parsed['destination'];
		const UserID = Parsed['userid'];
		let Result = {};
		switch(Parsed['type']) {
			case "create":
				if (MasterObject[Destination] == undefined) { MasterObject[Destination] = {}; }
				const ExpectPath = path.join(process.cwd(), DBDir, Destination);
				if (!fs.existsSync(ExpectPath)) { fs.mkdirSync(ExpectPath); }
				Result['success'] = true;
				Result = JSON.stringify(Result);
				break;
			case "delete":
				delete MasterObject[Destination][String(UserID)];
				Result['success'] = true;
				Result = JSON.stringify(Result);
				break;
			case "destroy":
				delete MasterObject[Destination];
				Result['success'] = true;
				Result = JSON.stringify(Result);
				break;
			case "forcesave":
				if (Destination != undefined) {
					ForceSaveDatabase(Destination);
				}
				else { ForceSaveDatabases(); }
				Result['success'] = true;
				Result = JSON.stringify(Result);
				break;
			case "shutdown":
				Result['success'] = false;
				Result = JSON.stringify(Result);
				break;
			case "exists":
				Result['exists'] = false;
				if (UserID != 0) {
					try {
						if (MasterObject[Destination][String(UserID)] != undefined) {
							Result['exists'] = true;
						}
						else if (fs.existsSync(path.join(process.cwd(), DBDir, Destination, UserID + ".gz"))) {
							MasterObject[Destination][String(UserID)] = JSON.parse(zlib.gunzipSync(fs.readFileSync(path.join(process.cwd(), DBDir, Destination, UserID + ".gz"))));
							Result['exists'] = true;
						}
					} catch { console.log("error"); }
				}
				else {
					if (fs.existsSync(path.join(process.cwd(), DBDir, Destination))) {
						Result['exists'] = true;
					}
				}
				Result = JSON.stringify(Result);
				break;
			case "list":
				const UserList = [];
				for (let x in Object.keys(MasterObject[Destination])) {
					UserList.push(Object.keys(MasterObject[Destination])[x]);
				}
				Result = JSON.stringify(UserList);
			case "read":
				Result = ReadUserData(Destination, String(UserID));
				break;
			case "write":
				if (UserID == 0) { Result['success'] = false; socket.end(Result); return; }
				Result = WriteUserData(Destination, String(UserID), Parsed['data']);
				break;
			case "directread":
				Result = DirectReadUserData(Destination, String(UserID));
				break;
			case "directwrite":
				if (UserID == 0) { Result['success'] = false; socket.end(Result); return; }
				Result = DirectWriteUserData(Destination, String(UserID), Parsed['data']);
				break;
				break;
		}
		socket.end(Result);
	});
}).listen(4781, "127.0.0.1");
ColdLoop();
console.log("Fluoresce is listening.");
