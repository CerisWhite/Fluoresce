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
	return Response;
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