const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);
const searchQuery = urlParams.get('id');
var database = firebase.database();

//themoviedb

const API_KEY = "api_key=bef5eb55028208771a057a3a652b8632";
const BASE_URL = "https://api.themoviedb.org/3"
const IMG_URL = "https://image.tmdb.org/t/p/w500";
const MOVIE_URL = "https://api.themoviedb.org/3/movie/"+ searchQuery + "?" + API_KEY + "&language=en-US";
const SIMILAR_URL = "https://api.themoviedb.org/3/movie/"+ searchQuery + "/similar?" + API_KEY + "&language=en-US&page=1";

const image = document.getElementById('movie_image');
const title = document.getElementById('movie_header');
const overview = document.getElementById('overview');
const movie_menu = document.getElementById('movie_menu');
const suggested_menu = document.getElementById('suggested_films');


getFilms(MOVIE_URL);
getSuggestFilms(SIMILAR_URL,suggested_menu);

function getFilms(url){
  fetch(url).then(res => res.json()).then(data =>{
    if(data.success === false){
      alertMessage(type="danger", "Invalid movie id!");
      setTimeout(() => { window.location.replace("./index.html"); }, 2000);
    }else{
      showFilms(data);
    }
  })
}

var userdata = null;

function showFilms(data){
  image.innerHTML = `<img class="movie-image" src="${IMG_URL+data.poster_path}" alt="${data.title}">`
  title.innerHTML = `${data.title} - ${data.release_date.substring(0,4)} <span class="${getColor(data.vote_average)}">${data.vote_average}</span>`
  overview.innerHTML = `<p>${data.tagline}</p><h4>Overview:</h4>${data.overview}`
  movie_menu.innerHTML = `
    <div class="movie-menu-item">Status: ${data.status}</div>
    <div class="movie-menu-item">Release: ${data.release_date}</div>
    <div class="movie-menu-item">Runtime: ${data.runtime} minutes</div>
    <div class="movie-menu-item">Ratings: ${data.vote_average}</div>
    <div class="movie-menu-item">Vote Counts: ${data.vote_count}</div>
    <div class="movie-menu-item">Budget: ${data.budget} &#36;</div>
    <div class="movie-menu-item">Revenue: ${data.revenue} &#36;</div>
  `
  document.title = data.title + " - FilmFreak";
  firebase.auth().onAuthStateChanged(user => {
    if (user) {
      userdata = user;
      showUserWishHandler(user);
    }
    else {
      document.getElementById("user_handler").innerHTML = ``
    }
  })
}

function getColor(vote){
  if(vote>=7){
    return 'green'
  }else{
    return 'orange'
  }
}

// FIREBASE

var user_handler_div_area = document.getElementById("user_handler")

function showUserWishHandler(user){
  database.ref('/'+user.uid+'/movies/'+searchQuery).once("value").then((snapshot) => {
    var wish = snapshot.child("wish").val();
    var watched = snapshot.child("watched").val();

    if(wish === true && watched === true){
      user_handler_div_area.innerHTML = `
        <div id="watched_btn" class="wish-active"><i class="fa fa-eye" aria-hidden="true"></i><span class="tooltiptext">Remove from watched</span></div>
        <div id="wish_btn" class="wish-active"><i class="fa fa-bookmark" aria-hidden="true"><span class="tooltiptext">Remove from wishlist</span></i></div>
      `
    }else if(wish !== true && watched === true){
      user_handler_div_area.innerHTML = `
        <div id="watched_btn" class="wish-active"><i class="fa fa-eye" aria-hidden="true"></i><span class="tooltiptext">Remove from watched</span></div>
        <div id="wish_btn" class="wish"><i class="fa fa-bookmark-o" aria-hidden="true"></i><span class="tooltiptext">Add to wishlist</span></div>
      `
    }else if(wish === true && watched !== true){
      user_handler_div_area.innerHTML = `
        <div id="watched_btn" class="wish"><i class="fa fa-eye-slash" aria-hidden="true"></i><span class="tooltiptext">Add to watched</span></div>
        <div id="wish_btn" class="wish-active"><i class="fa fa-bookmark" aria-hidden="true"></i><span class="tooltiptext">Remove from wishlist</span></div>
      `
    }else{
      user_handler_div_area.innerHTML = `
        <div id="watched_btn" class="wish"><i class="fa fa-eye-slash" aria-hidden="true"></i><span class="tooltiptext">Add to watched</span></div>
        <div id="wish_btn" class="wish"><i class="fa fa-bookmark-o" aria-hidden="true"></i><span class="tooltiptext">Add to wishlist</span></div>
      `
    }
  })
}

window.onload = setTimeout(events, 3000);

function events(){
  document.getElementById('wish_btn').addEventListener('click', WriteWish);
  document.getElementById('watched_btn').addEventListener('click', WriteWatched);
}

function WriteWish(){
  database.ref('/'+userdata.uid+'/movies/'+searchQuery).once("value").then((snapshot) => {
    var wish = snapshot.child("wish").val();

    if (wish === true){
      database.ref('/'+userdata.uid+'/movies/'+searchQuery).update({
        wish: false,
      })
      showUserWishHandler(userdata);
    }else {
      database.ref('/'+userdata.uid+'/movies/'+searchQuery).update({
        wish: true,
      })
      showUserWishHandler(userdata);
    }
  })
}

function WriteWatched(){
  database.ref('/'+userdata.uid+'/movies/'+searchQuery).once("value").then((snapshot) => {
    var wish = snapshot.child("wish").val();
    var watched = snapshot.child("watched").val();

    if (wish === true && watched !== true){
      database.ref('/'+userdata.uid+'/movies/'+searchQuery).update({
        wish: false,
        watched: true
      })
      showUserWishHandler(userdata);
    }else if (wish !== true && watched !== true){
      database.ref('/'+userdata.uid+'/movies/'+searchQuery).update({
        watched: true
      })
      showUserWishHandler(userdata);
    }else if (wish === true && watched === true){
      database.ref('/'+userdata.uid+'/movies/'+searchQuery).update({
        watched: false
      })
      showUserWishHandler(userdata);
    }else if (wish !== true && watched === true){
      database.ref('/'+userdata.uid+'/movies/'+searchQuery).update({
        watched: false,
      })
      showUserWishHandler(userdata);
    }
  })
}

function getSuggestFilms(url,divId){
  fetch(url).then(res => res.json()).then(data =>{
    showSuggestFilms(data.results,divId);
  })
}

function showSuggestFilms(data,divId){
  divId.innerHTML = '';
  var i = 1;
  for(const movie in data){
    const {title, poster_path, vote_average, overview, id} = data[movie];
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
    i+=1;
    if (i > 10){return};
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
