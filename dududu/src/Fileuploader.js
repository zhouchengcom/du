import React, { Component } from "react";
import Uploader from "./uploader";
import { connect, actions,Link} from "mirrorx";
import faillogo from "./svg/illustration_error.svg";
// Our app

const radius = 73;
const oRadius = radius + 10;
const oDiameter = oRadius * 2;
const circumference = 2 * Math.PI * radius;

const LOCALIZE_NUMBERS = !!(
  typeof Intl === "object" &&
  Intl &&
  typeof Intl.NumberFormat === "function" &&
  typeof navigator === "object"
);


const UNITS = ["B", "kB", "MB", "GB"];

const requesturl =
  "http://10.11.65.34:32769/my-bucketname/my-objectname?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=M4UE4EE0UV36DFSMBAC2%2F20180807%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Date=20180807T103340Z&X-Amz-Expires=259200&X-Amz-SignedHeaders=host&X-Amz-Signature=52e31170ec0680871171bc36053d4aae35d6a1958fd0432b4e8332792db0f3a2";
function bytes(num) {
  if (num < 1) {
    return "0B";
  }
  const exponent = Math.min(Math.floor(Math.log10(num) / 3), UNITS.length - 1);
  const n = Number(num / Math.pow(1000, exponent));
  let nStr = n.toFixed(1);
  if (LOCALIZE_NUMBERS) {
    try {
      const locale = document.querySelector("html").lang;
      nStr = n.toLocaleString(locale, {
        minimumFractionDigits: 1,
        maximumFractionDigits: 1
      });
    } catch (e) {
      // fall through
    }
  }
  return `${nStr}${UNITS[exponent]}`;
}

class Fileuploader extends Component {
  constructor(props) {
    super(props);
    this.uploader = React.createRef();

    this.state = {
      process: 0
    };
  }

  handleCancel() {
    if (this.uploader.current) {
      this.uploader.current.xhr.abort();
    }
    actions.routing.push("/");
  }

  onComplete() {
    console.log("finish");
  }
  onError(error) {
    console.log(error);
    this.setState({ error: error });
  }

  componentDidMount() {
    console.log(this.uploader);
    if (
      this.props.uplaodFile === "undefined" ||
      this.props.uplaodFile === null
    ) {
      actions.routing.push("/");
      return;
    }
    this.uploader.current.handleUpload([this.props.uplaodFile]);
  }

  renderProgress(state) {
    if (this.state.error) {
      return <div />;
    }
    return (
      <ProgressBar
        {...state}
        uplaodFile={this.props.uplaodFile}
        handleCancel={this.handleCancel.bind(this)}
      />
    );
  }

  renderError() {
    if (this.props.uplaodFile === undefined || this.props.uplaodFile === null) {
      return <div />;
    }
    var title = `上传失败 ${this.props.uplaodFile.name}  ${bytes(
      this.props.uplaodFile.size
    )}`;

    if (this.state.error) {
      return (
        <div>
          <div className="page effect--fadeIn" />
          <div className="title">{title}</div>
          <div className="description" />
          <div className="page">
            <img src={faillogo} />
          </div>
          <div className="progressSection">
            <Link className="btn btn--cancel" to="/">
              返回
            </Link>
          </div>
        </div>
      );
    }
  }
  render() {
    var request = {
      fileName: "name",
      url: requesturl,
      method: "PUT"
    };

    return (
      <div>
        <Uploader
          request={request}
          ref={this.uploader}
          onError={this.onError.bind(this)}
          onComplete={this.onComplete.bind(this)}
        >
          {this.renderProgress.bind(this)}
        </Uploader>
        {this.renderError()}
      </div>
    );
  }
}

class ProgressBar extends Component {
  render() {
    if (this.props.uplaodFile === undefined || this.props.uplaodFile === null) {
      return <div />;
    }

    const p = this.props.progress / 100;
    const dashOffset = (1 - p) * circumference;
    const percent = `${Math.floor(p * 100)}%`;
    var title = `正在上传 ${this.props.uplaodFile.name}  ${bytes(
      this.props.uplaodFile.size
    )}`;

    var presize = `${bytes(this.props.uplaodFile.size * p)} / ${bytes(
      this.props.uplaodFile.size
    )}`;
    return (
      <div>
        <div className="page effect--fadeIn" />
        <div className="title">{title}</div>
        <div className="description" />
        <div className="progressSection">
          <div className="page effect--fadeIn">
            <div className="title" />
            <div className="description" />
            <div className="progress">
              <svg width={oDiameter} height={oDiameter} version="1.1">
                <circle
                  className="progress__bg"
                  r={radius}
                  cx={oRadius}
                  cy={oRadius}
                  fill="transparent"
                />
                <circle
                  className="progress__indefinite progress--invisible"
                  r={radius}
                  cx={oRadius}
                  cy={oRadius}
                  fill="transparent"
                  transform={`rotate(-90 ${oRadius} ${oRadius})`}
                  strokeDasharray={circumference}
                  strokeDashoffset={dashOffset}
                />
                <circle
                  className="progress__bar"
                  r={radius}
                  cx={oRadius}
                  cy={oRadius}
                  fill="transparent"
                  transform={`rotate(-90 ${oRadius} ${oRadius})`}
                  strokeDasharray={circumference}
                  strokeDashoffset={dashOffset}
                />
                <text
                  className="progress__percent"
                  textAnchor="middle"
                  x="50%"
                  y="98"
                >
                  {percent}
                </text>
              </svg>
            </div>
            <div className="progressSection">
              <div className="progressSection__text">{presize}</div>
              <button
                className="btn btn--cancel"
                onClick={this.props.handleCancel}
              >
                取消上传
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

Fileuploader = connect(state => ({ uplaodFile: state.uplaodFile }))(
  Fileuploader
);

export default Fileuploader;
