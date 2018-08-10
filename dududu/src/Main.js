import React, { Component } from "react";
import Dropzone from "./Dropzone";
// Our app
class Main extends Component {
  constructor(props) {
    super(props);

    this.state = {
      files: []
    };
  }

  render() {
    return (
      <div className="main">
        <div  className="effect--fadeIn">
          <div className="title">私密、安全的文件分享服务</div>
          <div className="description">
            <div>
              通过安全、私密且受加密的链接发送文件，链接到期后文件将从网上彻底抹除。
            </div>
            <a
              href="https://testpilot.firefox.com/experiments/send"
              className="link"
            >
              详细了解
            </a>
          </div>
          <Dropzone  />
        </div>
      </div>
    );
  }
}

export default Main;
