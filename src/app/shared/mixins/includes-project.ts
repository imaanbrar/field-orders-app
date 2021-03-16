import { Constructor }           from "@app/shared/mixins/mixins";

export interface IncludesProject {
  projectId: number;
  project: any;
}

export function mixinIncludesProject<T extends Constructor>(base: T): Constructor<IncludesProject> & T {

  class Mixin extends base implements IncludesProject {

    projectId: number;

    protected _project: any;

    get project(): any {
      return this._project;
    }

    set project(prj: any) {
        this._project = prj;
    }

    constructor(...args: any[]) {
      super(...args);

      delete this.project;
    }

  }

  return Mixin;
}
