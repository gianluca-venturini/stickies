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
  stickies: {[id: string]: IStickie}
}

class App extends React.Component<{}, IState> {

  constructor(props: {}) {
    super(props);
    this.state = {
      stickies: {
        id1: {
          coordinates: {
            x: 0,
            y: 0,
          },
          text: 'test123',
        },
        id2: {
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
      <div className="App">
        {
          Object.keys(this.state.stickies).map(stickieId => {
            const stickie = this.state.stickies[stickieId];
            return (
              <Stickie 
                coordinates={stickie.coordinates} 
                text={stickie.text} 
                key={stickieId} 
                onChangeCoordinates={this.handleChangeCoordinates.bind(this, stickieId)} 
              />
            );
          })
        }
      </div>
    );
  }

  private handleChangeCoordinates = (stickieId: string, coordinates: {x: number, y: number}) => {
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
}

export default App;
