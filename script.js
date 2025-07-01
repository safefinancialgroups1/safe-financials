const auth = firebase.auth();
const adminEmail = "admin@example.com"; // Change this to your admin email

function login() {
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;

  auth.signInWithEmailAndPassword(email, password)
    .then(() => routeUser(email))
    .catch(err => showError(err.message));
}
function signup() {
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;

  auth.createUserWithEmailAndPassword(email, password)
    .then(() => routeUser(email))
    .catch(err => showError(err.message));
}
function googleLogin() {
  const provider = new firebase.auth.GoogleAuthProvider();
  auth.signInWithPopup(provider)
    .then(result => routeUser(result.user.email))
    .catch(err => showError(err.message));
}
function routeUser(email) {
  if (email === adminEmail) {
    window.location.href = "admin.html";
  } else {
    window.location.href = "dashboard.html";
  }
}
function showError(msg) {
  document.getElementById('message').innerText = msg;
}