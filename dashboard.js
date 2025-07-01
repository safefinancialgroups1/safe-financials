const auth = firebase.auth();
const db = firebase.firestore();

auth.onAuthStateChanged(user => {
  if (!user) {
    alert("Please login first.");
    window.location.href = "index.html";
  } else {
    loadCustomers(user.uid);
  }
});

function submitCustomer() {
  const user = auth.currentUser;
  const id = document.getElementById('custId').value;
  const name = document.getElementById('custName').value;
  const phone = document.getElementById('custPhone').value;
  const balance = parseFloat(document.getElementById('custBalance').value);

  if (!name || !phone || isNaN(balance)) {
    alert("Please fill all fields.");
    return;
  }

  if (id) {
    db.collection("customers").doc(id).update({ name, phone, balance })
      .then(() => {
        alert("Customer updated!");
        clearForm();
        loadCustomers(user.uid);
      });
  } else {
    db.collection("customers").add({ name, phone, balance, userId: user.uid })
      .then(() => {
        alert("Customer added!");
        clearForm();
        loadCustomers(user.uid);
      });
  }
}

function editCustomer(id, name, phone, balance) {
  document.getElementById('custId').value = id;
  document.getElementById('custName').value = name;
  document.getElementById('custPhone').value = phone;
  document.getElementById('custBalance').value = balance;
}

function deleteCustomer(id) {
  if (confirm("Delete this customer?")) {
    db.collection("customers").doc(id).delete()
      .then(() => {
        alert("Customer deleted");
        loadCustomers(auth.currentUser.uid);
      });
  }
}

function clearForm() {
  document.getElementById('custId').value = "";
  document.getElementById('custName').value = "";
  document.getElementById('custPhone').value = "";
  document.getElementById('custBalance').value = "";
}

function loadCustomers(userId) {
  const list = document.getElementById('customerList');
  list.innerHTML = "Loading...";

  db.collection("customers").where("userId", "==", userId).get()
    .then(snapshot => {
      list.innerHTML = "";
      if (snapshot.empty) {
        list.innerHTML = "<p>No customers found.</p>";
        return;
      }
      snapshot.forEach(doc => {
        const data = doc.data();
        const div = document.createElement('div');
        div.innerHTML = `
          <strong>${data.name}</strong><br>
          Phone: ${data.phone}<br>
          Balance: ₹${data.balance}<br>
          <button onclick="editCustomer('${doc.id}', '${data.name}', '${data.phone}', ${data.balance})">Edit</button>
          <button onclick="deleteCustomer('${doc.id}')">Delete</button>
          <button onclick="addTransaction('${doc.id}')">Add Transaction</button>
          <hr>`;
        list.appendChild(div);
        showTransactions(doc.id, div);
      });
    });
}

function addTransaction(customerId) {
  const type = prompt("Enter type (Credit/Debit):");
  const amount = parseFloat(prompt("Enter amount:"));
  const note = prompt("Enter note:");
  const date = new Date().toISOString().split('T')[0];

  if (!type || isNaN(amount)) {
    alert("Invalid transaction");
    return;
  }

  const customerRef = db.collection("customers").doc(customerId);
  const txnRef = customerRef.collection("transactions");

  customerRef.get().then(doc => {
    if (!doc.exists) return;
    let balance = doc.data().balance;
    balance += type === "Credit" ? amount : -amount;

    txnRef.add({ type, amount, note, date })
      .then(() => {
        customerRef.update({ balance });
        alert("Transaction added!");
        loadCustomers(auth.currentUser.uid);
      });
  });
}

function showTransactions(customerId, container) {
  const txnDiv = document.createElement('div');
  txnDiv.innerHTML = "<em>Loading transactions...</em>";
  container.appendChild(txnDiv);

  db.collection("customers").doc(customerId).collection("transactions").orderBy("date", "desc").get()
    .then(snapshot => {
      txnDiv.innerHTML = "<h4>Transactions:</h4>";
      snapshot.forEach(doc => {
        const txn = doc.data();
        txnDiv.innerHTML += `${txn.date} - ${txn.type} ₹${txn.amount} - ${txn.note}<br>`;
      });
    });
}
