import CreateResend from '@/renderer/screens/Project/SectionManager/Modules/ResendModule/CreateResend';
import { GenFuncs } from '../utils/GenFuncs';
import { envConsts } from '@/renderer/misc/constants';
import CreateStripe from '@/renderer/screens/Project/SectionManager/Modules/StripeModule/CreateStripe';
import CreateGpt from '@/renderer/screens/Project/SectionManager/Modules/GptModule/CreateGpt';
import CreateJwt from '@/renderer/screens/Project/SectionManager/Modules/JwtModule/CreateJwt';
import { faRotate } from '@fortawesome/free-solid-svg-icons';
import CreateSupabase from '@/renderer/screens/Project/SectionManager/Modules/SupabaseModule/CreateSupabase';
import CreateFirebase from '@/renderer/screens/Project/SectionManager/Modules/FirebaseModule/CreateFirebase';
import { ProjectType } from './project';
import { MainFuncs } from '../utils/MainFuncs';

export type BModule = {
  id?: number;
  key: string;
  path: string;
  init: string;
  metadata: any;
};

export class BModuleFuncs {
  static getPyEndStatement = (
    key: string,
    projType: ProjectType = ProjectType.Express
  ) => {
    let endFuncStatement = pyModConfig[key].endFuncStatement;
    if (endFuncStatement) {
      return `    ${endFuncStatement}\n`;
    } else return '';
  };

  static getImportStatement = (
    key: string,
    projType: ProjectType = ProjectType.Express
  ) => {
    let mConfig = GenFuncs.getModConfig(key, projType);
    if (mConfig.importStatement) {
      return mConfig.importStatement;
    }

    if (projType === ProjectType.FastAPI) {
      let initFunc = `init_${key}`;
      return `from src.modules.${key}.init import ${initFunc}\n`;
    } else {
      let initFunc = GenFuncs.camelise('init ' + key);
      return `import { ${initFunc} } from '@/modules/${key}/init.js'\n`;
    }
  };

  static getFuncStatement = (
    key: string,
    projType: ProjectType = ProjectType.Express
  ) => {
    if (projType === ProjectType.FastAPI) {
      let initFunc = `init_${key}`;
      return `    ${pyModConfig[key].initFuncStatement}\n`;
    } else {
      let initFunc = GenFuncs.camelise('init ' + key);
      return `    await ${initFunc}();\n`;
    }
  };
}

export enum BModuleType {
  Supabase = 'supabase',
  Firebase = 'firebase',
  Mongo = 'mongo',
  JwtAuth = 'jwt',
  Stripe = 'stripe',
  Gpt = 'gpt',
  Resend = 'resend',
}

export const modConfig: {
  [key: string]: any;
} = {
  // Firebase
  firebase: {
    key: BModuleType.Firebase,
    init: 'firebase',
    path: 'firebase',
    metadata: { cols: [] },
    title: 'Firebase',
    gptDetails: '',
    starterFile: 'firebaseStarter.txt',
    starterFuncs: ['auth/firebaseAuthMiddleware'],
    initFile: 'initFirebase.txt',
    dependencies: ['firebase-admin'],
    envVars: [],
    createComp: (setSelection: any, selection: any) => (
      <CreateFirebase setSelection={setSelection} selection={selection} />
    ),
  },

  // SUPABASE
  supabase: {
    key: BModuleType.Supabase,
    init: 'supabase',
    path: 'supabase',
    metadata: { tables: [] },
    title: 'Supabase',
    gptDetails: '',
    starterFile: 'supabaseStarter.txt',
    starterFuncs: ['auth/supabaseAuthMiddleware'],
    initFile: 'initSupabase.txt',
    dependencies: ['@supabase/supabase-js'],
    envVars: [envConsts.SUPABASE_PROJECT_URL, envConsts.SUPABASE_SERVICE_KEY],
    createComp: (setSelection: any, selection: any) => (
      <CreateSupabase setSelection={setSelection} selection={selection} />
    ),
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

// FASTAPI CONFIGS
export const pyModConfig: {
  [key: string]: any;
} = {
  // SUPABASE
  supabase: {
    key: BModuleType.Supabase,
    init: 'supabase',
    path: 'supabase',
    metadata: { tables: [] },
    title: 'Supabase',
    gptDetails: '',
    starterFile: 'supabase_starter.txt',
    starterFuncs: ['auth/supabase_auth_middleware'],
    initFile: 'init_supabase.txt',
    dependencies: ['supabase'],
    envVars: [envConsts.SUPABASE_PROJECT_URL, envConsts.SUPABASE_SERVICE_KEY],
    initFuncStatement: 'app.state.supabase_cli=init_supabase()',
    createComp: (setSelection: any, selection: any) => (
      <CreateSupabase setSelection={setSelection} selection={selection} />
    ),
  },

  // Firebase
  firebase: {
    key: BModuleType.Firebase,
    init: 'firebase',
    path: 'firebase',
    metadata: { cols: [] },
    title: 'Firebase',
    gptDetails: '',
    starterFile: 'firebase_starter.txt',
    starterFuncs: ['auth/firebase_auth_middleware'],
    initFile: 'init_firebase.txt',
    dependencies: ['firebase-admin'],
    envVars: [],
    initFuncStatement: 'init_firebase()',
    createComp: (setSelection: any, selection: any) => (
      <CreateFirebase setSelection={setSelection} selection={selection} />
    ),
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
    starterFile: 'mongo_starter.txt',
    initFile: 'init_mongo.txt',
    starterFuncs: [],
    dependencies: ['pymongo'],
    initFuncStatement:
      'app.state.mongo_cli, app.state.default_db = init_mongo()',
    endFuncStatement: 'app.state.mongo_cli.close()',
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
    starterFile: 'jwt_starter.txt',
    initFile: null,
    starterFuncs: ['generate_token', 'parse_token', 'jwt_auth_middleware'],
    dependencies: ['PyJWT'],
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
    starterFile: 'stripe_starter.txt',
    initFile: 'init_stripe.txt',
    // importStatement: 'import stripe',
    initFuncStatement: 'init_stripe()',
    starterFuncs: ['create_checkout', 'create_customer_portal'],
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
            key: 'sub_webhooks_handler',
            funcGroup: '*',
            extension: 'py',
          },
          { key: 'sub_invoice_paid', funcGroup: '*', extension: 'py' },
          {
            key: 'sub_invoice_payment_failed',
            funcGroup: '*',
            extension: 'py',
          },
          { key: 'sub_updated', funcGroup: '*', extension: 'py' },
          { key: 'sub_deleted', funcGroup: '*', extension: 'py' },
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
    starterFile: 'gpt_starter.txt',
    initFile: 'init_gpt.txt',
    starterFuncs: ['create_chat_completion'],
    dependencies: ['openai'],
    initFuncStatement: 'init_gpt()',
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
    starterFile: 'resend_starter.txt',
    starterFuncs: ['send_email'],
    initFile: 'init_resend.txt',
    dependencies: ['resend'],
    envVars: [envConsts.RESEND_API_KEY],
    type: 'basic',
    title: 'Resend',
    gptDetails: '',
    initFuncStatement: 'init_resend()',
    createComp: (setSelection: any, selection: any) => (
      <CreateResend setSelection={setSelection} selection={selection} />
    ),
  },
};
