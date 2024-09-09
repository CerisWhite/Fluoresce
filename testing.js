const Fluoresce = require('./driver.js');

async function InitDatabase() {
	const IDStatus = await Fluoresce.Exists("MasterIDRecord");
	const AccStatus = await Fluoresce.Exists("MasterAccountRecord");
	const SessStatus = await Fluoresce.Exists("MasterSessionRecord");
	const IndexStatus = await Fluoresce.Exists("MasterIndexRecord");
	const AnalyticsStatus = await Fluoresce.Exists("AnalyticsRecord");
	const DPSStatus = await Fluoresce.Exists("MasterDPSRecord");
	const TeamStatus = await Fluoresce.Exists("MasterTeamRecord");
	if (IDStatus == false) {
		await Fluoresce.Create("MasterIDRecord");
		await Fluoresce.Write("MasterIDRecord", "LastAssignedID", 9999999);
		await Fluoresce.Write("MasterIDRecord", "LastGuildID", 10001);
		await Fluoresce.Save("MasterIDRecord");
	}
	if (AccStatus == false) { await Fluoresce.Create("MasterAccountRecord"); }
	if (SessStatus == false) { await Fluoresce.Create("MasterSessionRecord"); }
	if (IndexStatus == false) {
		await Fluoresce.Create("MasterIndexRecord");
		const fs = require('fs');
		const Save = JSON.parse(fs.readFileSync("/home/ceris/Downloads/savedata.json"))['data'];
		await Fluoresce.Write("MasterIndexRecord", 1000000000, Save);
	}
	if (AnalyticsStatus == false) { await Fluoresce.Create("AnalyticsRecord"); }
	if (DPSStatus == false) { await Fluoresce.Create("MasterDPSRecord"); }
	if (TeamStatus == false) { await Fluoresce.Create("MasterTeamRecord"); }
}
InitDatabase();

console.log("Running tests");

async function Main() {
	const ObjectTest = await Fluoresce.ReadObject("MasterIndexRecord", 1000000000, "user_data");
	console.log(ObjectTest);
	ObjectTest['crystal'] += 1000;
	await Fluoresce.WriteObject("MasterIndexRecord", 1000000000, "user_data", ObjectTest);
	const ObjectTest2 = await Fluoresce.ReadObject("MasterIndexRecord", 1000000000, "user_data");
	console.log(ObjectTest2);
	const ListTest1 = await Fluoresce.ReadObjectIndex("MasterIndexRecord", 1000000000, "material_list", {'valuename': "material_id", 'value': 104001041});
	console.log(ListTest1);
	ListTest1['quantity'] += 900;
	await Fluoresce.WriteObjectIndex("MasterIndexRecord", 1000000000, "material_list", {'valuename': "material_id", 'value': 104001041}, ListTest1);
	const ListTest2 = await Fluoresce.ReadObjectIndex("MasterIndexRecord", 1000000000, "material_list", {'valuename': "material_id", 'value': 104001041});
	console.log(ListTest2);
}
Main();