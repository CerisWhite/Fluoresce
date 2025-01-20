const net = require('net');
const fs = require('fs');
const zlib = require('zlib');
const path = require('path');
process.on('uncaughtException', function (error) {
   console.log(error.stack);
});
const DBDir = "database"
const MaxAppendObjects = 100;
const MaxArchiveObjects = 10000;
let PassKey = null;
let IsForceSave = 0;

let MasterObject = {};
let ArchiveObject = {};
if (!fs.existsSync(path.join(process.cwd(), DBDir))) { fs.mkdirSync(path.join(process.cwd(), DBDir)); }
if (!fs.existsSync(path.join(process.cwd(), DBDir, "Archive"))) { fs.mkdirSync(path.join(process.cwd(), DBDir, "Archive")); }
const ReloadDir = fs.readdirSync(path.join(process.cwd(), DBDir));
for (let e in ReloadDir) {
	if (ReloadDir[e].endsWith(".gz")) {
		MasterObject[ReloadDir[e].slice(0, ReloadDir[e].length - 3)] = JSON.parse(zlib.gunzipSync(fs.readFileSync(path.join(process.cwd(), DBDir, ReloadDir[e]))));
	}
	else {
		MasterObject[ReloadDir[e]] = {};
	}
}
async function Delay(Time) {
	await new Promise(resolve => setTimeout(resolve, Time));
	return;
}

function LoadUser(DB, UserID) {
	const RightNow = Date.now();
	if (MasterObject[DB][UserID] == undefined) {
		MasterObject[DB][UserID] = {
			'warmtime': RightNow,
			'lastinteraction': RightNow,
			'data': {}
		}
		if (fs.existsSync(path.join(process.cwd(), DBDir, DB, UserID + ".gz"))) {
			MasterObject[DB][UserID]['data'] = JSON.parse(zlib.gunzipSync(fs.readFileSync(path.join(process.cwd(), DBDir, DB, UserID + ".gz"))));
		}
	}
	else {
		MasterObject[DB][UserID]['lastinteraction'] = RightNow;
	}
	return;
}
function GetMatchIndex(Data, KeyValues) {
	const Search = Object.keys(KeyValues);
	for (const i in Data) {
		let Match = [];
		for (const x in Search) {
			if (Data[i][Search[x]] == KeyValues[Search[x]]) {
				Match.push(true);
			}
		}
		if (Match.length == Search.length) {
			return parseInt(i);
		}
	}
	return -1;
}
function ReverseSortByKey(Data, KeyName) {
	let Sorted = [];
	let Iteration = 0;
	for (const x in Data) {
		if (Data[x][KeyName] > Iteration) {
			Iteration = Data[x][KeyName];
		}
	}
	while (Sorted.length < Data.length) {
		if (Iteration == -1) { break; }
		for (const x in Data) {
			if (Data[x][KeyName] == Iteration) {
				Sorted.push(Data[x]);
				break;
			}
		}
		Iteration -= 1;
	}
	return Sorted;
}

