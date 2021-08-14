//themoviedb

const API_KEY = "api_key=bef5eb55028208771a057a3a652b8632";
const BASE_URL = "https://api.themoviedb.org/3"
const IMG_URL = "https://image.tmdb.org/t/p/w500";
const HIGH_URL = "https://api.themoviedb.org/3/discover/movie?certification_country=US&certification=R&sort_by=vote_average.desc&" + API_KEY;
const POPULAR_URL = "https://api.themoviedb.org/3/discover/movie?sort_by=popularity.desc&" + API_KEY;
const UPCOMING_URL = "https://api.themoviedb.org/3/movie/upcoming?" + API_KEY + "&language=en-US&page=1";

const popular = document.getElementById('popular_films');
const highrated = document.getElementById('high_rated_films');
const upcoming = document.getElementById('upcoming_films');


getFilms(POPULAR_URL,popular);
getFilms(UPCOMING_URL,upcoming);
getFilms(HIGH_URL,highrated);

function getFilms(url,divId){
  fetch(url).then(res => res.json()).then(data =>{
    showFilms(data.results,divId);
  })
}

function showFilms(data,divId){
  divId.innerHTML = '';
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
    divId.appendChild(filmEl);
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
