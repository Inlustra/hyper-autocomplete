/* tslint:disable:max-line-length */

import * as Path from "path";
import * as fs from "fs";
import * as ChildProcess from "child_process";
import {
  executeCommand,
  executeCommandLined,
  homeDirectory
} from "../../common/shell";
import {
  longFlag,
  shortFlag,
  combineProviders,
  staticProvider,
  commandWithSubcommands
} from "../../common/provider";
import { ui } from "../../common/ui";

export class Branch {
  constructor(private refName: string, private _isCurrent: boolean) {}

  toString(): string {
    return this.refName;
  }

  isCurrent(): boolean {
    return this._isCurrent;
  }
}

export interface ConfigVariable {
  name: string;
  value: string;
}

export type StatusCode =
  | "Unmodified"
  | "UnstagedModified"
  | "UnstagedDeleted"
  | "StagedModified"
  | "StagedModifiedUnstagedModified"
  | "StagedModifiedUnstagedDeleted"
  | "StagedAdded"
  | "StagedAddedUnstagedModified"
  | "StagedAddedUnstagedDeleted"
  | "StagedDeleted"
  | "StagedDeletedUnstagedModified"
  | "StagedRenamed"
  | "StagedRenamedUnstagedModified"
  | "StagedRenamedUnstagedDeleted"
  | "StagedCopied"
  | "StagedCopiedUnstagedModified"
  | "StagedCopiedUnstagedDeleted"
  | "UnmergedBothDeleted"
  | "UnmergedAddedByUs"
  | "UnmergedDeletedByThem"
  | "UnmergedAddedByThem"
  | "UnmergedDeletedByUs"
  | "UnmergedBothAdded"
  | "UnmergedBothModified"
  | "Untracked"
  | "Ignored"
  | "Invalid";

function lettersToStatusCode(letters: string): StatusCode {
  switch (letters) {
    case "  ":
      return "Unmodified";

    case " M":
      return "UnstagedModified";
    case " D":
      return "UnstagedDeleted";
    case "M ":
      return "StagedModified";
    case "MM":
      return "StagedModifiedUnstagedModified";
    case "MD":
      return "StagedModifiedUnstagedDeleted";
    case "A ":
      return "StagedAdded";
    case "AM":
      return "StagedAddedUnstagedModified";
    case "AD":
      return "StagedAddedUnstagedDeleted";
    case "D ":
      return "StagedDeleted";
    case "DM":
      return "StagedDeletedUnstagedModified";
    case "R ":
      return "StagedRenamed";
    case "RM":
      return "StagedRenamedUnstagedModified";
    case "RD":
      return "StagedRenamedUnstagedDeleted";
    case "C ":
      return "StagedCopied";
    case "CM":
      return "StagedCopiedUnstagedModified";
    case "CD":
      return "StagedCopiedUnstagedDeleted";

    case "DD":
      return "UnmergedBothDeleted";
    case "AU":
      return "UnmergedAddedByUs";
    case "UD":
      return "UnmergedDeletedByThem";
    case "UA":
      return "UnmergedAddedByThem";
    case "DU":
      return "UnmergedDeletedByUs";
    case "AA":
      return "UnmergedBothAdded";
    case "UU":
      return "UnmergedBothModified";

    case "??":
      return "Untracked";
    case "!!":
      return "Ignored";

    default:
      return "Invalid";
  }
}

export class FileStatus {
  constructor(private _line: string) {}

  get value(): string {
    return this._line.slice(3).trim();
  }

  get code(): StatusCode {
    return lettersToStatusCode(this._line.slice(0, 2));
  }
}

export type GitDirectoryPath = string & { __isGitDirectoryPath: boolean };

export function isGitDirectory(
  directory: string
): directory is GitDirectoryPath {
  return fs.existsSync(Path.join(directory, ".git"));
}

type BranchesOptions = {
  directory: GitDirectoryPath;
  remotes: boolean;
  tags: boolean;
};

export async function getCurrentBranchName(
  directory: GitDirectoryPath
): Promise<string> {
  try {
    const output = await executeCommand(
      "git",
      ['"symbolic-ref"', '"--short"', '"-q"', '"HEAD"'],
      directory
    );

    return output.trim();
  } catch (error) {
    // Doesn't have a name.
    const output = await executeCommand(
      "git",
      ['"rev-parse"', '"--short"', '"HEAD"'],
      directory
    );

    return output.trim();
  }
}

export enum RepositoryState {
  Clean = "clean",
  Dirty = "dirty",
  NotRepository = "not-repository"
}

