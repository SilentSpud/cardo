import ReactDOM from 'react-dom/client'
import App from './App'
import './engines/translations'
import './main.css'
import { postupdate } from './postupdate'

postupdate().then(() => {
  ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(<App />)
})
