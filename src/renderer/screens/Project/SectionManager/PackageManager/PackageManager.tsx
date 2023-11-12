import React, { useEffect, useState } from 'react';
import '@/renderer/styles/Project/PackageManager/PackageManager.scss';
import { useSelector } from 'react-redux';
import { RootState } from '@/renderer/redux/store';
import { Button, Input, Space, Spin } from 'antd';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash } from '@fortawesome/free-solid-svg-icons';

let hidePackages: any = {
  '@gitbeaker/rest': 'hide',
  '@google-cloud/cloudbuild': 'hide',
  nodemon: 'hide',
  'ts-patch': 'hide',
  'typescript-transform-paths': 'hide',
  gitlab: 'hide',
  'node-gitlab': 'hide',
  'http-status-codes': 'hide',
  'body-parser': 'show',
  jsonwebtoken: 'show',
  express: 'show',
  axios: 'show',
  dotenv: 'show',
  cors: 'show',
  ngrok: 'show',
  // mongodb: 'show',
};

function PackageManager() {
  let curProject = useSelector((state: RootState) => state.app.currentProject);
  let [packages, setPackages] = useState<any>([]);
  const [packageName, setPackageName] = useState('');
  const [installLoading, setInstallLoading] = useState(false);
  const [errText, setErrText] = useState('');

  let getProjPackages = async () => {
    let packages = [];
    let res = await window.electron.getProjectPackages({
      projKey: curProject?.key,
    });
    for (const [key, value] of Object.entries(res)) {
      packages.push({ name: key, version: value });
    }

    let sortedPackges = packages.sort((a: any, b: any) => {
      if (hidePackages[a.name]) return -1;
      else return 1;
    });
    setPackages(packages);
  };

  useEffect(() => {
    getProjPackages();
  }, []);

  const installClicked = async () => {
    setInstallLoading(true);
    setErrText('');
    const { error } = await window.electron.installNpmPackage({
      projKey: curProject?.key,
      pkgName: packageName,
    });

    if (error) {
      setInstallLoading(false);
      setPackageName('');
      setErrText('Failed to install');
      return;
    }

    await getProjPackages();

    setInstallLoading(false);
    setPackageName('');
  };

  if (packages.length === 0) {
    return (
      <div className="emptyContainer">
        <Spin />
      </div>
    );
  }
  return (
    <div className="packageManager">
      <div className="headerContainer">
        <p className="header">Packages</p>

        <p className="installHeader">Install new package</p>
        <Space.Compact style={{ width: '100%' }}>
          <Input
            value={packageName}
            onChange={(e) => setPackageName(e.target.value)}
            placeholder="<package-name>"
          />
          <Button
            loading={installLoading}
            onClick={() => installClicked()}
            type="primary"
          >
            Install
          </Button>
        </Space.Compact>
        {errText && <p className="errorText">{errText}</p>}
      </div>
      <div className="middleContainer">
        <p className="header">Installed</p>
        {packages.map((pkg: any, index: number) => {
          if (hidePackages[pkg.name] == 'hide') {
            return <></>;
          }
          return (
            <PkgRow pkg={pkg} key={index} getProjPackages={getProjPackages} />
          );
        })}
      </div>
    </div>
  );
}

export default PackageManager;

export const PkgRow = ({ pkg, getProjPackages }: any) => {
  const [loading, setLoading] = useState(false);
  let curProject = useSelector((state: RootState) => state.app.currentProject);

  const deleteClicked = async () => {
    setLoading(true);
    const { error } = await window.electron.deleteNpmPackage({
      projKey: curProject!.key,
      pkgName: pkg.name,
    });

    if (error) {
      setLoading(false);
      return;
    }

    await getProjPackages();
    setLoading(false);
    return;
  };
  return (
    <div className="pkgRow">
      <div className="left">
        <p className="pkgName">{pkg.name} </p>
        <p className="pkgVersion"> | v{pkg.version.slice(1)}</p>
      </div>
      {!hidePackages[pkg.name] && (
        <Button
          loading={loading}
          onClick={() => deleteClicked()}
          type="text"
          className="delBtn"
        >
          <FontAwesomeIcon icon={faTrash} />
        </Button>
      )}
    </div>
  );
};
