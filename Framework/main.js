import Application from './app/Application.js';

document.addEventListener('DOMContentLoaded', () => {
  const app = new Application();
  app.initialize();
});

export default Application;
