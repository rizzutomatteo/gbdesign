var h = window.location.hash;
if (h.indexOf('invite_token') !== -1 || h.indexOf('recovery_token') !== -1) {
  window.location.replace('/admin' + h);
}