function ReadUserData(DB, ID, Target, KeyValues) {
	if (MasterObject[DB] == undefined) { return false; }
	if (MasterObject[DB]['Fluoresce_Type'] == "Transient") {
		if (MasterObject[DB][ID] == undefined) { return false; }
		else { return MasterObject[DB][ID]['data']; }
	}
	
	LoadUser(DB, ID);
	if (Target != false) {
		if (MasterObject[DB][ID]['data'][Target] == undefined) {
			return false;
		}
		if (KeyValues != false) {
			const Index = GetMatchIndex(MasterObject[DB][ID]['data'][Target], KeyValues);
			if (Index == -1) { return false; }
			else { return MasterObject[DB][ID]['data'][Target][Index]; }
		}
		else { return MasterObject[DB][ID]['data'][Target]; }
	}
	else if (KeyValues != false) {
		const Search = Object.keys(KeyValues);
		for (const i in MasterObject[DB][ID]['data']) {
			let Match = [];
			for (const x in Search) {
				if (MasterObject[DB][ID]['data'][Search[x]] == KeyValues[Search[x]]) {
					Match.push(true);
				}
			}
			if (Match.length == Search.length) {
				return MasterObject[DB][ID]['data'][i];
			}
		}
	}
	else {
		return MasterObject[DB][ID]['data'];
	}
	
	return false;
}
function WriteUserData(DB, ID, Data, Target, KeyValues) {
	if (MasterObject[DB] == undefined) { return false; }
	LoadUser(DB, ID);
	if (Target != false) {
		if (KeyValues != false) {
			if (MasterObject[DB][ID]['data'][Target] == undefined) {
				return false;
			}
			
			const Index = GetMatchIndex(MasterObject[DB][ID]['data'][Target], KeyValues);
			if (Index == -1) { MasterObject[DB][ID]['data'][Target].push(Data); }
			else { MasterObject[DB][ID]['data'][Target][Index] = Data; }
		}
		else { MasterObject[DB][ID]['data'][Target] = Data; }
	}
	else if (KeyValues != false) {
		const Index = GetMatchIndex(MasterObject[DB][ID]['data'], KeyValues);
		if (Index == -1) { MasterObject[DB][ID]['data'].push(Data); }
		else { MasterObject[DB][ID]['data'][Index] = Data; }
	}
	else {
		MasterObject[DB][ID]['data'] = Data;
	}
	
	return true;
}
function DeleteUserData(DB, ID, Target, KeyValues, Confirm) {
	if (MasterObject[DB] == undefined) { return false; }
	let Response = {};
	LoadUser(DB, ID);
	if (Target != false) {
		if (KeyValues != false) {
			if (MasterObject[DB][ID]['data'][Target] == undefined) {
				return false;
			}
			const Index = GetMatchIndex(MasterObject[DB][ID]['data'][Target], KeyValues);
			if (Index == -1) { return false; }
			else { MasterObject[DB][ID]['data'][Target].splice(Index, 1); }
		}
		else {
			if (Confirm == true) {
				delete MasterObject[DB][ID]['data'][Target];
			}
		}
	}
	else if (KeyValues != false) {
		const Index = GetMatchIndex(MasterObject[DB][ID]['data'][Target], KeyValues);
		if (Index == -1) { return false; }
		else { MasterObject[DB][ID]['data'][Target].splice(Index, 1); }
	}
	else {
		if (Confirm == true) {
			MasterObject[DB][ID]['data'] = {};
		}
	}
	
	
	return true;
}

function DirectReadUserData(DB, ID) {
	if (MasterObject[DB] == undefined) { return false; }
	if (MasterObject[DB][ID] == undefined) {
		const UserPath = path.join(process.cwd(), DBDir, DB, ID + ".gz");
		if (fs.existsSync(UserPath)) {
			const Data = JSON.parse(zlib.gunzipSync(fs.readFileSync(UserPath)));
			return Data;
		}
		else {
			return {}
		}
	}
	else { return MasterObject[DB][ID]['data']; }
	
	return false;
}
function DirectWriteUserData(DB, ID, Data) {
	if (MasterObject[DB] == undefined) { return false; }
	if (MasterObject[DB][ID] == undefined) {
		const UserPath = path.join(process.cwd(), DBDir, DB, ID + ".gz");
		fs.writeFileSync(UserPath, zlib.gzipSync(JSON.stringify(Data)));
	}
	else { MasterObject[DB][ID]['data'] = Data; }
	
	return true;
}

