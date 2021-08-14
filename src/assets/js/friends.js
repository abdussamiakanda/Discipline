var provider = new firebase.auth.GoogleAuthProvider();
var database = firebase.database();

document.getElementById('login').addEventListener('click', GoogleLogin)
document.getElementById('logout').addEventListener('click', LogoutUser)

function GoogleLogin() {
  firebase.auth().signInWithPopup(provider).then(res=>{
    alertMessage(type="success", "You're logged in!")
    showUserData(res.user)
    document.getElementById('user_head').style.display="flex";
    document.getElementById('nonuser_head').style.display="none";
  }).catch((e)=>{})
}

function showUserData(user){
  FriendsHandler(user);
  //document.getElementById('user_name').innerHTML = `Hola, ${user.displayName}`
  document.getElementById('user_image_div').innerHTML = `<img src="${user.photoURL}" class="user-image">`
}

var userdata = null;

function checkAuthState(){
  firebase.auth().onAuthStateChanged(user=>{
    if(user){
      userdata = user;
      document.getElementById('user_head').style.display="flex";
      document.getElementById('nonuser_head').style.display="none";
      checkPermission(user);
      showUserData(user);
      showAllFriendsData(user);
      showReqFriendsData(user);
      showReqFriendsNum(user);
    }else{
      alertMessage(type="danger", "You're logged out!")
      setTimeout(() => { window.location.replace("./index.html"); }, 2000);
    }
  })
}