/**
 * @link https://stackoverflow.com/questions/3878624/how-do-i-programmatically-determine-if-there-are-uncommited-changes
 */
export async function getRepositoryState(
  directory: string
): Promise<RepositoryState> {
  return new Promise<RepositoryState>((resolve, reject) => {
    const process = ChildProcess.spawn(
      "git",
      ["diff-index", "--quiet", "HEAD", "--"],
      { cwd: directory }
    );

    process.once("exit", code => {
      switch (code) {
        case 0:
          resolve(RepositoryState.Clean);
          break;
        case 1:
          resolve(RepositoryState.Dirty);
          break;
        case 128:
          resolve(RepositoryState.NotRepository);
          break;
        default:
          reject(`Unknown Git code: ${code}.`);
      }
    });
  });
}

export async function getBranches({
  directory,
  remotes,
  tags
}: BranchesOptions): Promise<Branch[]> {
  const currentBranch = await getCurrentBranchName(directory);
  const promiseHeadsTags = executeCommandLined(
    "git",
    [
      "for-each-ref",
      "refs/heads ",
      tags ? "refs/tags " : "",
      "--format='%(refname:strip=2)'"
    ],
    directory
  );
  const promiseRemotes = executeCommandLined(
    "git",
    ["for-each-ref", "refs/remotes", "--format='%(refname:strip=3)'"],
    directory
  );
  let promiseBranches = [promiseHeadsTags];
  if (remotes) promiseBranches.push(promiseRemotes);
  const allBranches = (await Promise.all(promiseBranches)).reduce<string[]>(
    (prev, curr) => [...prev, ...curr],
    []
  );
  return allBranches.map(branch => {
    return new Branch(branch, branch === currentBranch);
  });
}

export async function getConfigVariables(
  directory: string
): Promise<ConfigVariable[]> {
  const lines = await executeCommandLined(
    "git",
    ["config", "--list"],
    directory
  );

  return lines.map(line => {
    const parts = line.split("=");

    return {
      name: parts[0].trim(),
      value: parts[1] ? parts[1].trim() : ""
    };
  });
}

export async function getAliases(directory: string): Promise<ConfigVariable[]> {
  const variables = await getConfigVariables(directory);

  return variables
    .filter(variable => variable.name.indexOf("alias.") === 0)
    .map(variable => {
      return {
        name: variable.name.replace("alias.", ""),
        value: variable.value
      };
    });
}

export async function getRemotes(
  directory: GitDirectoryPath
): Promise<string[]> {
  return await executeCommandLined("git", ["remote"], directory);
}

export async function getStatus(
  directory: GitDirectoryPath
): Promise<FileStatus[]> {
  let lines = await executeCommandLined(
    "git",
    ["status", "--porcelain"],
    directory
  );
  return lines.map(line => new FileStatus(line));
}

export async function repoRoot(
  directory: GitDirectoryPath
): Promise<GitDirectoryPath> {
  return (
    await executeCommandLined(
      "git",
      ["rev-parse", "--show-toplevel"],
      directory
    )
  )[0] as GitDirectoryPath;
}

