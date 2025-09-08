<template>
  <div class="sound-map">
    
    <!-- Google Map -->
    <div class="map-container">
      <div ref="mapElement" style="width: 100%; height: 400px;"></div>
    </div>
    
    <p>Click markers to see and hear each sound location!</p>
  </div>
</template>

<script>
import { ref, onMounted, nextTick } from 'vue'

export default {
  name: 'MinimalSoundMap',
  setup() {
    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY
    const center = { lat: 41.495304, lng: -81.796885 }  // Change to your location
    
    const mapElement = ref(null)
    const mapInstance = ref(null)
    
    // Sound markers with 10-second YouTube loops - CUSTOMIZE THESE!
    const soundMarkers = [
      {
        id: 1,
        position: { lat: 41.495335, lng: -81.796369},
        icon: 'https://media3.giphy.com/media/v1.Y2lkPTc5MGI3NjExOWh6ajM0amR2b2dmb2x2NHdvdG5yNmtpYTc2MmFxazFmaG5nZnN4YiZlcD12MV9zdGlja2Vyc19zZWFyY2gmY3Q9cw/DIhWp1sTDgm3oR8lb1/200w.webp',
        title: 'Veterans War Memorial',
        description: 'Three flags sway in the wind.  The metal pulley allowing the flags to be raised or lowered clanks against the tall poles in at intervals with the wind.  The flags snap and ripple like the sound of an open car window on a highway.  This all happens above a Vietnam and Korean war memorial monument.',
        videoId: '4rZniei1Xvc',  // Replace with your video ID
        startTime: 0,
        endTime: 15
      },
      {
        id: 2,
        position: { lat: 41.493941, lng: -81.798589},
        icon: 'https://media1.giphy.com/media/v1.Y2lkPWVjZjA1ZTQ3a3N2ejU2bm94Yzhrb3phcnVuM3AyMHFzeWQ5Z2ozNnFjZXEzOTEzdyZlcD12MV9zdGlja2Vyc19zZWFyY2gmY3Q9cw/O0SEIsVpeAvI4LAJJ9/giphy.webp',
        title: 'Skatepark',
        description: 'Nas and other rap music playing as the skaters ride.  Groups gather in playful conversation.  Stepping on their tails of their boards rocking them like horses ready for the trail.  Strong precise pops launching towards a smooth 50-50 grind.',
        videoId: 'Qy3WJepCh5g',  // Replace with your video ID
        startTime: 0,
        endTime: 32
      },
      {
        id: 3,
        position: { lat: 41.497345, lng: -81.797894 },
        icon: 'https://media2.giphy.com/media/v1.Y2lkPTc5MGI3NjExdGZpd2k2enZuM2Vrb3U0MGl4aHYzYjY0dTI4Y2o2NnN2dHkzZnNpZiZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9cw/QWrCFpI965negKDo0n/giphy.gif',
        title: 'Solstice Steps',
        description: 'A constant metronome of crickets from a nearby shrubbery.  Deep lake winds rustle my hair.  The lake undulates with a standing wave pattern pointed east.  Wave tips crash down gently with white water.  My girlfriends backpack zipper opens.  An occasional splash or trickle responds to powerful gusts of winds.  A vast and expansive atmosphere',
        videoId: 'z2uYVTu1GOM',  // Replace with your video ID
        startTime: 0,
        endTime: 30
      },
      {
        id: 4,
        position: { lat: 41.495491, lng: -81.797512 },
        icon: 'https://media2.giphy.com/media/v1.Y2lkPTc5MGI3NjExY2hsbmRyazNkMTh2MTQ4MW0yaGZnaWxvNDVqOGd0Y3RydGZ0MG5nbiZlcD12MV9zdGlja2Vyc19zZWFyY2gmY3Q9cw/kfUeCH6C8lPs2lPDcV/200w.webp',
        title: 'Kids Cove Playground',
        description: 'Kids sing we will we will rock you.  Occasional shrieks and mouse squeaks from the playful children at the park.  Pounding of feet on pavement as two girls chase and yell at a squirrel.  A flock of geese pass honking chaotically.  Dead leaves rustle against the wood chips.  Birds tweet in a tree.  Happy birthday is being sung in harmony in a pavilion.  Cheers and clapping. Cheers hooray.  quick steps clap against the ramped platform leading up to the playground jungle gym.  A girl pats a rhythm on the green playground bongos.',
        videoId: 'Y4hsMF39osc',  // Replace with your video ID
        startTime: 0,
        endTime: 16
      },
      {
        id: 5,
        position: { lat: 41.494998, lng: -81.798563 },
        icon: 'https://media0.giphy.com/media/v1.Y2lkPTc5MGI3NjExeWNiZjRsaWdnb2Rsdjhla25wbmg3cjdrbW4ydjF2aWdrYjVyYXQxMiZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9cw/fVTSQIY4ETEDpqB3EL/giphy.gif',
        title: 'Pickleball Courts',
        description: '2 games played on diagonal courts.  The serving player yells 3-2 followed by a hollow wooden smack. The dueling opponents paddles converse in alternating pitches.  One lower than the other.  Shoes skid across the pavement urgently chasing down the ball returned to the players opposite corner.',
        videoId: 'GmyLNBE7MxE',  // Replace with your video ID
        startTime: 0,
        endTime: 12
      }
    ]
    
    // Initialize map with bright mode
    const initMap = () => {
      if (!window.google || !mapElement.value) {
        setTimeout(initMap, 500)
        return
      }
      
      mapInstance.value = new google.maps.Map(mapElement.value, {
        zoom: 16,
        center: center,
        minZoom: 16,
        maxZoom: 22,
        disableDefaultUI: true,
        zoomControl: true,
        mapTypeId: google.maps.MapTypeId.SATELLITE
      })
      
      // Add markers
      soundMarkers.forEach(soundData => {
        const marker = new google.maps.Marker({
          position: soundData.position,
          map: mapInstance.value,
          icon: { url: soundData.icon, scaledSize: new google.maps.Size(40, 40) },
          title: soundData.title
        })
        
        const infoWindow = new google.maps.InfoWindow({
          content: `
            <div style="width: 300px; text-align: center; background: repeating-radial-gradient(farthest-corner at 5% 5%, rgb(208, 178, 153) .0099%, rgb(33, 230, 230) .05%);">

              
              <h3 style="font-size: 30px; margin: 0 0 10px 0; color: #4a90e2;">${soundData.title}</h3>

              <p style="margin: 0; font-size: 14px; color: #333;"><em>${soundData.description}</em></p>

              <div id="player-${soundData.id}" style="width:300px; height: 200px; margin: 0 auto 10px auto;"></div>

            </div>
          `,
          maxWidth: 500,

        })
        
        marker.addListener('click', () => {
          infoWindow.open(mapInstance.value, marker)
          setTimeout(() => createPlayer(soundData), 100)
        })
      })
    }
    
    // Create autoplay YouTube player with FIXED LOOPING
    const createPlayer = (soundData) => {
      if (!window.YT?.Player) return
      
      new YT.Player(`player-${soundData.id}`, {
        height: '157',
        width: '280',
        videoId: soundData.videoId,
        playerVars: {
          'autoplay': 1,
          'controls': 0,
          'start': soundData.startTime,
          'end': soundData.endTime,
          'loop': 0,  // Disabled built-in loop - we handle it manually
          'rel': 0,
          'showinfo': 0,
          'modestbranding': 1,
          'mute': 0
        },
        events: {
          'onStateChange': (event) => {
            // When video ends, manually restart from custom start time (not 0!)
            if (event.data === YT.PlayerState.ENDED) {
              event.target.seekTo(soundData.startTime)
              event.target.playVideo()
            }
          }
        }
      })
    }
    
    // Load APIs
    const loadAPIs = () => {
      // Google Maps
      const mapsScript = document.createElement('script')
      mapsScript.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&callback=initMap`
      window.initMap = initMap
      document.head.appendChild(mapsScript)
      
      // YouTube API
      const youtubeScript = document.createElement('script')
      youtubeScript.src = 'https://www.youtube.com/iframe_api'
      document.head.appendChild(youtubeScript)
    }
    
    onMounted(() => {
      nextTick(loadAPIs)
    })
    
    return {
      mapElement
    }
  }
}
</script>

<style scoped>
.sound-map {
  max-width: 800px;
  margin: 0 auto;
  padding: 1rem;
  text-align: center;
}

.map-container {
  border: 3px solid #4a90e2;
  border-radius: 15px;
  overflow: hidden;
  margin-bottom: 1rem;
}
</style>