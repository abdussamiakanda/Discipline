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
        email: userdata.email,
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
    showMyCourses(user);
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
  document.getElementById('calendar-body').innerHTML += "";
  showCalendar(database,user);
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

function showMyCourses(user){
  document.title = "My Courses";
  document.getElementById('header_middle').innerHTML = `<h4>My Courses</h4>`;
  document.getElementById('my-courses').classList.remove('hide');
  document.getElementById('my-retake-contents').innerHTML = '';
  document.getElementById('my-courses-contents').innerHTML = '';

  database.ref('/users/'+user.uid).once("value").then((snapshot) => {
    var term = snapshot.child('term').val();

    database.ref('/'+term+'-term/courses').orderByKey().once("value").then((snapshot) => {
      snapshot.forEach(function(childSnapshot){
        database.ref('/'+term+'-term/courses/'+childSnapshot.key).once("value").then((snapshot) => {
          var no = snapshot.child('no').val().toUpperCase();
          var title = snapshot.child('title').val();
          var type = snapshot.child('type').val();
          var credit = snapshot.child('credit').val();

          var courseDiv = document.getElementById('my-courses-contents');
          var courseEl = `
            <div class="course-item" onclick="changeURL('course','${no}')">
              <h6>${no} (${type})</h6>
              <h4>${title}</h4>
              <p>Credit: ${credit}</p>
            </div>
          `
          courseDiv.innerHTML += courseEl;
        })
      })
    })
  })
  database.ref('/users/'+user.uid+'/courses').once("value").then((snapshot) => {
    snapshot.forEach(function(childSnapshot){
      var term = childSnapshot.val();
      var course = childSnapshot.key;

      database.ref('/'+term+'-term/courses/'+course).once("value").then((snapshot) => {
        var no = snapshot.child('no').val().toUpperCase();
        var title = snapshot.child('title').val();
        var type = snapshot.child('type').val();
        var credit = snapshot.child('credit').val();

        var retakeDiv = document.getElementById('my-retake-contents');
        var retakeEl = `
          <div class="retake-item">
            <div onclick="changeURL('course','${no}')">
              <h6>${no} (${type})</h6>
              <h4>${title}</h4>
              <p>Credit: ${credit} </p>
            </div>
            <div class="dropdown" style="margin-left:6px;">
              <i onclick="hideshowDropMenu('retake-${course}')" class="icon fa fa-ellipsis-v" aria-hidden="true"></i>
              <div class="drop-menu" id="retake-${course}">
                <div class="drop-menu-item" onclick="deleteRetake('${no.toLowerCase()}')">Delete</div>
              </div>
            </div>
          </div>
        `
        retakeDiv.innerHTML += retakeEl;
      })
    })
  })
}

function showAddRetakeForm(){
  let x = document.getElementById('addretakeform');
  if(x.style.display === 'none'){
    x.style.display = 'block';
  }else{
    x.style.display = 'none';
  }
}

function populate(s1,s2){
  var ss1 = document.getElementById(s1);
  var ss2 = document.getElementById(s2);
  ss2.innerHTML = '';

  database.ref('/'+ss1.value+'-term/courses/').orderByKey().once("value").then((snapshot) => {
    snapshot.forEach(function(childSnapshot){
      var courseEl = `<option value="${childSnapshot.key}">${childSnapshot.key.toUpperCase()}</option>`;
      ss2.innerHTML += courseEl;
    })
  })
}

function deleteRetake(no){
  database.ref('/users/'+userdata.uid+'/courses/'+no).remove();
  database.ref('/users/'+userdata.uid).once("value").then((snapshot) => {
    var id = snapshot.child('id').val();
    database.ref('/retake/'+no+'/'+id).remove();
  })
  showMyCourses(userdata);
}

