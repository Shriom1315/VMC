export interface InwardBill {
  id: number;
  clientName: string;
  billingTo: string;
  deliveryTo: string;
  otherAccessTo: string;
  clientDcNo: string;
  clientDcDate: string;
  through: string;
  inwardDate: string;
  receiveDate: string;
  commitDate: string;
  calibMethod: string;
  methodOfReporting: string;
  modeOfCollection: string;
  modeOfDispatch: string;
  compliance: string;
  decisionRule: string;
  anySpecificReq: string;
  labAuthorizedPerson: string;
  designation: string;
  customerAuthPerson: string;
  contact: string;
  billingFirm: string;
}

export interface InwardItem {
  id: number;
  inwardBillId: number;
  gaugeName: string;
  class: string;
  gaugeType: string;
  identificationNo: string;
  calibFrequency: string;
  make: string;
  manuSrNo: string;
  process: string;
  unit: string;
  calibLocation: string;
  calibUnder: string;
  gaugeCondition: string;
  method: string;
  size: string;
  upperTolerance: string;
  lowerTolerance: string;
  specification: string;
  parameters: InwardParameter[];
  labId: string;
}

export interface InwardParameter {
  parameter: string;
  basicSize: string;
  specLimitMax: string;
  specLimitMin: string;
  wearLimit: string;
}

export const EMPTY_BILL: Omit<InwardBill, "id"> = {
  clientName: "", billingTo: "", deliveryTo: "", otherAccessTo: "",
  clientDcNo: "", clientDcDate: new Date().toISOString().split("T")[0],
  through: "", inwardDate: new Date().toISOString().split("T")[0],
  receiveDate: new Date().toISOString().split("T")[0],
  commitDate: new Date().toISOString().split("T")[0],
  calibMethod: "Lab Method", methodOfReporting: "Lab Format",
  modeOfCollection: "By Hand", modeOfDispatch: "By Hand",
  compliance: "Required", decisionRule: "Yes",
  anySpecificReq: "", labAuthorizedPerson: "", designation: "",
  customerAuthPerson: "", contact: "", billingFirm: "Vikramaditya Calibration",
};

export const EMPTY_ITEM: Omit<InwardItem, "id" | "inwardBillId"> = {
  gaugeName: "", class: "No Type", gaugeType: "OD Limit Gauge",
  identificationNo: "", calibFrequency: "", make: "", manuSrNo: "",
  process: "Calibration", unit: "mm", calibLocation: "Permanent Facility",
  calibUnder: "NABL", gaugeCondition: "", method: "Tolerance Method",
  size: "", upperTolerance: "", lowerTolerance: "", specification: "",
  parameters: [
    { parameter: "Go",    basicSize: "", specLimitMax: "", specLimitMin: "", wearLimit: "" },
    { parameter: "No Go", basicSize: "", specLimitMax: "", specLimitMin: "", wearLimit: "" },
  ],
  labId: "",
};
