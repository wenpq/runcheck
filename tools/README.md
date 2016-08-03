# This directory contains the tools for importing data into the application
## Import lattice data from an xlsx file
Use xlsx library to read data.

Data files are uploaded on trello.com runcheck sprint2 board. There are some format changes between the Original file and the modified file. Each sheet saves one branch,
The following is the branch data format of one sheet in modified file:

| systm         |subsytem          | devie         |
| ------------- | ---------------- | ------------- |
| foo           | 123              | abc           |
| bar           | 345              | def           |

The following are the main steps for slot data filter:
  - delete column named 'Distance from Artemis source (m)' in slots data.
  - if type of field is number, delete the unit in field.
  - if column 'systm' or 'subsytem' or 'devie' or 'Beam line position (dm)' are empty, delete the row.

```
Usage: node import-slots [options] <spec>

  Options:

    -h, --help              output usage information
    -V, --version           output the version number
    -d, --dryrun            validate data by schema in MongoDB.
    -m, --mongo             save data in defoult MongoDB.
    -o, --outfile [outfle]  save data in specified file.
    -f, --force             force to save n MongoDB when the DB already has data.
```
