const quoteTextOne = document.querySelector(".quoteOne"),
    quoteTextTwo = document.querySelector(".quoteTwo"),
    mergedQuote = document.querySelector(".mergedQuote"),
    quoteBtnOne = document.querySelector(".buttonOne"),
    quoteBtnTwo = document.querySelector(".buttonTwo"),
    authorNameOne = document.querySelector(".nameOne"),
    authorNameTwo = document.querySelector(".nameTwo"),
    mergedAuthors = document.querySelector(".mergedNames"),
    mergeBtn = document.querySelector(".merge");
    mergedContainer = document.querySelector(".merged-container");
    copyBtn = document.querySelector(".copy"),
    twitterBtn = document.querySelector(".twitter");
// default author
let authorOfChoiceOne = "albert-einstein"; 
let authorOfChoiceTwo = "albert-einstein"; 
// automatically fetching and displaying quotes upon loading the page
window.addEventListener("load", randomQuoteOne);
window.addEventListener("load", randomQuoteTwo);

function randomQuoteOne(){
    quoteBtnOne.classList.add("loading");
    quoteBtnOne.innerText = "Loading Quote...";
    // fetches quote from API
    fetch(`http://api.quotable.io/random?minLength=80&maxLength=200&author=${authorOfChoiceOne}`).then(response => response.json()).then(result => {
        let splitQuoteOne = sentenceChunker(result.content);
        // redoes sentence chunker if resulting splitQuote array has less than 2 elements
        if (splitQuoteOne.length < 2) {
            randomQuoteOne();
        } else {
            // displays fetched quote and author
            quoteTextOne.innerText = result.content;
            authorNameOne.innerText = result.author;
            quoteBtnOne.classList.remove("loading");
            quoteBtnOne.innerText = "New Quote";
        }
    });
}

function randomQuoteTwo(){
    quoteBtnTwo.classList.add("loading");
    quoteBtnTwo.innerText = "Loading Quote...";
    // fetches quote from API
    fetch(`http://api.quotable.io/random?minLength=80&maxLength=200&author=${authorOfChoiceTwo}`).then(response => response.json()).then(result => {
        let splitQuoteTwo = sentenceChunker(result.content);
        // redoes sentence chunker if resulting splitQuote array has less than 2 elements
        if (splitQuoteTwo.length < 2) {
            randomQuoteTwo();
        } else {
            // displays fetched quote and author
            quoteTextTwo.innerText = result.content;
            authorNameTwo.innerText = result.author;
            quoteBtnTwo.classList.remove("loading");
            quoteBtnTwo.innerText = "New Quote";
        }
    });
}

// for the author choice option menu in hmtl 
// -> makes the choice the API fetch author query value in string literal ${}
function getAuthorOne(el) {
    if (el.value !== "select")
        authorOfChoiceOne = el.value;
    else return;
}

function getAuthorTwo(el) {
    if (el.value !== "select")
        authorOfChoiceTwo = el.value;
    else return;
}

// clipboard functionality
copyBtn.addEventListener("click", ()=>{
    navigator.clipboard.writeText(mergedQuote.innerText);
});

// tweeting quotes
twitterBtn.addEventListener("click", ()=>{
    let tweetUrl = `https://twitter.com/intent/tweet?url=${mergedQuote.innerText}`;
    window.open(tweetUrl, "_blank");
});

// clicking on "get quote" button pulls new one from API through randomQuote function
quoteBtnOne.addEventListener("click", randomQuoteOne);
quoteBtnTwo.addEventListener("click", randomQuoteTwo);
// enacts the merge and displays in UI
mergeBtn.addEventListener("click", joinAndDisplay);

// filters fetched quotes through keywords to divide them up 
function sentenceChunker(text) {
    // keywords after which text is divided, ordered accoding to average frequency
    const keywords = ["\\,", "\\.", "\\?", "\\!", "\\:", "\\;", " but ", " because ", " and ", " or ", " if ", " that ", " which "];

    // array that is being divided
    let input = [text + " "];
    // individual strings to be added to splitParts array
    let splitText = "";
    // result of each while loop dividing input by current keyword
    let splitParts = [];
    let match;
    
    // loop that goes through each keyword if amount of parts is yet insufficient
    for (let j = 0; j < keywords.length; j++) {
        // emptying current output so that it can serve as output target for next loop
        splitParts = [];
        // creates regular expression out of current keyword (current for this loop)
        let re = new RegExp(keywords[j]);
        // iterates through each item in the input array
        // in order to seach up and divide that item by current keyword
        for (let i = 0; i < input.length; i++) {
            // runs as long as there are matches of current keyword in current 
            // item of input array
            while (match = re.exec(input[i])) {
                splitText = input[i].slice(0, match.index+keywords[j].length); 
                splitParts.push(splitText);
                input[i] = input[i].substring(match.index+keywords[j].length);
            }
            splitParts.push(input[i]);
        }
        // required to keep the loop going -> turns current loop's output into next loop's input
        input = splitParts;
    }
    // after going through all the keywords.
    // .pop() method is there to get rid of an empty element after the last period
    splitParts.pop();
    return splitParts;
}

// and now the two splitPart arrays will be turned to mixedUpText or shortText
function arrayShuffle() {
    let splitQuoteOne = sentenceChunker(quoteTextOne.innerText);
    let splitQuoteTwo = sentenceChunker(quoteTextTwo.innerText);

    // determining which array is shorter (to be added) and which is longer (to be added to)
    let shuffledText = (splitQuoteOne.length < splitQuoteTwo.length) ? splitQuoteTwo : splitQuoteOne;
    let shorterArray = (splitQuoteOne.length < splitQuoteTwo.length) ? splitQuoteOne : splitQuoteTwo;
    let itemsToInsert = shorterArray;

    // leaving only every other element from shoter array starting from the last one
    if (shorterArray.length > 3) {
        itemsToInsert = shorterArray.reverse().filter((element, index) => {
            return index % 2 === 0;
        }).reverse()
    } 
    // inserting filtered elements of shorter array between those of longer
    // starting from the end of it. creating a [long, long, short, long, short] pattern in output.
    for (let i = shuffledText.length; i >= 0; i--) {
        if (itemsToInsert.length < 1) break;

        let addedItem = itemsToInsert.pop();
        shuffledText.splice(i, 1, addedItem);
        i--;
    }
    return shuffledText;
}

// joins and displays final mixed up quote
function joinAndDisplay() {
    // cleaning up overall capitalisation and deleting white space after the last period, ! and ?
    let joinedText = arrayShuffle()
    .join("")
    .toLowerCase()
    .replace(/\. \w/g, l => l.toUpperCase())
    .replace(/\? \w/g, l => l.toUpperCase())
    .replace(/\! \w/g, l => l.toUpperCase())
    .slice(0, -1);
    // capitalising the first word of the whole string
    const finalText = joinedText.charAt(0).toUpperCase() + joinedText.slice(1);
    // displaying the final result in UI
    mergedQuote.innerText = finalText;
    mergedContainer.classList.remove("hidden");
    mergedAuthors.innerText = authorNameOne.innerText + " + " + authorNameTwo.innerText;
}