import React from "react";
import "./css/main.css";
import App from "./App";
import registerServiceWorker from "./registerServiceWorker";
import { render, Router, Route } from "mirrorx";

// ReactDOM.render(<App />, document.getElementById('root'));

render(
  <Router>
    <Route path="/" component={App} />
  </Router>,
  document.getElementById("root")
);
registerServiceWorker();
