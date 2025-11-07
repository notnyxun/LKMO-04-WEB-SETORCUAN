export interface MapLocation {
  id: string
  name: string
  address: string
  latitude: number
  longitude: number
  phone: string
  operatingHours: {
    open: string
    close: string
  }
}

export interface MapCenter {
  lat: number
  lng: number
}
