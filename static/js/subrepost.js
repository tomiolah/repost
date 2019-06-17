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
