if('serviceWorker' in navigator) {window.addEventListener('load', () => {navigator.serviceWorker.register('/my-project-pomodoro/sw.js', { scope: '/my-project-pomodoro/' })})}