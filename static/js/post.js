/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */
// There are no unused vars - they are just in another JS file - these files are linked in HTML
// These functions are invoked from HTML, so they are not unused

async function removePost(postID) {
  const resp = await fetch(`/api/posts/${postID}`, {
    method: 'DELETE',
  });

  if (resp.ok) {
    UIkit.modal.dialog('<p class="uk-modal-body">Deleted!</p>');
    setTimeout(() => { window.location = '/home'; }, 1000);
  } else UIkit.modal.alert('<p class="uk-modal-body">Something went wrong...</p>');
}

async function upvotePost(postID) {
  const username = document.getElementById('username').innerText;

  await fetch(`/api/posts/${postID}`, {
    method: 'PATCH',
    json: true,
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ username, rating: 1 }),
  });

  const rating = parseInt(document.getElementById('postVote').innerText, 10) + 1;

  document.getElementById('inactive_upvote_post').hidden = true;
  document.getElementById('upvoted_post').hidden = false;
  // eslint-disable-next-line no-use-before-define
  document.getElementById('upvoted_post').onclick = () => resetRatingPost(postID);
  document.getElementById('inactive_downvote_post').hidden = false;
  document.getElementById('downvoted_post').hidden = true;
  // eslint-disable-next-line no-use-before-define
  document.getElementById('inactive_downvote_post').onclick = () => resetRatingPost(postID);
  document.getElementById('postVote').innerText = rating;
}

async function downvotePost(postID) {
  const username = document.getElementById('username').innerText;

  await fetch(`/api/posts/${postID}`, {
    method: 'PATCH',
    json: true,
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ username, rating: -1 }),
  });

  const rating = parseInt(document.getElementById('postVote').innerText, 10) - 1;

  document.getElementById('inactive_upvote_post').hidden = false;
  // eslint-disable-next-line no-use-before-define
  document.getElementById('inactive_upvote_post').onclick = () => resetRatingPost(postID);
  document.getElementById('upvoted_post').hidden = true;
  document.getElementById('inactive_downvote_post').hidden = true;
  document.getElementById('downvoted_post').hidden = false;
  // eslint-disable-next-line no-use-before-define
  document.getElementById('downvoted_post').onclick = () => resetRatingPost(postID);
  document.getElementById('postVote').innerText = rating;
}

async function resetRatingPost(postID) {
  const username = document.getElementById('username').innerText;

  await fetch(`/api/posts/${postID}`, {
    method: 'PATCH',
    json: true,
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ username, rating: 0 }),
  });

  const post = await (await fetch(`/api/posts/${postID}`)).json();

  document.getElementById('inactive_upvote_post').hidden = false;
  document.getElementById('inactive_upvote_post').onclick = () => upvotePost(postID);
  document.getElementById('upvoted_post').hidden = true;
  document.getElementById('upvoted_post').onclick = () => resetRatingPost(postID);
  document.getElementById('inactive_downvote_post').hidden = false;
  document.getElementById('inactive_downvote_post').onclick = () => downvotePost(postID);
  document.getElementById('downvoted_post').hidden = true;
  document.getElementById('downvoted_post').onclick = () => resetRatingPost(postID);
  document.getElementById('postVote').innerText = post.rating;
}
