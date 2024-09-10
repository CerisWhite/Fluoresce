local coro_net = require('coro-net');
local JSON = require('json');

local Module = {}

function Module.Create(Database)
	local Response = {};
	local read, write = coro_net.connect({
		host = "127.0.0.1",
		port = 4781
	});
	local Request = JSON.stringify({ type = "create", destination = Database });
	write(Request); write();
	for Reply in read do
		Response[#Response + 1] = Reply;
	end;
	Response = table.concat(Response);
	return Response;
end;

function Module.Delete(Database, UserID)
	local Response = {};
	local read, write = coro_net.connect({
		host = "127.0.0.1",
		port = 4781
	});
	local Request = JSON.stringify({ type = "delete", destination = Database, userid = UserID });
	write(Request); write();
	for Reply in read do
		Response[#Response + 1] = Reply;
	end;
	Response = table.concat(Response);
	return Response;
end;

function Module.Read(Database, UserID)
	local Response = {};
	local read, write = coro_net.connect({
		host = "127.0.0.1",
		port = 4781
	});
	local Request = JSON.stringify({ type = "read", destination = Database, userid = UserID });
	write(Request); write();
	for Reply in read do
		Response[#Response + 1] = Reply;
	end;
	Response = table.concat(Response);
	return Response;
end;

function Module.Write(Database, UserID, Data)
	local Response = {};
	local read, write = coro_net.connect({
		host = "127.0.0.1",
		port = 4781
	});
	local Request = JSON.stringify({ type = "write", destination = Database, userid = UserID, data = Data });
	write(Request); write();
	for Reply in read do
		Response[#Response + 1] = Reply;
	end;
	Response = table.concat(Response);
	return Response;
end;

function Module.DirectRead(Database, UserID)
	local Response = {};
	local read, write = coro_net.connect({
		host = "127.0.0.1",
		port = 4781
	});
	local Request = JSON.stringify({ type = "directread", destination = Database, userid = UserID });
	write(Request); write();
	for Reply in read do
		Response[#Response + 1] = Reply;
	end;
	Response = table.concat(Response);
	return Response;
end;

function Module.DirectWrite(Database, UserID, Data)
	local Response = {};
	local read, write = coro_net.connect({
		host = "127.0.0.1",
		port = 4781
	});
	local Request = JSON.stringify({ type = "directwrite", destination = Database, userid = UserID, data = Data });
	write(Request); write();
	for Reply in read do
		Response[#Response + 1] = Reply;
	end;
	Response = table.concat(Response);
	return Response;
end;

function Module.ReadIndex(Database, UserID, Index)
	-- Index: {'valuename': "", 'value': ?} --
	local Response = {};
	local read, write = coro_net.connect({
		host = "127.0.0.1",
		port = 4781
	});
	local Request = JSON.stringify({ type = "readindex", destination = Database, userid = UserID, index = Index });
	write(Request); write();
	for Reply in read do
		Response[#Response + 1] = Reply;
	end;
	Response = table.concat(Response);
	return Response;
end;

function Module.WriteIndex(Database, UserID, Index, Data)
	local Response = {};
	local read, write = coro_net.connect({
		host = "127.0.0.1",
		port = 4781
	});
	local Request = JSON.stringify({ type = "writeindex", destination = Database, userid = UserID, index = Index, data = Data });
	write(Request); write();
	for Reply in read do
		Response[#Response + 1] = Reply;
	end;
	Response = table.concat(Response);
	return Response;
end;

function Module.DeleteIndex(Database, UserID, Index)
	local Response = {};
	local read, write = coro_net.connect({
		host = "127.0.0.1",
		port = 4781
	});
	local Request = JSON.stringify({ type = "deleteindex", destination = Database, userid = UserID, index = Index });
	write(Request); write();
	for Reply in read do
		Response[#Response + 1] = Reply;
	end;
	Response = table.concat(Response);
	return Response;
end;

function Module.ReadObject(Database, UserID, ObjectName)
	local Response = {};
	local read, write = coro_net.connect({
		host = "127.0.0.1",
		port = 4781
	});
	local Request = JSON.stringify({ type = "readobject", destination = Database, userid = UserID, objectname = ObjectName });
	write(Request); write();
	for Reply in read do
		Response[#Response + 1] = Reply;
	end;
	Response = table.concat(Response);
	return Response;
end;

function Module.WriteObject(Database, UserID, ObjectName, Data)
	local Response = {};
	local read, write = coro_net.connect({
		host = "127.0.0.1",
		port = 4781
	});
	local Request = JSON.stringify({ type = "writeobject", destination = Database, userid = UserID, objectname = ObjectName, data = Data });
	write(Request); write();
	for Reply in read do
		Response[#Response + 1] = Reply;
	end;
	Response = table.concat(Response);
	return Response;
end;

function Module.DeleteObject(Database, UserID, ObjectName)
	local Response = {};
	local read, write = coro_net.connect({
		host = "127.0.0.1",
		port = 4781
	});
	local Request = JSON.stringify({ type = "deleteobject", destination = Database, userid = UserID, objectname = ObjectName });
	write(Request); write();
	for Reply in read do
		Response[#Response + 1] = Reply;
	end;
	Response = table.concat(Response);
	return Response;
end;

function Module.ReadObjectIndex(Database, UserID, ObjectName, Index)
	local Response = {};
	local read, write = coro_net.connect({
		host = "127.0.0.1",
		port = 4781
	});
	local Request = JSON.stringify({ type = "readobjectindex", destination = Database, userid = UserID, objectname = ObjectName, index = Index });
	write(Request); write();
	for Reply in read do
		Response[#Response + 1] = Reply;
	end;
	Response = table.concat(Response);
	return Response;
end;

function Module.WriteObjectIndex(Database, UserID, ObjectName, Index, Data)
	local Response = {};
	local read, write = coro_net.connect({
		host = "127.0.0.1",
		port = 4781
	});
	local Request = JSON.stringify({ type = "writeobjectindex", destination = Database, userid = UserID, objectname = ObjectName, index = Index, data = Data });
	write(Request); write();
	for Reply in read do
		Response[#Response + 1] = Reply;
	end;
	Response = table.concat(Response);
	return Response;
end;

function Module.DeleteObjectIndex(Database, UserID, ObjectName, Index)
	local Response = {};
	local read, write = coro_net.connect({
		host = "127.0.0.1",
		port = 4781
	});
	local Request = JSON.stringify({ type = "deleteobjectindex", destination = Database, userid = UserID, objectname = ObjectName, index = Index });
	write(Request); write();
	for Reply in read do
		Response[#Response + 1] = Reply;
	end;
	Response = table.concat(Response);
	return Response;
end;

function Module.Exists(Database, UserID)
	local Response = {};
	local read, write = coro_net.connect({
		host = "127.0.0.1",
		port = 4781
	});
	local Request = JSON.stringify({ type = "exists", destination = Database, userid = UserID });
	write(Request); write();
	for Reply in read do
		Response[#Response + 1] = Reply;
	end;
	Response = table.concat(Response);
	return Response['exists'];
end;

function Module.List(Database)
	local Response = {};
	local read, write = coro_net.connect({
		host = "127.0.0.1",
		port = 4781
	});
	local Request = JSON.stringify({ type = "list", destination = Database });
	write(Request); write();
	for Reply in read do
		Response[#Response + 1] = Reply;
	end;
	Response = table.concat(Response);
	return Response;
end;

function Module.Save(Database)
	local Response = {};
	local read, write = coro_net.connect({
		host = "127.0.0.1",
		port = 4781
	});
	local Request = JSON.stringify({ type = "forcesave", destination = Database });
	write(Request); write();
	for Reply in read do
		Response[#Response + 1] = Reply;
	end;
	Response = table.concat(Response);
	return Response;
end;

return Module;
