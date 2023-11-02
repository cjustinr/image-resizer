import { useState } from 'react'
import FileUpload from './components/fileUpload/FileUpload'


function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <FileUpload cropSize={{ width: 200, height: 200 }}/>
    </>
  )
}

export default App
