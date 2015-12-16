**_This documentation is a work in progress_**

# Qlik Branch
###### That's right branch.qlik.com is open source.

For better or for worse Branch contains a lot of moving parts. Before setting out on your Branch adventure you'll need to be familiar with [Qlik Sense](), [The Generic REST Connector for Qlik Sense](), [MongoDB](), [NodeJS](), [ExpressJS]() and [AngularJS]()

### Environment
To setup Branch you'll need the following available environments - 
* A Qlik Sense Server Environment (Sense Server)
* Access to a MongoDB instance (Database Server)
* An installation of NodeJS and bower (Web Server)

**NOTE** These environments may exist on one or many machines.

### An overview of moving parts
The Branch platform is built on top of a MEAN stack. That's [MongoDB](), [ExpressJS](), [AngularJS]() and [NodeJS](). 
All data is stored and maintained in MongoDB however we load that data into a Qlik Sense application and use it for all searching and filtering. Within the site, the different listing pages (Projects, Blogs, Forum etc) are all powered by Qlik Sense. The detail pages and commenting are all driven by MongoDB. As a result, whenever new items are added (excluding comments) they will need to be loaded into the Qlik Sense application prior to being visible in the Branch Client.

If you intend to customise and/or repurpose Branch you'll need to understand how to retrieve the data you need from Qlik Sense. You can read more about that in the **Customising the Sense Integration section**

### Installing Branch
1. First things first either clone or download the project into your favourite directory.
2. Using a command line tool, navigate to the directory and install the project and it's dependencies
```
npm install
```
3. We also have some dependencies
```
bower update
```
### Setting up the database
1. Using a tool of you choice, make a connection to your MongoDB instance and create a database
2. Next you'll need an admin user and some permissions. Run the following script to create them
```

```

### Configuring the Qlik Sense Server
1. info goes here
2. 

### Configuring the Qlik Sense App
1. 

### Configuring the NodeJS application
###### So that NodeJS can talk to Qlik Sense and Mongo we'll need to tell it where they live. 
1. Start by creating a file called **config.js** in the root directory of the project and add the following -
```javascript
module.exports = {
  mongoconnectionstring: "mongodb://user:pass@host:port/database",
  mailTransport:{
    service: '',  //for example 'smtp'
    auth: {
      user: '',
      pass: ''
    }
  }
}
```
**NOTE** The mailTransport object is used when sending email notifications. If no mailTransport is specified no emails will be sent. 
We are using [Nodemailer](https://github.com/andris9/Nodemailer) for sending emails. For more information on Nodemailer and mailTransports see [here](https://github.com/andris9/Nodemailer)

2. Now create a file called **sense.json** in the **/public/configs** directory and add the following -
```javascript
{
  "host": "<qlik sense host>",
  "prefix": "/<virtual proxy prefix>",
  "isSecure": true,
  "rejectUnauthorized": false,
  "appname": "<app name/guid>"
}
```

### Customising the Sense Integration
Each search result list that appears in Branch is composes of an HTML template and a JSON configuration file. The HTML template can live anywhere however the JSON config **MUST** reside in the **/public/configs** directory. The configuration file contains the definition for which fields to use in when Searching, Suggesting and Sorting as well as the fields that will be available in the results list. The config also controls how many results to load per page. An example config may look like this -
```javascript
{
  "fields":[
    {
      "dimension": "projectId",
      "suppressNull": true
    },
    {
      "dimension": "title",
      "suppressNull": false
    },
    {
      "dimension": "username",
      "suppressNull": false
    },
    {
      "measure": "sum(points)",
      "label": "rating",
      "sortType" : "qSortByNumeric",
      "order" : -1
    },
    {
      "measure": "sum(viewNum)",
      "label": "views"
    }
  ],
  "template": "/views/projects/project-results.html",
  "sorting":{
    "title": {
      "id": "title",
      "name": "A-Z",
      "order": 1,
      "field": "title",
      "sortType": "qSortByAscii"
    },
    "username": {
      "id": "username",
      "name": "User",
      "order": 1,
      "field": "username",
      "sortType": "qSortByAscii"
    },
    "rating": {
      "id": "rating",
      "name": "Most Popular",
      "order": -1,
      "field": "rating",
      "sortType": "qSortByNumeric"
    }
  },
  "primaryKey" : "projectId",
  "defaultSort": "title",
  "entity": "project",
  "nullSuppressor": 0,
  "searchFields": ["SearchField"],
  "suggestFields": ["title","username","tags","category","product"],
  "pagesize" : 20
}
```
