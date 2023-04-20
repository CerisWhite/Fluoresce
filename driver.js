// Fluoresce DB "driver"
const net = require('net');

function Create(Database) {
	const socket = net.connect(4781, "127.0.0.1");
	socket.write(JSON.stringify({'type': "create", 'destination': Database, 'userid': 0}));
	socket.on("data", (data) => {
		Response = JSON.parse(data);
		socket.destroy();
		return Response;
	});
}

function Delete(Database, UserID) {
	const socket = net.connect(4781, "127.0.0.1");
	if (typeof UserID == Number || typeof UserID == String) {
		socket.write(JSON.stringify({'type': "delete", 'destination': Database, 'userid': UserID}));
		socket.on("data", (data) => {
			Response = JSON.parse(data);
			socket.destroy();
			return Response;
		});
	}
	else {
		socket.write(JSON.stringify({'type': "destroy", 'destination': Database, 'userid': 0}));
		socket.on("data", (data) => {
			Response = JSON.parse(data);
			socket.destroy();
			return Response;
		});
	}
}

function Read(Database, UserID) {
	const socket = net.connect(4781, "127.0.0.1");
	socket.write(JSON.stringify({'type': "read", 'destination': Database, 'userid': UserID }));
	socket.on("data", (data) => {
		Response = JSON.parse(data);
		socket.destroy();
		return Response;
	});
}

function Write(Database, UserID, Data) {
	if (UserID == 0) { return false; }
	const socket = net.connect(4781, "127.0.0.1");
	socket.write(JSON.stringify({'type': "write", 'destination': Database, 'userid': UserID, 'data': Data }));
	socket.on("data", (data) => {
		Response = JSON.parse(data);
		socket.destroy();
		return Response;
	});
}

function Exists(Database, UserID) {
	const socket = net.connect(4781, "127.0.0.1");
	if (typeof UserID == Number || typeof UserID == String) {
		socket.write(JSON.stringify({'type': "exists", 'destination': Database, 'userid': UserID }));
		socket.on("data", (data) => {
			Response = JSON.parse(data);
			socket.destroy();
			return Response['exists'];
		});
	}
	else {
		socket.write(JSON.stringify({'type': "exists", 'destination': Database, 'userid': 0 }));
		socket.on("data", (data) => {
			Response = JSON.parse(data);
			socket.destroy();
			return Response['exists'];
		});
	}
	return false;
}

module.exports = { Create, Delete, Read, Write, Exists };