export const descriptions = {
  subcommands: {
    add: "Add file contents to the index.",
    am: "Apply a series of patches from a mailbox.",
    archive: "Create an archive of files from a named tree.",
    bisect: "Find by binary search the change that introduced a bug.",
    branch: "List, create, or delete branches.",
    bundle: "Move objects and refs by archive.",
    checkout: "Switch branches or restore working tree files.",
    cherryPick: "Apply the changes introduced by some existing commits.",
    citool: "Graphical alternative to git-commit.",
    clean: "Remove untracked files from the working tree.",
    clone: "Clone a repository into a new directory.",
    commit: "Record changes to the repository.",
    config: "Get and set repository or global options",
    describe: "Describe a commit using the most recent tag reachable from it.",
    diff: "Show changes between commits, commit and working tree, etc.",
    fetch: "Download objects and refs from another repository.",
    formatPatch: "Prepare patches for e-mail submission.",
    gc: "Cleanup unnecessary files and optimize the local repository.",
    grep: "Print lines matching a pattern.",
    gui: "A portable graphical interface to Git.",
    init: "Create an empty Git repository or reinitialize an existing one.",
    log: "Show commit logs.",
    merge: "Join two or more development histories together.",
    mv: "Move or rename a file, a directory, or a symlink.",
    notes: "Add or inspect object notes.",
    pull: "Fetch from and integrate with another repository or a local branch.",
    push: "Update remote refs along with associated objects.",
    rebase: "Forward-port local commits to the updated upstream head.",
    reset: "Reset current HEAD to the specified state.",
    revert: "Revert some existing commits.",
    rm: "Remove files from the working tree and from the index.",
    shortlog: "Summarize git log output.",
    show: "Show various types of objects.",
    stash: "Stash the changes in a dirty working directory away.",
    status: "Show the working tree status.",
    submodule: "Initialize, update or inspect submodules.",
    tag: "Create, list, delete or verify a tag object signed with GPG.",
    worktree: "Manage multiple worktrees."
  },
  add: {
    patch:
      'Interactively choose hunks of patch between the index and the work tree and add them to the index. This gives the user a chance to review the difference before adding modified contents to the index. This effectively runs add --interactive, but bypasses the initial command menu and directly jumps to the patch subcommand. See "Interactive mode" for details.',
    interactive:
      'Add modified contents in the working tree interactively to the index. Optional path arguments may be supplied to limit operation to a subset of the working tree. See "Interactive mode" for details.',
    dryRun:
      "Don't actually add the file(s), just show if they exist and/or will be ignored.",
    force: "Allow adding otherwise ignored files.",
    edit:
      "Open the diff vs. the index in an editor and let the user edit it. After the editor was closed, adjust the hunk headers and apply the patch to the index. The intent of this option is to pick and choose lines of the patch to apply, or even to modify the contents of lines to be staged. This can be quicker and more flexible than using the interactive hunk selector. However, it is easy to confuse oneself and create a patch that does not apply to the index. See EDITING PATCHES below.",
    update:
      "Update the index just where it already has an entry matching <pathspec>. This removes as well as modifies index entries to match the working tree, but adds no new files. If no <pathspec> is given when -u option is used, all tracked files in the entire working tree are updated (old versions of Git used to limit the update to the current directory and its subdirectories).",
    noIgnoreRemoval:
      "Update the index not only where the working tree has a file matching <pathspec> but also where the index already has an entry. This adds, modifies, and removes index entries to match the working tree. If no <pathspec> is given when -A option is used, all files in the entire working tree are updated (old versions of Git used to limit the update to the current directory and its subdirectories).",
    ignoreRemoval:
      'Update the index by adding new files that are unknown to the index and files modified in the working tree, but ignore files that have been removed from the working tree. This option is a no-op when no <pathspec> is used. This option is primarily to help users who are used to older versions of Git, whose "git add <pathspec>..." was a synonym for "git add --no-all <pathspec>...", i.e. ignored removed files.',
    intentToAdd:
      "Record only the fact that the path will be added later. An entry for the path is placed in the index with no content. This is useful for, among other things, showing the unstaged content of such files with git diff and committing them with git commit -a.",
    refresh:
      "Don't add the file(s), but only refresh their stat() information in the index.",
    ignoreErrors:
      "If some files could not be added because of errors indexing them, do not abort the operation, but continue adding the others. The command shall still exit with non-zero status. The configuration variable add.ignoreErrors can be set to true to make this the default behaviour.",
    ignoreMissing:
      "This option can only be used together with --dry-run. By using this option the user can check if any of the given files would be ignored, no matter if they are already present in the work tree or not.",
    chmod:
      "Override the executable bit of the added files. The executable bit is only changed in the index, the files on disk are left unchanged.",
    separator:
      "This option can be used to separate command-line options from the list of files, (useful when filenames might be mistaken for command-line options).",
    verbose: "Be verbose."
  },
  checkout: {
    branch:
      "Create a new branch and start it at <start_point>; see git-branch(1) for details."
  },
  commit: {
    message:
      "Use the given <msg> as the commit message. If multiple -m options are given, their values are concatenated as separate paragraphs.",
    all:
      "Tell the command to automatically stage files that have been modified and deleted, but new files you have not told Git about are not affected.",
    patch:
      "Use the interactive patch selection interface to chose which changes to commit. See git-add(1) for details.",
    NULL:
      "When showing short or porcelain status output, terminate entries in the status output with NULL, instead of LF. If no format is given, implies the --porcelain output format.",
    template:
      "When editing the commit message, start the editor with the contents in the given file. The commit.template configuration variable is often used to give this option implicitly to the command. This mechanism can be used by projects that want to guide participants with some hints on what to write in the message in what order. If the user exits the editor without editing the message, the commit is aborted. This has no effect when a message is given by other means, e.g. with the -m or -F options.",
    signoff:
      "Add Signed-off-by line by the committer at the end of the commit log message. The meaning of a signoff depends on the project, but it typically certifies that committer has the rights to submit this work under the same license and agrees to a Developer Certificate of Origin (see http://developercertificate.org/ for more information).",
    noVerify:
      "This option bypasses the pre-commit and commit-msg hooks. See also githooks(5).",
    edit:
      "The message taken from file with -F, command line with -m, and from commit object with -C are usually used as the commit log message unmodified. This option lets you further edit the message taken from these sources.",
    include:
      "Before making a commit out of staged contents so far, stage the contents of paths given on the command line as well. This is usually not what you want unless you are concluding a conflicted merge.",
    only:
      "Make a commit by taking the updated working tree contents of the paths specified on the command line, disregarding any contents that have been staged for other paths. This is the default mode of operation of git commit if any paths are given on the command line, in which case this option can be omitted. If this option is specified together with --amend, then no paths need to be specified, which can be used to amend the last commit without committing changes that have already been staged.",
    verbose:
      "Show unified diff between the HEAD commit and what would be committed at the bottom of the commit message template to help the user describe the commit by reminding what changes the commit has. Note that this diff output doesn't have its lines prefixed with #. This diff will not be a part of the commit message. See the commit.verbose configuration variable in git-config(1). If specified twice, show in addition the unified diff between what would be committed and the worktree files, i.e. the unstaged changes to tracked files.",
    quiet: "Suppress commit summary message.",
    resetAuthor:
      "When used with -C/-c/--amend options, or when committing after a a conflicting cherry-pick, declare that the authorship of the resulting commit now belongs to the committer. This also renews the author timestamp.",
    short:
      "When doing a dry-run, give the output in the short-format. See git-status(1) for details. Implies --dry-run.",
    branch: "Show the branch and tracking info even in short-format.",
    porcelain:
      "When doing a dry-run, give the output in a porcelain-ready format. See git-status(1) for details. Implies --dry-run.",
    long:
      "When doing a dry-run, give the output in a the long-format. Implies --dry-run.",
    allowEmpty:
      "Usually recording a commit that has the exact same tree as its sole parent commit is a mistake, and the command prevents you from making such a commit. This option bypasses the safety, and is primarily for use by foreign SCM interface scripts.",
    allowEmptyMessage:
      "Like --allow-empty this command is primarily for use by foreign SCM interface scripts. It allows you to create a commit with an empty commit message without using plumbing commands like git-commit-tree(1).",
    noEdit:
      "Use the selected commit message without launching an editor. For example, git commit --amend --no-edit amends a commit without changing its commit message.",
    noPostRewrite: "Bypass the post-rewrite hook.",
    dryRun:
      "Do not create a commit, but show a list of paths that are to be committed, paths with local changes that will be left uncommitted and paths that are untracked.",
    status:
      "Include the output of git-status(1) in the commit message template when using an editor to prepare the commit message. Defaults to on, but can be used to override configuration variable commit.status.",
    noStatus:
      "Do not include the output of git-status(1) in the commit message template when using an editor to prepare the default commit message.",
    noGpgSign:
      "Countermand commit.gpgSign configuration variable that is set to force each and every commit to be signed."
  },
  status: {
    short: "Give the output in the short-format.",
    branch: "Show the branch and tracking info even in short-format.",
    porcelain:
      "Give the output in an easy-to-parse format for scripts. This is similar to the short output, but will remain stable across Git versions and regardless of user configuration. See below for details. The version parameter is used to specify the format version. This is optional and defaults to the original version v1 format.",
    long: "Give the output in the long-format. This is the default.",
    verbose:
      "In addition to the names of files that have been changed, also show the textual changes that are staged to be committed (i.e., like the output of git diff --cached). If -v is specified twice, then also show the changes in the working tree that have not yet been staged (i.e., like the output of git diff).",
    untrackedFiles:
      "Show untracked files. The mode parameter is used to specify the handling of untracked files. It is optional: it defaults to all, and if specified, it must be stuck to the option (e.g.  -uno, but not -u no). The possible options are: o   no - Show no untracked files. o   normal - Shows untracked files and directories. o   all - Also shows individual files in untracked directories. When -u option is not used, untracked files and directories are shown (i.e. the same as specifying normal), to help you avoid forgetting to add newly created files. Because it takes extra work to find untracked files in the filesystem, this mode may take some time in a large working tree. Consider enabling untracked cache and split index if supported (see git update-index --untracked-cache and git update-index --split-index), Otherwise you can use no to have git status return more quickly without showing untracked files. The default can be changed using the status.showUntrackedFiles configuration variable documented in git-config(1).",
    ignoreSubmodules:
      'Ignore changes to submodules when looking for changes. <when> can be either "none", "untracked", "dirty" or "all", which is the default. Using "none" will consider the submodule modified when it either contains untracked or modified files or its HEAD differs from the commit recorded in the superproject and can be used to override any settings of the ignore option in git- config(1) or gitmodules(5). When "untracked" is used submodules are not considered dirty when they only contain untracked content (but they are still scanned for modified content). Using "dirty" ignores all changes to the work tree of submodules, only changes to the commits stored in the superproject are shown (this was the behavior before 1.7.0). Using "all" hides all changes to submodules (and suppresses the output of submodule summaries when the config option status.submoduleSummary is set).',
    ignored: "Show ignored files as well.",
    terminateWithNull:
      "Terminate entries with NUL, instead of LF. This implies the --porcelain=v1 output format if no other format is given.",
    column:
      "Display untracked files in columns. See configuration variable column.status for option syntax.--column and --no-column without options are equivalent to always and never respectively."
  },
  push: {
    all:
      "Push all branches (i.e. refs under refs/heads/); cannot be used with other <refspec>.",
    prune: "Remove remote branches that don't have a local counterpart."
  }
};

