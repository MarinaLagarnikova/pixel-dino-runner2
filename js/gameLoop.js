export function createLoop(update, render) {
  let prevTime = null;

  function tick(timestamp) {
    const dt = prevTime !== null ? (timestamp - prevTime) / 1000 : 0;
    prevTime = timestamp;
    update(dt);
    render();
    requestAnimationFrame(tick);
  }

  return { start: () => requestAnimationFrame(tick) };
}
