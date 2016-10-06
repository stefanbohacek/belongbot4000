var fs = require('fs'),
    path = require('path'),
    express = require('express'),
    http = require('http'),
    request = require('request'),
    cheerio = require('cheerio'),
    app = express(),
    server = http.Server(app),
    Twit = require('twit'),
    config = require('./config'),    
    twitter = new Twit(config.twitter),
    tweetQueue = [],
    url = 'http://belong.io/',
    date = new Date(),
    posted_tweet_ids = [],
    tweet_ids_filename = date.getFullYear()
                       + '-'
                       + ((date.getMonth()+1) < 10 ? '0' : '') + (date.getMonth()+1)
                       + '-'
                       + (date.getDate() < 10 ? '0' : '')
                       + date.getDate()
                       + '.txt',
    tweet_ids_file_path = path.join(__dirname, 'tweet_ids', tweet_ids_filename),
    tweet_url_regexp = /https:\/\/twitter.com\/(.*)\/status\/(.*)/g,
    loggingEnabled = true,
    collectionsId,
    collectionsUrl;

function checkTweetQueue(){
  fs.readFile(tweet_ids_file_path, 'utf8', function (err, data) {

    if (err){
      fs.open(tweet_ids_file_path, "wx", function (err, fd) {
        // handle error
        fs.close(fd, function (err) {
        // handle error
        });
      });      
    }
    else{
      posted_tweet_ids = data.split(',');
    }

    if (loggingEnabled === true){
      console.log('posted_tweet_ids:');
      console.log(posted_tweet_ids);
    }

    if (tweetQueue.length > 0){
      var newTweet = tweetQueue.shift();

      if (posted_tweet_ids.indexOf(newTweet.id) === -1){
        if (loggingEnabled === true){
          console.log('Found new item:');
          console.log(newTweet);
        }
          
        /*
          Yes, I know about the collections/entries/curate endpoint.
          Consider this a "legacy codebase" in need of a complete rewrite.
        */
        twitter.post('collections/entries/add', {
          id: collectionsId,
          tweet_id: newTweet.id
        }, function(err, data, response) {
          // console.log(JSON.stringify(data, null, 4));
            if (loggingEnabled === true){
              if (err){
                console.log('ERROR');
                console.log(err);       
              }
              else{
                if (loggingEnabled === true){
                  console.log('Added!');
                }

                posted_tweet_ids.push(newTweet.id);

                fs.writeFile(tweet_ids_file_path, posted_tweet_ids, function (err) {
                  if (err) throw err;      
                });
              }
            }
          }
        );
      }
      else{
        if (loggingEnabled === true){
          console.log('Already posted');
        }
      }

      setTimeout(function(){
        checkTweetQueue();
      }, 1000);
    }
    else{
      twitter.post('statuses/update', { status: 'New tweets from belong.io! ' + collectionsUrl }, function(err, data, response) {
        console.log(collectionsUrl);
      });
    }
  });
}


request(url, function(error, response, html){
  if(!error){
    var $ = cheerio.load(html, {
      normalizeWhitespace: true
    });

    // var items = $('div.container').find('div.row:nth-of-type(2)').find('div.item').find('a:nth-of-type(2)');
    var items = $('div.container').find('div.row:nth-of-type(2)').find('div.item').find('a');
    console.log('items:');
    console.log(items.length);

    for (var i = 0, j = items.length; i < j; i++){
      var match = tweet_url_regexp.exec($(items[i]).attr('href'));


      if (match){
        tweetQueue.push({
          id: match[2]
        });        
      }
    }

    twitter.get('collections/list', {'screen_name': 'belongbot4000', 'count': 100}, function(err, data, response){
      if (err){
        console.log(err);
      }
      else{
        var lastCollectionId = data.response.results[data.response.results.length - 1];
        twitter.post('collections/destroy', {
          id: lastCollectionId
        }, function(err, data, response) {
          if (!err){
            twitter.post('collections/create', { name: 'BELONG.IO' }, function(err, data, response) {
              console.log(JSON.stringify(data, null, 4));
              console.log(JSON.stringify(data.objects.timelines, null, 4));
              collectionsId = Object.keys(data.objects.timelines)[0];
              collectionsUrl = data.objects.timelines[collectionsId].collection_url;
              setTimeout(function(){
                checkTweetQueue();
              }, 1000);
            });
          }
        });
      }
    })
  }
});