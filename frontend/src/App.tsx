import { BrowserRouter } from "react-router-dom"
import { Approutes } from "./Approuter/router"
import { Toaster } from "sonner"
import { ThemeProvider } from "./Components/ThemeProvider"
import { Provider } from "react-redux"
import { store } from "./redux/store"
function App() {

  return (

    <Provider store={store}>
      <ThemeProvider>
        <BrowserRouter>
          <Toaster richColors closeButton position="top-center" />
          <Approutes></Approutes>
        </BrowserRouter>
      </ThemeProvider>
    </Provider>
  )
}

export default App
