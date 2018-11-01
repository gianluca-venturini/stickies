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
  connectionError: boolean;
}

class App extends React.Component<{}, IState> {
  private ws: WebSocket;

  constructor(props: {}) {
    super(props);
    this.state = {
      connectionError: false,
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

  public componentDidMount() {
    this.ws = new WebSocket(`ws://${window.location.hostname}:8080`);

    // Listen for messages
    this.ws.addEventListener('message', event => {
      // tslint:disable-next-line:no-console
      console.log('Received message', event.data);
      this.setState({
        stickies: JSON.parse(event.data)
      })
    });
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
                onTextChange={this.handleTextChange.bind(this, stickieId)}
              />
            );
          })
        }
      </div>
    );
  }

  private deleteStickie = (stickieId: number) => {
    this.updateState(s => {
      delete s.stickies[stickieId];
      return {
        stickies: {
          ...s.stickies,
        }
      };
    });
  }

  private handleChangeStickieCoordinates = (stickieId: number, coordinates: {x: number, y: number}) => {
    this.updateState(s => ({
      stickies: {
        ...s.stickies,
        [stickieId]: {
          ...s.stickies[stickieId],
          coordinates
        }
      }
    }));
  }

  private handleTextChange = (stickieId: number, text: string) => {
    // tslint:disable-next-line:no-console
    console.log(text);
    this.updateState(s => ({
      stickies: {
        ...s.stickies,
        [stickieId]: {
          ...s.stickies[stickieId],
          text
        }
      }
    }));
  }

  private handleDoubleClick = (e: React.MouseEvent<HTMLElement>) => {
    const coordinates = {
      x: e.clientX,
      y: e.clientY,
    }
    this.updateState(s => (
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

  private updateState = <K extends keyof IState>(
    updateState: (
      (
        prevState: Readonly<IState>, 
        props: Readonly<{}>
      ) => (Pick<IState, K> | IState | null)
    ) | (Pick<IState, K> | IState | null)
  ) => {
    if (typeof updateState === 'function') {
      this.setState((state, props) => {
        const newState = updateState(state, props);
        // tslint:disable-next-line:no-console
        console.log(newState);
        if (newState && newState.stickies) {
          this.updateStickiesServer(newState.stickies);
        }
        return newState;
      });
    } else {
      this.setState(updateState);
      // tslint:disable-next-line:no-console
      console.log(updateState);
      if (updateState && updateState.stickies) {
        this.updateStickiesServer(updateState.stickies);
      }
    }
  }

  private updateStickiesServer = (stickies: {[id: number]: IStickie}) => {
    this.ws.send(JSON.stringify(stickies));
  }
}

export default App;
