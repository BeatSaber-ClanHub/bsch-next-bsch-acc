# BSCH Data Access Layer (DAL)

To keep code organized, all queries are written inside of a DAL file. A DAL file contains all the related queries needed throughout the application for a respective model. It doesn't matter how small the query is, it is to be written inside of a respective DAL file.

## Why DAL

Implementing a Data Access Layer ensures that code is uniformilly formated. It also ensures that the BSCH codebase follows the DRY (Dont repeat yourself) principles. The goal is to keep code organized, documented, typesafe, and secure!

## Will contibutions get disreguarded if they write queries outside of the DAL?

Yes. If you make a pull request with code that doesn't follow the standards set in place, they will not be considered no matter the effort.

## Data Access Layer standards

All queries should be written in a file which corresponds to the ORM model it is referencing. For example, if you have a query to get data for a clan, but that query also needs to get data on a user, you must seperate the user and clan query before joining them back together.

- Say we get clan data and get the user info on the current owner, you can call the getUser() function inside of the getClan() DAL function, the queries themselves must be kept seperate though!
