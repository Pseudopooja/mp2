import { Link, Route, Routes } from 'react-router-dom'
import Layout from './components/Layout'
import DetailView from './pages/DetailView'
import GalleryView from './pages/GalleryView'
import ListView from './pages/ListView'

function NotFound() {
  return (
    <div>
      <h1>Page not found</h1>
      <p>
        That address does not match anything here. <Link to="/">Go to the meal list</Link>.
      </p>
    </div>
  )
}

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<ListView />} />
        <Route path="gallery" element={<GalleryView />} />
        <Route path="meal/:id" element={<DetailView />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  )
}
