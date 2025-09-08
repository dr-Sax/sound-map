<template>
  <div id="app">
    <header>
      <h1>|| Sound Map || </h1>
      <h2>Lakewood Park || Cleveland, OH</h2>
      <h3>September 6th, 2025 || Nick Romano</h3>
    </header>
    <main>
      <SoundMap />
    </main>
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
#app {
  font-family: 'Courier New', Courier, monospace;
  color: #2c3e50;
}

header {
  background: repeating-radial-gradient(farthest-corner at 20% 34%, rgb(216, 240, 248) .0099%, rgb(172, 171, 246) .05%);
  color: white;
  padding: 1rem;
  text-align: center;
}

main {
  padding: 1rem;
  background: repeating-radial-gradient(farthest-corner at 5% 5%, rgb(208, 178, 153) .0099%, rgb(33, 230, 230) .05%);
}
</style>