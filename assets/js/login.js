var provider = new firebase.auth.GoogleAuthProvider();
var database = firebase.database();
var userdata = null;

document.getElementById('login_btn').addEventListener('click', GoogleLogin)

function GoogleLogin() {
  firebase.auth().signInWithPopup(provider).then(res=>{
    alertMessage(type="success", "You're logged in!")
    verifyUser(user);
  }).catch((e)=>{})
}

function checkAuthState(){
  firebase.auth().onAuthStateChanged(user=>{
    if(user){
      userdata = user;
      verifyUser(user);
    }else{
      document.title = "Login";
      document.getElementById('login_form').style.display="block";
    }
  })
}

function verifyUser(user){
  database.ref('/verified-users').orderByKey().once("value").then((snapshot) => {
    snapshot.forEach(function(childSnapshot){
      database.ref('/verified-users/'+childSnapshot.key).once("value").then((snapshot) => {
        var email = snapshot.child('email').val();
        var name = snapshot.child('name').val();

        if(email === user.email && !(name)){
          registerUser(user);
        }else if(email === user.email && name){
          verified(user);
        }else{
          document.title = "Login";
          document.getElementById('verify_id').style.display="block";
          document.getElementById('login_form').style.display="none";
        }
      })
    })
  })
}

function registerUser(user){
  document.title = "Sign Up";
  alertMessage(type="success", "Your email is verified by your CR!<br>Now it's time to sign up.")
  document.getElementById('login_form').style.display="none";
  document.getElementById('verify_id').style.display="none";
  document.getElementById('signup_form').style.display="block";
}

function verified(user){
  document.title = "Dashboard";
  document.getElementById('login_form').style.display="none";
  document.getElementById('signup_form').style.display="none";
  showDashboard(user);
}

document.getElementById("signup_btn").onclick = function (){
  var name = document.getElementById('name').value;
  var id = document.getElementById('id').value;
  var year = document.getElementById('year').value;
  var term = document.getElementById('term').value;
  var contact = document.getElementById('contact').value;
  var blood_group = document.getElementById('blood_group').value;

  database.ref('/users/'+userdata.uid).update({
    name: name,
    id: id,
    year: year,
    term: term,
    contact: contact,
    blood: blood_group,
    type: general
  })
  database.ref('/verified-users/'+id).update({
    name: name
  })
  checkAuthState();
  return false;
}

function GoogleLogout() {
  firebase.auth().signOut().then(()=>{
    alertMessage(type="danger", "You're logged out!");
    document.getElementById('login_form').style.display="block";
    document.getElementById('verify_id').style.display="none";
    document.getElementById('signup_form').style.display="none";
    document.getElementById('dashboard_container').style.display = "none";
  }).catch((e)=>{
    console.log(e)
  })
}

function showDashboard(user){
  document.getElementById('dashboard_container').style.display = "flex";
  showHeader(user);
}

function showHeader(user){
  document.getElementById('header_right').innerHTML = `
    <a href="./search.html"><i class="search-icon fa fa-search" aria-hidden="true"></i></a>
    <div>${user.displayName}</div>
    <div class="dropdown">
      <div class="user-image-div"><img class="header-image" src="${user.photoURL}" alt=""></div>
      <div class="dropdown-menu">
        <a href="./profile.html"><div class="dropdown-menu-item">Profile</div></a>
        <div class="dropdown-menu-item" onClick="GoogleLogout()" style="cursor:pointer;">Logout</div>
      </div>
    </div>`
}

//
// function FriendsHandler(userdata){
//   database.ref('/'+userdata.uid+'/profile').once("value").then((snapshot) => {
//     var public = snapshot.child("public").val();
//     if(public === true){
//       document.getElementById("friends").innerHTML = `
//         <div class="dropdown-menu-item">Friends</div>
//       `
//       document.getElementById("friends-icon").innerHTML = `
//         <i class="search-icon fa fa-users" aria-hidden="true"></i>
//       `
//       document.getElementById("message-icon").innerHTML = `
//         <i class="search-icon fa fa-comments-o" aria-hidden="true"></i>
//       `
//     }else{
//     }
//   })
// }
//


checkAuthState()
//
// function showReqFriendsNum(user){
//   database.ref('/'+user.uid+'/friends').orderByKey().once("value").then((snapshot) => {
//     var num = 0;
//     snapshot.forEach(function(childSnapshot){
//       var profileId = childSnapshot.key;
//       database.ref('/'+user.uid+'/friends/'+profileId).once("value").then((snapshot) => {
//         var status = snapshot.child('status').val();
//         if (status === false){
//           num++;
//           showNumber(num);
//         }else{
//           num = num;
//         }
//       });
//     });
//   });
// }
//
// function showNumber(num){
//   document.getElementById('friends-icon').style.position = 'relative';
//   document.getElementById('friends-icon').innerHTML += `
//     <i class="badge-dot fa fa-circle" aria-hidden="true"></i>
//   `
// }