function FriendsHandler(user){
  database.ref('/'+user.uid+'/profile').once("value").then((snapshot) => {
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

function LogoutUser() {
  firebase.auth().signOut().then(()=>{
    document.getElementById('user_head').style.display="none";
    document.getElementById('nonuser_head').style.display="flex";
    alertMessage(type="danger", "You're logged out!")
    setTimeout(() => { window.location.replace("./index.html"); }, 2000);
  }).catch((e)=>{
    console.log(e)
  })
}
checkAuthState()

// HANDLING MENUS BUTTONS

document.getElementById("all_friends").onclick = function (){
  document.getElementById("all_friends").classList.add("selected-friends-item");
  document.getElementById("req_friends").classList.remove("selected-friends-item");
  document.getElementById("find_friends").classList.remove("selected-friends-item");
  document.getElementById("all_friends_div").style.display = "flex";
  document.getElementById("req_friends_div").style.display = "none";
  document.getElementById("find_friends_div").style.display = "none";
}
document.getElementById("req_friends").onclick = function (){
  document.getElementById("all_friends").classList.remove("selected-friends-item");
  document.getElementById("req_friends").classList.add("selected-friends-item");
  document.getElementById("find_friends").classList.remove("selected-friends-item");
  document.getElementById("all_friends_div").style.display = "none";
  document.getElementById("req_friends_div").style.display = "flex";
  document.getElementById("find_friends_div").style.display = "none";
}
document.getElementById("find_friends").onclick = function (){
  document.getElementById("all_friends").classList.remove("selected-friends-item");
  document.getElementById("req_friends").classList.remove("selected-friends-item");
  document.getElementById("find_friends").classList.add("selected-friends-item");
  document.getElementById("all_friends_div").style.display = "none";
  document.getElementById("req_friends_div").style.display = "none";
  document.getElementById("find_friends_div").style.display = "block";
}


// FIREBASE

function checkPermission(user){
  database.ref('/'+user.uid+'/profile').once("value").then((snapshot) => {
    var public = snapshot.child("public").val();
    if(public === false){
      alertMessage(type="danger", "You're not authorized to see this page!");
      setTimeout(() => { window.location.replace("./profile.html"); }, 2000);
    }else{
    }
  })
}


const search = document.getElementById('frnd_search');

document.getElementById('frnd_search').addEventListener('change', updateValue);

function updateValue(e) {
  if(e !== " "){
    searchFriends(e);
  }else{
    dontShowUser(divId);
  }
}

function handleForm(event) { event.preventDefault(); }
form.addEventListener('submit', handleForm);

function searchFriends(name){
  var divId = document.getElementById('search_results');
  database.ref('/').orderByKey().once("value").then((snapshot) => {
    divId.innerHTML = ``;
    snapshot.forEach(function(childSnapshot){
      var userId = childSnapshot.key;
      database.ref('/'+ childSnapshot.key + '/profile').once("value").then((snapshot) => {
        var public = snapshot.child("public").val();
        var user = snapshot.child("name").val().toLowerCase();

        if(public === true && user.includes(name.target.value.toLowerCase()) === true && userId !== userdata.uid){
          showUser(userId,divId);
        }else{
        }
      })
    })
  })
}

function showUser(userId,divId){
  database.ref('/'+ userId + '/profile').once("value").then((snapshot) => {
    var image = snapshot.child("image").val();
    var name = snapshot.child("name").val();

    const userEl = document.createElement('div');
    userEl.classList.add('user-profile-id');
    userEl.innerHTML = `
    <img class="avatar" src="${image}" alt="">
    <h5>${name}</h5>
    <a href="./user.html?id=${userId}"><div class="user-id-button">Profile</div></a>
    `
    divId.appendChild(userEl);
  })
}

function dontShowUser(divId){
  divId.innerHTML = `No user found!`
}

function showAllFriendsData(user){
  database.ref('/'+user.uid+'/friends').orderByKey().once("value").then((snapshot) => {
    snapshot.forEach(function(childSnapshot){
      var profileId = childSnapshot.key;
      database.ref('/'+profileId+'/friends/'+user.uid).once("value").then((snapshot) => {
        var status = snapshot.child('status').val();
        database.ref('/'+profileId+'/profile').once("value").then((snapshot) => {
          var public = snapshot.child('public').val();
          if (public === true){
            database.ref('/'+user.uid+'/friends/'+profileId).once("value").then((snapshot) => {
              var mystatus = snapshot.child('status').val();
              if (mystatus === true && status === true){
                database.ref('/'+profileId+'/profile').once("value").then((snapshot) => {
                  var image = snapshot.child("image").val();
                  var name = snapshot.child("name").val();

                  const userEl = document.createElement('div');
                  userEl.classList.add('user-profile-id');
                  userEl.innerHTML = `
                  <img class="avatar" src="${image}" alt="">
                  <h5>${name}</h5>
                  <a href="./user.html?id=${profileId}"><div class="user-id-button">Profile</div></a>
                  `
                  document.getElementById('all_friends_div').appendChild(userEl);
                })
              }
            })
          }
        })
      })
    })
  })
}

function showReqFriendsData(user){
  database.ref('/'+user.uid+'/friends').orderByKey().once("value").then((snapshot) => {
    snapshot.forEach(function(childSnapshot){
      var profileId = childSnapshot.key;
      database.ref('/'+profileId+'/friends/'+user.uid).once("value").then((snapshot) => {
        var status = snapshot.child('status').val();
        database.ref('/'+user.uid+'/friends/'+profileId).once("value").then((snapshot) => {
          var mystatus = snapshot.child('status').val();
          if (mystatus === false && status === true){
            database.ref('/'+profileId+'/profile').once("value").then((snapshot) => {
              var image = snapshot.child("image").val();
              var name = snapshot.child("name").val();

              const userEl = document.createElement('div');
              userEl.classList.add('user-profile-id');
              userEl.innerHTML = `
              <img class="avatar" src="${image}" alt="">
              <h5>${name}</h5>
              <a href="./user.html?id=${profileId}"><div class="user-id-button">Profile</div></a>
              `
              document.getElementById('req_friends_div').appendChild(userEl);
            })
          }
        })
      })
    })
  })
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
  const userEl = document.createElement('span');
  userEl.classList.add('badge');
  userEl.innerHTML = `${num}`
  document.getElementById('req_friends').appendChild(userEl);
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
