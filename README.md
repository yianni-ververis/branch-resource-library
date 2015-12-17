**_This documentation is a work in progress_**

# Qlik Branch
###### That's right branch.qlik.com is open source.

For better or for worse Branch contains a lot of moving parts. Before setting out on your Branch adventure you'll need to be familiar with **Qlik Sense**, **The Generic REST Connector for Qlik Sense**, **MongoDB**, **NodeJS**, **ExpressJS** and **AngularJS**

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

To contribute to or implement your own version of Branch, see the [Wiki](https://github.com/Qlik-PE/branch-resource-library/wiki) pages for more information.
