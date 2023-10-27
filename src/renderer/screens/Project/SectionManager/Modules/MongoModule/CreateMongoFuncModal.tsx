// import React, { Dispatch, SetStateAction, useState } from 'react';
// import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
// import { faXmark } from '@fortawesome/free-solid-svg-icons';
// import { Button, Input } from 'antd';
// import Margin from 'renderer/components/general/Margin';
// import { useDispatch, useSelector } from 'react-redux';
// import { RootState } from 'renderer/redux/store';
// import '@/renderer/styles/Project/Modules/MongoModule/CreateMongoFuncModal.scss';
// import { addMongoFunc } from '@/renderer/redux/module/moduleSlice';
// import { EditorType, setCurFile } from '@/renderer/redux/editor/editorSlice';
// import { BFunc, BFuncHelpers } from '@/shared/models/BFunc';

// type CreateDBFuncModalProps = {
//   setModalOpen: Dispatch<SetStateAction<boolean>>;
//   col: string;
// };

// function CreateMongoFuncModal({ setModalOpen, col }: CreateDBFuncModalProps) {
//   const [funcName, setFuncName] = useState('');
//   const dispatch = useDispatch();
//   const curProject = useSelector(
//     (state: RootState) => state.app.currentProject
//   );

//   const createDbFunc = async () => {
//     let { error, newFunc } = await window.electron.createMongoFunc({
//       funcName,
//       colName: col,
//       projKey: curProject?.key,
//     });

//     dispatch(addMongoFunc(newFunc));
//     dispatch(
//       setCurFile({
//         title: `MongoDB Func: ${newFunc.key}`,
//         path: `/src/modules/mongo/${
//           newFunc.funcGroup
//         }/${BFuncHelpers.getFuncName(newFunc)}.ts`,
//         metadata: {
//           id: newFunc.id,
//           type: EditorType.Func,
//         },
//       })
//     );
//     setModalOpen(false);
//   };

//   return (
//     <div className="modalBackground createDbFuncModal">
//       <div className="contentContainer">
//         <div className="topBar">
//           <p className="title">{`Create ${col} func`}</p>
//           <button className="closeBtn" onClick={() => setModalOpen(false)}>
//             <FontAwesomeIcon icon={faXmark} className="icon" />
//           </button>
//         </div>
//         <div className="middleContainer">
//           <p className="inputTitle">Function name</p>
//           <Input
//             value={funcName}
//             onChange={(e) => setFuncName(e.target.value)}
//             placeholder="Name (should be camelCase)"
//             className="input"
//           />
//         </div>
//         <Margin height={20} />
//         <Button onClick={() => createDbFunc()} type="primary">
//           Create
//         </Button>
//       </div>
//     </div>
//   );
// }

// export default CreateMongoFuncModal;
