// Fluoresce DB "driver"
const net = require('net');

function Create(Database) {
	return new Promise((resolve, reject) => {
		const socket = net.connect(4781, "127.0.0.1");
		socket.write(JSON.stringify({'type': "create", 'destination': Database, 'userid': 0}));
		socket.on("data", (data) => {
			Response = JSON.parse(data);
			socket.destroy();
			resolve(Response);
		});
	});
}

function Delete(Database, UserID) {
	return new Promise((resolve, reject) => {
		const socket = net.connect(4781, "127.0.0.1");
		if (typeof UserID == Number || typeof UserID == String) {
			socket.write(JSON.stringify({'type': "delete", 'destination': Database, 'userid': UserID}));
			socket.on("data", (data) => {
				Response = JSON.parse(data);
				socket.destroy();
				resolve(Response);
			});
		}
		else {
			socket.write(JSON.stringify({'type': "destroy", 'destination': Database, 'userid': 0}));
			socket.on("data", (data) => {
				Response = JSON.parse(data);
				socket.destroy();
				resolve(Response);
			});
		}
	});
}

function Read(Database, UserID) {
	return new Promise((resolve, reject) => {
		const socket = net.connect(4781, "127.0.0.1");
		socket.write(JSON.stringify({'type': "read", 'destination': Database, 'userid': UserID }));
		socket.on("data", (data) => {
			Response = JSON.parse(data);
			socket.destroy();
			resolve(Response);
		});
	});
}

function Write(Database, UserID, Data) {
	return new Promise((resolve, reject) => {
		if (UserID == 0) { return false; }
		const socket = net.connect(4781, "127.0.0.1");
		socket.write(JSON.stringify({'type': "write", 'destination': Database, 'userid': UserID, 'data': Data }));
		socket.on("data", (data) => {
			Response = JSON.parse(data);
			socket.destroy();
			resolve(Response);
		});
	});
}

function Exists(Database, UserID) {
	return new Promise((resolve, reject) => {
		const socket = net.connect(4781, "127.0.0.1");
		if (typeof UserID == Number || typeof UserID == String) {
			socket.write(JSON.stringify({'type': "exists", 'destination': Database, 'userid': UserID }));
			socket.on("data", (data) => {
				const Response = JSON.parse(data);
				socket.destroy();
				resolve(Response['exists']);
			});
		}
		else {
			socket.write(JSON.stringify({'type': "exists", 'destination': Database, 'userid': 0 }));
			socket.on("data", (data) => {
				const Response = JSON.parse(data);
				socket.destroy();
				resolve(Response['exists']);
			});
		}
	});
}

function Save(Database) {
	return new Promise((resolve, reject) => {
		const socket = net.connect(4781, "127.0.0.1");
		socket.write(JSON.stringify({'type': "forcesave", 'destination': Database }));
		socket.on("data", (data) => {
			Response = JSON.parse(data);
			socket.destroy();
			resolve(Response);
		});
	});
}

module.exports = { Create, Delete, Read, Write, Exists, Save };
