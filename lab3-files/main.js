// Authors: Brandon Tran and Jai Radhakrishnan
// CS110 Lab 3, 4/28/2021

// used to keep track of all tweet ID's to ensure uniqueness (no duplicates)
var masterIdList = [];
// used to keep track of all tweet objects
var masterTweetList = [];
// used to poll the server depending on the time interval
var intervalID;
// used to update the page depending on the time interval
var refreshID;

// contains the text within the searchbar
let searchString = ""; // here we use a global variable
// used to store the location of which we will be adding our new tweets
let tweetContainer;

/** Holds the information required for a tweet */
class tweetObject{
    /**
     * Initializes the information for a tweet
     * @param {string} text - The body of a tweet, what the tweeter is saying
     * @param {string} handle - The username of a tweeter, generally denoted "@[username]", usually unique
     * @param {string} name - The name of a tweeter, usually more common than the handle/username and appears bolded on the tweet
     * @param {Date} datetime - The date, time, and timezone of the creation of this tweet
     * @param {string} pfp - The URL which leads to the image of the tweeter's profile picture
     */
    constructor(text, handle, name, datetime, pfp){
        this.text = text;
        this.handle = handle;
        this.name = name;
        this.datetime = new Date(datetime);
        this.pfp = pfp;
    }
}

/**
 * Runs once document is finished loading
 * Initializes tweetContainer for refreshTweet function below
 * Fetches an initial amount of tweets to populate page
 * Initializes interval ID's for polling server and refreshing page
 * Adds listener to searchbar for immediate results
 * Updates page for the initial page
 * @returns None, page set-up
 */
$(function() {
    tweetContainer = document.getElementById("tweet-container");

    fetchTweets();
    
    intervalID = setInterval(fetchTweets, 5000);
    refreshID = setInterval(refreshTweets, 5000, masterTweetList);
    
    document.getElementById("searchBar").addEventListener("input", handleSearch);

    refreshTweets(masterTweetList);
});

/**
 * Fetches tweets and adds them into the master lists if they are not already there
 * @returns None, updating global master lists
 */
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
                let tweet = new tweetObject(data.statuses[i].text, data.statuses[i].user.screen_name, data.statuses[i].user.name, data.statuses[i].created_at, data.statuses[i].user.profile_image_url_https);
                masterTweetList.push(tweet);
            }
        }
    })
    .catch(err => {
        // error catching
        console.log(err);
    });
}

/**
 * Modifies interval ID for polling according to the pause button's status
 * Also refreshes the webpage on reactivating the interval ID in order to update the page with the most recent content
 * @returns None, intervalID is either updated or deleted
 */
function pauseAJAX() {
    if($("#myCheck").prop("checked") == true)
    {
        if(intervalID){
            clearInterval(intervalID);
        }
        
    }
    else {
        intervalID = setInterval(fetchTweets, 5000);
        refreshTweets(masterTweetList);
    }
}

/**
 * Updates searchString with the new text (in the searchbar) and refreshes the page
 * When attached to the searchbar as a listener function, the page will be dynamically refreshed whenever the searchbar is changed
 * @returns None, only updates a variable
 */
const handleSearch = event => {
    searchString = event.target.value.trim().toLowerCase(); 
    // you may want to update the displayed HTML here too
    refreshTweets(masterTweetList);
}


/**
 * Removes all existing tweets from tweetList and then append all tweets back in
 *
 * @param {Array<Object>} tweets - A list of tweets (should always be masterTweetList)
 * @returns None, the tweets will be renewed
 */
function refreshTweets(tweets) {
    // feel free to use a more complicated heuristics like in-place-patch, for simplicity, we will clear all tweets and append all tweets back
    // {@link https://stackoverflow.com/questions/3955229/remove-all-child-elements-of-a-dom-node-in-javascript}
    while (tweetContainer.firstChild) {
        tweetContainer.removeChild(tweetContainer.firstChild);
    }
    
    // create an ordered list to hold the tweets, use existing class for css styling
    // {@link https://developer.mozilla.org/en-US/docs/Web/API/Document/createElement}
    const tweetList = document.createElement("ol");
    tweetList.setAttribute('class', 'tweet-list');
    
    // append the tweetList to the tweetContainer
    // {@link https://developer.mozilla.org/en-US/docs/Web/API/Node/appendChild}
    tweetContainer.appendChild(tweetList);

    // all tweet objects (no duplicates) stored in tweets variable

    // filter on search text
    // {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/filter}
    const filteredResult = tweets.filter( (tweet) => { if(tweet.text.includes(searchString)) {return tweet;} });

    // sort by date and time (stored in datetime as a Date object)
    // {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/sort}
    const sortedResult = filteredResult.sort((tweet1, tweet2) => { return tweet2.datetime - tweet1.datetime; });

    // execute the arrow function for each tweet
    // {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/forEach}
    sortedResult.forEach(tweetObject => {
        // create a container for individual tweet, and apply the existing class for css
        const tweet = document.createElement("li");
        tweet.setAttribute('class', 'tweet-card');

        // e.g. create a div holding tweet content, and apply existing class
        const tweetContent = document.createElement("div");
        tweetContent.setAttribute('class', 'tweet-content');

        // create the text similarly to structure in #center-content of html
        const tweetText = document.createElement("div");
        tweetText.setAttribute('class', 'tweet-text');
        tweetText.innerHTML = "<p data-aria-label-part=\"0\">" + tweetObject.text + "</p>";
        
        // create tweeter's handle (name, username, pfp) with structure defined in html
        const tweetHandle = document.createElement("div");
        const pfpHolder = document.createElement("a");

        var fullname = "<span class=\"fullname\"><strong>" + tweetObject.name + "</strong></span>";
        var username = "<span class=\"username\"> " + tweetObject.handle + "</span>";
        var time = "<span class=\"tweet-time\"> " + tweetObject.datetime + "</span>";

        tweetHandle.innerHTML = fullname + username + time;

        pfpHolder.innerHTML = "<img class=\"tweet-card-avatar\" src=\"" + tweetObject.pfp + "\" alt=\"User Profile Picture\">";
        
        // append the tweet contents to the div
        tweetContent.appendChild(tweetHandle);
        tweetContent.appendChild(pfpHolder);
        tweetContent.appendChild(tweetText);
        

        // you may want to put more stuff here like time, username...
        tweet.appendChild(tweetContent);

        // finally append your tweet into the tweet list
        tweetList.appendChild(tweet);
    });
}