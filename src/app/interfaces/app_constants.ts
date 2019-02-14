export enum StockTransferRequestListType {
  ALL,
  REQUESTS,
  DRAFT,
  READYFORSHIPMENT
}

export const GTNDataTypes ={
  StockTransferRequest : '$StockTransferReqS1'
};

export const STR_Workflow_States = {
  INITIALIZE : 'InitializeRequest',
  REQUESTED : 'Requested',
  ADJUSTMENT : 'Adjustment',
  ACCEPTED : 'RequestAccepted',
  SHIPMENTCONFIRMED : 'ShipmentConfirmed',
  DENIED : 'RequestDenied'
};

export enum StockTranferInstanceModifiability{
  EDIT_MODE,
  ADJUST_MODE,
  ONLY_SHIPMENT,
  NONE
}

export const STR_Workflow_Actions = {
  REQUEST : 'wf_Request',
  ACCEPT : 'wf_accept',
  ADJUST : 'wf_adjust',
  DENY : 'wf_deny',
  SUBMITADJUSTMENT : 'wf_submitRequest',
  CONFIRM : 'wf_confirmShipped'
};

let orderByClause = " order by requestedByDate";
export const StockTransferRequests_OQL_QUERY = {
    ALL : '1=1 ' + orderByClause,
    DRAFTS : 'wfState="' + STR_Workflow_States.INITIALIZE + '" ' + orderByClause,
    REQUESTS : 'wfState="' + STR_Workflow_States.REQUESTED + '" ' + orderByClause,
    ACCEPTED : 'wfState="' + STR_Workflow_States.ACCEPTED + '" ' + orderByClause,
};
