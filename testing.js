const net = require('net');

console.log("Running tests");

function Create() {
	const socket = net.connect(4781, "localhost");
	socket.write(JSON.stringify({'type': "create", 'destination': "Test1", 'userid': 0}));
	socket.on("data", (data) => {
		console.log(JSON.parse(data));
		socket.destroy();
	});
}
function Write() {
	const socket = net.connect(4781, "localhost");
	socket.write(JSON.stringify({'type': "write", 'destination': "Test1", 'userid': 1000, 'data': { 'examplestr': "Test", 'exampleint': 1 } }));
	socket.on("data", (data) => {
		console.log(JSON.parse(data));
		socket.destroy();
	});
}
function Read() {
	const socket = net.connect(4781, "localhost");
	socket.write(JSON.stringify({'type': "read", 'destination': "Test1", 'userid': 1000 }));
	socket.on("data", (data) => {
		console.log(JSON.parse(data));
		socket.destroy();
	});
}
function ForceSave() {
	const socket = net.connect(4781, "localhost");
	socket.write(JSON.stringify({'type': "forcesave", 'destination': "Test1", 'userid': 1000 }));
	socket.on("data", (data) => {
		console.log(JSON.parse(data));
		socket.destroy();
	});
}
function Exists() {
	const socket = net.connect(4781, "localhost");
	socket.write(JSON.stringify({'type': "exists", 'destination': "Test1", 'userid': 0 }));
	socket.on("data", (data) => {
		console.log(JSON.parse(data));
		socket.destroy();
	});
}
function ExistsUser() {
	const socket = net.connect(4781, "localhost");
	socket.write(JSON.stringify({'type': "exists", 'destination': "Test1", 'userid': 1000 }));
	socket.on("data", (data) => {
		console.log(JSON.parse(data));
		socket.destroy();
	});
}
async function Delay() {
	await new Promise(resolve => setTimeout(resolve, 4000));
}



function PerfOps() {
	Create();
	Delay();
	Write();
	Read();
	//ForceSave();
	Exists();
	ExistsUser();
}
PerfOps();
