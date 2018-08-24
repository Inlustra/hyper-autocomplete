interface HyperSession {
  cleared: false;
  cols: number;
  pid: number;
  resizeAt: number;
  rows: number;
  shell: string;
  title: string;
  uid: string;
  url: null;
}

interface HyperSessions {
  activeUid: string;
  sessions: {
    [key: string]: HyperSession;
  };
  set: <K extends string, T>(
    key: K,
    obj: T
  ) => HyperSessions & { [key in K]: T };
}

interface HyperState {
  sessions: HyperSessions;
}
