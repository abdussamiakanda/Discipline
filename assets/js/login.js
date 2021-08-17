var provider = new firebase.auth.GoogleAuthProvider();
var database = firebase.database();
var userdata = null;

const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);
const page = urlParams.get('page');
const pageid = urlParams.get('id');

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
  var isEmail = false;
  var isName = false;
  database.ref('/verified-users').orderByKey().once("value").then((snapshot) => {
    snapshot.forEach(function(childSnapshot){
      var email = snapshot.child(childSnapshot.key+'/email').val();
      var name = snapshot.child(childSnapshot.key+'/name').val();

      if(email === user.email && name){
        isEmail = true;
        isName = true;
      }else if(email === user.email && !name){
        isEmail = true;
        isName = false;
      }
    })

    if(isEmail === true && isName === false){
      registerUser(user);
    }else if(isEmail === true && isName === true){
      verified(user);
    }else if(isEmail === false){
      document.title = "Verify your account";
      document.getElementById('login_form').style.display="none";
      document.getElementById('verify_id').style.display="block";
    }
  })
}

document.getElementById("signup_btn").onclick = function (){
  var name = document.getElementById('name').value;
  var id = document.getElementById('id').value;
  var batch = document.getElementById('batch').value;
  var year = document.getElementById('year').value;
  var term = document.getElementById('term').value;
  var contact = document.getElementById('contact').value;
  var blood_group = document.getElementById('blood_group').value;

  database.ref('/verified-users/'+id).once("value").then((snapshot) => {
    var useremail = snapshot.child('email').exists();
    var username = snapshot.child('name').exists();

    if(useremail === false && username === false){
      alertMessage(type="danger", "Student ID does not match!");
    }else if(useremail === true && username === true){
      alertMessage(type="danger", "Student ID is already in use!");
    }else if (useremail === true && username === false){
      database.ref('/users/'+userdata.uid).update({
        name: name,
        id: id,
        batch: batch,
        year: year,
        term: term,
        contact: contact,
        blood: blood_group,
        type: 'general'
      })
      database.ref('/verified-users/'+id).update({
        name: name
      })
      checkAuthState();
      alertMessage(type="success", "Welcome, "+userdata.displayName);
    }
  })
}

function GoogleLogout() {
  firebase.auth().signOut().then(()=>{
    alertMessage(type="danger", "You're logged out!");
    document.getElementById('login_form').style.display="block";
    document.getElementById('verify_id').style.display="none";
    document.getElementById('signup_form').style.display="none";
    document.getElementById('dashboard_container').style.display = "none";
    document.getElementById('header_right').innerHTML = "";
    document.getElementById('fa_bars').innerHTML = "";
    window.setTimeout(function(){ window.location.assign("./"); }, 1500);
  }).catch((e)=>{
    console.log(e)
  })
}

function checkPage(user){
  if (page === 'dashboard'){
    showUserDashboard(user);
  } else if(page === 'academic-calendar'){
    showAcademicCalendar(user);
  } else if(page === 'term-courses'){
    showTermCourses(user);
  } else if(page === 'course'){
    showCourseDetail(user);
  } else if(page === 'profile'){
    showProfile(user);
  } else if(page === 'teachers'){
    showTeachers(user,database);
  } else if(page === 'cr-privilege'){
    showCRPage(user,database);
  } else if(page === 'my-courses'){
    // showMyCourses(user);
  } else if(page === 'attendance'){
    // showAttendance(user);
  } else if(page === 'important-links'){
    // showImportantLinks(user);
  }else{
    showUserDashboard(user);
  }
}

function showUserDashboard(user){
  document.title = "Dashboard";
  document.getElementById('header_middle').innerHTML = `<h4>Dashboard</h4>`;
  document.getElementById('dashboard').classList.remove('hide');
}

function showAcademicCalendar(user){
  document.title = "Academic Calendar";
  document.getElementById('header_middle').innerHTML = `<h4>Academic Calendar</h4>`;
  document.getElementById('academic-calendar').classList.remove('hide');
}

