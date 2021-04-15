import {
  defineAsyncApi,
  API_ON_ACCELEROMETER,
  API_TYPE_ON_ACCELEROMETER_CHANGE,
  API_OFF_ACCELEROMETER,
  API_TYPE_OFF_ACCELEROMETER_CHANGE,
  API_START_ACCELEROMETER,
  API_TYPE_START_ACCELEROMETER,
  API_STOP_ACCELEROMETER,
  API_TYPE_STOP_ACCELEROMETER,
  defineOnApi,
} from '@dcloudio/uni-api'

let listener: ((event: DeviceMotionEvent) => void) | null = null

export const onAccelerometerChange = <API_TYPE_ON_ACCELEROMETER_CHANGE>(
  defineOnApi(API_ON_ACCELEROMETER, () => {
    startAccelerometer()
  })
)

export const offAccelerometerChange = <API_TYPE_OFF_ACCELEROMETER_CHANGE>(
  defineOnApi(API_OFF_ACCELEROMETER, () => {
    stopAccelerometer()
  })
)

export const startAccelerometer = <API_TYPE_START_ACCELEROMETER>(
  defineAsyncApi(API_START_ACCELEROMETER, (_, { resolve, reject }) => {
    if (!window.DeviceMotionEvent) {
      reject()
    }
    function addEventListener() {
      listener = function (event: DeviceMotionEvent) {
        const acceleration =
          event.acceleration || event.accelerationIncludingGravity
        UniServiceJSBridge.invokeOnCallback(API_ON_ACCELEROMETER, {
          x: (acceleration && acceleration.x) || 0,
          y: (acceleration && acceleration.y) || 0,
          z: (acceleration && acceleration.z) || 0,
        })
      }
      window.addEventListener('devicemotion', listener, false)
    }
    if (!listener) {
      if (DeviceMotionEvent.requestPermission) {
        DeviceMotionEvent.requestPermission()
          .then((res) => {
            if (res === 'granted') {
              addEventListener()
              resolve()
            } else {
              reject(`${res}`)
            }
          })
          .catch((error) => {
            reject(`${error}`)
          })
        return
      }
      addEventListener()
    }
  })
)

export const stopAccelerometer = <API_TYPE_STOP_ACCELEROMETER>(
  defineAsyncApi(API_STOP_ACCELEROMETER, (_, { resolve }) => {
    if (listener) {
      window.removeEventListener('devicemotion', listener, false)
      listener = null
    }
    resolve()
  })
)
