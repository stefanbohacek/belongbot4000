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
    tweet_queue = [],
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
    tweet_url_regexp = /https:\/\/twitter.com\/(.*)\/status\/(.*)/g;

function check_tweet_queue(){
  fs.readFile(tweet_ids_file_path, 'utf8', function (err, data) {

    if (err){
      fs.open(tweet_ids_file_path, "wx", function (err, fd) {
        // TODO: handle error
        fs.close(fd, function (err) {
        // TODO: handle error
        });
      });      
    }
    else{
      posted_tweet_ids = data.split(',');
    }

    console.log('posted_tweet_ids:', posted_tweet_ids);

    if (tweet_queue.length > 0){
      var new_tweet = tweet_queue.shift();

      if (posted_tweet_ids.indexOf(new_tweet.id) === -1){
        console.log('found new item:', new_tweet);

        twitter.post('statuses/retweet', { id: new_tweet.id }, function(err, data, response) {
          console.log('retweeted', new_tweet.text);
        });
      }
      else{
        console.log('already posted');
      }

      setTimeout(function(){
        check_tweet_queue();
      }, 1000);
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
        tweet_queue.push({
          id: match[2]
        });        
      }
    }
    setTimeout(function(){
      check_tweet_queue();
    }, 1000);    
  }
});