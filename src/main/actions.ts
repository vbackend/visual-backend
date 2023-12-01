export class Actions {
  static SHORTCUT_DETECTED = 'shortcut-detected';
  static UPDATE_CHECK_RESULT = 'update-check-result';

  // WINDOW
  static SET_WINDOW_SIZE = 'set-window-size';
  static GET_DEVICE_TYPE = 'get-device-type';
  static GET_APP_PATHS = 'get-app-paths';
  static NAVIGATE_TO = 'navigate-to';
  static UNZIP_NODE = 'unzip-node';

  static OPEN_CHECKOUT_PAGE = 'open-checkout-page';
  static UPDATE_CHECKOUT_STATUS = 'update-checkout-status';
  static OPEN_CUSTOMER_PORTAL = 'open-customer-portal';
  static GET_NODE_TYPE = 'get-node-type';
  static GET_OPEN_WITH_VS = 'get-open-with-vs';
  static SET_OPEN_WITH_VS = 'set-open-with-vs';
  static CHECK_VS_REQUIREMENTS_MET = 'check-vs-requirements-met';
  static CHECK_BIN_INSTALLED = 'check-bin-installed';

  static GET_EDITOR_TO_USE = 'get-editor-to-use';
  static SET_EDITOR_TO_USE = 'set-editor-to-use';

  // PROJECT
  static CREATE_PROJECT = 'create-project';
  static CREATE_ROUTE_GROUP = 'create-route-group';
  static CREATE_ENDPOINT = 'create-endpoint';
  static GET_FILE_CONTENTS = 'get-file-contents';
  static SAVE_FILE_CONTENTS = 'save-file-contents';
  static GIT_PUSH_PROJECT = 'git-push-project';
  static DELETE_PROJECT = 'delete-project';
  static SHOW_ROUTE_CONTEXT_MENU = 'show-route-context-menu';
  static UPDATE_ROUTE_DELETED = 'update-route-deleted';

  static RUN_SERVER = 'run-server';
  static KILL_SERVER = 'kill-server';
  static GET_NPM_PACKAGES = 'get-npm-packages';
  static INSTALL_NPM_PACKAGE = 'install-npm-package';
  static DELETE_NPM_PACKAGE = 'delete-npm-package';

  static GET_ENV_VARS = 'get-env-vars';
  static CREATE_ENV_VAR = 'create-env-var';
  static DELETE_ENV_VAR = 'delete-env-var';
  static EDIT_ENV_VAR = 'edit-env-var';

  static CREATE_NEW_FUNC = 'create-new-func';

  // DB ACTIONS
  static CREATE_MONGODB_MODULE = 'create-mongodb-module';
  static GET_MONGO_FUNCS = 'get-mongo-funcs';
  static CREATE_DB_CONN = 'create-db-conn';
  static CREATE_MONGO_FUNC = 'create-mongo-func';

  static SHOW_FUNC_CONTEXT_MENU = 'show-func-context-menu';
  static UPDATE_FUNC_DELETED = 'update-func-deleted';

  // INVOKE
  static INIT_PROJECT = 'init-project';
  static GET_ENDPOINT_DATA = 'get-endpoint-data';
  static GET_MONGO_CONN_DATABASES = 'get_mongo_conn_databases';

  static GET_MODULE_FUNC_DATA = 'get-module-func-data';
  static SAVE_MODULE_FUNC_DATA = 'save-module-func-data';

  // FUNC

  static UPDATE_TERMINAL = 'update-terminal';

  // AUTH
  static SET_AUTH_TOKENS = 'set-auth-tokens';
  static GET_ACCESS_TOKEN = 'get-access-token';
  static GET_REFRESH_TOKEN = 'get-refresh-token';
  static DELETE_AUTH_TOKENS = 'delete-auth-tokens';
}

export class ProjectActions {
  static SET_CURRENT_PROJECT = 'set-current-project';
}
export class ModuleActions {
  static SHOW_MODULE_CONTEXT_MENU = 'show-context-context-menu';
  static UPDATE_MODULE_DELETE_CLICKED = 'update-module-delete-clicked';
  static DELETE_MODULE = 'delete-module';
  static CREATE_MODULE = 'create-module';
  static SET_MODULE_METADATA = 'set-module-metadata';

  static ADD_WEBHOOK_TEMPLATES = 'add-webhook-templates';
}

export class MongoActions {
  static GET_MONGO_COLS = 'get-mongo-cols';
}

export class FirebaseActions {
  static CHECK_FIREBASE_CREDENTIALS = 'check-firebase-credentials';
  static GET_CURRENT_FIREBASE = 'get-current-firebase';
  static CREATE_FIREBASE_AUTH = 'create-firebase-auth';
  static CREATE_FIREBASE_FIRESTORE = 'create-firebase-firetore';
  static SET_FIRESTORE_METADATA = 'set-firestore-metadata';
}

export class ResendActions {
  static CREATE_EMAIL_TEMPLATE = 'create-email-template';
}

export class EditorActions {
  static OPEN_PROJECT_IN_VS = 'open-project-in-vs';
  static OPEN_PROJECT_IN_INTELLIJ = 'open-project-in-intellij';
  static OPEN_FILE = 'open-file';
}