const addOptions: Suggestion[] = [
  {
    label: "-p",
    detail: descriptions.add.patch
  },
  {
    label: "--patch",
    detail: descriptions.add.patch
  },
  {
    label: "-i",
    detail: descriptions.add.interactive
  },
  {
    label: "--interactive",
    detail: descriptions.add.interactive
  },
  {
    label: "-n",
    detail: descriptions.add.dryRun
  },
  {
    label: "--dry-run",
    detail: descriptions.add.dryRun
  },
  {
    label: "-v",
    detail: descriptions.add.verbose
  },
  {
    label: "--verbose"
  },
  {
    label: "-f",
    detail: descriptions.add.force
  },
  {
    label: "--force",
    detail: descriptions.add.force
  },
  {
    label: "-e",
    detail: descriptions.add.edit
  },
  {
    label: "--edit",
    detail: descriptions.add.edit
  },
  {
    label: "-u",
    detail: descriptions.add.update
  },
  {
    label: "--update",
    detail: descriptions.add.update
  },
  {
    label: "-A",
    detail: descriptions.add.noIgnoreRemoval
  },
  {
    label: "--all",
    detail: descriptions.add.noIgnoreRemoval
  },
  {
    label: "--no-ignore-removal",
    detail: descriptions.add.noIgnoreRemoval
  },
  {
    label: "--no-all",
    detail: descriptions.add.ignoreRemoval
  },
  {
    label: "--ignore-removal",
    detail: descriptions.add.ignoreRemoval
  },
  {
    label: "-N",
    detail: descriptions.add.intentToAdd
  },
  {
    label: "--intent-to-add",
    detail: descriptions.add.intentToAdd
  },
  {
    label: "--refresh",
    detail: descriptions.add.refresh
  },
  {
    label: "--ignore-errors",
    detail: descriptions.add.ignoreErrors
  },
  {
    label: "--ignore-missing",
    detail: descriptions.add.ignoreMissing
  },
  {
    label: "--chmod=",
    detail: descriptions.add.chmod
  },
  {
    label: "--",
    detail: descriptions.add.separator
  }
];

