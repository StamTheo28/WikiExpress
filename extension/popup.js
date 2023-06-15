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
  console.log("Query inserted by user: "+searchTerm)

  // Initialise html elements
  searchResults.innerHTML = '';
  const searchResult = document.createElement('div');
  const searchTitle = document.createElement('h2');
  const searchSnippet = document.createElement('p');
  const searchURL = document.createElement('a')
  var queryTerm 


  // Wikipedia Opensearch api parameters
  const opensearchparams = new URLSearchParams({
    action: "opensearch",
    search: searchTerm,
    limit: "1",
    namespace: "0",
    format: "json",
    origin:"*"
  });

  // Search wikipedia for the query using opensearch
  fetch( endpointUrl + opensearchparams)
  .then(function(response){return response.json();})
  .then(function(response) {
    // Check if the query exists
    if(response[1].length==1){

      // Find the most appropriate query term
      queryTerm = response[1][0] 
      console.log("Optimal query is: " + queryTerm)

      // wikipedia api parameters
      const params = new URLSearchParams({
        action: "query",
        format: "json",
        prop: "extracts",
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
        console.log("Successfully made connection with Wikipedia.")
        const page = Object.values(response.query.pages)[0];
        const searchItem = page
        const pageLink = "https://en.wikipedia.org/wiki/" + searchTerm
        if(page.extract===""){
          searchTitle.textContent = queryTerm
          searchSnippet.innerHTML = 'To view information about'+ queryTerm+ ' you need to press the link below.';
          console.log('Wikipedia article was redirected.')
        } else {
          // Limit the Wikipedia extract to n sentences
          const extract = limitExtractToSentences(searchItem.extract, 4)
          searchTitle.textContent = searchItem.title;
          searchSnippet.innerHTML = extract+'.';
        }
        
        // Wikipedia url added to the html element
        searchURL.href = pageLink;
        searchURL.text = pageLink;
        searchURL.target = "_blank";
          
      })
      .catch(function(error){console.log(error);});
    }
    else{
      searchTitle.textContent = 'Query not found in Wikipedia'
      searchSnippet.innerHTML = 'Check your spelling ☺';
      console.log('Search Not found in wikipedia.')
    }

    // Append all the information on the html element
    searchResult.appendChild(searchTitle);
    searchResult.appendChild(searchSnippet);
    searchResult.appendChild(searchURL)
    searchResults.appendChild(searchResult);
    console.log('Results appended to popup.')
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
