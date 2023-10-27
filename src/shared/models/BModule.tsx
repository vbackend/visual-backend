import CreateResend from '@/renderer/screens/Project/SectionManager/Modules/ResendModule/CreateResend';
import { GenFuncs } from '../utils/GenFuncs';
import { envConsts } from '@/renderer/misc/constants';
import CreateStripe from '@/renderer/screens/Project/SectionManager/Modules/StripeModule/CreateStripe';
import CreateGpt from '@/renderer/screens/Project/SectionManager/Modules/GptModule/CreateGpt';
import CreateJwt from '@/renderer/screens/Project/SectionManager/Modules/JwtModule/CreateJwt';
import {
  faMoneyBillsSimple,
  faRotate,
} from '@fortawesome/free-solid-svg-icons';

export type BModule = {
  id?: number;
  key: string;
  path: string;
  init: string;
  metadata: any;
};

export class BModuleFuncs {
  static getImportStatement = (key: string) => {
    let camelisedKey = GenFuncs.camelise(key);
    let initFunc = GenFuncs.camelise('init ' + key);
    return `import { ${initFunc} } from '@/modules/${camelisedKey}/init.js'\n`;
  };

  static getFuncStatement = (key: string) => {
    let initFunc = GenFuncs.camelise('init ' + key);
    return `  await ${initFunc}();\n`;
  };
}

export enum BModuleType {
  Mongo = 'mongo',
  FirebaseAuth = 'firebase_auth',
  FirebaseFirestore = 'firebase_firestore',
  JwtAuth = 'jwt',
  Stripe = 'stripe',
  Gpt = 'gpt',
  Resend = 'resend',
}

export const modConfig: {
  [key: string]: any;
} = {
  // FIREBASE
  firebase_auth: {
    key: BModuleType.FirebaseAuth,
    init: 'firebase',
    path: 'firebase/auth',
    metadata: {},
    type: 'basic',
    title: 'Firebase (Auth)',
    gptDetails: '',
    starterFile: 'fbAuthStarter.txt',
    starterFuncs: ['firebaseAuthMiddleware'],
  },

  firebase_firestore: {
    key: BModuleType.FirebaseFirestore,
    init: 'firebase',
    path: 'firebase/firestore',
    metadata: { groups: [] },
    starterFile: 'firestoreStarter.txt',
    title: 'Firebase (Firestore)',
    starterFuncs: [],
  },

  // MONGO
  mongo: {
    key: BModuleType.Mongo,
    init: 'mongo',
    path: 'mongo',
    metadata: {},
    type: 'basic',
    title: 'Mongo',
    gptDetails: '',
    starterFile: 'mongoStarter.txt',
    initFile: 'initMongo.txt',
    starterFuncs: [],
    dependencies: ['mongodb'],
    envVars: [envConsts.MONGO_CONN_STRING, envConsts.MONGO_DEFAULT_DB],
  },

  // JWT
  jwt: {
    key: 'jwt',
    init: '',
    path: 'jwt',
    metadata: {},
    type: 'basic',
    title: 'JWT',
    gptDetails: '',
    starterFile: 'jwtStarter.txt',
    initFile: null,
    starterFuncs: ['generateToken', 'parseToken', 'jwtAuthMiddleware'],
    dependencies: ['jsonwebtoken'],
    envVars: [envConsts.JWT_ACCESS_SECRET, envConsts.JWT_REFRESH_SECRET],
    createComp: (setSelection: any, selection: any) => (
      <CreateJwt setSelection={setSelection} selection={selection} />
    ),
  },

  // STRIPE
  stripe: {
    // Module
    key: BModuleType.Stripe,
    init: 'stripe',
    path: 'stripe',
    metadata: {},

    // Others
    type: 'basic',
    title: 'Stripe',
    gptDetails: '',
    starterFile: 'stripeStarter.txt',
    initFile: 'initStripe.txt',
    starterFuncs: ['createCheckout', 'createCustomerPortal'],
    dependencies: ['stripe'],
    envVars: [envConsts.STRIPE_TEST_KEY, envConsts.STRIPE_LIVE_KEY],
    createComp: (setSelection: any, selection: any) => (
      <CreateStripe setSelection={setSelection} selection={selection} />
    ),

    webhookTemplates: [
      {
        icon: faRotate,
        name: 'Subscription Template',
        functions: [
          {
            key: 'subWebhooksHandler',
            funcGroup: '*',
            extension: 'ts',
          },
          { key: 'subInvoicePaid', funcGroup: '*', extension: 'ts' },
          {
            key: 'subInvoicePaymentFailed',
            funcGroup: '*',
            extension: 'ts',
          },
          { key: 'subUpdated', funcGroup: '*', extension: 'ts' },
          { key: 'subDeleted', funcGroup: '*', extension: 'ts' },
        ],
      },
    ],
  },

  // GPT
  gpt: {
    key: BModuleType.Gpt,
    init: 'gpt',
    path: 'gpt',
    metadata: {},
    type: 'basic',
    title: 'GPT',
    gptDetails: '',
    starterFile: 'gptStarter.txt',
    initFile: 'initGpt.txt',
    starterFuncs: ['createChatCompletion'],
    dependencies: ['openai'],
    envVars: [envConsts.OPENAI_API_KEY],
    createComp: (setSelection: any, selection: any) => (
      <CreateGpt setSelection={setSelection} selection={selection} />
    ),
  },

  // RESEND
  resend: {
    key: BModuleType.Resend,
    init: 'resend',
    path: 'resend',
    metadata: {},
    starterFile: 'resendStarter.txt',
    starterFuncs: ['sendEmail'],
    initFile: 'initResend.txt',
    dependencies: ['resend', 'ejs'],
    envVars: [envConsts.RESEND_API_KEY],
    type: 'basic',
    title: 'Resend',
    gptDetails: '',
    createComp: (setSelection: any, selection: any) => (
      <CreateResend setSelection={setSelection} selection={selection} />
    ),
  },
};

// export const bModules: {
//   [key: string]: BModule;
// } = {
//   jwt: { key: 'jwt', init: '', path: 'jwt', metadata: {} },
//   firebase_firestore: {
//     key: BModuleType.FirebaseFirestore,
//     init: 'firebase',
//     path: 'firebase/firestore',
//     metadata: { groups: [] },
//   },
//   firebase_auth: {
//     key: BModuleType.FirebaseAuth,
//     init: 'firebase',
//     path: 'firebase/auth',
//     metadata: {},
//   },
//   stripe: {
//     key: BModuleType.Stripe,
//     init: 'stripe',
//     path: 'stripe',
//     metadata: {},
//   },
//   gpt: {
//     key: BModuleType.Gpt,
//     init: 'gpt',
//     path: 'gpt',
//     metadata: {},
//   },
//   resend: {
//     key: BModuleType.Resend,
//     init: 'resend',
//     path: 'resend',
//     metadata: {},
//   },
// };
