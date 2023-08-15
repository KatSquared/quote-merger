const quoteTextOne = document.querySelector(".quoteOne"),
    quoteTextTwo = document.querySelector(".quoteTwo"),
    mergedQuote = document.querySelector(".mergedQuote"),
    quoteBtnOne = document.querySelector(".buttonOne"),
    quoteBtnTwo = document.querySelector(".buttonTwo"),
    selection = document.querySelectorAll("select"),
    authorNameOne = document.querySelector(".nameOne"),
    authorNameTwo = document.querySelector(".nameTwo"),
    mergedAuthors = document.querySelector(".mergedNames"),
    mergeBtn = document.querySelector(".merge");
    mergedContainer = document.querySelector(".merged-container");
    copyBtn = document.querySelector(".copy"),
    twitterBtn = document.querySelector(".twitter"),
    suggestionsDropdowns = document.querySelectorAll('#suggestions'),
    searchBars = document.querySelectorAll('.search-bar'),
    tooltip = document.getElementById('tooltip'),
    params = {
        method: "GET",
        headers: myHeaders,
        mode: "cors",
        cache: "default"
    };


//
// SUGGESTIONS
//

document.addEventListener('click', (e) => {
    if (!e.target.closest('#search-container')) 
        suggestionsDropdowns.forEach(el => {
            el.classList.add('hidden');
        });
})

// inserts selected suggestion as search bar value
let autofill = (suggestion) => {
    suggestionsDropdowns.forEach(el => {
        let searchBar = el.previousElementSibling;
        if (searchBar.id === suggestion.id)
            searchBar.value = suggestion.lastChild.data;
    });
}

// fetches and displays suggestions
searchBars.forEach(el => {
    el.onkeyup = (e) => {
        // search query input by user
        let userQuery = e.target.value; 
        // autocomplete after entering 3 characters
        if (userQuery.length >= 3) {
            // fetches quote from API
            fetch(`http://api.quotable.io/search/authors?query=${userQuery}`, params)
                .then(response => response.json())
                .then(result => {
                    let suggestions = []
                    let suggestionsDropdown = el.nextElementSibling;
    
                    for (let i = 0; i < result.results.length; i++) {
                        if (result.results[i].quoteCount > 0)
                            suggestions.push(result.results[i].name);
                    }
                    // displays suggestions in the DOM element
                    suggestionsDropdown.innerHTML = suggestions.map((suggestion) => {
                            return `<li onclick="autofill(this)" id="${el.id}">${suggestion}</li>`
                        }).join('');
                    
                    // shows the suggestions container
                    if (suggestions.length !== 0)
                        suggestionsDropdown.classList.remove('hidden');
                    else
                        suggestionsDropdown.classList.add('hidden');
            });
        }
    }
})


//
// FETCHING RANDOM QUOTES FROM API
//

// default author
let authorOfChoiceOne = "albert-einstein"; 
let authorOfChoiceTwo = "albert-einstein"; 
// automatically fetching and displaying quotes upon loading the page
window.addEventListener("load", randomQuoteOne);
window.addEventListener("load", randomQuoteTwo);

let quoteOneLoopIndex = 0;
let quoteTwoLoopIndex = 0;

function hideTooltip(){
    tooltip.style.transform = 'translateY(-50px)'
}

async function randomQuoteOne(){
    quoteBtnOne.classList.add("loading");
    quoteBtnOne.innerText = "Loading...";
    let authorOfChoiceOne = `&author=${searchBars[0].value}`;

    // fetches a quote from API
    let apiCall = await fetch(`http://api.quotable.io/random?minLength=80&maxLength=200${authorOfChoiceOne}`, params);
    
    // if no quotes from the selected author are between 80 and 200 characters
    if (apiCall.status !== 200) {
        searchBars[0].value = '';
        tooltip.style.transform = 'none';
        setTimeout(hideTooltip, 5000);
        // fetches a random quote instead
        apiCall = await fetch(`http://api.quotable.io/random?minLength=80&maxLength=200`, params);
    } 
    let result = await apiCall.json();

    let splitQuoteOne = sentenceChunker(result.content);

    // if sentence chunker had to be redone over 4 times - quote from a random author gets selected
    if (quoteOneLoopIndex > 4) {
        searchBars[0].value = '';
        tooltip.style.transform = 'none';
        setTimeout(hideTooltip, 5000);
        // fetches a random quote instead
        apiCall = await fetch(`http://api.quotable.io/random?minLength=80&maxLength=200`, params);
    }
    // redoes sentence chunker if resulting splitQuote array has less than 2 elements
    if (splitQuoteOne.length < 2) {
        quoteOneLoopIndex++;
        randomQuoteOne();
    } else {
        // displays fetched quote and author
        quoteOneLoopIndex = 0;
        quoteTextOne.innerText = result.content;
        authorNameOne.innerText = result.author;
        quoteBtnOne.classList.remove("loading");
        quoteBtnOne.innerText = "New Quote";
        joinAndDisplay();
    }
}

