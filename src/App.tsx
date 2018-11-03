import * as Automerge from 'automerge';
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

interface IStickies {[id: string]: IStickie};

interface IState {
  stickies?: IStickies;
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
    }
  }

  public componentDidMount() {
    this.ws = new WebSocket(`ws://${window.location.hostname}:8080`);

    // Listen for messages
    this.ws.addEventListener('message', event => {
      // tslint:disable-next-line:no-console
      console.log('Received message', event.data);
      this.setState(s => {
        const {id, changes} = JSON.parse(event.data);
        return {
          ...s,
          stickies: Automerge.applyChanges(s.stickies || Automerge.init(id), changes)
        }
      });
    });
  }

  public render() {
    const {stickies} = this.state;

    if(!stickies) {
      return null;
    }

    return (
      <div className="App" onDoubleClick={this.handleDoubleClick}>
        {
          Object.keys(stickies).map(stickieId => {
            const stickie = stickies[stickieId];
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

  private deleteStickie = (stickieId: string) => {
    this.updateStickie(stickieId, null);
  }

  private handleChangeStickieCoordinates = (stickieId: string, coordinates: {x: number, y: number}) => {
    this.updateStickie(stickieId, {coordinates});
  }

  private handleTextChange = (stickieId: string, text: string) => {
    this.updateStickie(stickieId, {text});
  }

  private handleDoubleClick = (e: React.MouseEvent<HTMLElement>) => {
    const coordinates = {
      x: e.clientX - STICKIE_WIDTH / 2,
      y: e.clientY - STICKIE_HEIGHT / 2,
    }
    const text = '';
    this.updateStickie(uuid4(), {coordinates, text});
  }

  private updateStickie = (
    id: string,
    partialUpdates: Partial<IStickie> | null
  ) => {
    this.setState(s => {
      if (!s.stickies) {
        return s;
      }

      const newStickies = Automerge.change(s.stickies, 'Update', (stickies: IStickies) => {        
        if (partialUpdates === null) {
          delete stickies[id];
        }
        else if (!stickies[id]) {
          stickies[id] = partialUpdates as IStickie;
        } else {
          Object.keys(partialUpdates).forEach(key => {
            stickies[id][key] = partialUpdates[key];
          });
        }

      });
      this.updateServer(s.stickies, newStickies);
      return {
        ...s,
        stickies: newStickies
      };
    });
  }

  private updateServer = (oldStickies: IStickies, newStickies: IStickies) => {
    const changes = Automerge.getChanges(oldStickies, newStickies);
    const id = newStickies._actorId;
    this.ws.send(JSON.stringify({id, changes}));
  }
}

export default App;
