import Application from './app/Application.js';

document.addEventListener('DOMContentLoaded', () => {
  const app = new Application();
  void app.initialize().catch((e) => console.error('[Application]', e));
});

export default Application;
