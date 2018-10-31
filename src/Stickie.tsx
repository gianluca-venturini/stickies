import * as React from 'react';

import './Stickie.css';

interface ICoordinates {
  x: number,
  y: number,
}

interface IProps {
  coordinates: ICoordinates;
  text: string;
  onChangeCoordinates: (coordinates: ICoordinates) => void;
}

export class Stickie extends React.Component<IProps, {}> {
  private mouseDownCoordinates?: ICoordinates;
  private initialCoordinates?: ICoordinates;

  public render() {
    const {x, y} = this.props.coordinates;
    const {text} = this.props;
    const style = {
      left: x,
      top: y,
    };

    return (
      <div 
        className="Stickie" 
        contentEditable={true} 
        style={style}
        onMouseDown={this.handleOnMouseDown}
        onMouseMove={this.handleOnMouseMove}
        onMouseUp={this.handleOnMouseUp}
        dangerouslySetInnerHTML={{__html: text}}
      />
    );
  }

  private handleOnMouseDown = (e: React.MouseEvent<HTMLElement>) => {
    this.mouseDownCoordinates = {x: e.clientX, y: e.clientY};
    this.initialCoordinates = this.props.coordinates;
  }

  private handleOnMouseUp = (e: React.MouseEvent<HTMLElement>) => {
    this.mouseDownCoordinates = undefined;
    this.initialCoordinates = undefined;
  }
  
  private handleOnMouseMove = (e: React.MouseEvent<HTMLElement>) => {
    const coordinates = {
      x: e.clientX,
      y: e.clientY,
    }
    if (this.initialCoordinates && this.mouseDownCoordinates) {
      this.props.onChangeCoordinates({
        x: this.initialCoordinates.x + (coordinates.x - this.mouseDownCoordinates.x),
        y: this.initialCoordinates.y + (coordinates.y - this.mouseDownCoordinates.y),
      });
    }
  }
}