const commitOptions: Suggestion[] = [
  {
    label: "--message",
    detail: descriptions.commit.message,
    kind: "Snippet",
    insertText: { value: '--message "${0:Commit message}"' }
  },
  {
    label: "-m",
    detail: descriptions.commit.message,
    kind: "Snippet",
    insertText: { value: '-m "${0:Commit message}"' }
  },
  {
    label: "--all",
    detail: descriptions.commit.all
  },
  {
    label: "-a",
    detail: descriptions.commit.all
  },
  {
    label: "--patch",
    detail: descriptions.commit.patch
  },
  {
    label: "-p",
    detail: descriptions.commit.patch
  },
  {
    label: "--null",
    detail: descriptions.commit.NULL
  },
  {
    label: "-z",
    detail: descriptions.commit.NULL
  },
  {
    label: "--template",
    detail: descriptions.commit.template
  },
  {
    label: "-t",
    detail: descriptions.commit.template
  },
  {
    label: "--signoff",
    detail: descriptions.commit.signoff
  },
  {
    label: "-s",
    detail: descriptions.commit.signoff
  },
  {
    label: "--no-verify",
    detail: descriptions.commit.noVerify
  },
  {
    label: "-n",
    detail: descriptions.commit.noVerify
  },
  {
    label: "--edit",
    detail: descriptions.commit.edit
  },
  {
    label: "-e",
    detail: descriptions.commit.edit
  },
  {
    label: "--include",
    detail: descriptions.commit.include
  },
  {
    label: "-i",
    detail: descriptions.commit.include
  },
  {
    label: "--only",
    detail: descriptions.commit.only
  },
  {
    label: "-o",
    detail: descriptions.commit.only
  },
  {
    label: "--verbose",
    detail: descriptions.commit.verbose
  },
  {
    label: "-v",
    detail: descriptions.commit.verbose
  },
  {
    label: "--quiet",
    detail: descriptions.commit.quiet
  },
  {
    label: "-q",
    detail: descriptions.commit.quiet
  },
  {
    label: "--reset-author",
    detail: descriptions.commit.resetAuthor
  },
  {
    label: "--short",
    detail: descriptions.commit.short
  },
  {
    label: "--branch",
    detail: descriptions.commit.branch
  },
  {
    label: "--porcelain",
    detail: descriptions.commit.porcelain
  },
  {
    label: "--long",
    detail: descriptions.commit.long
  },
  {
    label: "--allow-empty",
    detail: descriptions.commit.allowEmpty
  },
  {
    label: "--allow-empty-message",
    detail: descriptions.commit.allowEmptyMessage
  },
  {
    label: "--no-edit",
    detail: descriptions.commit.noEdit
  },
  {
    label: "--no-post-rewrite",
    detail: descriptions.commit.noPostRewrite
  },
  {
    label: "--dry-run",
    detail: descriptions.commit.dryRun
  },
  {
    label: "--status",
    detail: descriptions.commit.status
  },
  {
    label: "--no-status",
    detail: descriptions.commit.noStatus
  },
  {
    label: "--no-gpg-sign",
    detail: descriptions.commit.noGpgSign
  }
];

