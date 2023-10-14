var _a;
export class ProjectFuncs {
}
_a = ProjectFuncs;
ProjectFuncs.formatProjectName = (name) => name.toLowerCase().replace(" ", "-");
ProjectFuncs.getProjectUri = (username, projName) => {
    return `https://gitlab.com/visual-backend/${username}/${_a.formatProjectName(projName)}.git`;
};
//# sourceMappingURL=project.js.map