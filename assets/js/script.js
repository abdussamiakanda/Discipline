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
  document.getElementById('verify_id').style.display="none";
  showDashboard(user);
}

function showDashboard(user){
  document.getElementById('dashboard_container').style.display = "flex";
  document.getElementById('fa_bars').innerHTML = `<i class="search-icon fa fa-bars" onclick="hideshowDashMenu()" aria-hidden="true"></i>`;
  showHeader(user);
  checkPage(user);
  showNotification(user);
  listenForNotification(user);
}

function showHeader(user){
  document.getElementById('header_right').innerHTML = `
    <div onclick="changeURL('search',null)"><i class="search-icon fa fa-search" aria-hidden="true"></i></div>
    <div>${user.displayName}</div>
    <div class="dropdown">
      <div class="user-image-div" onclick="hideshowDropMenu('dropdown-menu')"><img class="header-image" src="${user.photoURL}" alt=""></div>
      <div class="dropdown-menu" id="dropdown-menu">
        <div class="dropdown-menu-item" onclick="changeURL('profile',null)">Profile</div>
        <div class="dropdown-menu-item" onClick="GoogleLogout()">Logout</div>
      </div>
    </div>`
}

function hideshowDashMenu(){
  var x = document.getElementById('dashboard_left');
  if(x.style.display === "none"){
    x.style.display = "flex";
    document.getElementById('dashboard_right').style.width = "80%";
  } else {
    x.style.display = "none";
    document.getElementById('dashboard_right').style.width = "100%";
  }
}

function hideshowDropMenu(id){
  if(document.getElementById(id).style.display === "none"){
    document.getElementById(id).style.display = "block";
  } else {
    document.getElementById(id).style.display = "none";
  }
}

function changeURL(page,id){
  if(id){
    window.location.search = "page="+page+"&id="+id;
  }else{
    window.location.search = "page="+page;
  }
  return false;
}

function cancelEditProfile(){
  document.getElementById('user-data').classList.remove('hide');
  document.getElementById('profile_form').classList.add('hide');
}

function showEditProfileData(user,database){
  database.ref('/users/'+user.uid).once("value").then((snapshot) => {
    var name = snapshot.child('name').val();
    var id = snapshot.child('id').val();
    var batch = snapshot.child('batch').val();
    var year = snapshot.child('year').val();
    var term = snapshot.child('term').val();
    var contact = snapshot.child('contact').val();
    var blood = snapshot.child('blood').val();
    var years = ['1st','2nd','3rd','4th'];
    var terms = ['11','12','21','22','31','32','41','42'];
    var bloods = ['A (+ve)','B (+ve)','AB (+ve)','O (+ve)','A (-ve)','B (-ve)','AB (-ve)','O (-ve)'];
    var isYear = [];
    var isTerm = [];
    var isBlood = [];

    for (let x=0; x < years.length; x++){
      if (year === years[x]){
        isYear[x] = "selected";
        console.log(x,isYear[x])
      }else{
        isYear[x] = null;
      }
    }
    for (let y=0; y < terms.length; y++){
      if (term === terms[y]){
        isTerm[y] = "selected";
        console.log(y,isTerm[y])
      }else{
        isTerm[y] = null;
      }
    }
    for (let z=0; z < bloods.length; z++){
      if (blood === bloods[z]){
        isBlood[z] = "selected";
        console.log(z,isBlood[z])
      }else{
        isBlood[z] = null;
      }
    }

    document.getElementById('profile_form').innerHTML = `
    <form onSubmit="return false;">
      <table>
        <tr>
          <td>Name</td><td> : </td>
          <td><input type="text" id="name1" placeholder="Enter your name.." value="${name}"></td>
        </tr>
        <tr>
          <td>Student ID</td><td> : </td>
          <td><input type="number" id="id1" placeholder="Enter student ID.." pattern="/^-?\d+\.?\d*$/" onKeyPress="if(this.value.length==6) return false;" value="${id}"></td>
        </tr>
        <tr>
          <td>Batch</td><td> : </td>
          <td><input type="number" id="batch1" placeholder="Enter your batch.." pattern="/^-?\d+\.?\d*$/" onKeyPress="if(this.value.length==2) return false;" value="${batch}"></td>
        </tr>
        <tr>
          <td>Year</td><td> : </td>
          <td>
            <select id="year1">
              <option value="1st" ${isYear[0]}>1st Year</option>
              <option value="2nd" ${isYear[1]}>2nd Year</option>
              <option value="3rd" ${isYear[2]}>3rd Year</option>
              <option value="4th" ${isYear[3]}>4th Year</option>
            </select>
          </td>
        </tr>
        <tr>
          <td>Term</td><td> : </td>
          <td>
            <select id="term1">
              <option value="11" ${isTerm[0]}>11 Term</option>
              <option value="12" ${isTerm[1]}>12 Term</option>
              <option value="21" ${isTerm[2]}>21 Term</option>
              <option value="22" ${isTerm[3]}>22 Term</option>
              <option value="31" ${isTerm[4]}>31 Term</option>
              <option value="32" ${isTerm[5]}>32 Term</option>
              <option value="41" ${isTerm[6]}>41 Term</option>
              <option value="42" ${isTerm[7]}>42 Term</option>
            </select>
          </td>
        </tr>
        <tr>
          <td>Contact</td><td> : </td>
          <td><input type="number" id="contact1" placeholder="Enter contact number.." pattern="/^-?\d+\.?\d*$/" onKeyPress="if(this.value.length==11) return false;" value="${contact}"></td>
        </tr>
        <tr>
          <td>Blood Group</td><td> : </td>
          <td>
            <select id="blood_group1">
              <option value="A (+ve)" ${isBlood[0]}>A (+ve)</option>
              <option value="B (+ve)" ${isBlood[1]}>B (+ve)</option>
              <option value="AB (+ve)" ${isBlood[2]}>AB (+ve)</option>
              <option value="O (+ve)" ${isBlood[3]}>O (+ve)</option>
              <option value="A (-ve)" ${isBlood[4]}>A (-ve)</option>
              <option value="B (-ve)" ${isBlood[5]}>B (-ve)</option>
              <option value="AB (-ve)" ${isBlood[6]}>AB (-ve)</option>
              <option value="O (-ve)" ${isBlood[7]}>O (-ve)</option>
            </select>
          </td>
        </tr>
      </table>
      <button type="submit" class="reverse-btn" onClick="saveUserData()">Save Profile</button>
    </form>
    <button class="signup-btn" onClick="cancelEditProfile()">Cancel</button>
    `
  })
}