function showTermCourses(user){
  document.title = "Term Courses";
  document.getElementById('term-courses').classList.remove('hide');
  database.ref('/users/'+user.uid).once("value").then((snapshot) => {
    var term = snapshot.child('term').val();
    document.getElementById('header_middle').innerHTML = `<h4>${term} Term Courses</h4>`;

    database.ref('/'+term+'-term/courses').orderByKey().once("value").then((snapshot) => {
      snapshot.forEach(function(childSnapshot){
        database.ref('/'+term+'-term/courses/'+childSnapshot.key).once("value").then((snapshot) => {
          var no = snapshot.child('no').val().toUpperCase();
          var title = snapshot.child('title').val();
          var type = snapshot.child('type').val();
          var secA = snapshot.child('secA/teacher').val();
          var secB = snapshot.child('secB/teacher').val();

          var courseDiv = document.getElementById('term-courses');
          var courseEl = `
            <div class="course-item" onclick="changeURL('course','${no}')">
              <h6>${no} (${type})</h6>
              <h4>${title}</h4> <hr>
              Section A: ${secA} <br>
              Section B: ${secB}
            </div>
          `
          courseDiv.innerHTML += courseEl;
        })
      })
    })
  })
}

function showCourseDetail(user){
  document.getElementById('header_middle').innerHTML = `<h4>Course No: ${pageid.toUpperCase()}</h4>`;
  document.getElementById('single-course').classList.remove('hide');
  document.getElementById('dashboard_left').style.display = "none"
  document.getElementById('dashboard_right').style.width = "100%";
}

function showProfile(user){
  document.getElementById('header_middle').innerHTML = `<h4>Profile</h4>`;
  document.getElementById('profile-page').classList.remove('hide');
  document.getElementById('dashboard_left').style.display = "none"
  document.getElementById('dashboard_right').style.width = "100%";

  document.getElementById('hello-user').innerHTML = `
    <img src="${user.photoURL}" alt="">
    <h4>Welcome, ${user.displayName}</h4>
  `;
  database.ref('/users/'+user.uid).once("value").then((snapshot) => {
    var name = snapshot.child('name').val();
    var id = snapshot.child('id').val();
    var batch = snapshot.child('batch').val();
    var year = snapshot.child('year').val();
    var term = snapshot.child('term').val();
    var contact = snapshot.child('contact').val();
    var blood = snapshot.child('blood').val();

    document.getElementById('user-data').innerHTML = `
      <table>
        <tr><td>Name</td><td> : </td><td>${name}</td></tr>
        <tr><td>Student ID</td><td> : </td><td>${id}</td></tr>
        <tr><td>Batch</td><td> : </td><td>${batch}</td></tr>
        <tr><td>Year</td><td> : </td><td>${year}</td></tr>
        <tr><td>Term</td><td> : </td><td>${term}</td></tr>
        <tr><td>Contact</td><td> : </td><td>${contact}</td></tr>
        <tr><td>Blood Group</td><td> : </td><td>${blood}</td></tr>
      </table>
      <button class="signup-btn" onClick="hideEditProfile()">Edit Profile</button>
    `;
  })
}

function saveUserData(){
  var name = document.getElementById('name1').value;
  var id = document.getElementById('id1').value;
  var batch = document.getElementById('batch1').value;
  var year = document.getElementById('year1').value;
  var term = document.getElementById('term1').value;
  var contact = document.getElementById('contact1').value;
  var blood_group = document.getElementById('blood_group1').value;

  database.ref('/users/'+userdata.uid).update({
    name: name,
    id: id,
    batch: batch,
    year: year,
    term: term,
    contact: contact,
    blood: blood_group
  })
  document.getElementById('user-data').classList.remove('hide');
  document.getElementById('profile_form').classList.add('hide');
  showProfile(userdata);
  alertMessage(type="success", 'Your profile is updated!');
}

function hideEditProfile(){
  showEditProfileData(userdata,database);
  document.getElementById('user-data').classList.add('hide');
  document.getElementById('profile_form').classList.remove('hide');
}

function showAllClasses(){
  
}

function showAllCTs(){
  
}

function showAllCourses(){
  
}

function showAllTeachers(){
  
}

function showVerifyUsers(){
  
}




checkAuthState()
