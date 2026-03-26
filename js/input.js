export function createInput() {
  const keys = new Set();
  const onDown = (e) => keys.add(e.code);
  const onUp = (e) => keys.delete(e.code);

  window.addEventListener('keydown', onDown);
  window.addEventListener('keyup', onUp);

  return {
    isPressed: (code) => keys.has(code),
    consume: (code) => {
      const had = keys.has(code);
      keys.delete(code);
      return had;
    },
    destroy: () => {
      window.removeEventListener('keydown', onDown);
      window.removeEventListener('keyup', onUp);
    },
  };
}
