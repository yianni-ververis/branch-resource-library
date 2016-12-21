const https = require('https')
const parseString = require('xml2js').parseString
const mongoose = require('mongoose')
const Blog = require('./server/models/blog')
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
            Blog.findOne({mediumId: getUrlId(item)})
                .then(blog => {
                  if (blog) {
                    const itemHash = hash(item)
                    if (itemHash !== blog.checksum) {
                      console.log(`Publication Updated: ${item.title[0]}`)
                      // item has changed
                      return createUpdateBlog(blog, item)
                    } else {
                      console.log(`No Change: ${item.title[0]}`)
                      resolve()
                    }
                  } else {
                    console.log(`New Publication: ${item.title[0]}`)
                    // item doesn't exist yet
                    const newBlog = new Blog({mediumId: getUrlId(item)})
                    return createUpdateBlog(newBlog, item)
                  }
                })
                .then(created => resolve())
          })
        }))
            .then(result => {
              Blog.find({mediumId: {$nin: foundPublications}})
                  .then((removedPublications) => {
                    Promise.all(removedPublications.map(publication => {
                      return new Promise((pubResolve, pubReject) => {
                        console.log(`Deleting ${publication.title}`)
                        Blog.remove({_id: publication._id})
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

const createUpdateBlog = (blog, rssItem) => {
  return new Promise((resolve, reject) => {
    blog.title = rssItem.title[0]
    blog.author = rssItem["dc:creator"][0]
    blog.link = rssItem["link"][0]
    blog.tags = rssItem.category.join(', ')
    blog.checksum = hash(rssItem)
    blog.published = new Date(rssItem.pubDate[0])
    blog.published_num = blog.published.getTime()
    blog.content = rssItem["content:encoded"][0]
    blog.mediumId = getUrlId(rssItem)
    blog.plaintext = cleanUpContent(blog.content)
    blog.short_description = blog.plaintext.length > 200 ? `${blog.plaintext.substring(0, 197)}...` : blog.plaintext
    blog.image = getFirstImage(blog.content) || "/attachments/default/blog.png"
    blog.approved = true
    blog.save()
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