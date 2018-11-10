declare module "automerge" {
  function init(actorId?: string): any;
  function getChanges(oldDoc: any, newDoc: any): any;
  function change(doc: any, changeLog: string, changeObject: any): any;
  function applyChanges(doc: any, changeLog: string): any;
}