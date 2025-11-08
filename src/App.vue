<template>
  <div id="app">
    <header>
      <h1>🗺️ GPS Sound Map Viewer</h1>
      <h2>Upload and Visualize GPS Tracking Sessions</h2>
    </header>
    <main>
      <SoundMap />
    </main>
    <footer>
      <p>Upload JSON + MP3 files from your GPS tracker to view on map</p>
    </footer>
  </div>
</template>

<script>
import SoundMap from './components/SoundMap.vue'

export default {
  name: 'App',
  components: {
    SoundMap
  }
}
</script>

<style>
* {
  box-sizing: border-box;
}

body {
  margin: 0;
  padding: 0;
}

#app {
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  color: #2c3e50;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 2rem 1rem;
  text-align: center;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
}

header h1 {
  margin: 0 0 0.5rem 0;
  font-size: 2.5rem;
}

header h2 {
  margin: 0;
  font-size: 1.2rem;
  font-weight: normal;
  opacity: 0.9;
}


main {
  flex: 1;
  padding: 2rem 1rem;
  background: #f5f7fa;
}

footer {
  background: #2c3e50;
  color: white;
  text-align: center;
  padding: 1rem;
  font-size: 0.9rem;
}

footer p {
  margin: 0;
}
</style>