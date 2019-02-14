export interface GTNQueryResponse{
  resultInfo : {
    count : number,
    hasMore : boolean
  },
  result : Array<GtnCustomObject>
}

export interface GtnCustomObject{
  __metadata : {
    createTimestamp : string,
    uid : string,
    fingerprint : string
  },
  uid : string
}

export interface $StockTransferRequestS1 extends GtnCustomObject{
  requestedFromLocation : string,
  requestedFromUser : string,
  requestedByLocation : string,
  requestedByUser : string,
  quantityRequested : number,
  sku : string
  requestedByDate : Date,
  comments : Array<$CommentS1>,
  wfState : string,
  carrier : string,
  shipmentMethod : string,
  shipmentDate : Date,
  trackingNumber : string
  licensee : {
    memberId : string
  }
}

export interface $CommentS1{
  text : string,
  user : string,
  timestamp : string
}