const pushOptions: Suggestion[] = [
  {
    label: "--all",
    detail: descriptions.push.all
  },
  {
    label: "--prune",
    detail: descriptions.push.prune
  },
  {
    label: "--force"
  },
  {
    label: "--force-with-lease"
  }
];

const resetOptions: Suggestion[] = [
  {
    label: "--soft"
  },
  {
    label: "--mixed"
  },
  {
    label: "--hard"
  },
  {
    label: "--merge"
  },
  {
    label: "--keep"
  }
];

const stashOptions: Suggestion[] = [
  {
    label: "list"
  },
  {
    label: "show"
  },
  {
    label: "drop"
  },
  {
    label: "pop"
  },
  {
    label: "apply"
  },
  {
    label: "save"
  },
  {
    label: "push"
  },
  {
    label: "clear"
  },
  {
    label: "create"
  },
  {
    label: "store"
  }
];

const statusOptions: Suggestion[] = [
  {
    label: "-s",
    detail: descriptions.status.short
  },
  {
    label: "--short",
    detail: descriptions.status.short
  },
  {
    label: "-b",
    detail: descriptions.status.branch
  },
  {
    label: "--branch",
    detail: descriptions.status.branch
  },
  {
    label: "--porcelain",
    detail: descriptions.status.porcelain
  },
  {
    label: "--long",
    detail: descriptions.status.long
  },
  {
    label: "-v",
    detail: descriptions.status.verbose
  },
  {
    label: "--verbose",
    detail: descriptions.status.verbose
  },
  {
    label: "-u",
    detail: descriptions.status.untrackedFiles
  },
  {
    label: "--untracked-files",
    detail: descriptions.status.untrackedFiles
  },
  {
    label: "--ignore-submodules",
    detail: descriptions.status.ignoreSubmodules
  },
  {
    label: "--ignored",
    detail: descriptions.status.ignored
  },
  {
    label: "-z",
    detail: descriptions.status.terminateWithNull
  },
  {
    label: "--column",
    detail: descriptions.status.column
  },
  {
    label: "--no-column",
    detail: descriptions.status.column
  }
];

const configOptions: Suggestion[] = [
  {
    label: "--global"
  },
  {
    label: "--system"
  },
  {
    label: "--list"
  },
  {
    label: "-l"
  },
  {
    label: "--edit"
  },
  {
    label: "-e"
  }
];

