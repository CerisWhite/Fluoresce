# Fluoresce, a pure JS JSON-based DB
Made for me to use with my projects, mostly.

This server uses a TCP socket on port 4781 (bound to 127.0.0.1) to accept JSON information.


To use Fluoresce yourself, run it, and edit the `driver.js` file to include the generated "passkey". Afterwards, add the `driver.js` file to your project and use require to include it

`const db = require('./driver.js')`


You can run Fluoresce itself by downloading the repository and then creating a background process:

`node ./fluoresce.js & disown`

or on Windows, you can use [Quiet](http://www.joeware.net/freetools/tools/quiet/index.htm) and do:

`quiet node ./fluoresce.js`


It's that simple

---

## Some more information:
- Fluoresce is file-based. All of the data is stored in gzip'd plain-text inside a folder, which is the "database". All of this is saved inside of the directory set inside `fluoresce.js` itself.
- Certain operations perform differently if a User ID or Database name is not passed. e.g.) `Save` will write out all data to disk.
- The `UserID` is stored as a string, so it can be anything.
- By default, Fluoresce writes out all data that has been in the database for longer than 5 minutes. If the data has not been interacted with for longer than 5 minutes, it is both written out to disk and removed from memory.
- Fluoresce returns "{}" or `false` when no data is present/an error has occurred.
- `DirectRead` and `DirectWrite` will bypass the live data if it isn't present in memory, and operate on the file directly. This is used for modifying data in all files to avoid loading everything into memory at once.
