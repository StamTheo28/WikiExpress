const searchForm = document.querySelector('#search-form');
const searchResults = document.querySelector('#search-results');
// Wikipedia API url
const endpointUrl = "https://en.wikipedia.org/w/api.php?";

// listen that retrieves wikipedia information when searchTerm is submitted
searchForm.addEventListener('submit', (event) => {
  event.preventDefault();
  
  const searchTerm = document.querySelector('#search-term').value;
  getWikiInfo(searchTerm)

});

// Function that returns the Wikipedia information of the subject searchTerm
function getWikiInfo(searchTerm){
  console.log(searchTerm)

  // Create the search params used for the Wikipedia API
  const params = new URLSearchParams({
    action: "query",
    format: "json",
    prop: "extracts",
    titles: searchTerm,
    explaintext:true,
    exintro:true,
    exsentence:4,
    exlimit: "max",
    origin:"*"
  });
  
  // Fetch the Wikipedia data
  fetch( endpointUrl + params)
  .then(function(response){return response.json();})
  .then(function(response) {

      console.log("Successfully made connection with Wikipedia")
      // Create a new div to append the information
      const found = Object.keys(response.query.pages);
      searchResults.innerHTML = '';
      const searchResult = document.createElement('div');
      const searchTitle = document.createElement('h2');
      const searchSnippet = document.createElement('p');
      const searchURL = document.createElement('a')

      // if the searchTerm exists in WikiPedia
      if (found != -1){
        const page = Object.values(response.query.pages)[0];
        console.log(page)
        const searchItem = page
        const pageLink = "https://en.wikipedia.org/wiki/" + searchTerm
        const extract = limitExtractToSentences(searchItem.extract, 4)
        searchTitle.textContent = searchItem.title;
        searchSnippet.innerHTML = extract;
        searchURL.href = pageLink;
        searchURL.text = pageLink;
        searchURL.target = "_blank";
        console.log("Your search page " + searchTerm +" exists on English Wikipedia" )
      } else {
        searchTitle.textContent = 'Query not found in Wikipedia'
        searchSnippet.innerHTML = 'Check your spelling ☺';
        console.log('Search Not found in wikipedia')
      }
      searchResult.appendChild(searchTitle);
      searchResult.appendChild(searchSnippet);
      searchResult.appendChild(searchURL)
      searchResults.appendChild(searchResult);
      searchResults = document.querySelector('#search-results');
  })
  .catch(function(error){console.log(error);});

};


// Function to limit the extract to a specified number of sentences
function limitExtractToSentences(extract, numSentences) {
  // Split the extract into an array of sentences
  const sentences = extract.split('. ');

  // Take the specified number of sentences
  const limitedSentences = sentences.slice(0, numSentences);

  // Join the limited sentences back into a single string
  const limitedExtract = limitedSentences.join('. ');

  return limitedExtract;
}


// Terminate the popup when the close button is pressed
document.getElementById("close").addEventListener("click", terminateFunction);

function terminateFunction() {
  window.close();
}
