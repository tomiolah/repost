/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */
// There are no unused vars - they are just in another JS file - these files are linked in HTML
// These functions are invoked from HTML, so they are not unused

async function join(subrepost) {
  UIkit.modal.confirm(`Would you like to join <b>r/${subrepost}</b>?`)
    .then(
      () => console.log('Confirmed'), // TODO
      () => console.log('Rejected'), // TODO
    );
}
