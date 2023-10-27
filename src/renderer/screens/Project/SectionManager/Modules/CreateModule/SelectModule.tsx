import '@/renderer/styles/Project/CreateModule/SelectModule.scss';
import { Dispatch, SetStateAction } from 'react';
import { BModuleType } from '@/shared/models/BModule';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faXmark } from '@fortawesome/free-solid-svg-icons';
import { useDispatch, useSelector } from 'react-redux';
import { setCreateModuleOpen } from '@/renderer/redux/project/projectSlice';

import { RootState } from '@/renderer/redux/store';
import { BModule } from '@/shared/models/BModule';

import MongoDBLogo from '@/shared/assets/images/mongodb-logo.png';
import FBAuthLogo from '@/shared/assets/images/fb-auth.png';
import FBFirestoreLogo from '@/shared/assets/images/fb-firestore.png';
import JWTLogo from '@/shared/assets/images/jwt.png';
import StripeLogo from '@/shared/assets/images/stripe.png';
import GptLogo from '@/shared/assets/images/chatgpt.png';
import ResendLogo from '@/shared/assets/images/resend.png';

import '@/renderer/styles/Project/CreateModule/CreateModule.scss';

type SelectModuleProps = {
  setSelection: Dispatch<SetStateAction<BModuleType | null>>;
};

function SelectModule({ setSelection }: SelectModuleProps) {
  const dispatch = useDispatch();
  const modules = useSelector((state: RootState) => state.module.modules);

  let availableMods = [
    {
      title: 'Firebase (Auth)',
      image: FBAuthLogo,
      key: BModuleType.FirebaseAuth,
      position: 1,
    },
    {
      title: 'Firebase (Firestore)',
      image: FBFirestoreLogo,
      key: BModuleType.FirebaseFirestore,
      position: 2,
    },
    { title: 'MongoDB', image: MongoDBLogo, key: BModuleType.Mongo },
    {
      title: 'JWT (Auth)',
      image: JWTLogo,
      key: BModuleType.JwtAuth,
      scale: 0.8,
      position: 3,
    },
    {
      title: 'Stripe',
      image: StripeLogo,
      key: BModuleType.Stripe,
      position: 4,
    },
    {
      title: 'Resend',
      image: ResendLogo,
      key: BModuleType.Resend,
      position: 5,
    },
    {
      title: 'GPT',
      image: GptLogo,
      key: BModuleType.Gpt,
      position: 6,
    },
  ];

  let sortedMods = availableMods.sort((a, b) => {
    const indexA = modules?.findIndex((m: BModule) => m.key === a.key);
    const indexB = modules?.findIndex((m: BModule) => m.key === b.key);

    if (indexA === -1 && indexB === -1) {
      return a.position! - b.position!; // Both items not found in modules, maintain their relative order
    } else if (indexA === -1) {
      return -1; // Only a is not found in modules, place it below b
    } else if (indexB === -1) {
      return 1; // Only b is not found in modules, place it below a
    } else {
      // Both a and b are found in modules, sort based on a.position
      return a.position! - b.position!;
    }
  });

  return (
    <div className="selectModule">
      <div className="headerBar">
        <p>Create module</p>
        <button onClick={() => setSelection(null)}>
          <FontAwesomeIcon
            icon={faXmark}
            className="icon"
            size="lg"
            onClick={() => dispatch(setCreateModuleOpen(false))}
          />
        </button>
      </div>
      <div className="selectionContainer">
        {sortedMods.map((mod: any) => (
          <button
            onClick={() => setSelection(mod.key)}
            className="moduleSelection"
            disabled={
              modules!.findIndex((m: BModule) => m.key == mod.key) != -1
            }
          >
            <div className="left">
              <img
                style={{
                  transform: `scale(${mod.scale})`,
                  borderRadius: '5px',
                }}
                src={mod.image}
                className="logo"
              />
              <p>{mod.title}</p>
            </div>
            {modules!.findIndex((m: BModule) => m.key == mod.key) != -1 && (
              <div className="right">
                <p style={{ justifySelf: 'flex-end' }}>Added</p>
              </div>
            )}
          </button>
        ))}

        <p className="moreComingTxt">More coming soon...</p>
      </div>
    </div>
  );
}

export default SelectModule;
