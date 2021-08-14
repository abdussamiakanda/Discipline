const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);
const searchQuery = urlParams.get('s')
document.getElementById("big_search").value = searchQuery;

//themoviedb

const API_KEY = "api_key=bef5eb55028208771a057a3a652b8632";
const BASE_URL = "https://api.themoviedb.org/3"
const API_URL = BASE_URL + "/discover/movie?sort_by=popularity.desc&" + API_KEY;
const IMG_URL = "https://image.tmdb.org/t/p/w500";
const searchURL = BASE_URL + "/search/movie?" + API_KEY;

//getFilms(API_URL);

const searchDiv = document.getElementById('search_res_container');
const search = document.getElementById('big_search');

search.addEventListener('input', updateValue);

function updateValue(e) {
  if(e){
    getFilms(searchURL+"&query="+e.target.value)
  }
}

var form = document.getElementById("form");
function handleForm(event) { event.preventDefault(); }
form.addEventListener('submit', handleForm);

function getFilms(url){
  fetch(url).then(res => res.json()).then(data =>{
    showFilms(data.results);
  })
}

function showFilms(data){
  searchDiv.innerHTML = '';
  data.forEach(movie => {
    const {title, poster_path, vote_average, overview, id} = movie;
    const filmEl = document.createElement('div');
    filmEl.classList.add('film');
    filmEl.innerHTML = `<a href="./movie.html?id=${id}">
    <img src="${IMG_URL+poster_path}" alt="${title}">
    <div class="film-info">
      <h4>${title}</h4>
      <span class="${getColor(vote_average)}">${vote_average}</span>
    </div>
    <div class="overview">
      <h4 style="margin: 0;">Overview</h4>
      ${overview}
    </div></a>
    `
    searchDiv.appendChild(filmEl);
  })
}



function getColor(vote){
  if(vote>=7){
    return 'green'
  }else{
    return 'orange'
  }
}


function alertMessage(type="success", message){
    let x = document.getElementById("alerts")
    let content = ``
    if(type==="success") {
        x.classList.add("show-alerts-success")
        setTimeout(function(){ x.className = x.className.replace("show-alerts-success", ""); }, 2000);
        content += `
                ${message}`
        x.innerHTML = content;
    }
    else {
        x.classList.add("show-alerts-danger")
        setTimeout(function(){ x.className = x.className.replace("show-alerts-danger", ""); }, 2000);
        content += `
                ${message}`
        x.innerHTML = content;
    }
}
