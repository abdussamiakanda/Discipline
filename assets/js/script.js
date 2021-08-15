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

function showDashboard(user){
  document.getElementById('dashboard_container').style.display = "flex";
  document.getElementById('fa_bars').innerHTML = `<i class="search-icon fa fa-bars" onclick="hideshowDashMenu()" aria-hidden="true"></i>`;
  showHeader(user);
  checkPage(user);
}

function showHeader(user){
  document.getElementById('header_right').innerHTML = `
    <a href="./search.html"><i class="search-icon fa fa-search" aria-hidden="true"></i></a>
    <div>${user.displayName}</div>
    <div class="dropdown">
      <div class="user-image-div" onclick="hideshowDropMenu()"><img class="header-image" src="${user.photoURL}" alt=""></div>
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

function hideshowDropMenu(){
  if(document.getElementById('dropdown-menu').style.display === "none"){
    document.getElementById('dropdown-menu').style.display = "block";
  } else {
    document.getElementById('dropdown-menu').style.display = "none";
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
