var fs = require('fs');
var twitter = require('twitter');
var request = require('request');

if(process.argv.length < 4) {console.log('please set : npm start "screen_name" "tweet_count"');process.exit();}
var screen_name = process.argv[2];
var KEYS = JSON.parse(fs.readFileSync('keys.json', 'utf-8'));

var client = new twitter({
    "consumer_key"        : KEYS.consumer_key,
    "consumer_secret"     : KEYS.consumer_secret,
    "access_token_key"    : KEYS.access_token_key,
    "access_token_secret" :KEYS.access_token_secret
});

function getAndSaveImage() {
    var counter = 0;
    var maxCount = Math.ceil(process.argv[3]/200) > 16 ? 16 : Math.ceil(process.argv[3]/200);
    var index = 0;

    fs.mkdirSync("./images/"+screen_name+"/");
    option = {screen_name : screen_name, count : 200};

    function _getAndSaveImage() {
        if(counter<maxCount) {
            client.get('statuses/user_timeline', option,  function(err, tweets) {
                if(err) {console.log(err);}
                tweets.forEach(function(tweet) {
                    if(
                    typeof tweet.entities !== "undefined" &&
                    typeof tweet.entities.media !== "undefined" &&
                    typeof tweet.text !=="undefined"  &&
                    tweet.entities.media.length > 0  &&
                    ! tweet.text.match(/\bRT/)
                )
                     {
                        tweet.entities.media.forEach(function(m) {
                            request
                                .get(m.media_url)
                                .on('response', function(data) {
                                    console.log("画像が見つかりました");
                                })
                                .pipe(
                                    fs.createWriteStream("./images/"+screen_name+"/"+screen_name+String(index)+".jpeg")
                                );index++;
                        });
                    }
                });
                option.max_id=tweets[tweets.length-1].id;
                counter++;
                _getAndSaveImage();
            });
        }
    }
    _getAndSaveImage();
}

getAndSaveImage();