function showTeachers(user,database){
  document.title = "Teachers & Staffs";
  document.getElementById('header_middle').innerHTML = `<h4>Teachers & Staffs</h4>`;
  document.getElementById('teachers').classList.remove('hide');
  database.ref('/teachers').orderByKey().once("value").then((snapshot) => {
    snapshot.forEach(function(childSnapshot){
      var name = snapshot.child(childSnapshot.key+'/name').val();
      var image = snapshot.child(childSnapshot.key+'/image').val();
      var desig = snapshot.child(childSnapshot.key+'/desig').val();
      var office = snapshot.child(childSnapshot.key+'/office').val();
      var discipline = snapshot.child(childSnapshot.key+'/discipline').val();
      var varsity = snapshot.child(childSnapshot.key+'/varsity').val();
      var contact = snapshot.child(childSnapshot.key+'/contact').val();
      var email = snapshot.child(childSnapshot.key+'/email').val();
      var web = snapshot.child(childSnapshot.key+'/web').val();
      var type = snapshot.child(childSnapshot.key+'/type').val();

      if(type === 'teacher'){
        var teachEl = `
          <div class="teacher-item">
            <img src="${image}" alt="">
            <div class="teacher-content">
              <strong>${name}</strong> <br>
              ${desig} <br>
              Room-${office} <br>
              ${discipline} Discipline <br>
              ${varsity} <br>
              <a target="_blank" href="tel:${contact}"><i class="link-icon fa fa-phone" aria-hidden="true"></i></a>
              <a target="_blank" href="mailto:${email}"><i class="link-icon fa fa-envelope" aria-hidden="true"></i></a>
              <a target="_blank" href="${web}"><i class="link-icon fa fa-globe" aria-hidden="true"></i></a>
            </div>
          </div>
        `
        document.getElementById('teachers_items').innerHTML += teachEl;
      }
    })
  })
  database.ref('/teachers').orderByKey().once("value").then((snapshot) => {
    snapshot.forEach(function(childSnapshot){
      var name = snapshot.child(childSnapshot.key+'/name').val();
      var image = snapshot.child(childSnapshot.key+'/image').val();
      var desig = snapshot.child(childSnapshot.key+'/desig').val();
      var office = snapshot.child(childSnapshot.key+'/office').val();
      var discipline = snapshot.child(childSnapshot.key+'/discipline').val();
      var varsity = snapshot.child(childSnapshot.key+'/varsity').val();
      var contact = snapshot.child(childSnapshot.key+'/contact').val();
      var email = snapshot.child(childSnapshot.key+'/email').val();
      var web = snapshot.child(childSnapshot.key+'/web').val();
      var type = snapshot.child(childSnapshot.key+'/type').val();

      if(type === 'staff'){
        var teachEl = `
          <div class="teacher-item">
            <img src="${image}" alt="">
            <div class="teacher-content">
              <strong>${name}</strong> <br>
              ${desig} <br>
              Room-${office} <br>
              ${discipline} Discipline <br>
              ${varsity} <br>
              <a target="_blank" href="tel:${contact}"><i class="link-icon fa fa-phone" aria-hidden="true"></i></a>
              <a target="_blank" href="mailto:${email}"><i class="link-icon fa fa-envelope" aria-hidden="true"></i></a>
              <a target="_blank" href="${web}"><i class="link-icon fa fa-globe" aria-hidden="true"></i></a>
            </div>
          </div>
        `
        document.getElementById('staffs_items').innerHTML += teachEl;
      }
    })
  })
}

function showCRPage(user,database){
  document.title = "CR Privileges";
  document.getElementById('header_middle').innerHTML = `<h4>CR Privileges</h4>`;
  document.getElementById('cr-privilege').classList.remove('hide');
  showAllClassePage();
}







function registerCRactivity(database,title,content){
  var time = new Date();
  var date = time.toLocaleString('en-US',{hour:'numeric',minute:'numeric',hour12:true,day:'2-digit',month:"long",year:"numeric"});
  database.ref('/cr-activities/'+Date.parse(time)).update({
    time: date,
    title: title,
    content: content
  })
}

var coll = document.getElementsByClassName("collapsible");
var i;

for (i = 0; i < coll.length; i++) {
    coll[i].addEventListener("click", function() {
        this.classList.toggle("activate");
        var content = this.nextElementSibling;
        if (content.style.display === "block") {
            content.style.display = "none";
        } else {
            content.style.display = "block";
        }
    });
}

var close = document.getElementsByClassName("closebtn");
var i;

for (i = 0; i < close.length; i++) {
  close[i].onclick = function(){
    var div = this.parentElement;
    div.style.opacity = "0";
    setTimeout(function(){ div.style.display = "none"; }, 600);
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