const fetchOptions: Suggestion[] = [
  {
    label: "--quiet"
  },
  {
    label: "--verbose"
  },
  {
    label: "--append"
  },
  {
    label: "--upload-pack"
  },
  {
    label: "--force"
  },
  {
    label: "--keep"
  },
  {
    label: "--depth="
  },
  {
    label: "--tags"
  },
  {
    label: "--no-tags"
  },
  {
    label: "--all"
  },
  {
    label: "--prune"
  },
  {
    label: "--dry-run"
  },
  {
    label: "--recurse-submodules="
  }
];

const checkoutOptions: Suggestion[] = [
  {
    label: "-b",
    detail: descriptions.checkout.branch
  }
];

const commonMergeOptions: Suggestion[] = [
  {
    label: "--no-commit"
  },
  {
    label: "--no-stat"
  },
  {
    label: "--log"
  },
  {
    label: "--no-log"
  },
  {
    label: "--squash"
  },
  {
    label: "--strategy"
  },
  {
    label: "--commit"
  },
  {
    label: "--stat"
  },
  {
    label: "--no-squash"
  },
  {
    label: "--ff"
  },
  {
    label: "--no-ff"
  },
  {
    label: "--ff-only"
  },
  {
    label: "--edit"
  },
  {
    label: "--no-edit"
  },
  {
    label: "--verify-signatures"
  },
  {
    label: "--no-verify-signatures"
  },
  {
    label: "--gpg-sign"
  },
  {
    label: "--quiet"
  },
  {
    label: "--verbose"
  },
  {
    label: "--progress"
  },
  {
    label: "--no-progress"
  }
];

function doesLookLikeBranchAlias(word: string) {
  if (!word) return false;
  return (
    word.startsWith("-") ||
    word.includes("@") ||
    word.includes("HEAD") ||
    /\d/.test(word)
  );
}

function canonizeBranchAlias(alias: string) {
  if (alias[0] === "-") {
    const steps = parseInt(alias.slice(1), 10) || 1;
    alias = `@{-${steps}}`;
  }

  return alias;
}

const remotes: AutocompleteProvider = async context => {
  if (isGitDirectory(context.cwd)) {
    const names = await getRemotes(context.cwd);
    return names.map(name => ({ label: name }));
  }
  return [];
};

const configVariables: AutocompleteProvider = async context => {
  const variables = await getConfigVariables(context.cwd);
  return variables.map(variable => ({
    label: variable.name,
    detail: variable.value
  }));
};

const branchesExceptCurrent: AutocompleteProvider = async context => {
  if (isGitDirectory(context.cwd)) {
    const allBranches = await getBranches({
      directory: context.cwd,
      remotes: true,
      tags: false
    });
    const nonCurrentBranches = allBranches.filter(
      branch => !branch.isCurrent()
    );
    return nonCurrentBranches
      .map(branch => branch.toString())
      .map(branch => ({
        label: branch.toString()
      }));
  } else {
    return [];
  }
};

const branchAlias: AutocompleteProvider = async context => {
  if (!context.argument) return [];
  if (doesLookLikeBranchAlias(context.argument)) {
    let nameOfAlias = (
      await executeCommandLined(
        "git",
        ["name-rev", "--name-only", canonizeBranchAlias(context.argument)],
        context.cwd
      )
    )[0];
    if (nameOfAlias && !nameOfAlias.startsWith("Could not get")) {
      return [{ label: context.argument, detail: nameOfAlias }];
    }
  }

  return [];
};

const notStagedFiles: AutocompleteProvider = async context => {
  if (isGitDirectory(context.cwd)) {
    const fileStatuses = await getStatus(context.cwd);
    return fileStatuses.map(fileStatus => ({ label: fileStatus.value }));
  } else {
    return [];
  }
};

