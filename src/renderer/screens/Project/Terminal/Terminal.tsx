import React, { useEffect, useRef, useState } from 'react';
import '../../../styles/Project/Terminal/Terminal.scss';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from 'renderer/redux/store';
import Margin from 'renderer/components/general/Margin';
import useShortcut from '@/renderer/hooks/useShortcut';
import useShortcutShift from '@/renderer/hooks/useShortcutShift';
import {
  addTermMsg,
  resetTermData,
  setServerRunning,
} from '@/renderer/redux/project/projectSlice';
import { RenFuncs } from '@/shared/utils/RenFuncs';
import 'xterm/css/xterm.css';

import { Terminal } from 'xterm';
import { FitAddon } from 'xterm-addon-fit';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlay, faRefresh, faStop } from '@fortawesome/pro-solid-svg-icons';
import { LoadingOutlined } from '@ant-design/icons';
import { Button } from 'antd';

function TerminalComponent() {
  const dispatch = useDispatch();
  const curProject = useSelector(
    (state: RootState) => state.app.currentProject
  );
  const termData = useSelector((state: RootState) => state.project.termData);
  let platform = useSelector((state: RootState) => state.app.curPlatform);
  let serverRunning = useSelector(
    (state: RootState) => state.project.serverRunning
  );

  const [port, setPort] = useState('');
  const [starting, setStarting] = useState(false);
  const [stopping, setStopping] = useState(false);

  let runServer = () => {
    setStarting(true);
    window.electron.runServer({ projKey: curProject?.key, port });
  };

  let killServer = () => {
    if (!serverRunning) return;
    setStopping(true);
    window.electron.killServer({});
  };

  useShortcutShift('r', runServer);
  useShortcutShift('e', killServer);

  const terminalRef: any = useRef(null);

  useEffect(() => {
    const terminal = new Terminal({
      disableStdin: true,
      fontFamily: 'CascadiaMono',
      letterSpacing: -0.5,
      fontSize: 14,
      theme: {
        background: '#1c1c1c',
        green: '#55F884',
      },
    });
    const fitAddon = new FitAddon();

    terminal.open(terminalRef.current);
    terminal.loadAddon(fitAddon);
    terminalRef.current._xterm = terminal;
    terminal.focus();

    termData.forEach((line: string) =>
      terminalRef.current._xterm.writeln(line)
    );

    // Initialize the fit addon
    fitAddon.fit();

    // Handle cleanup when the component unmounts
    return () => {
      terminal.dispose();
      window.electron.removeTermListener();
    };
  }, []);

  useEffect(() => {
    let handleMessage: any = (event: any, payload: any) => {
      if (payload.type == 'SPAWNED') {
        setStarting(false);
        dispatch(setServerRunning(true));
      }

      if (payload.type == 'CLOSED') {
        dispatch(setServerRunning(false));
        setStopping(false);
      }

      let lines = payload.data.slice(0, -1).split('\n');

      dispatch(addTermMsg(lines));
      lines.forEach((line: string) => terminalRef.current._xterm.writeln(line));
    };

    window.electron.onUpdateTerminal(handleMessage);
  }, []);

  useShortcut('k', () => {
    dispatch(resetTermData(null));
    terminalRef.current._xterm.clear();
  });

  return (
    <div className="terminalContainer">
      <div className="headerContainer">
        <div className="left">
          <button onClick={() => runServer()}>
            {starting ? (
              <LoadingOutlined className="icon" />
            ) : serverRunning ? (
              <FontAwesomeIcon icon={faRefresh} size="sm" className="icon" />
            ) : (
              <FontAwesomeIcon icon={faPlay} size="sm" className="icon" />
            )}
            {serverRunning ? 'Restart' : 'Run Server'}
          </button>
          <Margin width={10} />
          <Button
            type="text"
            disabled={!serverRunning}
            onClick={() => killServer()}
          >
            {stopping ? (
              <LoadingOutlined className="icon" />
            ) : (
              <FontAwesomeIcon icon={faStop} size="sm" className="icon" />
            )}
            Stop Server
          </Button>
          <Margin width={10} />
        </div>
        <div className="portContainer">
          <p>PORT: </p>
          <input
            className="portInput"
            placeholder="Default 8080"
            value={port}
            onChange={(e) => setPort(e.target.value)}
          />
        </div>
      </div>
      {/* <ReactTerminal commands={{}} /> */}
      <div
        ref={terminalRef}
        style={{
          height: '260px',
          paddingLeft: '15px',
          paddingTop: '5px',
        }}
      />
      {/* <div style={{ height: '100px' }}></div> */}

      {/* <div className="xtermContainer">
        <XTerm
          addons={[fitAddon]}
          options={{
            allowTransparency: true,
            disableStdin: true,
            theme: {
              background: '#444444',
              black: '#111',
            },
            scrollback: 400,
            fontFamily: 'Menlo',
          }}
          ref={xtermRef}
          onData={onData}
        />
      </div> */}

      {/* <div className="textContainer">
        {termData.map((msg, index) => {
          console.log(termData);
          return (
            <p className={`${msg.type === 'error' && 'errMsg'}`} key={index}>
              {msg.data}
            </p>
          );
        })}
      </div> */}
    </div>
  );
}

export default TerminalComponent;
