// Fluoresce DB "driver"
const net = require('net');
const PassKey = "";

function Perform(ToSend) {
	ToSend['passkey'] = PassKey;
	return new Promise((resolve, reject) => {
		let Response = "";
		const socket = net.connect(4781, "127.0.0.1");
		socket.end(JSON.stringify(ToSend));
		socket.on("data", (data) => {
			Response += data;
		});
		socket.on("end", () => {
			socket.destroy();
			Response = JSON.parse(Response);
			if (Response['error'] != 0) {
				let Line = "Fluoresce: ";
				switch(Response['error']) {
					case 1:
						Line += "The provided passkey is incorrect.";
						break;
					case 2:
						Line += "The \"confirmation\" value is required for dangerous operations.";
						break;
					case 3:
						Line += "A User ID value is required for Read/Write/Delete.";
						break;
					case 5:
						Line += "Data required for write.";
						break;
					case 99:
						Line += "The data sent was not valid JSON.";
						break;
				}
				console.log(Line);
				resolve(Response['error']);
			}
			else {
				resolve(Response['data']);
			}
		});
	});
}

function Create(Database, Type, Data, UserID) {
	return Perform({
		'type': "create",
		'db': Database,
		'createtype': Type != undefined ? Type : false,
		'data': Data != undefined ? Data : false,
		'userid': UserID != undefined ? UserID : false
	});
}
function Destroy(Database, UserID, Confirmation) {
	return Perform({
		'type': "destroy",
		'db': Database,
		'userid': UserID != undefined ? UserID : false,
		'confirmation': Confirmation != undefined ? Confirmation : false
	});
}

function Read(Database, UserID, Target, Search) {
	return Perform({
		'type': "read",
		'db': Database,
		'userid': UserID,
		'target': Target != undefined ? Target : false,
		'search': Search != undefined ? Search : false
	});
}
function DirectRead(Database, UserID) {
	return Perform({
		'type': "directread",
		'db': Database,
		'userid': UserID != undefined ? UserID : false
	});
}
function ReadIncrement(Database, UserID) {
	return Perform({
		'type': "readincrement",
		'db': Database,
		'userid': UserID != undefined ? UserID : false
	});
}

function Write(Database, UserID, Data, Target, Search) {
	return Perform({
		'type': "write",
		'db': Database,
		'userid': UserID,
		'data': Data,
		'target': Target != undefined ? Target : false,
		'search': Search != undefined ? Search : false,
	});
}
function DirectWrite(Database, UserID, Data) {
	return Perform({
		'type': "directwrite",
		'db': Database,
		'userid': UserID,
		'data': Data
	});
}

function Delete(Database, UserID, Target, Search, Confirmation) {
	return Perform({
		'type': "delete",
		'db': Database,
		'userid': UserID,
		'target': Target != undefined ? Target : false,
		'search': Search != undefined ? Search : false,
		'confirmation': Confirmation != undefined ? Confirmation : false
	});
}

function ReadList(Database, UserID, Count, KeyID, KeyValue) {
	return Perform({
		'type': "readlist",
		'db': Database,
		'userid': UserID,
		'count': Count != undefined ? Count : false,
		'keyname': KeyID != undefined ? KeyID : false,
		'keyvalue': KeyValue != undefined ? KeyValue : false
	});
}
function Append(Database, UserID, Data) {
	return Perform({
		'type': "append",
		'db': Database,
		'userid': UserID,
		'data': Data
	});
}
function QueryList(Database, UserID, Search) {
	return Perform({
		'type': "querylist",
		'db': Database,
		'userid': UserID,
		'search': Search
	});
}

function Exists(Database, UserID) {
	return Perform({
		'type': "exists",
		'db': Database,
		'userid': UserID != undefined ? UserID : false
	});
}

function List(Database) {
	return Perform({
		'type': "list",
		'db': Database
	});
}

function Count(Database, UserID, Target) {
	return Perform({
		'type': "count",
		'db': Database,
		'userid': UserID != undefined ? UserID: false,
		'target': Target != undefined ? Target : false
	});
}

function CountUser(Database, UserID, Target) {
	return Perform({
		'type': "countusers",
		'db': Database,
		'userid': UserID != undefined ? UserID: false,
		'target': Target != undefined ? Target : false
	});
}

function Save(Database) {
	return Perform({
		'type': "save",
		'db': Database
	});
}

module.exports = { Create, Destroy,
				   Read, DirectRead, ReadIncrement,
				   Write, DirectWrite,
				   Delete,
				   ReadList, QueryList, Append,
				   Exists, List,
				   Count, CountUser, Save };
