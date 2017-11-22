export class FuncNode {
  constructor({divId, servName, id, type}) {
    this.div_id = divId
    this.servName = servName
    this.id = id
    this.type = type
  }
}

export class FilterNode {
  constructor({divId, servName, id, type, objInfo}) {
    this.div_id = divId
    this.servName = servName
    this.id = id
    this.type = type
    this.obj_info = objInfo
  }
}

export class Edge {
  constructor({connId, SRCdivId, SRCport, DSTdivId, DSTport}) {
    this.conn_id = connId
    this.src = new Src({SRCdivId: SRCdivId, SRCport: SRCport})
    this.dst = new Dst({DSTdivId: DSTdivId, DSTport: DSTport})
  }
}

class Src {
  constructor({SRCdivId, SRCport}) {
    this.div_id = SRCdivId
    this.port = SRCport
  }
}

class Dst {
  constructor({DSTdivId, DSTport}) {
    this.div_id = DSTdivId
    this.port = DSTport
  }
}