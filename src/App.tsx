import * as React from 'react';
import * as uuid4 from 'uuid/v4';

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
  connectionError: boolean;
}

const STICKIE_WIDTH = 100;
const STICKIE_HEIGHT = 100;

class App extends React.Component<{}, IState> {
  private ws: WebSocket;

  constructor(props: {}) {
    super(props);
    this.state = {
      connectionError: false,
      stickies: {
        ['1']: {
          coordinates: {
            x: 0,
            y: 0,
          },
          text: 'test123',
        },
        ['2']: {
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
                width={STICKIE_WIDTH}
                height={STICKIE_HEIGHT}
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
      x: e.clientX - STICKIE_WIDTH / 2,
      y: e.clientY - STICKIE_HEIGHT / 2,
    }
    const id = uuid4();
    this.updateState(s => (
      {
        stickies: {
          ...s.stickies,
          [id]: {
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
