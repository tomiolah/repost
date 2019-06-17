/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */
// There are no unused vars - they are just in another JS file - these files are linked in HTML
// These functions are invoked from HTML, so they are not unused

async function login(event) {
  if (event) event.preventDefault();
  const form = document.getElementById('login-form');
  const username = String(form[0].value);
  const password = String(form[1].value);

  // Validate
  if (!/^[a-zA-Z0-9]{2,}$/g.test(username) || !/^[a-zA-Z0-9]{2,}$/g.test(password)) {
    UIkit.modal.alert('Invalid username or password format!');
    return;
  }

  const data = { username, password };
  const { status } = await fetch('/login', {
    method: 'POST',
    json: true,
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (status === 404) {
    UIkit.modal.confirm('No user with provided username! Would you like to register?')
      .then(async () => {
        // Confirmed - Register
        try {
          await fetch('/api/users', {
            method: 'POST',
            json: true,
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
          });
          window.location = '/home';
          return;
        } catch (err) {
          UIkit.modal.alert('Something went wrong...');
        }
      },
      () => {});
    return;
  }

  window.location = '/home';
}
