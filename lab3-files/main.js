// Authors: Brandon Tran and Jai Radhakrishnan
// CS110 Lab 3, 4/28/2021

var masterIdList = [];
var masterTweetList = [];
var intervalID;
var refreshID;

let searchString = ""; // here we use a global variable
let tweetContainer;

class tweetObject{
    constructor(text, handle, name, datetime){
        this.text = text;
        this.handle = handle;
        this.name = name;
        this.datetime = datetime;
    }
}


$(function() {
    tweetContainer = document.getElementById("tweet-container");

    fetchTweets();
    
    intervalID = setInterval(fetchTweets, 5000);
    refreshID = setInterval(refreshTweets, 5000, masterTweetList);
    
    document.getElementById("searchBar").addEventListener("input", handleSearch);

    refreshTweets(masterTweetList);
});

function fetchTweets(){
    // specify a url, in this case our web server
    //const url = "http://twitterfeedserverrails-env.eba-xmqy8ybh.us-east-1.elasticbeanstalk.com/feed/random?q=weather";
    const url = "http://ec2-54-219-224-129.us-west-1.compute.amazonaws.com:2000/feed/random?q=weather";

    fetch(url)
    .then(res => res.json())
    .then(data => { 
        for(var i = 0; i < Object.keys(data.statuses).length; i++){
            if(masterIdList.includes(data.statuses[i].id) == false) {
                masterIdList.push(data.statuses[i].id);
                let tweet = new tweetObject(data.statuses[i].text, data.statuses[i].user.screen_name, data.statuses[i].user.name, data.statuses[i].created_at);
                masterTweetList.push(tweet);
            }
        }
    })
    .catch(err => {
        // error catching
        console.log(err);
    });
}

function pauseAJAX() {
    if($("#myCheck").prop("checked") == true)
    {
        if(intervalID){
            clearInterval(intervalID);
        }
        
    }
    else {
        intervalID = setInterval(fetchTweets, 5000);
        // refreshID = setInterval(refreshTweets(masterTweetList), 5000);
        refreshTweets(masterTweetList);
    }
}

const handleSearch = event => {
    searchString = event.target.value.trim().toLowerCase(); 
    // you may want to update the displayed HTML here too
    refreshTweets(masterTweetList);
}


/**
 * Removes all existing tweets from tweetList and then append all tweets back in
 *
 * @param {Array<Object>} tweets - A list of tweets
 * @returns None, the tweets will be renewed
 */
function refreshTweets(tweets) {
    // feel free to use a more complicated heuristics like in-place-patch, for simplicity, we will clear all tweets and append all tweets back
    // {@link https://stackoverflow.com/questions/3955229/remove-all-child-elements-of-a-dom-node-in-javascript}
    while (tweetContainer.firstChild) {
        tweetContainer.removeChild(tweetContainer.firstChild);
    }

    // create an unordered list to hold the tweets
    // {@link https://developer.mozilla.org/en-US/docs/Web/API/Document/createElement}
    const tweetList = document.createElement("ul");
    // append the tweetList to the tweetContainer
    // {@link https://developer.mozilla.org/en-US/docs/Web/API/Node/appendChild}
    tweetContainer.appendChild(tweetList);

    // all tweet objects (no duplicates) stored in tweets variable

    // filter on search text
    // {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/filter}
    console.log(tweets);
    const filteredResult = tweets.filter( (tweet) => {tweet.text.includes(searchString)});
    console.log(filteredResult);
    // sort by date
    // {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/sort}
    const sortedResult = filteredResult.sort((tweet1, tweet2) => {
        return tweet1.datetime - tweet2.datetime;
    });

    //console.log(sortedResult);

    // execute the arrow function for each tweet
    // {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/forEach}
    sortedResult.forEach(tweetObject => {
        // create a container for individual tweet
        const tweet = document.createElement("li");

        // e.g. create a div holding tweet content
        const tweetContent = document.createElement("div");
        // create a text node "safely" with HTML characters escaped
        // {@link https://developer.mozilla.org/en-US/docs/Web/API/Document/createTextNode}
        const tweetText = document.createTextNode(tweetObject.text);
        const tweetHandle = document.createTextNode(tweetObject.handle);
        const tweetName = document.createTextNode(tweetObject.name);
        const tweetDateTime = document.createTextNode(tweetObject.datetime.substring(10));
        // append the text node to the div
        tweetContent.appendChild(tweetText);
        tweetContent.appendChild(tweetHandle);
        tweetContent.appendChild(tweetName);
        tweetContent.appendChild(tweetDateTime);

        // you may want to put more stuff here like time, username...
        console.log(tweetContent);
        tweet.appendChild(tweetContent);

        // finally append your tweet into the tweet list
        console.log(tweet);
        tweetList.appendChild(tweet);
    });
}