const searchForm = document.querySelector('#search-form');
const searchResults = document.querySelector('#search-results');

// Char counter for search bar
const input = document.getElementById('search-term');
const charCount = document.getElementById('charCount');

// function to update char counter of earch bar
input.addEventListener('input', function() {
  const currentCount = this.value.length;
  const remainingCount = 100;

  if (currentCount == 100) {
    this.value = this.value.slice(0, 100); // Truncate the input to 250 characters
    alert('Maximum character limit (100) reached!');
  } 

  charCount.textContent = `${currentCount} / ${remainingCount}`;
});



// Instructions minimizing effect
var instructionsBox = document.querySelector('.instructions-box');
var minimizeIcon = document.querySelector('.minimize-icon');
var maximizeIcon = document.querySelector('.maximize-icon');

minimizeIcon.addEventListener('click', function() {
  instructionsBox.classList.toggle('minimized');
  minimizeIcon.style.display = 'none';
  maximizeIcon.style.display = 'block';
});

maximizeIcon.addEventListener('click', function() {
  instructionsBox.classList.remove('minimized');
  minimizeIcon.style.display = 'block';
  maximizeIcon.style.display = 'none';
});



// listen that retrieves wikipedia information when searchTerm is submitted
searchForm.addEventListener('submit', (event) => {
  event.preventDefault();
  
  const searchTerm = document.querySelector('#search-term').value;


  // Check if instructions box are minimized
  if (instructionsBox.classList.contains('minimized')) {
    console.log('The instruction box is currently minimized');
  } else {
    console.log('The box is currently expanded');
    // Minimize the instruction box
    instructionsBox.classList.toggle('minimized');
    minimizeIcon.style.display = 'none';
    maximizeIcon.style.display = 'block';
    
  }
  const submitButton = document.getElementById('submit-button');

  if (!submitButton.disabled) {
    submitButton.disabled = true
    getWikiInfo(searchTerm)
    submitButton.disabled = false;
  }


});

// Function that returns the Wikipedia information of the subject searchTerm
function getWikiInfo(searchTerm){
  console.log("Query inserted by user: "+searchTerm)
  // Wikipedia API url
  const endpointUrl = "https://en.wikipedia.org/w/api.php?";

  // Initialise html elements
  searchResults.innerHTML = '';
  const searchResult = document.createElement('div');
  const searchTitle = document.createElement('h2');
  const searchImage = document.createElement('img')
  const searchSnippet = document.createElement('p');
  const searchURL = document.createElement('a')
  var myList = document.createElement("ul");
  //myList.id = "myList";
  searchURL.className = 'more-link'
  var queryTerm 


  // Wikipedia Opensearch api parameters
  const opensearchparams = new URLSearchParams({
    action: "opensearch",
    search: searchTerm,
    limit: "5",
    namespace: "0",
    format: "json",
    profile:'fuzzy',
    redirects:'resolve',
    origin:"*"
  });

  // Search wikipedia for the query using opensearch
  fetch( endpointUrl + opensearchparams)
  .then(function(recommended){return recommended.json();})
  .then(function(recommended) {
    // Check if the query exists
    console.log(recommended)
    if(recommended[1].length>=1){

      // Find the most appropriate query term
      queryTerm = recommended[1][0] 
      console.log("Optimal query is: " + queryTerm)

      // wikipedia api parameters
      const params = new URLSearchParams({
        action: "query",
        format: "json",
        prop: "extracts|pageimages",
        titles: queryTerm,
        explaintext:true,
        exintro:true,
        exsentence:4,
        exlimit: "max",
        origin:"*"
      });
      
   
      // Fetch the Wikipedia article using the suggested query 
      fetch( endpointUrl + params)
      .then(function(response){return response.json();})
      .then(function(response) {  
        // Response object of Wikipedia pages
        const page = Object.values(response.query.pages)[0];
        const searchItem = page;
        const pageLink = "https://en.wikipedia.org/wiki/" + searchTerm;


        // Check if the extract of the query exists
        if(checkExtract(page.extract, queryTerm)){
          searchTitle.textContent = "Query not found";

          // Show not found message
          searchSnippet.innerHTML = "Sorry, "+searchTerm+" or "+queryTerm+" which is the optimal query doesn't exist. Try again or choose one the recommended options below!";

          const notFoundTitle = document.createElement('h3');
          notFoundTitle.textContent = 'Suggested Results:'
          searchResults.appendChild(notFoundTitle)

          // Remove item used to search from recommendation list
          var items = recommended[1].slice(1);

          // Create list items and append to the unordered list
          items.forEach(function(itemText) {
            var listItem = document.createElement("li");
            listItem.textContent = itemText ;
            myList.appendChild(listItem);
          });
          
          // Get all list items
          var listItems = myList.querySelectorAll("li");

          listItems.forEach(function(item) {
            item.addEventListener("click", function() {
              console.log("Clicked item:", item.textContent);
              getWikiInfo(item.textContent)
            });
          });  
          
          // Append the list of recommended articles
          searchResults.appendChild(myList)
          console.log("Suggested list: "+myList)

        } else {
          
          // Check for image thumbnail and retrieve it
          console.log(page.thumbnail)
          const imageSource = getImage(page)

          // Limit the Wikipedia extract to n sentences
          const extract = limitExtractToSentences(searchItem.extract, 4)
          searchTitle.textContent = searchItem.title;
          searchSnippet.innerHTML = extract+'.';
          searchImage.src = imageSource;
          searchImage.alt = queryTerm;

          // Wikipedia url added to the html element
          searchURL.href = pageLink;
          searchURL.text = "Read more on Wikipedia!";
          searchURL.target = "_blank";
          // Append the URL in the div
          searchResult.appendChild(searchURL);
          console.log("Successfully retrieved Wikipedia extract.")
       }
        
          
      })
      .catch(function(error){console.log(error);});
    }
    else{
      searchTitle.textContent = 'Query not found in Wikipedia';
      searchSnippet.innerHTML = 'Check your spelling ☺';
      console.log('Search Not found in wikipedia.')
    }

    // Append all the information on the html element
    searchResult.appendChild(searchTitle);
    //searchResult.appendChild(searchImage);
    searchResult.appendChild(searchSnippet);
    searchResults.appendChild(searchResult);
    console.log('Results appended to popup.')
  })
  .catch(function(error){console.log(error);});

  };

// Checks if the Wikipedia article returned has an empty extract
function checkExtract(extract, query){
    const substring =  "may refer to:"
    const emptyStringSize = 30
    var modExtract = extract.replace(query, "");
    var size = modExtract.length;
  
    // check for substring in the extract and smaller than 20 chars
    if (size<emptyStringSize && modExtract.includes(substring) ){
      console.log("Extract does not exist, use suggested results")
      // return true to provided a list of suggestions
      return true
    } else {
      console.log("Extract Exists")
      return false
    }
  };


// Retrieve the thumbnail image of the Wikipedia Article
function getImage(page){
  // Check for image thumbnail and retrieve it
  if (page.thumbnail=== undefined){
    console.log('Article has no image thumbnail.')
    return "images/icon128.png"; 
  } else {
    return page.thumbnail.source; 
  }
};


// Function to limit the extract to a specified number of sentences
function limitExtractToSentences(extract, numSentences) {
  const sentences = extract.split('. ');
  const limitedSentences = sentences.slice(0, numSentences);
  const limitedExtract = limitedSentences.join('. ');

  return limitedExtract;
}


// Terminate the popup when the close button is pressed
document.getElementById("close").addEventListener("click", terminateFunction);

function terminateFunction() {
  window.close();
}
