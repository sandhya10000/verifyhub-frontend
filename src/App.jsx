import React from "react";
import Header from "./Components/layout/Header";
import AppRoutes from "./routes/AppRoutes";
import Footer from "./Components/layout/Footer";
import { BrowserRouter } from "react-router-dom";
function App() {
  return (
    <>
      <BrowserRouter>
        <Header />
        <AppRoutes />
        <Footer />
      </BrowserRouter>
    </>
  );
}

export default App;
