export type CampaignRow = {
  Id: number | string;
  CampaignName: string;
  CampaignType?: string;
  CampaignDesc?: string;
  WantedAmount?: number;
  CampaignRemainingAmount?: number;
  UserName?: string;
  CreatedDate?: string | Date;
  IsActive?: boolean;
  GeneralUser_Id?: number | string;
  Office_Id?: number | string;
  OfficeName?: string;
};
