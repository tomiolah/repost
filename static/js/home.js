async function fetchInspiration() {
  const path = await fetch('http://inspirobot.me/api?generate=true');
  const target = document.getElementById('inspiration');
  if (target) target.src = (await path.text());
}

fetchInspiration();
