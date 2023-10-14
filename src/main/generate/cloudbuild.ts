import { serverLocation } from '@/renderer/misc/constants';
import { FileFuncs } from '../helpers/fileFuncs';
import { MainFuncs } from '@/shared/utils/MainFuncs';
import path from 'path';

export const generateCloudBuildYaml = (
  projId: string,
  secretsString: string
) => {
  let loc = serverLocation;
  return `
steps:
  # Build the Docker image
  - name: 'gcr.io/cloud-builders/docker'
    args: ['build', '-t', '${loc}-docker.pkg.dev/$PROJECT_ID/visual-backend/${projId}', '.']

  # Push the Docker image to Container Registry
  - name: 'gcr.io/cloud-builders/docker'
    args: ['push', '${loc}-docker.pkg.dev/$PROJECT_ID/visual-backend/${projId}']
    
  # Deploy the Docker image to Cloud Run
  - name: 'gcr.io/cloud-builders/gcloud'

    entrypoint: 'bash'
    args: [
      '-c',
      'gcloud run deploy id-${projId}
      --image=${loc}-docker.pkg.dev/$PROJECT_ID/visual-backend/${projId} 
      --platform=managed
      --region=${loc} 
      --allow-unauthenticated 
${secretsString}
      '
    ]
        
images:
    - '${loc}-docker.pkg.dev/$PROJECT_ID/visual-backend/${projId}'    
`;
};

export const writeCloudBuildYaml = async (
  projKey: string,
  projId: string,
  secretsString: string
) => {
  await FileFuncs.writeFile(
    path.join(MainFuncs.getProjectPath(projKey), 'cloudbuild.yaml'),
    generateCloudBuildYaml(projId, secretsString)
  );
};