function ReadUserDataList(DB, ID, Count, KeyName, KeyValue) {
	if (MasterObject[DB] == undefined) { return false; }
	LoadUser(DB, ID);
	let ArchiveCount = 0;
	if (fs.existsSync(path.join(process.cwd(), DBDir, "Archive", DB))) {
		ArchiveCount = fs.readdirSync(path.join(process.cwd(), DBDir, "Archive", DB)).filter(x => x.includes(ID)).length;
	}
	const DataList = [];
	let Source = MasterObject[DB][ID]['data'];
	if (Count == 0 || Count == false) {
		return Source;
	}
	let CheckedArchive0 = false;
	let LoopTrack = 0;
	while (DataList.length < Count) {
		LoopTrack += 1;
		if (LoopTrack > 2000) { break; }
		if (KeyName != false && KeyValue != false) {
			Source = ReverseSortByKey(Source, KeyName);
			for (const x in Source) {
				if (Source[x][KeyName] < KeyValue) {
					DataList.unshift(Source[x]);
				}
			}
		}
		else {
			for (const x in Source) {
				DataList.unshift(Source[x]);
			}
		}
		if (ArchiveCount == -1) { break; }
		else {
			if (CheckedArchive0 == false && ArchiveObject[DB] != undefined && ArchiveObject[DB][ID] != undefined) {
				Source = ArchiveObject[DB][ID];
				CheckedArchive0 = true;
			}
			else {
				if (ArchiveCount == 0) {
					ArchiveCount -= 1;
				}
				else {
					const ArchivePath = path.join(process.cwd(), DBDir, "Archive", DB, ID + "_" + ArchiveCount + ".gz");
					Source = JSON.parse(zlib.gunzipSync(fs.readFileSync(ArchivePath)));
					ArchiveCount -= 1;
				}
			}
			
		}
	}
	if (DataList.length > Count) {
		const OverCount = DataList.length - Count;
		DataList.splice(0, OverCount);
		
	}
	
	return DataList;
}
function AppendUserData(DB, ID, Data) {
	if (MasterObject[DB] == undefined) { return false; }
	LoadUser(DB, ID);
	if (MasterObject[DB][ID]['data'][0] == undefined) { MasterObject[DB][ID]['data'] = []; }
	for (const x in Data) {
		MasterObject[DB][ID]['data'].unshift(Data[x]);
	}
	if (ArchiveObject[DB] == undefined) { ArchiveObject[DB] = {}; }
	if (ArchiveObject[DB][ID] == undefined) { ArchiveObject[DB][ID] = []; }
	while (MasterObject[DB][ID]['data'].length > MaxAppendObjects) {
		ArchiveObject[DB][ID].unshift(MasterObject[DB][ID]['data'].pop());
	}
	
	return true;
}
function QueryUserDataList(DB, ID, KeyValues) {
	if (MasterObject[DB] == undefined) { return false; }
	LoadUser(DB, ID);
	let ArchiveCount = 0;
	if (fs.existsSync(path.join(process.cwd(), DBDir, "Archive", DB))) {
		ArchiveCount = fs.readdirSync(path.join(process.cwd(), DBDir, "Archive", DB)).filter(x => x.includes(ID)).length;
	}
	let Source = MasterObject[DB][ID]['data'];
	let CheckedArchive0 = false;
	while (ArchiveCount > -1) {
		const Index = GetMatchIndex(Source, KeyValues);
		if (Index == -1) { return false; }
		else { return Source[Index]; }
		
		if (ArchiveCount == -1) { break; }
		else {
			if (CheckedArchive0 == false && ArchiveObject[DB] != undefined && ArchiveObject[DB][ID] != undefined) {
				Source = ArchiveObject[DB][ID];
				CheckedArchive0 = true;
			}
			else {
				if (ArchiveCount == 0) {
					ArchiveCount -= 1;
				}
				else {
					const ArchivePath = path.join(process.cwd(), DBDir, "Archive", DB, ID + "_" + ArchiveCount + ".gz");
					Source = JSON.parse(zlib.gunzipSync(fs.readFileSync(ArchivePath)));
					ArchiveCount -= 1;
				}
			}
		}
	}
	return false;
}

function CountUserList(DB, ID, Target) {
	if (MasterObject[DB] == undefined) { return false; }
	if (MasterObject[DB]['Fluoresce_Type'] == "Transient") {
		if (MasterObject[DB][ID] == undefined) { return false; }
		else { return MasterObject[DB][ID]['data'].length; }
	}
	
	LoadUser(DB, ID);
	if (Target != false) {
		if (MasterObject[DB][ID]['data'][Target] == undefined) {
			return false;
		}
		else { return MasterObject[DB][ID]['data'][Target].length; }
	}
	else {
		return MasterObject[DB][ID]['data'].length;
	}
	
	return false;
}
function CountUserData(DB, ID, Target) {
	if (MasterObject[DB] == undefined) { return false; }
	if (MasterObject[DB]['Fluoresce_Type'] == "Transient") {
		if (MasterObject[DB][ID] == undefined) { return false; }
		else { return Object.keys(MasterObject[DB][ID]['data']).length; }
	}
	
	LoadUser(DB, ID);
	if (Target != false) {
		if (MasterObject[DB][ID]['data'][Target] == undefined) {
			return false;
		}
		else { return Object.keys(MasterObject[DB][ID]['data'][Target]).length; }
	}
	else {
		return Object.keys(MasterObject[DB][ID]['data']).length;
	}
	
	return false;
}

