import React from "react";
import "./css/main.css";
import App from "./App";
import registerServiceWorker from "./registerServiceWorker";
import { render, Router, Route } from "mirrorx";
import { Cookies } from "react-cookie";

// ReactDOM.render(<App />, document.getElementById('root'));

function ID() {
  let array = new Uint32Array(8);
  window.crypto.getRandomValues(array);
  let str = "";
  for (let i = 0; i < array.length; i++) {
    str += array[i].toString(16).slice(-4);
  }
  return str;
}

function InitUid() {
  const c = new Cookies();
  if (c.get("uid")) {
    return;
  }
  c.set("uid", ID(), {
    expires: new Date(new Date().setFullYear(new Date().getFullYear() + 1))
  });
}

InitUid();

render(
  <Router>
    <Route  path="/" component={App} />
  </Router>,
  document.getElementById("root")
);
registerServiceWorker();
