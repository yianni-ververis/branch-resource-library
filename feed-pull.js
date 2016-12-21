const https = require('https')
const parseString = require('xml2js').parseString
const mongoose = require('mongoose')
const Publication = require('./server/models/publication')
const config = require('./config')
const hash = require('object-hash')

mongoose.Promise = global.Promise
mongoose.connect(config.mongoconnectionstring)

https.get(`https://medium.com/feed/${config.mediumId}`, res => {
  const statusCode = res.statusCode;
  const contentType = res.headers['content-type'];

  let error;
  if (statusCode !== 200) {
    error = new Error(`Request Failed.\n` +
        `Status Code: ${statusCode}`);
  } else if (!/^text\/xml/.test(contentType)) {
    error = new Error(`Invalid content-type.\n` +
        `Expected application/json but received ${contentType}`);
  }
  if (error) {
    console.log(error.message);
    // consume response data to free up memory
    res.resume();
    return;
  }

  res.setEncoding('utf8');
  let rawData = '';
  let foundPublications = []
  res.on('data', chunk => rawData += chunk);
  res.on('end', () => {
    try {
      parseString(rawData, (err, result) => {
        console.log(`${result.rss.channel[0].item.length} publications`)
        Promise.all(result.rss.channel[0].item.map(item => {
          return new Promise((resolve, reject) => {
            foundPublications.push(getUrlId(item))
            Publication.findOne({mediumId: getUrlId(item)})
                .then(publication => {
                  if (publication) {
                    const itemHash = hash(item)
                    if (itemHash !== publication.checksum) {
                      console.log(`Publication Updated: ${item.title[0]}`)
                      // item has changed
                      return createUpdatePublication(publication, item)
                    } else {
                      console.log(`No Change: ${item.title[0]}`)
                      resolve()
                    }
                  } else {
                    console.log(`New Publication: ${item.title[0]}`)
                    // item doesn't exist yet
                    const newPublication = new Publication({mediumId: getUrlId(item)})
                    return createUpdatePublication(newPublication, item)
                  }
                })
                .then(created => resolve())
          })
        }))
            .then(result => {
              Publication.find({mediumId: {$nin: foundPublications}})
                  .then((removedPublications) => {
                    Promise.all(removedPublications.map(publication => {
                      return new Promise((pubResolve, pubReject) => {
                        console.log(`Deleting ${publication.title}`)
                        Publication.remove({_id: publication._id})
                            .then(result => {
                              console.log(`Publication Removed: ${publication.title}`)
                              pubResolve()
                            })
                      })
                    }))
                        .then(result => {
                          console.log('done')
                          mongoose.connection.close()
                        })

                  })
            })
      })
    } catch (e) {
      console.log(e.message);
    }
  });
}).on('error', e => {
  console.log(`Got error: ${e.message}`);
});

const getUrlId = item => {
  let id = item.guid[0]["_"]
  id = id.substring(id.lastIndexOf('/') + 1)
  return id
}

const createUpdatePublication = (publication, rssItem) => {
  return new Promise((resolve, reject) => {
    publication.title = rssItem.title[0]
    publication.author = rssItem["dc:creator"][0]
    publication.link = rssItem["link"][0]
    publication.tags = rssItem.category.join(', ')
    publication.checksum = hash(rssItem)
    publication.published = new Date(rssItem.pubDate[0])
    publication.published_num = publication.published.getTime()
    publication.content = rssItem["content:encoded"][0]
    publication.mediumId = getUrlId(rssItem)
    publication.plaintext = cleanUpContent(publication.content)
    publication.short_description = publication.plaintext.length > 200 ? `${publication.plaintext.substring(0, 197)}...` : publication.plaintext
    publication.image = getFirstImage(publication.content) || "/attachments/default/publication.png"
    publication.approved = true
    publication.save()
        .then(result => {
          resolve()
        })
  })
}

const getFirstImage = content => {
  let index = content.indexOf("<img")
  if (index >= 0) {
    index = content.indexOf('src="', index)
    if (index >= 0) {
      index += 5
      let lastIndex = content.indexOf('"', index)
      let image = content.substring(index, lastIndex)
      if (image.indexOf("stat?event=post.clientViewed") >= 0) {
        // this is an image medium puts into rss feeds, don't want to use this
        return null
      }
      return image
    } else {
      return null
    }
  } else {
    return null
  }
}

const cleanUpContent = text => {
  let plaintext = text.replace(/<\/?[^>]+(>|$)/g, " ")
  plaintext = plaintext.replace(/\s\s+/g, ' ')
  return plaintext
}