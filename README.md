# BELONGBOT4000


[@belongbot4000](https://twitter.com/belongbot4000) is a simple Twitter bot that scrapes [belong.io](http://belong.io/) every 45 minutes (with the site's creator's [approval](https://twitter.com/waxpancake/status/649582755777417216)) and looks for new tweets to post.

![Featured!](belongio.png)

## Backstory

Originally, the bot would simply retweet every tweet on belong.io. This made the bot very nice to use, but at least one person openly complained about the notifications the bot was causing to them.

Rather than risking getting the bot shut down, I rewrote it to only post the URLs. Which made the bot look spammy, and effectively was just stealing other people's content.

Eventually I shut down the bot.


## Technical stuff

This bot runs on node.js + [ttezel/twit](https://github.com/ttezel/twit) + [cheeriojs/cheerio](https://github.com/cheeriojs/cheerio).

There may not be much of a point in running your own copy of this bot, you could just follow [@belongbot4000](https://twitter.com/belongbot4000), but this source code can serve as a basis for your own web scraping bot.

To run this bot:

1. Rename ```config-example.js``` to ```config.js```, add your [Twitter API keys/secrets](https://apps.twitter.com/) here.
2. ```sudo npm install```
3. ```node belongbot4000.js```

The bot runs once, checks for new content, saves IDs of new Tweets and adds them to a [Collection](https://dev.twitter.com/rest/collections/about)

If you want to run this bot, say, every 45 minutes on your server, edit your cron jobs with `crontab -e` and add this line:

```
*/45 * * * * /usr/local/bin/node /var/www/belongbot4000/belongbot4000.js
```

If you want to use a different delay, try something like [this](http://www.crontab-generator.org/) (unless you're familiar with crontab format).

Enjoy!

Note: If you're looking for a similar bot in Python, see [hugovk/finnishpop](https://github.com/hugovk/finnishpop).
