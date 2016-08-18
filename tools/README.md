# This directory contains the tools for importing data into the application
## summarize
Import lattice data to MongoDB from an xlsx file for runcheck.  Use xlsx (https://github.com/SheetJS/js-xlsx.git) library to read data.

Data files are uploaded on trello.com runcheck sprint2 board. There are some format changes between the Original file and the modified file.

The  format of data in each sheet shall like the following:

| systm         |subsytem          | devie         |
| ------------- | ---------------- | ------------- |
| foo           | 123              | abc           |
| bar           | 345              | def           |

The following are the main steps for slot data filter:
  - delete column named 'Distance from Artemis source (m)' in slots data.
  - if type of field is number, delete the unit in field.
  - if specified columns are empty, delete the row.

## command
```
Usage: node xlsx-mongo [options] <spec>
  <spec>: configuration file path or name.
  Options:

    -h, --help              output usage information
    -V, --version           output the version number
    -d, --dryrun            validate data by schema in MongoDB.
    -m, --mongo             save data in defoult MongoDB.
    -o, --outfile [outfle]  save data in specified file.
    -a, --append            force to append data in MongoDB when the DB already has data.
```
## configuration file
use json format file as configuration. Currently, there are there files in drectory:

*  slot-config.json, for detailed slot data import
*  slot-config2.json, for slot data import
*  device-config.json, for device data mport

### essential attributes
* file
The specified .xlsx fle path or name.
* name
Data name(slot or device)
* model
Mongoose data model name
* collection
collection name in MongoDB
* nameMap
two-dimensional array, The mapping relation betwwen raw column value in file and attrbute in data attribute in MongoDB. The column not defined in nameMap would be ommited, for example:
```
  "nameMap": [
    ["serialNo", "FRIB Part Number (w/ SN when applicable)"],
    ["name", "Alias / Nickname"],
    ["type", "FRIB Device Type"],
    ["department", "Associated Department"]
  ]
```
* position
Json Objects list, the data position in file, include sheet name and data range. For example:
| systm         |subsytem          | devie         |
| ------------- | ---------------- | ------------- |
| foo           | 123              | abc           |
| bar           | 345              | def           |
 If the table is in Devices sheet, and the 'system' is in cell A2, and the 'def' is in cell D66, position defined like this
```
  "position":[
    {
      "sheet": "Devices",
      "range": "A2:D66"
```
### optional  attributes
* filterField
String list, if a field is defined in filterField and the field(column) vaue is null, the row of data would be omitted.

