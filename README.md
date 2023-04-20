# Fluoresce, a pure JS JSON-based DB
Made for me to use with my projects, mostly.

This server uses a TCP socket on port 4781 (bound to 127.0.0.1) to accept JSON information. Examples of this are in `testing.js`

To use Fluoresce yourself, add the `driver.js` file to your project and use require to include it
`const db = require('./external/driver.js')`

You can run Fluoresce itself by downloading the repository and then creating a background process:
`node ./fluoresce.js & disown`
or on Windows, you can use (Quiet)[http://www.joeware.net/freetools/tools/quiet/index.htm] and do:
`quiet node ./fluoresce.js`


It's that simple

---

## Some more information:
- Fluoresce is file-based. All of the data is stored in gzip'd plain-text inside a folder, which is the "database". All of this is saved inside of the `saved` directory, in the same directory as `fluoresce.js`. This may be changed in the future.
- The commands available through the driver are `Create`, `Delete`, `Read`, `Write`, `Exists`.
- `Delete` and `Exists` operate slightly differently depending on if a `UserID` is passed. Delete will call `destroy` and delete the whole database if no UserID is present, while Exists will check if the requested database exists if no UserID is passed.
- The driver does not currently include the `ForceSave`/`Save` function, though it exists in Fluoresce.
- The `UserID` is stored as a string, so it can be anything, including numbers.
- By default, Fluoresce will (hopefully) flush all of the data that has been "cold" for 600000ms/10min or longer.
- Fluoresce returns "{}" or `undefined` when no data is present/an error has occurred.
- The `shutdown` command currently does nothing because I'm not entirely sure what I want it to do yet.
- UserID `0` isn't available for use, since this is used to change the context of some commands like Exists and Delete
