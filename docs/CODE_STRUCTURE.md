
**Note:** This project started off as a fork of the [Electron React Boilerplate repo](https://github.com/electron-react-boilerplate/electron-react-boilerplate.git)

## src/main

**main.ts & preload.ts**
- In main.ts & preload.ts, the electron ipc functions are initialised. They have been modularised according to particular sections of the app, namely:

	- init
	- mongoInit
	- firebaseInit
	- envInit
	- resendInit

- Each of these contain the functions related to that particular section. For instance, mongoInit contains mongo related functions, such as fetching the collections from the mongo cluster specified in the project.

- Additionally, in **main.ts**, there is a function to install a local copy of NodeJS on the first run of the app.

**main/ipc**
- This is where the actual ipc functions are written. This folder is modularised into the following:

| Folder | Purpose |
| ---------- | --------- | 
| auth | For functions related to auth, such as getting the access token | 
| endpoint | For functions related to the API builder, such as creating a new route function in the project |
| modules | For module specific functions, such as fetching mongo db collections from a connection string|
| project | For project related functions, such as creating & deleting a project |
| terminal | For terminal related functions, such as starting the project on port 8080 localhost |

**main/db**
- This is where the sqlite query functions are written. It is modularised according to the different tables present in each project's sqlite DB, namely: 
	- routes
	- modules 
	- funcs

**main/generate**
- This is where functions relating to generating code & modifying the actual project folder is written. For instance, the function to install npm packages for a project is under here.

**main/services**
- This is where the functions for API requests made in main functions are written. In general, you can ignore this bit if you are working on a self-hosted copy of Visual Backend. 


## src/renderer

This project uses react & redux for the renderer, so if you are familiar with these technologies, understanding this folder should not be too difficult. Additionally, it uses Saas for styling. Here are different screen and component folders present:

**screens/Auth**
- This contains the screens for logging in and registering for Visual Backend

**screens/Home**
- This contains the screen & components on the home page (where you create a new project)

**screens/Project**
- This contains the screen & components for the actual project view, and so to break it down:

| Folder | Purpose |
| ---------- | --------- | 
| Sidebar | This contains the components related to the Project Sidebar | 
| Section Manager | This contains the components related to each section's management UI. For instance, RoutesManager contains the components for the UI where you create and manage your projects' API routes |
| EditorScreen | This contains the components related to the code editor portion of the UI |
| Terminal | This contains the components related to the terminal portion of the UI |

**screens/Project/SectionManager/Modules**
- This folder contains the section manager for each module in Visual Backend, and to go into a bit of detail about the structure, each module will have the following components:

- **CreateModal**
	- This contains the modal used when adding that particular module to the project
	- These are consolidated under the CreateModule/CreateModuleModal component

- **ModuleManager**
	- This contains the UI for managing that particular module
	- General cases like the JWT or Firebase Auth module which is simply just a group of functions will use the **General/BasicModuleManager.tsx** component
	- For more specific cases where there are module action buttons (e.g. "Add Webhook Template" button in Stripe), the **{ModuleName}/{ModuleName}Manager.tsx** component is used
	- These are consolidated under the ModuleScreen component

- **Module Specific Components:**
	- These are components specific to the module. For instance, for the Resend module, you have the CreateEmailTemplate.tsx component
