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
    user_stream = twitter.stream('user'),
    tweet_queue = [],
    belongio_url = 'http://belong.io/',
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
  console.log('checking tweet queue...');

  fs.readFile(tweet_ids_file_path, 'utf8', function (err, data) {
    if (err){
      fs.open(tweet_ids_file_path, "wx", function (err, fd) {
        if (err){
          // TODO: handle error
          console.log('ERROR', err);
        }
        fs.close(fd, function (err) {
          if (err){
            // TODO: handle error
            console.log('ERROR', err);
          }
        });
      });      
    }
    else{
      posted_tweet_ids = data.split(',');
    }

    // console.log('posted_tweet_ids:', posted_tweet_ids);
    console.log(`found ${posted_tweet_ids.length} posted tweets`);

    if (tweet_queue.length > 0){
      var new_tweet = tweet_queue.shift();

      if (posted_tweet_ids.indexOf(new_tweet.id) === -1){
        console.log('found new item:', new_tweet);

        twitter.post('statuses/retweet', { id: new_tweet.id }, function(err, data, response) {
          console.log('retweeted', new_tweet);
        });
      }
      else{
        console.log(`already posted (${new_tweet.id})`);
      }

      setTimeout(function(){
        check_tweet_queue();
      }, 1000);
    }
    else{
      console.log('finished tweet queue, waiting...');
    }
  });
}

function check_belong_io(){
  console.log('checking belong.io...');
  request(belongio_url, function(error, response, html){
    if(!error){
      var $ = cheerio.load(html, {
        normalizeWhitespace: true
      });

      // var items = $('div.container').find('div.row:nth-of-type(2)').find('div.item').find('a:nth-of-type(2)');
      var items = $('div.container').find('div.row:nth-of-type(2)').find('div.item').find('a');
      console.log(`found ${items.length} tweets on belong.io, processing...`);

      for (var i = 0, j = items.length; i < j; i++){
        var match = tweet_url_regexp.exec($(items[i]).attr('href'));

        if (match){
          tweet_queue.push({
            id: match[2]
          });        
        }
      }
      check_tweet_queue();
    }
  });
  setTimeout(function(){
    check_belong_io();
  }, 30*60*1000);
}

function send_twitter_dm(username, message){
  twitter.post('direct_messages/new', {
    screen_name: username,
    text: message
  }, 
  function(err, data, response){
    if (err){
      console.log('Error!');
      console.log(err);
    }
  });  
}

/*
  TODO:

  https://twittercommunity.com/t/how-do-i-use-the-twitter-api-to-approve-a-follower-request-for-a-protected-account/82579
  As of February 2017, there is no way to approve follower requests for a protected account via the Twitter API.
  Keeping the code below until a workaround is available.

*/

user_stream.on('follow', function (tweet) {
  console.log(`new follower (${tweet.source.screen_name})`);
  twitter.post('friendships/create', { screen_name: tweet.source.screen_name }, function(err, data, response) {
    if (err){
      // TODO: handle error
      console.log('ERROR', err);
    }
  });
});

user_stream.on('direct_message', function (dm) {
  var dm_text = dm.direct_message.text.trim().toLowerCase();
  console.log(`new dm from @${dm.direct_message.sender.screen_name}`);

  // send_twitter_dm('fourtonfish', `New DM from @${dm.direct_message.sender.screen_name}.`)

  // twitter.post('friendships/create', { screen_name: dm.direct_message.sender.screen_name }, function(err, data, response) {
  //   if (err){
  //     // TODO: handle error
  //     console.log('ERROR', err);
  //   }
  //   else{
  //     console.log(`followed @${dm.direct_message.sender.screen_name}`);
  //   }
  // });
});


user_stream.on('unfollow', function (tweet) {
  console.log(`new unfollower (${tweet.source.screen_name})`);
  console.log(tweet);
  twitter.post('friendships/destroy', { screen_name: tweet.source.screen_name }, function(err, data, response) {
    if (err){
      // TODO: handle error
      console.log('ERROR', err);
    }
  });
});

check_belong_io();

server.listen(4003, function(){
  console.log('Express server listening on port 4003');
});
