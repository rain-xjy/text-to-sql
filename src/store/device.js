import { defineStore } from 'pinia'

export const useDeviceStore = defineStore('device', {
  state: () => ({
    devices: [],
    currentDevice: null,
    deviceData: {}
  }),
  actions: {
    setDevices(devices) {
      this.devices = devices
    },
    setCurrentDevice(device) {
      this.currentDevice = device
    },
    updateDeviceData(deviceId, data) {
      this.deviceData[deviceId] = data
    }
  }
})