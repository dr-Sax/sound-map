<template>
  <div class="sound-map">
    
    <!-- File Upload Section -->
    <div v-if="!dataLoaded" class="upload-section">
      <h2>Upload GPS Tracking Session</h2>
      <div class="upload-controls">
        <div class="file-input">
          <label for="json-upload">📄 JSON File:</label>
          <input 
            id="json-upload" 
            type="file" 
            accept=".json" 
            @change="handleJsonUpload"
          />
        </div>
        <div class="file-input">
          <label for="audio-upload">🎵 MP3 File:</label>
          <input 
            id="audio-upload" 
            type="file" 
            accept=".mp3,.webm" 
            @change="handleAudioUpload"
          />
        </div>
      </div>
      <button 
        v-if="jsonFile && audioFile" 
        @click="loadSession" 
        class="load-btn"
      >
        Load Session
      </button>
    </div>

    <!-- Map Display -->
    <div v-if="dataLoaded" class="map-section">
      <div class="session-info">
        <h2>{{ sessionData.session_name }}</h2>
        <button @click="resetSession" class="reset-btn">Upload New Session</button>
      </div>

      <!-- Google Map -->
      <div class="map-container">
        <div ref="mapElement" style="width: 100%; height: 500px;"></div>
      </div>
      
      <div class="legend">
        <div><span class="legend-marker gps">📍</span> GPS Point</div>
        <div><span class="legend-marker audio">🎤</span> Audio Segment</div>
        <div><span class="legend-marker annotation">💬</span> Text Annotation</div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, nextTick } from 'vue'

