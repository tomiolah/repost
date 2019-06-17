/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */
// There are no unused vars - they are just in another JS file - these files are linked in HTML
// These functions are invoked from HTML, so they are not unused

// I swear, ESLint is literally just like an annoying french chef...

// Work out how to open the Off-Screen Navbar

// Mouse wheel support for debugging
onmousewheel = (ev) => {
  // Mouse wheel Up -> Open Navbar
  if (ev.deltaY === 100) UIkit.offcanvas('#navbar').show();
  // Mouse wheel Down -> Close Navbar
  else UIkit.offcanvas('#navbar').hide();
};

// Arrow Key Support for Desktop
onkeydown = (ev) => {
  // Arrow Right -> Open Navbar
  if (ev.key === 'ArrowRight') UIkit.offcanvas('#navbar').show();
  // Arrow Left -> Close Navbar
  else if (ev.key === 'ArrowLeft') UIkit.offcanvas('#navbar').hide();
};

// Get user karma
async function getKarma() {
  // Get username
  const username = document.getElementById('username').innerText;

  // Get from API
  const resp = await (await fetch(`/api/users/${username}`)).json();

  // Update GUI element
  document.getElementById('karma').innerText = resp.rating;
}

getKarma();

// Get the body, which will listen to the swipe events
const body = document.getElementById('body');

// Use HammerJS to handle swipe events on touch-devices,
// because JS is just so forward-thinking...
// ... that it is unable to understand basic smartphone input...
const hammer = new Hammer(body);

// Add event handler to swipe events
hammer.on('swipe', (ev) => {
  // Swipe right -> Open Navbar
  if (ev.direction === 4) UIkit.offcanvas('#navbar').show();
  // Swipe left -> Close Navbar
  else if (ev.direction === 2) UIkit.offcanvas('#navbar').hide();
});
