const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);
const profileId = urlParams.get('id');

var database = firebase.database();
var provider = new firebase.auth.GoogleAuthProvider();

var mydata = null;

const API_KEY = "api_key=bef5eb55028208771a057a3a652b8632";
const IMG_URL = "https://image.tmdb.org/t/p/w500";

document.getElementById('login').addEventListener('click', GoogleLogin);
document.getElementById('logout').addEventListener('click', LogoutUser);

function GoogleLogin() {
  firebase.auth().signInWithPopup(provider).then(res=>{
    alertMessage(type="success", "You're logged in!")
    showUserData(res.user)
    document.getElementById('user_head').style.display="flex";
    document.getElementById('nonuser_head').style.display="none";
  }).catch((e)=>{})
}

function showUserData(user){
  document.getElementById('user_image_div').innerHTML = `<img src="${user.photoURL}" class="user-image">`
}


function checkAuthState(){
  firebase.auth().onAuthStateChanged(user=>{
    if(user.uid === profileId){
      window.location.replace("./profile.html");
    }
    if(user){
      mydata = user;
      document.getElementById('user_head').style.display="flex";
      document.getElementById('nonuser_head').style.display="none";
      checkPermission(user);
      showUserData(user);
      showProfileData(user);
      PublicProfileHandler(user);
      showReqFriendsNum(user);
    }else{
    alertMessage(type="danger", "You're logged out!");
    setTimeout(() => { window.location.replace("./index.html"); }, 2000);
    }
  })
}

function LogoutUser() {
  firebase.auth().signOut().then(()=>{
    document.getElementById('user_head').style.display="none";
    document.getElementById('nonuser_head').style.display="flex";
    alertMessage(type="danger", "You're logged out!");
    setTimeout(() => { window.location.replace("./index.html"); }, 2000);
  }).catch((e)=>{
    console.log(e)
  })
}

checkAuthState();

// FIREBASE

function checkPermission(user){
  database.ref('/'+user.uid+'/profile').once("value").then((snapshot) => {
    var public = snapshot.child("public").val();
    if(public === false){
      alertMessage(type="danger", "You're not authorized to see this profile!");
      setTimeout(() => { window.location.replace("./profile.html"); }, 2000);
    }else{
      database.ref('/'+profileId+'/profile').once("value").then((snapshot) => {
        var pub = snapshot.child("public").val();
        if(pub === false){
          alertMessage(type="danger", "This user does not have a public profile!");
          setTimeout(() => { window.location.replace("./profile.html"); }, 2000);
        }
      })
    }

  })
}

function PublicProfileHandler(mydata){
  database.ref('/'+mydata.uid+'/profile').once("value").then((snapshot) => {
    var public = snapshot.child("public").val();
    if(public === true){
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
    }
  })
}

function showProfileData(user){
  var name = null;
  database.ref('/'+profileId+'/profile').once("value").then((snapshot) => {
    var image = snapshot.child("image").val();
    name = snapshot.child("name").val();
    document.title = name + " - FilmFreak";
    document.getElementById('profile_name').innerHTML = `${name}`
    document.getElementById('profile_image').innerHTML = `<img src="${image}" class="user-profile-image">`
  })

  database.ref('/'+user.uid+'/friends/' + profileId).once("value").then((snapshot) => {
    var mystatus = snapshot.child("status").val();
    database.ref('/'+profileId+'/friends/' + user.uid).once("value").then((snapshot) => {
      var prof_status = snapshot.child("status").val();
      var friend_btn = document.getElementById('add_btn');
      var prof_head = document.getElementById('profile_head')

      if(mystatus === true && prof_status === true){
        friend_btn.innerHTML = `<div class="added">Remove Friend</div>`
        prof_head.innerHTML = `Films watched by ${name}.`
        watchedMoviesHandler(profileId);
      }else if(mystatus !== true && prof_status === true){
        friend_btn.innerHTML = `<div class="added">Accept Request</div>`
        prof_head.innerHTML = `Add as friend to see films watched by ${name}.`
      }else if(mystatus === true && prof_status !== true){
        friend_btn.innerHTML = `<div class="added">Cancel Request</div>`
        prof_head.innerHTML = `Add as friend to see films watched by ${name}.`
      }else{
        friend_btn.innerHTML = `<div class="added">Add Friend</div>`
        prof_head.innerHTML = `Add as friend to see films watched by ${name}.`
      }
    })
  })
}

document.getElementById("add_btn").onclick = function (){
  database.ref('/'+mydata.uid+'/friends/' + profileId).once("value").then((snapshot) => {
    var mystatus = snapshot.child("status").val();
    database.ref('/'+profileId+'/friends/' + mydata.uid).once("value").then((snapshot) => {
      var prof_status = snapshot.child("status").val();
      var friend_btn = document.getElementById('add_btn');
      var prof_head = document.getElementById('profile_head')

      if(mystatus === true && prof_status === true){
        removeFriend(mydata,profileId);
      }else if(mystatus !== true && prof_status === true){
        acceptFriend(mydata,profileId);
      }else if(mystatus === true && prof_status !== true){
        cancelFriend(mydata,profileId);
      }else{
        addFriend(mydata,profileId);
      }
    })
  })
}

function addFriend(user,profileId){
  database.ref('/'+user.uid+'/friends/'+profileId).update({
    status: true
  })
  database.ref('/'+profileId+'/friends/'+user.uid).update({
    status: false
  })
  showProfileData(user);
}
function cancelFriend(user,profileId){
  database.ref('/'+user.uid+'/friends/'+profileId).update({
    status: false
  })
  showProfileData(user);
}
function acceptFriend(user,profileId){
  database.ref('/'+user.uid+'/friends/'+profileId).update({
    status: true
  })
  showProfileData(user);
}
function removeFriend(user,profileId){
  database.ref('/'+user.uid+'/friends/'+profileId).update({
    status: false
  })
  database.ref('/'+profileId+'/friends/'+user.uid).update({
    status: false
  })
  document.getElementById("watched-container").innerHTML='';
  showProfileData(user);
}

function watchedMoviesHandler(user){
  database.ref('/'+user+'/movies').orderByKey().once("value").then((snapshot) => {
    snapshot.forEach(function(childSnapshot){
      var MOVIE_URL = "https://api.themoviedb.org/3/movie/"+ childSnapshot.key + "?" + API_KEY + "&language=en-US";

      database.ref('/'+user+'/movies/'+childSnapshot.key).once("value").then((snapshot) => {
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


document.getElementById("msg_btn").onclick = function (){
  window.location.assign("./messages.html?id="+profileId);
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
