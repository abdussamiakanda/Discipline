var provider = new firebase.auth.GoogleAuthProvider();
var database = firebase.database();

var userdata = null;

const API_KEY = "api_key=bef5eb55028208771a057a3a652b8632";
const BASE_URL = "https://api.themoviedb.org/3"
const IMG_URL = "https://image.tmdb.org/t/p/w500";



document.getElementById('login').addEventListener('click', GoogleLogin);
document.getElementById('logout').addEventListener('click', LogoutUser);
document.getElementById('profilelogout').addEventListener('click', LogoutUser);
document.getElementById('settings_btn').addEventListener('click', SettingsManager);
document.getElementById('wishlist_btn').addEventListener('click', WishlistManager);
document.getElementById('watched_btn').addEventListener('click', WatchedManager);

function GoogleLogin() {
  firebase.auth().signInWithPopup(provider).then(res=>{
    alertMessage(type="success", "You're logged in!")
    showUserData(res.user)
    document.getElementById('user_head').style.display="flex";
    document.getElementById('nonuser_head').style.display="none";
  }).catch((e)=>{})
}

function showUserData(user){
  document.getElementById('profile_name').innerHTML = `${user.displayName}`
  document.getElementById('user_image_div').innerHTML = `<img src="${user.photoURL}" class="user-image">`
  document.getElementById('profile_image').innerHTML = `<img src="${user.photoURL}" class="user-profile-image">`

}

function checkAuthState(){
  firebase.auth().onAuthStateChanged(user=>{
    if(user){
      userdata = user;
      document.getElementById('user_head').style.display="flex";
      document.getElementById('nonuser_head').style.display="none";
      showUserData(user);
      PublicProfileHandler(user);
      wishMoviesHandler(user);
      watchedMoviesHandler(user);
      showReqFriendsNum(user);
      document.title = user.displayName + " - FilmFreak";
    }else{
    alertMessage(type="danger", "You're logged out!")
    setTimeout(() => { window.location.replace("./index.html"); }, 2000);
    }
  })
}

function LogoutUser() {
  firebase.auth().signOut().then(()=>{
    document.getElementById('user_head').style.display="none";
    document.getElementById('nonuser_head').style.display="flex";
    setTimeout(() => { window.location.replace("./index.html"); }, 2000);
  }).catch((e)=>{
    console.log(e)
  })
}

function SettingsManager(){
  document.getElementById("settings_div").style.display="block";
  document.getElementById("wishlist_div").style.display="none";
  document.getElementById("watched_div").style.display="none";
}

function WishlistManager(){
  document.getElementById("settings_div").style.display="none";
  document.getElementById("wishlist_div").style.display="block";
  document.getElementById("watched_div").style.display="none";
}
function WatchedManager(){
  document.getElementById("settings_div").style.display="none";
  document.getElementById("wishlist_div").style.display="none";
  document.getElementById("watched_div").style.display="block";
}

checkAuthState();

// FIREBASE

document.getElementById("toggle").addEventListener('click', PublicProfileManager);

function PublicProfileManager(){
  database.ref('/'+userdata.uid+'/profile').once("value").then((snapshot) => {
    var public = snapshot.child("public").val();

    if (public === true){
      database.ref('/'+userdata.uid+'/profile').update({
        public: false,
      })
      PublicProfileHandler(userdata);
    }else {
      database.ref('/'+userdata.uid+'/profile').update({
        public: true,
        name: userdata.displayName,
        email: userdata.email,
        image: userdata.photoURL
      })
      PublicProfileHandler(userdata);
    }
  })
}

function PublicProfileHandler(userdata){
  database.ref('/'+userdata.uid+'/profile').once("value").then((snapshot) => {
    var public = snapshot.child("public").val();
    if(public === true){
      document.getElementById("toggle").checked = "checked";
      document.getElementById("friends").innerHTML = `
        <div class="dropdown-menu-item">Friends</div>
      `
      document.getElementById("friends-icon").innerHTML = `
        <i class="search-icon fa fa-users" aria-hidden="true"></i>
      `
      document.getElementById("message-icon").innerHTML = `
        <i class="search-icon fa fa-comments-o" aria-hidden="true"></i>
      `
    }else{
      document.getElementById("toggle").checked = false;
    }
  })
}

var modal = document.getElementById("myModal");

document.getElementById("download_data").onclick = function (){
  alertMessage(type="success", "This feature is not available yet!");
}
document.getElementById("delete_data").onclick = function (){
  modal.style.display = "block";
}
document.getElementById("no_button").onclick = function (){
  modal.style.display = "none";
}

document.getElementById("yes_button").onclick = function (){
  modal.style.display = "none";
  database.ref('/'+userdata.uid+'/movies').remove();
  alertMessage(type="danger", "All all your film data are deleted permanently!");
}


function wishMoviesHandler(user){
  database.ref('/'+user.uid+'/movies').orderByKey().once("value").then((snapshot) => {
    snapshot.forEach(function(childSnapshot){
      var MOVIE_URL = "https://api.themoviedb.org/3/movie/"+ childSnapshot.key + "?" + API_KEY + "&language=en-US";

      database.ref('/'+user.uid+'/movies/'+childSnapshot.key).once("value").then((snapshot) => {
        var wish = snapshot.child("wish").val();
        var wish_div = document.getElementById("wish-container")

        if(wish === true){
          getFilms(MOVIE_URL,wish_div);
        }
      })
    })
  })
}

function watchedMoviesHandler(user){
  database.ref('/'+user.uid+'/movies').orderByKey().once("value").then((snapshot) => {
    snapshot.forEach(function(childSnapshot){
      var MOVIE_URL = "https://api.themoviedb.org/3/movie/"+ childSnapshot.key + "?" + API_KEY + "&language=en-US";

      database.ref('/'+user.uid+'/movies/'+childSnapshot.key).once("value").then((snapshot) => {
        var watched = snapshot.child("watched").val();
        var watch_div = document.getElementById("watched-container")

        if(watched === true){
          getFilms(MOVIE_URL,watch_div);
        }
      })
    })
  })
}


function getFilms(url,divId){
  fetch(url).then(res => res.json()).then(data =>{
    if(data.success === false){

    }else{
      showFilms(data,divId);
    }
  })
}

function showFilms(data,divId){
  const {title, poster_path, vote_average, overview, id} = data;
  const filmEl = document.createElement('div');
  filmEl.classList.add('user-film');
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
}

function getColor(vote){
  if(vote>=7){
    return 'green'
  }else{
    return 'orange'
  }
}

function showReqFriendsNum(user){
  database.ref('/'+user.uid+'/friends').orderByKey().once("value").then((snapshot) => {
    var num = 0;
    snapshot.forEach(function(childSnapshot){
      var profileId = childSnapshot.key;
      database.ref('/'+user.uid+'/friends/'+profileId).once("value").then((snapshot) => {
        var status = snapshot.child('status').val();
        if (status === false){
          num++;
          showNumber(num);
        }else{
          num = num;
        }
      });
    });
  });
}

function showNumber(num){
  document.getElementById('friends-icon').style.position = 'relative';
  document.getElementById('friends-icon').innerHTML += `
    <i class="badge-dot fa fa-circle" aria-hidden="true"></i>
  `
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
