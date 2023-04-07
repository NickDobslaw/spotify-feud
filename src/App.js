import React, {useState, useEffect} from "react";
import WebApp from "./web/WebApp.js";
import MobileApp from "./mobile/MobileApp.js";

function App() {
  const [width, setWidth] = useState(window.innerWidth);
  function handleWindowSizeChange() {
    setWidth(window.innerWidth);
  }
  useEffect(() => {
    window.addEventListener("resize", handleWindowSizeChange);
    return () => {
      window.removeEventListener("resize", handleWindowSizeChange);
    };
  }, []);
  return <>{width <= 768 ? <MobileApp /> : <WebApp />}</>;
}

export default App;
