var firebaseConfig = {
    apiKey: "AIzaSyB21Kqp1-1glXKqKm9CuQ8qXNCE1Gzc6WM",
    authDomain: "physics-discipline.firebaseapp.com",
    projectId: "physics-discipline",
    storageBucket: "physics-discipline.appspot.com",
    messagingSenderId: "693185276711",
    appId: "1:693185276711:web:42a6715d971b7af7bb9702",
    measurementId: "G-L89PZP7W47"
  };

firebase.initializeApp(firebaseConfig);
firebase.analytics();

const messaging = firebase.messaging();
messaging
    .requestPermission()
    .then(function () {
        console.log("Notification permission granted.");
        return messaging.getToken()
    })
    .then(function(token) {
    })
    .catch(function (err) {
        console.log("Unable to get permission to notify.", err);
    });
