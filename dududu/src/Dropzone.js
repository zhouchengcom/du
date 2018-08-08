/*
 * Minio Cloud Storage (C) 2016 Minio, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import React from "react";
import ReactDropzone from "react-dropzone";
import upload_logo from "./svg/upload.svg";
import mirror, { actions } from "mirrorx";

mirror.model({
  name: "uplaodFile",
  initialState: null,
  reducers: {
    set(old, news) {
      return news;
    }
  }
});

export default class Dropzone extends React.Component {
  onDrop(files) {
    console.log(files);
    actions.uplaodFile.set(files[0]);
    actions.routing.push("/send");
  }

  render() {
    const style = {
      height: "100%",
      borderWidth: "0",
      borderStyle: "dashed",
      borderColor: "#fff",
      width: "100%"
    };

    return (
      <ReactDropzone style={style} onDrop={this.onDrop.bind(this)}>
        <div className="uploadArea">
          {/* <Dropzone> */}
          <img src={upload_logo} title="上传" />
          <div className="uploadArea__msg">把文件拖到到此处开始上传</div>
          <span className="uploadArea__sizeMsg">
            为保证运行稳定，建议文件大小不超过 1GB
          </span>
          <label title="选择一个要上传的文件" className="btn btn--file">
            选择一个要上传的文件
          </label>
        </div>
      </ReactDropzone>
    );
  }
}