export default {
  name: 'GPSSoundMap',
  setup() {
    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY
    
    const mapElement = ref(null)
    const mapInstance = ref(null)
    const dataLoaded = ref(false)
    const jsonFile = ref(null)
    const audioFile = ref(null)
    const sessionData = ref(null)
    const audioElement = ref(null)
    const audioUrl = ref(null)

    // Handle JSON file upload
    const handleJsonUpload = (event) => {
      const file = event.target.files[0]
      if (file) {
        jsonFile.value = file
      }
    }

    // Handle audio file upload
    const handleAudioUpload = (event) => {
      const file = event.target.files[0]
      if (file) {
        audioFile.value = file
        audioUrl.value = URL.createObjectURL(file)
      }
    }

    // Load session data
    const loadSession = async () => {
      const reader = new FileReader()
      reader.onload = (e) => {
        sessionData.value = JSON.parse(e.target.result)
        dataLoaded.value = true
        nextTick(() => {
          initMap()
        })
      }
      reader.readAsText(jsonFile.value)
    }

    // Reset and upload new session
    const resetSession = () => {
      dataLoaded.value = false
      jsonFile.value = null
      audioFile.value = null
      sessionData.value = null
      if (audioUrl.value) {
        URL.revokeObjectURL(audioUrl.value)
        audioUrl.value = null
      }
      if (mapInstance.value) {
        mapInstance.value = null
      }
    }

    // Parse ISO timestamp to Date
    const parseTimestamp = (timestamp) => {
      return new Date(timestamp)
    }

    // Play audio segment
    const playAudioSegment = (segment) => {
      if (!audioUrl.value) return

      if (!audioElement.value) {
        audioElement.value = new Audio(audioUrl.value)
      }

      const startTime = parseTimestamp(segment.start_timestamp)
      const endTime = parseTimestamp(segment.end_timestamp)
      const sessionStart = parseTimestamp(sessionData.value.gps_points[0].timestamp)
      
      // Calculate offset in seconds from session start
      const startOffset = (startTime - sessionStart) / 1000
      const endOffset = (endTime - sessionStart) / 1000

      audioElement.value.currentTime = startOffset
      audioElement.value.play()

      // Stop at end time
      const checkTime = setInterval(() => {
        if (audioElement.value.currentTime >= endOffset) {
          audioElement.value.pause()
          clearInterval(checkTime)
        }
      }, 100)
    }

    // Initialize map
    const initMap = () => {
      if (!window.google || !mapElement.value || !sessionData.value) {
        setTimeout(initMap, 500)
        return
      }

      // Calculate center from GPS points
      const gpsPoints = sessionData.value.gps_points
      if (gpsPoints.length === 0) return

      const firstPoint = gpsPoints[0].coordinates.split(', ')
      const center = {
        lat: parseFloat(firstPoint[0]),
        lng: parseFloat(firstPoint[1])
      }

      mapInstance.value = new google.maps.Map(mapElement.value, {
        zoom: 15,
        center: center,
        mapTypeId: google.maps.MapTypeId.ROADMAP,
        zoomControl: true,
        mapTypeControl: true,
        streetViewControl: false
      })

      // Add GPS path
      const pathCoordinates = gpsPoints.map(point => {
        const coords = point.coordinates.split(', ')
        return {
          lat: parseFloat(coords[0]),
          lng: parseFloat(coords[1])
        }
      })

      const path = new google.maps.Polyline({
        path: pathCoordinates,
        geodesic: true,
        strokeColor: '#4a90e2',
        strokeOpacity: 0.8,
        strokeWeight: 3
      })
      path.setMap(mapInstance.value)

      // Add GPS point markers
      gpsPoints.forEach((point, index) => {
        const coords = point.coordinates.split(', ')
        const position = {
          lat: parseFloat(coords[0]),
          lng: parseFloat(coords[1])
        }

        // Different marker for annotations
        const hasAnnotation = point.annotation !== null
        const icon = hasAnnotation
          ? 'http://maps.google.com/mapfiles/ms/icons/blue-dot.png'
          : 'http://maps.google.com/mapfiles/ms/icons/red-dot.png'

        const marker = new google.maps.Marker({
          position: position,
          map: mapInstance.value,
          icon: icon,
          title: hasAnnotation ? point.annotation : `GPS Point ${index + 1}`
        })

        if (hasAnnotation) {
          const infoWindow = new google.maps.InfoWindow({
            content: `
              <div style="padding: 10px;">
                <h3 style="margin: 0 0 10px 0;">📍 Annotation</h3>
                <p style="margin: 0;"><strong>${point.annotation}</strong></p>
                <p style="margin: 5px 0 0 0; font-size: 12px; color: #666;">
                  ${new Date(point.timestamp).toLocaleString()}
                </p>
              </div>
            `
          })

          marker.addListener('click', () => {
            infoWindow.open(mapInstance.value, marker)
          })
        }
      })

      // Add audio segment markers
      if (sessionData.value.audio_segments) {
        sessionData.value.audio_segments.forEach((segment, index) => {
          // Find closest GPS point to segment start
          const segmentTime = parseTimestamp(segment.start_timestamp)
          let closestPoint = gpsPoints[0]
          let minDiff = Math.abs(parseTimestamp(closestPoint.timestamp) - segmentTime)

          gpsPoints.forEach(point => {
            const diff = Math.abs(parseTimestamp(point.timestamp) - segmentTime)
            if (diff < minDiff) {
              minDiff = diff
              closestPoint = point
            }
          })

          const coords = closestPoint.coordinates.split(', ')
          const position = {
            lat: parseFloat(coords[0]),
            lng: parseFloat(coords[1])
          }

          const marker = new google.maps.Marker({
            position: position,
            map: mapInstance.value,
            icon: 'http://maps.google.com/mapfiles/ms/icons/green-dot.png',
            title: `Audio Segment ${index + 1}`
          })

          const startTime = new Date(segment.start_timestamp).toLocaleTimeString()
          const endTime = new Date(segment.end_timestamp).toLocaleTimeString()
          const duration = ((parseTimestamp(segment.end_timestamp) - parseTimestamp(segment.start_timestamp)) / 1000).toFixed(1)

          const infoWindow = new google.maps.InfoWindow({
            content: `
              <div style="padding: 10px; text-align: center;">
                <h3 style="margin: 0 0 10px 0;">🎤 Audio Segment ${index + 1}</h3>
                <p style="margin: 5px 0; font-size: 12px;">
                  <strong>Start:</strong> ${startTime}<br>
                  <strong>End:</strong> ${endTime}<br>
                  <strong>Duration:</strong> ${duration}s
                </p>
                <button 
                  onclick="window.playSegment${index}()" 
                  style="
                    margin-top: 10px;
                    padding: 8px 16px;
                    background: #4a90e2;
                    color: white;
                    border: none;
                    border-radius: 5px;
                    cursor: pointer;
                    font-size: 14px;
                  "
                >
                  ▶️ Play Audio
                </button>
              </div>
            `
          })

          // Create global function for play button
          window[`playSegment${index}`] = () => {
            playAudioSegment(segment)
          }

          marker.addListener('click', () => {
            infoWindow.open(mapInstance.value, marker)
          })
        })
      }
    }

    // Load Google Maps API
    const loadGoogleMaps = () => {
      if (!window.google) {
        const script = document.createElement('script')
        script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}`
        script.async = true
        script.defer = true
        document.head.appendChild(script)
      }
    }

    onMounted(() => {
      loadGoogleMaps()
    })

    return {
      mapElement,
      dataLoaded,
      jsonFile,
      audioFile,
      sessionData,
      handleJsonUpload,
      handleAudioUpload,
      loadSession,
      resetSession
    }
  }
}
</script>

<style scoped>
.sound-map {
  max-width: 1000px;
  margin: 0 auto;
  padding: 1rem;
}

.upload-section {
  background: white;
  padding: 2rem;
  border-radius: 10px;
  text-align: center;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
}

.upload-section h2 {
  margin-bottom: 1.5rem;
  color: #333;
}

.upload-controls {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 1.5rem;
  max-width: 400px;
  margin-left: auto;
  margin-right: auto;
}

.file-input {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.5rem;
  background: #f5f5f5;
  border-radius: 5px;
}

.file-input label {
  font-weight: bold;
  margin-right: 1rem;
}

.file-input input {
  flex: 1;
}

.load-btn {
  padding: 12px 30px;
  background: #4a90e2;
  color: white;
  border: none;
  border-radius: 5px;
  font-size: 16px;
  font-weight: bold;
  cursor: pointer;
  transition: background 0.3s;
}

.load-btn:hover {
  background: #357abd;
}

.map-section {
  background: white;
  padding: 1rem;
  border-radius: 10px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
}

.session-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  padding-bottom: 1rem;
  border-bottom: 2px solid #eee;
}

.session-info h2 {
  margin: 0;
  color: #333;
}

.reset-btn {
  padding: 8px 16px;
  background: #e74c3c;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 14px;
}

.reset-btn:hover {
  background: #c0392b;
}

.map-container {
  border: 3px solid #4a90e2;
  border-radius: 10px;
  overflow: hidden;
  margin-bottom: 1rem;
}

.legend {
  display: flex;
  justify-content: center;
  gap: 2rem;
  padding: 1rem;
  background: #f9f9f9;
  border-radius: 5px;
  font-size: 14px;
}

.legend-marker {
  font-size: 18px;
  margin-right: 5px;
}
</style>