import { createApp } from 'vue'
import App from './App.vue'
import { GoogleMap, Marker, InfoWindow } from 'vue3-google-map'

const app = createApp(App)

// Register Google Maps components
app.component('GoogleMap', GoogleMap)
app.component('Marker', Marker)
app.component('InfoWindow', InfoWindow)

app.mount('#app')