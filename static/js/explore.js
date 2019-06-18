/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */
// There are no unused vars - they are just in another JS file - these files are linked in HTML
// These functions are invoked from HTML, so they are not unused

async function join(subrepost) {
  UIkit.modal.confirm(`Would you like to join <b>r/${subrepost}</b>?`)
    .then(
      async () => {
        // Get username
        const username = document.getElementById('username').innerText;
        await fetch(`/api/subreposts/${subrepost}`, {
          method: 'PATCH',
          json: true,
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ username, moderator: false }),
        });
      },
      () => {},
    );
}
