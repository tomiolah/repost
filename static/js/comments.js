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

async function modalComment(id, username, parent, event) {
  event.preventDefault();
  const content = document.getElementById('modalContent').value;
  const resp = await fetch('/api/comments', {
    method: 'POST',
    json: true,
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      username,
      content,
      parentID: parent,
      postID: id,
    }),
  });

  if (resp.ok) UIkit.modal.dialog('<p class="uk-modal-body">Comment posted!</p>');
  else UIkit.modal.dialog('<p class="uk-modal-body">Something went wrong...</p>');

  setTimeout(() => window.location.reload(), 1000);
}

async function removeVote(commentID) {
  const prev = document.getElementById('modalVote');
  const username = document.getElementById('username').innerText;

  const resp = await fetch(`/api/comments/${commentID}`, {
    method: 'PATCH',
    json: true,
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ commentID, rating: 0, username }),
  });

  if (resp.ok) {
    // Get comment
    const comm = await (await fetch(`/api/comments/${commentID}`)).json();
    prev.innerText = comm.rating;
    // eslint-disable-next-line no-use-before-define
    document.getElementById('inactive_upvote').onclick = () => upvote(comm._id);
    document.getElementById('inactive_upvote').hidden = false;
    // eslint-disable-next-line no-use-before-define
    document.getElementById('inactive_downvote').onclick =  () => downvote(comm._id);
    document.getElementById('inactive_downvote').hidden = false;
    document.getElementById('upvoted').onclick = () => removeVote(comm._id);
    document.getElementById('upvoted').hidden = true;
    document.getElementById('downvoted').onclick = () => removeVote(comm._id);
    document.getElementById('downvoted').hidden = true;
  } else console.error(resp);
}

async function upvote(commentID) {
  const prev = document.getElementById('modalVote');
  const username = document.getElementById('username').innerText;

  const resp = await fetch(`/api/comments/${commentID}`, {
    method: 'PATCH',
    json: true,
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ rating: 1, username }),
  });

  if (resp.ok) {
    prev.innerText = parseInt(prev.innerText, 10) + 1;
    document.getElementById('upvoted').onclick = () => removeVote(commentID);
    document.getElementById('upvoted').hidden = false;
    document.getElementById('downvoted').hidden = true;
    document.getElementById('inactive_upvote').hidden = true;
    document.getElementById('inactive_downvote').onclick = () => removeVote(commentID);
    document.getElementById('inactive_downvote').hidden = false;
  } else console.error(resp);
}

async function removeComment(commentID) {
  const resp = await fetch(`/api/comments/${commentID}`, { method: 'DELETE' });

  if (resp.ok) UIkit.modal.dialog('<p class="uk-modal-body">Deleted!</p>');
  else UIkit.modal.alert('<p class="uk-modal-body">Something went wrong...</p>');

  setTimeout(() => window.location.reload(), 1000);
}

async function downvote(commentID) {
  const prev = document.getElementById('modalVote');
  const username = document.getElementById('username').innerText;

  const resp = await fetch(`/api/comments/${commentID}`, {
    method: 'PATCH',
    json: true,
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ rating: -1, username }),
  });

  if (resp.ok) {
    prev.innerText = parseInt(prev.innerText, 10) - 1;
    document.getElementById('downvoted').onclick = () => removeVote(commentID);
    document.getElementById('downvoted').hidden = false;
    document.getElementById('upvoted').hidden = true;
    document.getElementById('inactive_downvote').hidden = true;
    document.getElementById('inactive_upvote').onclick = () => removeVote(commentID);
    document.getElementById('inactive_upvote').hidden = false;
  } else console.error(resp);
}

async function userIsMod(username, postID) {
  const post = await (await fetch(`/api/posts/${postID}`)).json();
  const subrepost = await (await fetch(`/api/subreposts/${post.subrepost}`)).json();

  const arrInd = subrepost.users.findIndex(value => value.username === username);

  if (arrInd === -1) return false;

  return subrepost.users[arrInd].moderator;
}

async function showOneComment(commentID) {
  const element = document.getElementById('oneComment');

  // Get PostID
  const postID = document.getElementById('postID').innerText;

  // Get Username
  const username = document.getElementById('username').innerText;

  UIkit.modal(element).hide();
  // Get Comment
  const comm = await (await fetch(`/api/comments/${commentID}`)).json();

  // Get Subcomments
  const subs = await (await fetch(`/api/comments?parentID=${commentID}`)).json();

  // Place on UI
  document.getElementById('newModalComment').onsubmit = ev => modalComment(postID, username, commentID, ev);
  document.getElementById('commUser').innerText = comm.username;
  const date = new Date(comm.posted);
  document.getElementById('commDate').innerText = `${date.getFullYear()}/${date.getMonth() + 1}/${date.getDay()}`;
  document.getElementById('commBody').innerText = comm.content;
  document.getElementById('modalVote').innerText = comm.rating;
  document.getElementById('subcomments').innerText = '';

  if (comm.username === username || (await userIsMod(username, postID))) {
    document.getElementById('delComm').onclick = () => removeComment(comm._id);
    document.getElementById('delComm').hidden = false;
  } else document.getElementById('delComm').hidden = true;


  // Check rating
  const rating = comm.raters.find(value => value.username === username);

  if (!rating || !rating.rating) {
    document.getElementById('inactive_upvote').onclick = () => upvote(comm._id);
    document.getElementById('inactive_upvote').hidden = false;
    document.getElementById('inactive_downvote').onclick =  () => downvote(comm._id);
    document.getElementById('inactive_downvote').hidden = false;
    document.getElementById('upvoted').onclick = () => removeVote(comm._id);
    document.getElementById('upvoted').hidden = true;
    document.getElementById('downvoted').onclick = () => removeVote(comm._id);
    document.getElementById('downvoted').hidden = true;
  } else if (rating.rating === -1) {
    document.getElementById('downvoted').onclick = () => removeVote(comm._id);
    document.getElementById('downvoted').hidden = false;
    document.getElementById('upvoted').hidden = true;
    document.getElementById('inactive_downvote').hidden = true;
    document.getElementById('inactive_upvote').onclick = () => removeVote(comm._id);
    document.getElementById('inactive_upvote').hidden = false;
  } else {
    document.getElementById('upvoted').onclick = () => removeVote(comm._id);
    document.getElementById('upvoted').hidden = false;
    document.getElementById('downvoted').hidden = true;
    document.getElementById('inactive_upvote').hidden = true;
    document.getElementById('inactive_downvote').onclick = () => removeVote(comm._id);
    document.getElementById('inactive_downvote').hidden = false;
  }
  // Place subcomments on UI
  subs.forEach((sub) => {
    if (sub._id !== commentID) {
      const datee = new Date(sub);
      document.getElementById('subcomments').insertAdjacentHTML('beforeend', `
      <li>
      <div class="uk-card uk-card-default uk-card-body">
            
          <a onclick="showOneComment('${sub._id}')">
                <p><b>${sub.username}</b> on <b>${date.getFullYear()}/${date.getMonth() + 1}/${date.getDay()}</b></p>
                <p>${sub.content}</p>
          </a>
      </div>
      </li>
      `);
    }
  });

  UIkit.modal(element).show();
}
