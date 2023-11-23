import { Button, Spin, Tooltip } from 'antd';
import { useCallback, useEffect, useState } from 'react';
import Margin from '@/renderer/components/general/Margin';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/renderer/redux/store';
import { ProjectService } from '@/renderer/services/ProjectService';
import { BuildStatus, GBuild } from '@/shared/models/GBuild';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircle } from '@fortawesome/free-solid-svg-icons';
import { format } from 'date-fns';
import clipboardCopy from 'clipboard-copy';
import { LoadingOutlined } from '@ant-design/icons';
import { addBuild, setCloudData } from '@/renderer/redux/cloud/cloudSlice';

import '@/renderer/styles/Project/SectionManager/HostingManager/HostingManager.scss';

function HostingManager() {
  const dispatch = useDispatch();

  const cloudState = useSelector((state: RootState) => state.cloud);
  const user = useSelector((state: RootState) => state.app.user);
  const cloudService = cloudState.cloudRunService;
  const curProject = useSelector(
    (state: RootState) => state.app.currentProject
  );

  const [deployLoading, setDeployLoading] = useState(false);
  const [initErr, setInitErr] = useState(false);
  const [errText, setErrText] = useState('');

  const deploy = async () => {
    setErrText('');
    setDeployLoading(true);

    let res = await window.electron.updateYamlAndGitPush({
      project: curProject,
    });

    if (!res) {
      setDeployLoading(false);
      setErrText('Failed to deploy');
      return;
    }

    try {
      const { data } = await ProjectService.createBuild(curProject!._id);
      dispatch(addBuild(data));
    } catch (error) {
      setErrText('Failed to deploy');
    }
    setDeployLoading(false);
  };

  const copyEndpointClicked = async () => {
    let textToCopy = cloudService.endpoint;
    clipboardCopy(textToCopy)
      .then(() => {})
      .catch((err) => {
        console.error('Error copying text:', err);
      });
  };

  const fetchBuilds = useCallback(async () => {
    let shouldFetch = false;
    cloudState.builds!.map((build) => {
      if (build.status === BuildStatus.WORKING) {
        shouldFetch = true;
      }
    });

    if (shouldFetch) {
      try {
        let { data } = await ProjectService.getCloudData(curProject!._id);
        dispatch(setCloudData(data));
      } catch (error) {
        console.log('Failed to get builds');
      }
    }
  }, [cloudState]);

  useEffect(() => {
    const pollingInterval = setInterval(fetchBuilds, 5000);
    return () => clearInterval(pollingInterval);
  }, [fetchBuilds]);

  let init = async () => {
    try {
      let { data } = await ProjectService.getCloudData(curProject!._id);
      dispatch(setCloudData(data));
    } catch (error) {
      console.log('Failed to get builds');
      setInitErr(true);
    }
  };
  useEffect(() => {
    if (cloudState.builds == null) {
      init();
    }
  }, []);

  if (initErr) {
    return (
      <div className="emptyContainer">
        <p>Failed to retrieve project deployments</p>
      </div>
    );
  }

  if (!cloudState.builds) {
    return (
      <div className="emptyContainer">
        <Spin />
      </div>
    );
  }
  return (
    <div className="hostingManager">
      <h3 className="title">Hosting</h3>
      <Margin height={10} />
      <div className="row1">
        <Tooltip
          title={
            user.accountTier == 'starter' &&
            'Premium account required to host projects'
          }
        >
          <Button
            loading={deployLoading}
            className="actionBtn"
            onClick={() => deploy()}
            disabled={user.accountTier == 'starter'}
          >
            Deploy
          </Button>
        </Tooltip>
        <Margin width={8} />

        <Tooltip title={cloudService == null && 'No builds detected'}>
          <Button
            disabled={cloudService == null}
            onClick={() => copyEndpointClicked()}
            className="actionBtn"
          >
            Copy Endpoint
          </Button>
        </Tooltip>
      </div>
      {errText && <p className="errorText">{errText}</p>}
      <Margin height={20} />
      <div className="buildsContainer">
        <p className="sectionTitle">Builds </p>
        {cloudState.builds.length === 0 && (
          <p className="noBuildsTxt">No builds available</p>
        )}
        {cloudState.builds.length > 0 &&
          cloudState.builds.map((build: GBuild, index: number) => {
            let createTime = new Date(build.createTime);

            return (
              <div key={index} className="buildRow">
                {build.status == BuildStatus.WORKING ? (
                  <div className="statusIcon">
                    <LoadingOutlined style={{ color: '#0173FF' }} />
                  </div>
                ) : (
                  <FontAwesomeIcon
                    icon={faCircle}
                    className={`statusIcon ${
                      build.status == BuildStatus.SUCCESS
                        ? 'successIcon'
                        : 'failIcon'
                    }`}
                  />
                )}

                <p className="buildId">{build.id.slice(0, 8)}</p>
                <p className="buildTime">
                  {format(createTime, 'dd/MM, hh:mm')}
                </p>
              </div>
            );
          })}
      </div>
    </div>
  );
}

export default HostingManager;
