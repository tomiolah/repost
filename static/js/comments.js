/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */
// There are no unused vars - they are just in another JS file - these files are linked in HTML
// These functions are invoked from HTML, so they are not unused

async function comment(id, username, event) {
  event.preventDefault();
  const content = document.getElementById('content').value;
  const resp = await fetch('/api/comments', {
    method: 'POST',
    json: true,
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      username,
      content,
      parentID: undefined,
      postID: id,
    }),
  });

  if (resp.ok) UIkit.modal.dialog('<p class="uk-modal-body">Comment posted!</p>');
  else UIkit.modal.dialog('<p class="uk-modal-body">Something went wrong...</p>');

  setTimeout(() => window.location.reload(), 1000);
}

async function showOneComment(commentID) {
  const element = document.getElementById('oneComment');
  UIkit.modal(element).hide();
  // Get Comment
  const comm = await (await fetch(`/api/comments/${commentID}`)).json();

  // Get Subcomments
  const subs = await (await fetch(`/api/comments?parentID=${commentID}`)).json();

  // Place on UI
  document.getElementById('commUser').innerText = comm.username;
  const date = new Date(comm.posted);
  document.getElementById('commDate').innerText = `${date.getFullYear()}/${date.getMonth() + 1}/${date.getDay()}`;
  document.getElementById('commBody').innerText = comm.content;
  document.getElementById('subcomments').innerText = '';

  // Place subcomments on UI
  subs.forEach((sub) => {
    const datee = new Date(sub);
    document.getElementById('subcomments').insertAdjacentHTML('beforeend', `
      <li onclick="showComment('${sub._id}')">
        <div class="uk-card uk-card-default uk-card-body">
          <p><b>${sub.username}</b> on <b>${date.getFullYear()}/${date.getMonth() + 1}/${date.getDay()}</b></p>
          <p>${sub.content}</p>
        </div>
      </li>
    `);
  });

  UIkit.modal(element).show();
}