function addRetakeToDatabase(){
  var term = document.getElementById('term8').value;
  var course = document.getElementById('course8').value;

  database.ref('/users/'+userdata.uid).once("value").then((snapshot) => {
    var isAvail = snapshot.child('courses/'+course).exists();
    var isterm = snapshot.child('term').val();
    var id = snapshot.child('id').val();
    var email = snapshot.child('email').val();

    if(isterm === term){
      alertMessage(type="success", "You can't add "+term+" term courses as retake!");
    }else{
      if(isAvail === true){
        alertMessage(type="success", 'Course already exists in your retake list!');
      }else{
        var data = {};
        data[course] = term;
        database.ref('/users/'+userdata.uid+'/courses').update(data);
        var data1 = {};
        data1[id] = email;
        database.ref('/retake/'+course).update(data1);
        document.getElementById('addretakeform').style.display = 'none';
        showMyCourses(userdata);
        document.getElementById("retakeaddform8").reset();
      }
    }
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

function showAllClassePage(){
  document.getElementById('allclasspage').style.display = 'block';
  document.getElementById('allctpage').style.display = 'none';
  document.getElementById('allcoursepage').style.display = 'none';
  document.getElementById('allteacherpage').style.display = 'none';
  document.getElementById('allverifieduserpage').style.display = 'none';
  document.getElementById('allresourcepage').style.display = 'none';
  showAllClasses();
}

function showAllCTPage(){
  document.getElementById('allclasspage').style.display = 'none';
  document.getElementById('allctpage').style.display = 'block';
  document.getElementById('allcoursepage').style.display = 'none';
  document.getElementById('allteacherpage').style.display = 'none';
  document.getElementById('allverifieduserpage').style.display = 'none';
  document.getElementById('allresourcepage').style.display = 'none';
  showAllCTs();
}

function showAllCoursePage(){
  document.getElementById('allclasspage').style.display = 'none';
  document.getElementById('allctpage').style.display = 'none';
  document.getElementById('allcoursepage').style.display = 'block';
  document.getElementById('allteacherpage').style.display = 'none';
  document.getElementById('allverifieduserpage').style.display = 'none';
  document.getElementById('allresourcepage').style.display = 'none';
  showAllCourses();
}

function showAllTeacherPage(){
  document.getElementById('allclasspage').style.display = 'none';
  document.getElementById('allctpage').style.display = 'none';
  document.getElementById('allcoursepage').style.display = 'none';
  document.getElementById('allteacherpage').style.display = 'block';
  document.getElementById('allverifieduserpage').style.display = 'none';
  document.getElementById('allresourcepage').style.display = 'none';
  showAllTeachers();
}

function showVerifyUserPage(){
  document.getElementById('allclasspage').style.display = 'none';
  document.getElementById('allctpage').style.display = 'none';
  document.getElementById('allcoursepage').style.display = 'none';
  document.getElementById('allteacherpage').style.display = 'none';
  document.getElementById('allverifieduserpage').style.display = 'block';
  document.getElementById('allresourcepage').style.display = 'none';
  showVerifyUsers();
}

function showAllResourcesPage(){
  document.getElementById('allclasspage').style.display = 'none';
  document.getElementById('allctpage').style.display = 'none';
  document.getElementById('allcoursepage').style.display = 'none';
  document.getElementById('allteacherpage').style.display = 'none';
  document.getElementById('allverifieduserpage').style.display = 'none';
  document.getElementById('allresourcepage').style.display = 'block';
  showAllResources();
}

// ALL CLASSES

function showAllClasses(){
  document.getElementById('allclasses').innerHTML = ``;
  database.ref('/users/'+userdata.uid).once("value").then((snapshot) => {
    var term = snapshot.child('term').val();
    database.ref('/'+term+'-term/classes').orderByKey().once("value").then((snapshot) => {
      snapshot.forEach(function(childSnapshot){
        var course = snapshot.child(childSnapshot.key+'/course').val();
        var location = snapshot.child(childSnapshot.key+'/location').val();
        var section = snapshot.child(childSnapshot.key+'/section').val();
        var time = snapshot.child(childSnapshot.key+'/time').val();
        var topics = snapshot.child(childSnapshot.key+'/topics').val();

        database.ref('/'+term+'-term/courses/'+course).once("value").then((snapshot) => {
          var title = snapshot.child('title').val();
          var teacher = snapshot.child('sec'+section+'/teacher').val();

          var classEl = `
            <div class="class-item">
              <div class="class-details">
                <div class="class-left">
                  Course No: ${course.toUpperCase()} <br>
                  Course Title: ${title} <br>
                  Section: ${section} <br>
                  Instructor: ${teacher}
                </div>
                <div class="class-left">
                  Location: Room-${location} <br>
                  Time: ${time} <br>
                  Topics: ${topics}
                </div>
                <div class="dropdown">
                  <i onclick="hideshowDropMenu('course-${childSnapshot.key}')" class="icon fa fa-ellipsis-v" aria-hidden="true"></i>
                  <div class="drop-menu" id="course-${childSnapshot.key}">
                    <div class="drop-menu-item" onclick="deleteClass('${term}','${childSnapshot.key}')">Delete</div>
                  </div>
                </div>
              </div>
            </div>
          `
          document.getElementById('allclasses').innerHTML += classEl;
        })
      })
    })
  })
}

function deleteClass(term,id){
  database.ref('/'+term+'-term/classes/'+id).remove();
  registerCRactivity(database,userdata.displayName+' deleted a class from the database','Term: '+term+'; Classid: '+id);
  showAllClasses();
}

function showAddClassForm(){
  let x = document.getElementById('addclassform');
  if(x.style.display === 'none'){
    x.style.display = 'block';
    showAddClassFormData();
  }else{
    x.style.display = 'none';
  }
}

function showAddClassFormData(){
  document.getElementById('courseno2').innerHTML = '';
  database.ref('/users/'+userdata.uid).once("value").then((snapshot) => {
    var term = snapshot.child('term').val();
    database.ref('/'+term+'-term/courses').orderByKey().once("value").then((snapshot) => {
      snapshot.forEach(function(childSnapshot){
        let formEl = `<option value="${childSnapshot.key}">${childSnapshot.key.toUpperCase()}</option>`;
        document.getElementById('courseno2').innerHTML += formEl;
      })
    })
  })
}

function addClassToDatabase(){
  var course = document.getElementById('courseno2').value;
  var section = document.getElementById('section2').value;
  var location = document.getElementById('location2').value;
  var time = document.getElementById('time2').value;
  var topics = document.getElementById('topics2').value;
  var date1 = new Date(time);
  var classid = Date.parse(time);
  var date = date1.toLocaleString('en-BD',{hour:'numeric',minute:'numeric',hour12:true,day:'2-digit',month:"long",year:"numeric"});

  database.ref('/users/'+userdata.uid).once("value").then((snapshot) => {
    var term = snapshot.child('term').val();
    database.ref('/'+term+'-term/classes/'+classid).once("value").then((snapshot) => {
      var isAvail = snapshot.child('section').exists();

      if(isAvail === true){
        alertMessage(type="success", 'Class is already scheduled for this time!');
      }else{
        database.ref('/'+term+'-term/classes/'+classid).update({
          course: course,
          location: location,
          section: section,
          time: date,
          topics: topics
        })
        document.getElementById('addclassform').style.display = 'none';
        showAllClasses();
        document.getElementById("classaddform1").reset();
        registerCRactivity(database,userdata.displayName+' added a new class to database','Course No: '+course+'; Section: '+section+'; Time: '+date);
        // sendNotification(course,);
        // sendEmail();
      }
    })
  })
}

// CTS

function showAllCTs(){
  document.getElementById('allcts').innerHTML = ``;
  database.ref('/users/'+userdata.uid).once("value").then((snapshot) => {
    var term = snapshot.child('term').val();
    database.ref('/'+term+'-term/cts').orderByKey().once("value").then((snapshot) => {
      snapshot.forEach(function(childSnapshot){
        var course = snapshot.child(childSnapshot.key+'/course').val();
        var location = snapshot.child(childSnapshot.key+'/location').val();
        var section = snapshot.child(childSnapshot.key+'/section').val();
        var time = snapshot.child(childSnapshot.key+'/time').val();
        var topics = snapshot.child(childSnapshot.key+'/topics').val();
        var type = snapshot.child(childSnapshot.key+'/type').val();

        database.ref('/'+term+'-term/courses/'+course).once("value").then((snapshot) => {
          var title = snapshot.child('title').val();
          var teacher = snapshot.child('sec'+section+'/teacher').val();

          var classEl = `
            <div class="class-item">
              <div class="class-details">
                <div class="class-left">
                  <h4>Type: ${type}</h4>
                  Course No: ${course.toUpperCase()} <br>
                  Course Title: ${title} <br>
                  Section: ${section}
                </div>
                <div class="class-left">
                  Instructor: ${teacher} <br>
                  Location: Room-${location} <br>
                  Time: ${time} <br>
                  Topics: ${topics}
                </div>
                <div class="dropdown">
                  <i onclick="hideshowDropMenu('ct-${childSnapshot.key}')" class="icon fa fa-ellipsis-v" aria-hidden="true"></i>
                  <div class="drop-menu" id="ct-${childSnapshot.key}">
                    <div class="drop-menu-item" onclick="deleteCT('${term}','${childSnapshot.key}')">Delete</div>
                  </div>
                </div>
              </div>
            </div>
          `
          document.getElementById('allcts').innerHTML += classEl;
        })
      })
    })
  })
}

function deleteCT(term,id){
  database.ref('/'+term+'-term/cts/'+id).remove();
  registerCRactivity(database,userdata.displayName+' deleted a CT from the database','Term: '+term+'; CTid: '+id);
  showAllCTs();
}

function showAddCTForm(){
  let x = document.getElementById('addctform');
  if(x.style.display === 'none'){
    x.style.display = 'block';
    showAddCTFormData();
  }else{
    x.style.display = 'none';
  }
}

function showAddCTFormData(){
  document.getElementById('courseno3').innerHTML = '';
  database.ref('/users/'+userdata.uid).once("value").then((snapshot) => {
    var term = snapshot.child('term').val();
    database.ref('/'+term+'-term/courses').orderByKey().once("value").then((snapshot) => {
      snapshot.forEach(function(childSnapshot){
        let formEl = `<option value="${childSnapshot.key}">${childSnapshot.key.toUpperCase()}</option>`;
        document.getElementById('courseno3').innerHTML += formEl;
      })
    })
  })
}

function addCTToDatabase(){
  var type = document.getElementById('type3').value;
  var course = document.getElementById('courseno3').value;
  var section = document.getElementById('section3').value;
  var location = document.getElementById('location3').value;
  var time = document.getElementById('time3').value;
  var topics = document.getElementById('topics3').value;
  var date1 = new Date(time);
  var ctid = Date.parse(time);
  var date = date1.toLocaleString('en-BD',{hour:'numeric',minute:'numeric',hour12:true,day:'2-digit',month:"long",year:"numeric"});

  database.ref('/users/'+userdata.uid).once("value").then((snapshot) => {
    var term = snapshot.child('term').val();
    database.ref('/'+term+'-term/cts/'+ctid).once("value").then((snapshot) => {
      var isAvail = snapshot.child('section').exists();

      if(isAvail === true){
        alertMessage(type="success", 'CT is already scheduled for this time!');
      }else{
        database.ref('/'+term+'-term/cts/'+ctid).update({
          type: type,
          course: course,
          location: location,
          section: section,
          time: date,
          topics: topics
        })
        document.getElementById('addctform').style.display = 'none';
        showAllCTs();
        document.getElementById("ctaddform1").reset();
        registerCRactivity(database,userdata.displayName+' added a new '+type+' to database','Course No: '+course+'; Section: '+section+'; Time: '+date);
        // sendNotification(course,);
        // sendEmail();
      }
    })
  })
}

// RESOURCES

function showAllResources(){
  document.getElementById('allresources').innerHTML = ``;
  database.ref('/users/'+userdata.uid).once("value").then((snapshot) => {
    var term = snapshot.child('term').val();
    database.ref('/'+term+'-term/resources').orderByKey().once("value").then((snapshot) => {
      snapshot.forEach(function(childSnapshot){
        var course = snapshot.child(childSnapshot.key+'/course').val();
        var section = snapshot.child(childSnapshot.key+'/section').val();
        var url = snapshot.child(childSnapshot.key+'/url').val();
        var details = snapshot.child(childSnapshot.key+'/details').val();
        var type = snapshot.child(childSnapshot.key+'/type').val();

        var resourceEl = `
          <div class="class-item">
            <div class="class-details">
              <div class="class-left">
                <h4>Type: ${type}</h4>
                Course No: ${course.toUpperCase()} <br>
                Section: ${section}
              </div>
              <div class="class-left">
                URL: ${url} <br>
                Details: ${details}
              </div>
              <div class="dropdown">
                <i onclick="hideshowDropMenu('res-${childSnapshot.key}')" class="icon fa fa-ellipsis-v" aria-hidden="true"></i>
                <div class="drop-menu" id="res-${childSnapshot.key}">
                  <div class="drop-menu-item" onclick="deleteResource('${term}','${childSnapshot.key}')">Delete</div>
                </div>
              </div>
            </div>
          </div>
        `
        document.getElementById('allresources').innerHTML += resourceEl;
      })
    })
  })
}

function deleteResource(term,id){
  database.ref('/'+term+'-term/resources/'+id).remove();
  registerCRactivity(database,userdata.displayName+' deleted a resource from the database','Term: '+term+'; ResourceId: '+id);
  showAllResources();
}

function showAddResourceForm(){
  let x = document.getElementById('addresourceform');
  if(x.style.display === 'none'){
    x.style.display = 'block';
    showAddResourceFormData();
  }else{
    x.style.display = 'none';
  }
}

function showAddResourceFormData(){
  document.getElementById('courseno3').innerHTML = '';
  database.ref('/users/'+userdata.uid).once("value").then((snapshot) => {
    var term = snapshot.child('term').val();
    database.ref('/'+term+'-term/courses').orderByKey().once("value").then((snapshot) => {
      snapshot.forEach(function(childSnapshot){
        let formEl = `<option value="${childSnapshot.key}">${childSnapshot.key.toUpperCase()}</option>`;
        document.getElementById('courseno7').innerHTML += formEl;
      })
    })
  })
}

function addResourceToDatabase(){
  var type = document.getElementById('type7').value;
  var course = document.getElementById('courseno7').value;
  var section = document.getElementById('section7').value;
  var url = document.getElementById('url7').value;
  var details = document.getElementById('details7').value;
  var date1 = new Date();
  var resid = Date.parse(date1);
  var date = date1.toLocaleString('en-BD',{hour:'numeric',minute:'numeric',hour12:true,day:'2-digit',month:"long",year:"numeric"});

  database.ref('/users/'+userdata.uid).once("value").then((snapshot) => {
    var term = snapshot.child('term').val();
    database.ref('/'+term+'-term/resources/'+resid).once("value").then((snapshot) => {
      var isAvail = snapshot.child('section').exists();

      if(isAvail === true){
        alertMessage(type="success", 'File already exist!');
      }else{
        database.ref('/'+term+'-term/resources/'+resid).update({
          type: type,
          course: course,
          section: section,
          added: date,
          url: url,
          details: details
        })
        document.getElementById('addresourceform').style.display = 'none';
        showAllResources();
        document.getElementById("resourceform1").reset();
        registerCRactivity(database,userdata.displayName+' added a new resource to database','Course No: '+course+'; Section: '+section+'; URL: '+url+'; Details: '+details);
        // sendNotification(course,);
        // sendEmail();
      }
    })
  })
}

// COURSES

function showAllCourses(){
  document.getElementById('allcoursess').innerHTML = ``;
  database.ref('/users/'+userdata.uid).once("value").then((snapshot) => {
    var term = snapshot.child('term').val();
    database.ref('/'+term+'-term/courses').orderByKey().once("value").then((snapshot) => {
      snapshot.forEach(function(childSnapshot){
        var no = snapshot.child(childSnapshot.key+'/no').val();
        var title = snapshot.child(childSnapshot.key+'/title').val();
        var credit = snapshot.child(childSnapshot.key+'/credit').val();
        var type = snapshot.child(childSnapshot.key+'/type').val();
        var secA = snapshot.child(childSnapshot.key+'/secA/teacher').val();
        var secB = snapshot.child(childSnapshot.key+'/secB/teacher').val();
        var syllabus = snapshot.child(childSnapshot.key+'/syllabus').val();

        var classEl = `
          <div class="class-item">
            <div class="class-details">
              <div class="class-left">
                Course No: ${no.toUpperCase()} <br>
                Course Title: ${title} <br>
                Course Type: ${type} <br>
                Course Credit: ${credit}
              </div>
              <div class="class-left">
                Section A: ${secA} <br>
                Section B: ${secB} <br>
                Syllabus: <a target="_blank" href="${syllabus}">Download</a>
              </div>
              <div class="dropdown">
                <i onclick="hideshowDropMenu('courseno-${childSnapshot.key}')" class="icon fa fa-ellipsis-v" aria-hidden="true"></i>
                <div class="drop-menu" id="courseno-${childSnapshot.key}">
                  <div class="drop-menu-item" onclick="deleteCourse('${term}','${childSnapshot.key}')">Delete</div>
                </div>
              </div>
            </div>
          </div>
        `
        document.getElementById('allcoursess').innerHTML += classEl;
      })
    })
  })
}

function deleteCourse(term,id){
  database.ref('/'+term+'-term/courses/'+id).remove();
  registerCRactivity(database,userdata.displayName+' deleted a course from the database','Term: '+term+'; Id: '+id);
  showAllCourses();
}

function showAddCourseForm(){
  let x = document.getElementById('addcourseform');
  if(x.style.display === 'none'){
    x.style.display = 'block';
    showAddCourseFormData();
  }else{
    x.style.display = 'none';
  }
}

function showAddCourseFormData(){
  var xx = document.getElementById('secA4');
  var xy = document.getElementById('secB4');
  xx.innerHTML = '';
  xy.innerHTML = '';
  xx.innerHTML += '<option>Select Instructor of Section A</option>';
  xy.innerHTML += '<option>Select Instructor of Section B</option>';
  database.ref('/teachers').orderByKey().once("value").then((snapshot) => {
    snapshot.forEach(function(childSnapshot){
      var teacher = snapshot.child(childSnapshot.key+'/name').val();
      var type = snapshot.child(childSnapshot.key+'/type').val();

      if(type === 'teacher'){
        let formEl = `<option value="${teacher}">${teacher}</option>`;
        xx.innerHTML += formEl;
        xy.innerHTML += formEl;
      }
    })
  })
}

function addCourseToDatabase(){
  var no = document.getElementById('courseno4').value.toLowerCase();
  var title = document.getElementById('coursetitle4').value;
  var type = document.getElementById('type4').value;
  var secA = document.getElementById('secA4').value;
  var secB = document.getElementById('secB4').value;
  var syllabus = document.getElementById('syllabus4').value;
  var credit = document.getElementById('credit4').value;

  database.ref('/users/'+userdata.uid).once("value").then((snapshot) => {
    var term = snapshot.child('term').val();
    database.ref('/'+term+'-term/courses/'+no).once("value").then((snapshot) => {
      var isAvail = snapshot.child('no').exists();

      if(isAvail === true){
        alertMessage(type="success", 'Course No already exists!');
      }else{
        database.ref('/'+term+'-term/courses/'+no).update({
          no: no,
          secA: {
            teacher: secA
          },
          secB: {
            teacher: secB
          },
          title: title,
          type: type,
          syllabus: syllabus,
          credit: credit
        })
        document.getElementById('addcourseform').style.display = 'none';
        showAllCourses();
        document.getElementById("courseaddform4").reset();
        registerCRactivity(database,userdata.displayName+' added a new course to database','Course No: '+no+'; Title: '+title);
      }
    })
  })
}

// ALL users

function showVerifyUsers(){
  document.getElementById('allusers5').innerHTML = ``;
  database.ref('/verified-users').orderByKey().once("value").then((snapshot) => {
    snapshot.forEach(function(childSnapshot){
      var email = snapshot.child(childSnapshot.key+'/email').val();

      var userEl = `
        <div class="class-item">
          <div class="class-details">
            <div style="width:30%">
              ID: ${childSnapshot.key}
            </div>
            <div class="class-left">
              Email: ${email}
            </div>
            <div class="dropdown">
              <i onclick="hideshowDropMenu('sid-${childSnapshot.key}')" class="icon fa fa-ellipsis-v" aria-hidden="true"></i>
              <div class="drop-menu" id="sid-${childSnapshot.key}">
                <div class="drop-menu-item" onclick="deleteID('${childSnapshot.key}')">Delete</div>
              </div>
            </div>
          </div>
        </div>
      `
      document.getElementById('allusers5').innerHTML += userEl;
    })
  })
}

function deleteID(id){
  database.ref('/verified-users/'+id).remove();
  registerCRactivity(database,userdata.displayName+' deleted a verified user from the database','Id: '+id);
  showVerifyUsers();
}

function addUserToDatabase(){
  var id = document.getElementById('id5').value.toLowerCase();
  var email = document.getElementById('email5').value;

  database.ref('/verified-users/'+id).once("value").then((snapshot) => {
    var isAvail = snapshot.child('email').exists();

    if(isAvail === true){
      alertMessage(type="success", 'Student id is already verified!');
    }else{
      database.ref('/verified-users/'+id).update({
        email: email
      })
      document.getElementById("useraddform5").reset();
      showVerifyUsers();
      registerCRactivity(database,userdata.displayName+' added a new user to database','ID: '+id+'; Email: '+email);
      sendVerifyEmail(id,email);
    }
  })
}

// TEACHERS DONE

function showAllTeachers(){
  document.getElementById('allteachersstaff').innerHTML = ``;
  database.ref('/users/'+userdata.uid).once("value").then((snapshot) => {
    var term = snapshot.child('term').val();
    database.ref('/teachers').orderByKey().once("value").then((snapshot) => {
      snapshot.forEach(function(childSnapshot){
        var id = snapshot.child(childSnapshot.key+'/id').val();
        var name = snapshot.child(childSnapshot.key+'/name').val();
        var contact = snapshot.child(childSnapshot.key+'/contact').val();
        var desig = snapshot.child(childSnapshot.key+'/desig').val();
        var discipline = snapshot.child(childSnapshot.key+'/discipline').val();
        var email = snapshot.child(childSnapshot.key+'/email').val();
        var image = snapshot.child(childSnapshot.key+'/image').val();
        var office = snapshot.child(childSnapshot.key+'/office').val();
        var type = snapshot.child(childSnapshot.key+'/type').val();
        var varsity = snapshot.child(childSnapshot.key+'/varsity').val();
        var web = snapshot.child(childSnapshot.key+'/web').val();

        var classEl = `
          <div class="class-item">
            <div class="class-details">
              <img class="just-image" src="${image}" alt="">
              <div class="class-left">
                Short: ${id.toUpperCase()} <br>
                Name: ${name} <br>
                Designation: ${desig} <br>
                ${discipline} Discipline <br>
                ${varsity}
              </div>
              <div class="class-left">
                Office: Room-${office} <br>
                Contact: ${contact} <br>
                Email: ${email} <br>
                Type: ${type.capitalize()} <br>
                Web: <a target="_blank" href="${web}">Click here</a>
              </div>
              <div class="dropdown">
                <i onclick="hideshowDropMenu('teacher-${childSnapshot.key}')" class="icon fa fa-ellipsis-v" aria-hidden="true"></i>
                <div class="drop-menu" id="teacher-${childSnapshot.key}">
                  <div class="drop-menu-item" onclick="deleteTeacher('${childSnapshot.key}')">Delete</div>
                </div>
              </div>
            </div>
          </div>
        `
        document.getElementById('allteachersstaff').innerHTML += classEl;
      })
    })
  })
}

function deleteTeacher(id){
  database.ref('/teachers/'+id).remove();
  registerCRactivity(database,userdata.displayName+' deleted a teacher/staff from the database','Id: '+id);
  showAllTeachers();
}

function showAddTeacherForm(){
  let x = document.getElementById('addteacherform');
  if(x.style.display === 'none'){
    x.style.display = 'block';
  }else{
    x.style.display = 'none';
  }
}

function addTeacherToDatabase(){
  var id = document.getElementById('id6').value.toLowerCase();
  var name = document.getElementById('name6').value;
  var type = document.getElementById('type6').value;
  var desig = document.getElementById('desig6').value;
  var discipline = document.getElementById('discipline6').value;
  var varsity = document.getElementById('varsity6').value;
  var office = document.getElementById('office6').value;
  var email = document.getElementById('email6').value;
  var contact = document.getElementById('contact6').value;
  var image = document.getElementById('image6').value;
  var web = document.getElementById('web6').value;

  database.ref('/teachers/'+id).once("value").then((snapshot) => {
    var isAvail = snapshot.child('id').exists();

    if(isAvail === true){
      alertMessage(type="success", type.capitalize()+' already exists!');
    }else{
      database.ref('/teachers/'+id).update({
        id: id,
        name: name,
        type: type,
        desig: desig,
        discipline: discipline,
        varsity: varsity,
        office: office,
        email: email,
        contact: contact,
        image: image,
        web: web
      })
      document.getElementById('addteacherform').style.display = 'none';
      showAllTeachers();
      document.getElementById("teacheraddform6").reset();
      registerCRactivity(database,userdata.displayName+' added a new '+type+' to database','Name: '+name+'; Email: '+email+'; Contact: '+contact+'; Discipline: '+discipline);
    }
  })
}






// term,course,subject,body
function sendEmail(){
  Email.send({
    SecureToken : "50196c1a-e09a-4139-830b-ac7e501fbefb",
  	To : 'abdussamiakanda@gmail.com',
  	From : "physicsdiscipline@gmail.com",
  	Subject : 'ok',
  	Body : 'Hello, <br> Welcome to the DISCIPLINE web app. You email address  has been verified to our website by your batch CR. Use your student id:  when you sign up to the website. Click: https://abdussamiakanda.github.io/Discipline/ <br> Thank you.',
  })
}

function sendVerifyEmail(id,email){
  Email.send({
    SecureToken : "50196c1a-e09a-4139-830b-ac7e501fbefb",
  	To : email,
  	From : "physicsdiscipline@gmail.com",
  	Subject : 'Hello from Discipline',
  	Body : 'Hello user, <br> Welcome to the DISCIPLINE web app. You email address '+email+' has been verified to our website by your batch CR. Use your student id: '+id+' when you sign up to the website. <br> Click on this link to get started: https://abdussamiakanda.github.io/Discipline/ <br> Thank you.',
  })
}

function listenForNotification(user){
  database.ref('/users/'+user.uid+'/notifications').on('child_added', function (snapshot){
    document.getElementById('notifications').innerHTML += `
      <div class="notification">
        <span class="closebtn" onclick="deleteNotification('${user.uid}','${childSnapshot.key}')">&times;</span>
        <b>${snapshot.val().title}</b><br>${snapshot.val().content}
      </div>
    `
  })
}

function showNotification(user){
  document.getElementById('notifications').innerHTML = "";
  database.ref('/users/'+user.uid+'/notifications').orderByKey().once("value").then((snapshot) => {
    snapshot.forEach(function(childSnapshot){
      var title = snapshot.child(childSnapshot.key+'/title').val();
      var content = snapshot.child(childSnapshot.key+'/content').val();

      document.getElementById('notifications').innerHTML += `
        <div class="notification">
          <span class="closebtn" onclick="deleteNotification('${user.uid}','${childSnapshot.key}')">&times;</span>
          <b>${title}</b><br>${content}
        </div>
      `
    })
  })
}

function deleteNotification(uid,nid){
  database.ref('/users/'+uid+'/notifications/'+nid).remove();
  showNotification(userdata);
}

String.prototype.capitalize = function() {
    return this.charAt(0).toUpperCase() + this.slice(1);
}

checkAuthState()
