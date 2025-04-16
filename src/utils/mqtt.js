import mqtt from 'mqtt'

class MQTTClient {
  constructor() {
    this.client = null
    this.connected = false
  }

  connect(url = 'ws://localhost:8083/mqtt') {
    this.client = mqtt.connect(url)
    
    this.client.on('connect', () => {
      this.connected = true
      console.log('MQTT Connected')
    })

    this.client.on('error', (error) => {
      console.error('MQTT Error:', error)
    })
  }

  subscribe(topic) {
    if (this.connected) {
      this.client.subscribe(topic)
    }
  }

  publish(topic, message) {
    if (this.connected) {
      this.client.publish(topic, JSON.stringify(message))
    }
  }
}

export default new MQTTClient()