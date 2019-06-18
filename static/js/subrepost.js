/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */
// There are no unused vars - they are just in another JS file - these files are linked in HTML
// These functions are invoked from HTML, so they are not unused

function createSubrepost(event) {
  event.preventDefault();
  const form = document.getElementById('subrepost-form');
  const username = document.getElementById('username').innerText;
  const data = { name: form[0].value, description: form[1].value, username };
  fetch('/api/subreposts', {
    method: 'POST',
    json: true,
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  }).then(window.location.reload())
    .catch(err => UIkit.modal.alert(`Something went wrong...\n${err}`));
}
