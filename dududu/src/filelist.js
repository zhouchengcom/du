import React, { Component } from "react";
import mirror, { actions, connect, Link } from "mirrorx";
import db from "./db";
import closeimg from "./svg/close-16.svg";
import copyimg from "./svg/copy-16.svg";

mirror.model({
  name: "localFiles",
  initialState: {},
  reducers: {
    load(old, news) {
      return news;
    },
    add(old, value) {
      db.files.add(value).catch(function(error) {
        console.log(error);
        // alert("Ooops: " + error);
      });
      old[value.md5] = value;
      return old;
    },
    update(old, value) {
      console.log(value);
      db.files.update(value.md5, value).catch(function(error) {
        console.log(error);
        // alert("Ooops: " + error);
      });

      old[value.md5] = { ...value, ...old[value.md5] };

      return old;
    },
    del(old, value) {
      db.files.delete(value.md5).catch(function(error) {
        console.log(error);
      });
      delete old[value.md5];
      return { ...old };
    }
  }
});

async function LoadFiles() {
  try {
    let files = await db.files
      .orderBy("createTime")
      .limit(20)
      .toArray();
    let datas = {};
    console.log(files);
    files.forEach(element => {
      datas[element.md5] = element;
    });
    actions.localFiles.load(datas);

    for (var i in files) {
      let element = files[i];
      if (element.state !== "end") {
        let respond = await fetch(`/api/scan/${element.md5}`);
        let value = await respond.json();
        var local = {};

        for (var k in value.list) {
          local[k] = value.list[k].result;
        }
        local["name"] = value.name;
        local["state"] = value.state;
        local["md5"] = value.md5;
        actions.localFiles.update(local);
      }
    }
  } catch (e) {
    console.log(e);
  }
}
LoadFiles();

// Our app
class FileList extends Component {
  constructor(props) {
    super(props);
    this.state = { types: null };
  }

  async getLocalFiles() {}

  async getScanTypes() {
    let respond = await fetch("/api/scan/types");
    let value = await respond.json();
    this.setState({ types: value });
  }

  componentDidMount() {
    this.getScanTypes();
  }

  renderScanResult(v) {
    console.log(v);
    return this.state.types.map(ct => {
      let result = "--";
      if (v[ct]) {
        if (v[ct].state !== "end") {
          result = "scaning";
        }
        if (v[ct].result) {
          result = v[ct].result;
        }
      }
      return (
        <td key={ct} className="fileData ">
          {result}
        </td>
      );
    });
  }

  renderFiles() {
    let { files } = this.props;

    return Object.entries(files).map(([k, v]) => {
      let d = new Date(parseInt(v.createTime) * 1000).toLocaleString(
        "zh-Hans-CN",
        { hour12: false }
      );
      return (
        <tr key={k}>
          <td className="fileData ">
            <Link to={`/scan/${v.md5}`}>{v.name}</Link>
          </td>
          <td className="fileData ">
            <a target="_blank" href={`/minio/${v.md5}/${v.name}`}>
              <img src={copyimg} />
            </a>
          </td>
          <td className="fileData ">{d.slice(5, -1)}</td>
          {this.renderScanResult(v.list)}
          <td className="fileData ">
            <img
              src={closeimg}
              className="cursor--pointer"
              onClick={e => {
                e.preventDefault();
                actions.localFiles.del(v);
              }}
            />
          </td>
        </tr>
      );
    });
  }

  render() {
    if (Object.keys(this.props.files).length === 0) {
      return <div />;
    }

    if (this.state.types === null || this.state.types === undefined) {
      return <div />;
    }

    for (var v in this.props.files) {
      console.log(v.list);
    }
    return (
      <table className="fileList">
        <thead>
          <tr>
            <th className="fileList__header ">文件</th>
            {/* <th className="fileList__header fileList__copyCol">时间</th> */}
            <th className="fileList__header ">下载</th>
            <th className="fileList__header ">时间</th>
            {this.state.types.map(v => (
              <th key={v} className="fileList__header ">
                {v}
              </th>
            ))}
            <th className="fileList__header ">删除</th>
          </tr>
        </thead>
        <tbody className="fileList__body">{this.renderFiles()}</tbody>
      </table>
    );
  }
}

export default connect(state => ({ files: state.localFiles }))(FileList);