async function randomQuoteTwo(){
    quoteBtnTwo.classList.add("loading");
    quoteBtnTwo.innerText = "Loading Quote...";
    let authorOfChoiceTwo = `&author=${searchBars[1].value}`;

    // fetches a quote from API
    let apiCall = await fetch(`http://api.quotable.io/random?minLength=80&maxLength=200${authorOfChoiceTwo}`, params);
    
    // if no quotes from the selected author are between 80 and 200 characters
    if (apiCall.status !== 200) {
        searchBars[1].value = '';
        tooltip.style.transform = 'none';
        setTimeout(hideTooltip, 1000);
        // fetches a random quote instead
        apiCall = await fetch(`http://api.quotable.io/random?minLength=80&maxLength=200`, params);
    } 
    let result = await apiCall.json();

    let splitQuoteTwo = sentenceChunker(result.content);

    // if sentence chunker had to be redone over 4 times - quote from a random author gets selected
    if (quoteTwoLoopIndex > 4) {
        searchBars[1].value = '';
        tooltip.style.transform = 'none';
        setTimeout(hideTooltip, 1000);
        // fetches a random quote instead
        apiCall = await fetch(`http://api.quotable.io/random?minLength=80&maxLength=200`, params);
    }
    // redoes sentence chunker if resulting splitQuote array has less than 2 elements
    if (splitQuoteTwo.length < 2) {
        quoteTwoLoopIndex++;
        randomQuoteTwo();
    } else {
        // displays fetched quote and author
        quoteTwoLoopIndex = 0;
        quoteTextTwo.innerText = result.content;
        authorNameTwo.innerText = result.author;
        quoteBtnTwo.classList.remove("loading");
        quoteBtnTwo.innerText = "New Quote";
        joinAndDisplay();
    }
}

// clicking on "get quote" button pulls new one from API through randomQuote function
quoteBtnOne.addEventListener("click", randomQuoteOne);
quoteBtnTwo.addEventListener("click", randomQuoteTwo);


//
// MERGED RESULT SHARING FUNCTIONALITIES 
//

// clipboard functionality
copyBtn.addEventListener("click", ()=>{
    navigator.clipboard.writeText(mergedQuote.innerText);
});

// tweeting quotes
twitterBtn.addEventListener("click", ()=>{
    let tweetUrl = `https://twitter.com/intent/tweet?url=${mergedQuote.innerText}`;
    window.open(tweetUrl, "_blank");
});


//
// SPLITTING, MIXING AND MERGING QUOTES
//

// filters fetched quotes through keywords to divide them up 
function sentenceChunker(text) {
    // keywords after which text is divided, ordered accoding to average frequency
    const keywords = ["\\,", "\\.", "\\?", "\\!", "\\:", "\\;", "\\-", " but ", " because ", " and ", " or ", " if ", " that ", " which "];

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
    .replace(/\. \'/g, l => l.toUpperCase())
    .replace(/\'/g, "' ")
    .replace(/\.\./g, "... ")
    .replace(/\.\.\. \./g, "... ")
    .replace(/ \. /g, " ")
    .replace("n' t", "n't")
    .replace("i' m", "I'm")
    .replace("u' re", "u're")
    .replace("y' re", "y're")
    .replace("it' s", "it's")
    .replace(/\. \w/g, l => l.toUpperCase())
    .replace(/\? \w/g, l => l.toUpperCase())
    .replace(/\! \w/g, l => l.toUpperCase())
    .replace(" i ", " I ")
    .slice(0, -1);
    // capitalising the first word of the whole string
    const finalText = joinedText.charAt(0).toUpperCase() + joinedText.slice(1);
    // displaying the final result in UI
    mergedQuote.innerText = finalText;
    mergedContainer.classList.remove("hidden");
    mergedAuthors.innerText = authorNameOne.innerText + " + " + authorNameTwo.innerText;
}


