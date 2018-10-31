import * as React from 'react';
import './App.css';

import { Stickie } from './Stickie';

interface IStickie {
  coordinates: {
    x: number,
    y: number,
  };
  text: string;
}

interface IState {
  stickies: {[id: number]: IStickie};
  nextId: number;
}

class App extends React.Component<{}, IState> {

  constructor(props: {}) {
    super(props);
    this.state = {
      nextId: 0,
      stickies: {
        [-1]: {
          coordinates: {
            x: 0,
            y: 0,
          },
          text: 'test123',
        },
        [-2]: {
          coordinates: {
            x: 100,
            y: 100,
          },
          text: 'test123',
        },
      }
    }
  }

  public render() {
    return (
      <div className="App" onDoubleClick={this.handleDoubleClick}>
        {
          Object.keys(this.state.stickies).map(stickieId => {
            const stickie = this.state.stickies[stickieId];
            return (
              <Stickie 
                coordinates={stickie.coordinates} 
                text={stickie.text} 
                key={stickieId} 
                onChangeCoordinates={this.handleChangeStickieCoordinates.bind(this, stickieId)} 
                onDelete={this.deleteStickie.bind(this, stickieId)}
              />
            );
          })
        }
      </div>
    );
  }

  private deleteStickie = (stickieId: number) => {
    this.setState(s => {
      delete s.stickies[stickieId];
      return {
        stickies: {
          ...s.stickies,
        }
      };
    });
  }

  private handleChangeStickieCoordinates = (stickieId: number, coordinates: {x: number, y: number}) => {
    this.setState(s => ({
      stickies: {
        ...s.stickies,
        [stickieId]: {
          ...s.stickies[stickieId],
          coordinates
        }
      }
    }));
  }

  private handleDoubleClick = (e: React.MouseEvent<HTMLElement>) => {
    const coordinates = {
      x: e.clientX,
      y: e.clientY,
    }
    this.setState(s => (
      {
        nextId: s.nextId + 1,
        stickies: {
          ...s.stickies,
          [s.nextId]: {
            coordinates,
            text: ''
          }
        }
      }
    ));
  }
}

export default App;