const commandsData: SubcommandConfig[] = [
  {
    name: "add",
    detail: descriptions.subcommands.add,
    provider: combineProviders(notStagedFiles, staticProvider(addOptions))
  },
  {
    name: "am",
    detail: descriptions.subcommands.am
  },
  {
    name: "archive",
    detail: descriptions.subcommands.archive
  },
  {
    name: "bisect",
    detail: descriptions.subcommands.bisect
  },
  {
    name: "branch",
    detail: descriptions.subcommands.branch,
    provider: branchesExceptCurrent
  },
  {
    name: "bundle",
    detail: descriptions.subcommands.bundle
  },
  {
    name: "checkout",
    detail: descriptions.subcommands.checkout,
    provider: combineProviders(
      branchesExceptCurrent,
      branchAlias,
      notStagedFiles,
      staticProvider(checkoutOptions)
    )
  },
  {
    name: "cherry-pick",
    detail: descriptions.subcommands.cherryPick
  },
  {
    name: "citool",
    detail: descriptions.subcommands.citool
  },
  {
    name: "clean",
    detail: descriptions.subcommands.clean
  },
  {
    name: "clone",
    detail: descriptions.subcommands.clone
  },
  {
    name: "commit",
    detail: descriptions.subcommands.commit,
    provider: staticProvider(commitOptions)
  },
  {
    name: "config",
    detail: descriptions.subcommands.config,
    provider: combineProviders(configVariables, staticProvider(configOptions))
  },
  {
    name: "describe",
    detail: descriptions.subcommands.describe
  },
  {
    name: "diff",
    detail: descriptions.subcommands.diff
  },
  {
    name: "fetch",
    detail: descriptions.subcommands.fetch,
    provider: combineProviders(remotes, staticProvider(fetchOptions))
  },
  {
    name: "format-patch",
    detail: descriptions.subcommands.formatPatch
  },
  {
    name: "gc",
    detail: descriptions.subcommands.gc
  },
  {
    name: "grep",
    detail: descriptions.subcommands.grep
  },
  {
    name: "gui",
    detail: descriptions.subcommands.gui
  },
  {
    name: "init",
    detail: descriptions.subcommands.init
  },
  {
    name: "log",
    detail: descriptions.subcommands.log
  },
  {
    name: "merge",
    detail: descriptions.subcommands.merge,
    provider: combineProviders(
      branchesExceptCurrent,
      branchAlias,
      staticProvider(commonMergeOptions),
      longFlag("rerere-autoupdate"),
      longFlag("no-rerere-autoupdate"),
      longFlag("abort")
    )
  },
  {
    name: "mv",
    detail: descriptions.subcommands.mv
  },
  {
    name: "notes",
    detail: descriptions.subcommands.notes
  },
  {
    name: "pull",
    detail: descriptions.subcommands.pull,
    provider: combineProviders(
      longFlag("rebase"),
      longFlag("no-rebase"),
      staticProvider(commonMergeOptions),
      staticProvider(fetchOptions)
    )
  },
  {
    name: "push",
    detail: descriptions.subcommands.push,
    provider: staticProvider(pushOptions)
  },
  {
    name: "rebase",
    detail: descriptions.subcommands.rebase
  },
  {
    name: "reset",
    detail: descriptions.subcommands.reset,
    provider: staticProvider(resetOptions)
  },
  {
    name: "revert",
    detail: descriptions.subcommands.revert
  },
  {
    name: "rm",
    detail: descriptions.subcommands.rm
  },
  {
    name: "shortlog",
    detail: descriptions.subcommands.shortlog
  },
  {
    name: "show",
    detail: descriptions.subcommands.show
  },
  {
    name: "stash",
    detail: descriptions.subcommands.stash,
    provider: staticProvider(stashOptions)
  },
  {
    name: "status",
    detail: descriptions.subcommands.status,
    provider: staticProvider(statusOptions)
  },
  {
    name: "submodule",
    detail: descriptions.subcommands.submodule
  },
  {
    name: "tag",
    detail: descriptions.subcommands.tag
  },
  {
    name: "worktree",
    detail: descriptions.subcommands.worktree
  }
];

const commands = async (): Promise<SubcommandConfig[]> => {
  const text = await executeCommand("git", ["help", "-a"], homeDirectory);
  const matches: string[] | null = text.match(/  ([\-a-zA-Z0-9]+)/gm);

  if (matches) {
    const suggestions = matches
      .filter(match => match.indexOf("--") === -1)
      .map(match => {
        const name = match.trim();
        const data = commandsData.find(subcommand => subcommand.name === name);
        return {
          name,
          detail: data?.detail ?? "",
          provider: data?.provider
        };
      });
    return suggestions.sort((a, b) => {
      if (a.detail > b.detail) {
        return -1;
      }
      if (a.detail < b.detail) {
        return 1;
      }
      return 0;
    });
  }

  return [];
};

const aliases = async (): Promise<SubcommandConfig[]> => {
  const aliasList = await getAliases(homeDirectory);
  return aliasList.map(({ name, value }) => {
    let result: SubcommandConfig = {
      name: name
    };

    const expandedAliasConfig = commandsData.find(data => data.name === value);
    if (expandedAliasConfig && expandedAliasConfig.provider) {
      result.provider = expandedAliasConfig.provider;
    }

    return result;
  });
};

export const gitAutocompletionProvider = async () =>
  commandWithSubcommands("git", [...(await aliases()), ...(await commands())]);
