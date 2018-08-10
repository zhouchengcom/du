import React, { Component } from "react";
import send_logo from "./svg/send_logo.svg";
import { Route } from "mirrorx";

import Main from "./Main";
import Fileuploader from "./Fileuploader";
import Scan from "./scan"
// Our app
class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
      files: []
    };
  }

  render() {
    return (
      <div className="App">
        <header className="header">
          <div className="logo">
            <a href="/" className="logo__link">
              <img src={send_logo} alt="Send" />
              <h1 className="logo__title">Send</h1>
            </a>
            <div className="logo__subtitle">
              <a
                href="https://testpilot.firefox.com"
                className="logo__subtitle-link"
              >
                Firefox Test Pilot
              </a>
              <div>Web 实验</div>
            </div>
          </div>
        </header>

        <Route exact path="/" component={Main} />

        <Route path="/send" component={Fileuploader} />
        <Route path="/scan/:name" component={Scan} />
      </div>
    );
  }
}

export default App;