async function ForceSaveDatabases() {
	IsForceSave = 1;
	const DBList = Object.keys(MasterObject);
	for (const ent in DBList) {
		const ExistData = MasterObject[DBList[ent]];
		if (ExistData['Fluoresce_Type'] == "Transient") { continue; }
		const ExpectPath = path.join(process.cwd(), DBDir, DBList[ent]);
		if (ExistData['Fluoresce_Type'] == "Incremental") {
			fs.writeFileSync(ExpectPath + '.gz', zlib.gzipSync(JSON.stringify(ExistData)));
			continue;
		}
		const UserList = Object.keys(ExistData);
		for (let u in UserList) {
			const UserData = ExistData[UserList[u]]['data'];
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
	if (MasterObject[String(Database)]['Fluoresce_Type'] == "Transient") { return; }
	if (MasterObject[String(Database)]['Fluoresce_Type'] == "Incremental") {
		fs.writeFileSync(ExpectPath + '.gz', zlib.gzipSync(JSON.stringify(MasterObject[String(Database)])));
		return;
	}
	const UserList = Object.keys(MasterObject[String(Database)]);
	for (let u in UserList) {
		const UserData = MasterObject[String(Database)][UserList[u]]['data'];
		const UserName = UserList[u] + ".gz";
		const UserPath = path.join(process.cwd(), DBDir, Database, UserName);
		fs.writeFileSync(UserPath, zlib.gzipSync(JSON.stringify(UserData)));
	}
	IsForceSave = 0;
	return 0;
}

async function ColdLoop() {
	while (true) {
		await Delay(60000);
		if (IsForceSave == 1) { continue; }
		const DBList = Object.keys(MasterObject);
		for (const ent in DBList) {
			const ExistData = MasterObject[DBList[ent]];
			const ExpectPath = path.join(process.cwd(), DBDir, DBList[ent]);
			if (ExistData['Fluoresce_Type'] == "Incremental") {
				fs.writeFileSync(ExpectPath + '.gz', zlib.gzipSync(JSON.stringify(ExistData)));
				continue;
			}
			const UserList = Object.keys(ExistData);
			if (ExistData['Fluoresce_Type'] == "Transient") {
				for (const u in UserList) {
					if (UserList[u] == "Fluoresce_Type" || UserList[u] == "Alive_Time") { continue; }
					if (ExistData[UserList[u]]['warmtime'] < (Date.now() - ExistData['Alive_Time'])) {
						delete MasterObject[DBList[ent]][UserList[u]];
					}
				}
			}
			else {
				for (const u in UserList) {
					if (ExistData[UserList[u]]['warmtime'] < (Date.now() - 180000)) {
						const UserData = ExistData[UserList[u]]['data'];
						const UserName = UserList[u] + ".gz";
						const UserPath = path.join(process.cwd(), DBDir, DBList[ent], UserName);
						fs.writeFileSync(UserPath, zlib.gzipSync(JSON.stringify(UserData)));
						MasterObject[DBList[ent]][UserList[u]]['warmtime'] = Date.now();
					}
					if (ExistData[UserList[u]]['lastinteraction'] < (Date.now() - 600000)) {
						const UserData = ExistData[UserList[u]]['data'];
						const UserName = UserList[u] + ".gz";
						const UserPath = path.join(process.cwd(), DBDir, DBList[ent], UserName);
						fs.writeFileSync(UserPath, zlib.gzipSync(JSON.stringify(UserData)));
						
						delete MasterObject[DBList[ent]][UserList[u]];
					}
				}
			}
		}
	}
}
async function ArchiveLoop() {
	while (true) {
		await Delay(120000);
		const DBList = Object.keys(ArchiveObject);
		for (const ent in DBList) {
			const ExistData = ArchiveObject[DBList[ent]];
			const ExpectPath = path.join(process.cwd(), DBDir, "Archive", DBList[ent]);
			if (!fs.existsSync(ExpectPath)) { fs.mkdirSync(ExpectPath); }
			const UserList = Object.keys(ExistData);
			for (const u in UserList) {
				let ArchiveCount = fs.readdirSync(ExpectPath).filter(x => x.includes(UserList[u])).length;
				let ArchivePath = path.join(ExpectPath, UserList[u] + "_" + ArchiveCount + ".gz");
				let FileArchive = [];
				if (ArchiveCount == 0) { ArchivePath = path.join(ExpectPath, UserList[u] + "_1" + ".gz"); }
				else { FileArchive = JSON.parse(zlib.gunzipSync(fs.readFileSync(ArchivePath))); }
				while (ArchiveObject[DBList[ent]][UserList[u]].length > 0) {
					if (FileArchive.length > MaxArchiveObjects) {
						fs.writeFileSync(ArchivePath, zlib.gzipSync(JSON.stringify(FileArchive)));
						ArchiveCount += 1;
						ArchivePath = path.join(ExpectPath, UserList[u] + "_" + ArchiveCount + ".gz");
						FileArchive = [];
					}
					FileArchive.push(ArchiveObject[DBList[ent]][UserList[u]].shift());
				}
				fs.writeFileSync(ArchivePath, zlib.gzipSync(JSON.stringify(FileArchive)));
			}
		}
	}
}

if (!fs.existsSync(path.join(process.cwd(), ".key"))) {
	const Crypto = require('crypto');
	PassKey = Crypto.randomBytes(32).toString("hex");
	console.log("Fluoresce key: ", PassKey);
	fs.writeFileSync(path.join(process.cwd(), ".key"), PassKey);
}
else { PassKey = fs.readFileSync(path.join(process.cwd(), ".key")); }

net.createServer((socket) => {
	let Parsed = "";
	socket.on('data', (Input) => {
		// Expected input: { 'type': "write", 'db': "xyz", 'userid': 1000, 'data': {} }
		Parsed += Input;
	});
	socket.on('end', () => {
		let Result = {'error': 0};
		try {
		Parsed = JSON.parse(Parsed);
		if (Parsed['passkey'] != PassKey) {
			Result = {'error': 1};
			socket.end(JSON.stringify(Result));
			return;
		}
		const DB = Parsed['db'];
		const UserID = Parsed['userid'];
		if (
			Parsed['type'] == "read" || Parsed['type'] == "directread" ||
			Parsed['type'] == "write" || Parsed['type'] == "directwrite" ||
			Parsed['type'] == "delete" || Parsed['type'] == "directdelete"
		) {
			if (UserID == 0 || UserID == false) {
				Result['error'] = 3;
				socket.end(JSON.stringify(Result));
				return;
			}
		}
		
		switch(Parsed['type']) {
			case "create":
				if (MasterObject[DB] == undefined) {
					MasterObject[DB] = {};
					if (Parsed['createtype'] == "transient") {
						MasterObject[DB]['Fluoresce_Type'] = "Transient";
						if (Parsed['data'] == false) {
							MasterObject[DB]['Alive_Time'] = 600000;
						}
						else { MasterObject[DB]['Alive_Time'] = parseInt(Parsed['data']); }
					}
					else if (Parsed['createtype'] == "incremental") {
						MasterObject[DB]['Fluoresce_Type'] = "Incremental";
						if (UserID == false) {
							if (Parsed['data'] == false) {
								MasterObject[DB]['data'] = 0;
							}
							else { MasterObject[DB]['data'] = Parsed['data']; }
						}
						else {
							if (Parsed['data'] == false) {
								MasterObject[DB][UserID] = 0;
							}
							else { MasterObject[DB][UserID] = Parsed['data']; }
						}
					}
					else {
						const ExpectPath = path.join(process.cwd(), DBDir, DB);
						if (!fs.existsSync(ExpectPath)) { fs.mkdirSync(ExpectPath); }
					}
				}
				else {
					if (Parsed['createtype'] == "incremental") {
						if (UserID != false) {
							if (Parsed['data'] == false) {
								MasterObject[DB][UserID] = 0;
							}
							else { MasterObject[DB][UserID] = Parsed['data']; }
						}
					}
				}
				break;
			case "destroy":
				if (Parsed['confirmation'] == true) {
					let ExpectPath = "";
					if (UserID != 0) {
						const ExpectPath = path.join(process.cwd(), DBDir, DB, UserID);
						delete MasterObject[DB][UserID];
					}
					else {
						const ExpectPath = path.join(process.cwd(), DBDir, DB);
						delete MasterObject[DB];
					}
					fs.unlinkSync(ExpectPath);
				}
				else { Result['error'] = 2; }
				break;
			case "save":
				if (DB != undefined) {
					ForceSaveDatabase(DB);
				}
				else { ForceSaveDatabases(); }
				break;
			case "exists":
				Result['data'] = false;
				if (UserID != false && MasterObject[DB] != undefined) {
					if (MasterObject[DB][String(UserID)] != undefined) {
						Result['data'] = true;
					}
					else if (fs.existsSync(path.join(process.cwd(), DBDir, DB, UserID + ".gz"))) {
						Result['data'] = true;
					}
				}
				else {
					if (MasterObject[DB] != undefined
					|| fs.existsSync(path.join(process.cwd(), DBDir, DB))
					|| fs.existsSync(path.join(process.cwd(), DBDir, DB + ".gz"))) {
						Result['data'] = true;
					}
				}
				break;
			case "list":
				const UserList = [];
				for (let x in Object.keys(MasterObject[DB])) {
					UserList.push(Object.keys(MasterObject[DB])[x]);
				}
				const AllList = fs.readdirSync(path.join(__dirname, DBDir, DB));
				for (let y in AllList) {
					const Sliced = AllList[y].slice(0, AllList[y].length - 3);
					if (!UserList.includes(Sliced)) { UserList.push(Sliced); }
				}
				Result['data'] = UserList;
				break;
			case "read":
				Result['data'] = ReadUserData(DB, String(UserID), Parsed['target'], Parsed['search']);
				break;
			case "write":
				if (Parsed['data'] == undefined) { Result['error'] = 5; }
				else {
					Result['data'] = WriteUserData(DB, String(UserID), Parsed['data'], Parsed['target'], Parsed['search']);
				}
				break;
			case "delete":
				Result['data'] = DeleteUserData(DB, String(UserID), Parsed['target'], Parsed['search'], Parsed['confirmation']);
				break;
			case "directread":
				Result['data'] = DirectReadUserData(DB, String(UserID));
				break;
			case "directwrite":
				if (Parsed['data'] == undefined) { Result['error'] = 5; }
				else {
					Result['data'] = DirectWriteUserData(DB, String(UserID), Parsed['data']);
				}
				break;
			case "readincrement":
				if (UserID != false) {
					if (MasterObject[DB][UserID] == undefined) {
						
					}
					MasterObject[DB][UserID] += 1;
					Result['data'] = MasterObject[DB][UserID];
				}
				else {
					MasterObject[DB]['data'] += 1;
					Result['data'] = MasterObject[DB]['data'];
				}
				break;
			case "readlist":
				Result['data'] = ReadUserDataList(DB, String(UserID), Parsed['count'], Parsed['keyname'], Parsed['keyvalue']);
				break;
			case "querylist":
				Result['data'] = QueryUserDataList(DB, String(UserID), Parsed['search']);
				break;
			case "append":
				Result['data'] = AppendUserData(DB, String(UserID), Parsed['data']);
				break;
			case "count":
				Result['data'] = CountUserList(DB, String(UserID), Parsed['target']);
				break;
			case "countusers":
				Result['data'] = CountUserData(DB, String(UserID), Parsed['target']);
				break;
		}
		} catch (err) { console.log(err); Result = JSON.stringify({'error': 99}); }
		socket.end(JSON.stringify(Result));
	});
}).listen(4781, "127.0.0.1");
ColdLoop();
ArchiveLoop();
console.log("Fluoresce is listening.");