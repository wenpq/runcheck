# Import lattice data in Excel to MongoDB
Use xlsx library to read data.

Data files are uploaded on trelleo. there are some format changes between the Original file and the current file.

The following is the data format in current file:
| systm         |subsytem         | devie        |
| ------------- | ---------------- | ------------- |
| foo           | 123              | abc           |
| bar           | 345              | def           |

The following is the key process for slot data:
  - delete column (Distance from Artemis source (m)) in slots data
  - if type of field is number, delete the unit in field.
  - if column 'systm' or 'subsytem' or 'devie' or 'Beam line position (dm)' are empty, delete the row.