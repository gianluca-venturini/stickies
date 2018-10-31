import * as React from 'react';

import './Stickie.css';

export class Stickie extends React.Component {
  public render() {
    const style = {
      left: 0,
      top: 0,
    };
    return (
      <div className="Stickie" contentEditable={true} style={style}/>
    );
  }
}