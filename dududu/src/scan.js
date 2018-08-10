import React, { Component } from "react";

// Our app
class Scan extends Component {
  constructor(props) {
    super(props);
    this.state = {
      result: null
    };
  }

  async getScanResult() {
    let respond = null;
    let value = null;
    try {
      while (true) {
        respond = await fetch(`/api/scan/${this.props.match.params.name}`);
        value = await respond.json();
        this.setState({ result: value });
        if (value.state && value.state === "end") {
          return;
        }
        await new Promise(resolve => setTimeout(resolve, 3000));
      }
    } catch (e) {
      console.log(e);
    }
  }

  componentDidMount() {
    this.getScanResult();
  }

  renderScanType() {
    let { result } = this.state;

    if (result && result.list) {
      return Object.entries(result.list).map(([k, v]) => {
        return (
          <tr key={k}>
            <td className="fileData fileData--overflow">{k}</td>
            <td className="fileData fileData--overflow">{v.state}</td>
            <td className="fileData fileData--overflow">{v.result || "--"}</td>
            <td className="fileData fileData--overflow">{v.msg || "--"}</td>
          </tr>
        );
      });
    }
  }

  render() {
    let title = "";
    let { result } = this.state;
    if (result) {
      if (result.state === "end") {
        title = `分析完成 ${result.name}`;
      } else {
        title = `正在分析 ${result.name}`;
      }
    }
    return (
      <div className="main">
        <div className="effect--fadeIn">
          <div className="title">{title}</div>
          <div className="description" />
          <table className="fileList">
            <thead>
              <tr>
                <th className="fileList__header fileList__expireCol">type</th>
                {/* <th className="fileList__header fileList__copyCol">时间</th> */}
                <th className="fileList__header fileList__dlCol">状态</th>
                <th className="fileList__header fileList__dlCol">结果</th>
                <th className="fileList__header fileList__nameCol">信息</th>
              </tr>
            </thead>
            <tbody className="fileList__body">{this.renderScanType()}</tbody>
          </table>
        </div>
      </div>
    );
  }
}

export default Scan;
