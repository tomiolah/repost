/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */
// There are no unused vars - they are just in another JS file - these files are linked in HTML
// These functions are invoked from HTML, so they are not unused

async function pageLoaded() {
  // Get Subrepost By Name
  const subrepost = document.getElementById('sr-name').innerText;
  const sr = await (await fetch(`/api/subreposts/${subrepost}`)).json();

  const userListHTML = [];
  const modListHTML = [];

  // Create HTML elements
  sr.users.forEach((value) => {
    if (value.moderator) {
      modListHTML.push(`
        <li>
          <h3>${value.username}&nbsp;
            <a onclick="ban('${value.username}')" class="remove">
              <span uk-icon="icon: ban"></span>
            </a>&nbsp;
            <a onclick="downgrade('${value.username}')" class="remove">
              <span uk-icon="icon: pull"></span>
            </a>
          </h3>
        </li>
      `);
    } else {
      userListHTML.push(`
        <li>
          <h3>${value.username}&nbsp;
            <a onclick="ban('${value.username}')" class="remove">
              <span uk-icon="icon: ban"></span>
            </a>&nbsp;
            <a onclick="upgrade('${value.username}')" class="add">
              <span uk-icon="icon: plus-circle"></span>
            </a>
          </h3>
        </li>
      `);
    }
  });

  modListHTML.push('<li><a class="add" onclick="addMod()"><span uk-icon="icon: plus-circle; ratio: 1.5"></span></a></li>');
  userListHTML.push('<li><a class="add" onclick="addUser()"><span uk-icon="icon: plus-circle; ratio: 1.5"></span></a></li>');

  // Clear lists
  document.getElementById('mod-list').innerText = '';
  document.getElementById('user-list').innerText = '';
  // Inject into HTML
  modListHTML.forEach(elem => document.getElementById('mod-list').insertAdjacentHTML('beforeend', elem));
  userListHTML.forEach(elem => document.getElementById('user-list').insertAdjacentHTML('beforeend', elem));
}

pageLoaded();

function addUser() {
  UIkit.modal.prompt('User to add:', '')
    .then((username) => {
      // TODO
      if (username) console.log(username);
      pageLoaded();
    });
}

function addMod() {
  UIkit.modal.prompt('User to add as Moderator:', '')
    .then((username) => {
      // TODO
      if (username) console.log(username);
      pageLoaded();
    });
}

async function deleteSub(subrepost) {
  UIkit.modal.prompt(`<h1 class="uk-text-danger">WARNING!</h1> This operation cannot be undone! <div class="uk-alert-danger" uk-alert><p>To confirm your request please type in the name of this subrepost (<b>${subrepost}</b>):</p></div>`, '')
    .then((input) => {
      // TODO
      if (input === subrepost) console.log('delet this.');
    });
}

function ban(username) {
  // TODO
}

function downgrade(username) {
  // TODO
}

function upgrade(username) {
  // TODO
}
