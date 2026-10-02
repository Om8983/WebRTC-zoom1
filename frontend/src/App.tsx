import { BrowserRouter } from "react-router-dom"
import { Approutes } from "./Approuter/router"
import { Toaster } from "sonner"
import { ThemeProvider } from "./Components/ThemeProvider"
function App() {

  return (

    <ThemeProvider>
      <BrowserRouter>
        {/* <Toaster /> */}
        <Approutes></Approutes>
      </BrowserRouter>
    </ThemeProvider>
  )
}

export default App
