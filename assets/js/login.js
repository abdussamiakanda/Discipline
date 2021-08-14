var provider = new firebase.auth.GoogleAuthProvider();
var database = firebase.database();

document.getElementById('login').addEventListener('click', GoogleLogin)
// document.getElementById('logout').addEventListener('click', LogoutUser)

function GoogleLogin() {
  firebase.auth().signInWithPopup(provider).then(res=>{
    alertMessage(type="success", "You're logged in!")
    verifyUser(user);
  }).catch((e)=>{})
}

function checkAuthState(){
  firebase.auth().onAuthStateChanged(user=>{
    if(user){
      verifyUser(user);
    }else{
      document.title = "Login";
      alertMessage(type="danger", "You're not logged in!")
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
        }
      })
    })
  })
}

function registerUser(user){
  document.title = "Sign Up";
  alertMessage(type="success", "Your email is verified by your CR!<br>Now it's time to sign up.")
  document.getElementById('login_form').style.display="none";
  document.getElementById('signup_form').style.display="block";
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
// function LogoutUser() {
//   firebase.auth().signOut().then(()=>{
//     document.getElementById('user_head').style.display="none";
//     document.getElementById('nonuser_head').style.display="flex";
//     alertMessage(type="danger", "You're logged out!")
//   }).catch((e)=>{
//     console.log(e)
//   })
// }

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
