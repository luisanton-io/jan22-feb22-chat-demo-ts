export interface Message {
  text: string
  sender: string
  id: string
  timestamp: number // the number of elapsed ms after 1/1/1970
}
