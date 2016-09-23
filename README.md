# BELONGBOT4000

**UPDATE December 22, 2015:**

The way [@belongbot4000](https://twitter.com/belongbot4000) originally worked was that it crawled [belong.io](http://belong.io/) (with the site's creator's [approval](https://twitter.com/waxpancake/status/649582755777417216)), parsed the site's HTML for tweet IDs and retweeted the new tweets.

This worked mostly fine, but a few people were annoyed by the notifications they'd get. I briefly considered a different approach, where the bot only tweets the content of the tweets, but this had several issues: the bot wouldn't credit the original author, some of the tweets looked confusing, and the bot's page looked like spam.


On December 1, I decided to shut down the bot until I have the necessary time to rewrite it so that it only posts links and doesn't create notifications that would bother anyone.

I finished my first rewrite about a week or two later, but it wasn't until December 22 when I had a chance to test the bot, as it has been blocked by Twitter sometime after I already disabled it.

Unfortunately, the rewrite didn't prove to be sufficient, the bot still sometimes triggers unwanted notifications when linking to other people's tweets.

The adventure continues...

(Original description is below.)

---

[@belongbot4000](https://twitter.com/belongbot4000) is a simple bot that scrapes [belong.io](http://belong.io/) every 15 minutes and posts new content to Twitter.


![Featured!](belongio.png)

This bot runs on node.js + [ttezel/twit](https://github.com/ttezel/twit) + [cheeriojs/cheerio](https://github.com/cheeriojs/cheerio).

There may not be much of a point in running your own copy of this bot, you could just follow [@belongbot4000](https://twitter.com/belongbot4000), but this source code can serve as a basis for your own web scraping bot.

To run this bot:

1. Rename ```config-example.js``` to ```config.js```, add your [Twitter API keys/secrets](https://apps.twitter.com/) here.
2. ```sudo npm install```
3. ```node belongbot4000.js```

The bot runs once, checks for new content, saves IDs of new Tweets and posts them in a loop (there is a slight delay to avoid the Twitter API rate limit). If you want to run this bot every 15 minutes on your server, edit your cron jobs with `crontab -e` and add this:

```
*/15 * * * * /usr/local/bin/node /var/www/belongbot4000/belongbot4000.js
```

If you want to use a different delay, try something like [this](http://www.crontab-generator.org/) (unless you're familiar with crontab format).

Enjoy!

Note: If you're looking for a similar bot in Python, see [hugovk/finnishpop](https://github.com/hugovk/finnishpop).