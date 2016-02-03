var fs = require('fs');
var path = require('path');
var twitter = require('twitter');
var request = require('request');
var d = [];
if(process.argv.length < 4) {console.log('please set : npm start "screen_name" "tweet_count"');process.exit();}
var screen_name = process.argv[2];
var KEYS = JSON.parse(fs.readFileSync('keys.json', 'utf-8'));
var image_index = 0;
var movie_index = 0;
var client = new twitter({
    "consumer_key"        : KEYS.consumer_key,
    "consumer_secret"     : KEYS.consumer_secret,
    "access_token_key"    : KEYS.access_token_key,
    "access_token_secret" :KEYS.access_token_secret
});

function getAndSaveImage() {
    var counter = 0;
    var maxCount = Math.ceil(process.argv[3]/200) > 16 ? 16 : Math.ceil(process.argv[3]/200);

		fs.mkdirSync("./images/"+screen_name+"/");
		fs.mkdirSync("./movies/"+screen_name+"/");
    option = {screen_name : screen_name, count : 200};

    function _getAndSaveImage() {
        if(counter<maxCount) {
            client.get('statuses/user_timeline', option,  function(err, tweets) {
                if(err) {console.log(err);}
								d = d.concat(tweets);
                tweets.forEach(function(tweet) {
                    if(
												typeof tweet.entities !== "undefined" &&
												typeof tweet.entities.media !== "undefined" &&
												typeof tweet.text !=="undefined"  &&
												tweet.entities.media.length > 0  //&&
												//! tweet.text.match(/\bRT/)
											){
                        tweet.entities.media.forEach(function(m) {
													getImage(m.media_url);
													image_index++;
                        });
                    }
										if(
												typeof tweet.extended_entities !== "undefined" &&
												typeof tweet.extended_entities.media !== "undefined" &&
												tweet.extended_entities.media.length > 0  
												//! tweet.text.match(/\bRT/)
											){
                        tweet.extended_entities.media.forEach(function(m) {
													if(
															typeof m.video_info !== "undefined" &&
															typeof m.video_info.variants !== "undefined" &&
															m.video_info.variants.length > 0 &&
															typeof m.video_info.variants[0].url !== "undefined"
														) {
														getMovie(m.video_info.variants[0].url);
														movie_index++;
													}

                        });
                    }

                });
                option.max_id=tweets[tweets.length-1].id;
                counter++;
                _getAndSaveImage();
            });
        }else{fs.writeFile('result.json', JSON.stringify(d, null,'   '));}
    }
    _getAndSaveImage();
}

function getImage(name) {
	request
		.get(name)
		.on('response', function(data){
			console.log("画像が見つかりました");
		})
	  .pipe(
			fs.createWriteStream("./images/"+screen_name+"/"+screen_name+String(image_index)+".jpeg")
		);
}
function getMovie(name) {
	console.log("haita");
	request
		.get(name)
		.on('response', function(data){
			console.log("動画が見つかりました");
		})
	  .pipe(
			fs.createWriteStream("./movies/"+screen_name+"/"+screen_name+String(movie_index)+".mp4")
		);

}

getAndSaveImage();















