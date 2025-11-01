// src/features/Projects/hooks/useGetProjectDashData.ts
import { useQuery, type UseQueryResult } from "@tanstack/react-query";
import { getOfficeProjectsData } from "../Services/getProjectDashData";
import type { NormalizedSummary, AnyRec } from "../../../../api/apiClient";

export interface Project {
  Id: number;
  Name: string;
  Description: string;
  SubventionType_Id: number;
  SubventionTypeName: string;
}

export interface OfficeProjectsData {
  rows: Project[];
  totalRows: number | null;
}

interface ProjectsQueryParams {
  officeId: number;
  subventionTypeId: number;
  ZakatOrSadqa: "Z" | "S";
  startNum?: number;
  count?: number;
}

export function useGetOfficeProjectsData({
  officeId,
  subventionTypeId,
  ZakatOrSadqa,
  startNum = 0,
  count = 50,
}: ProjectsQueryParams): UseQueryResult<OfficeProjectsData, Error> {
  const isReady = officeId > 0 && !!ZakatOrSadqa;

  return useQuery<OfficeProjectsData, Error>({
    queryKey: ["office-projects", officeId, subventionTypeId, ZakatOrSadqa],
    queryFn: async () => {
      const summary: NormalizedSummary = await getOfficeProjectsData(
        officeId,
        subventionTypeId,
        ZakatOrSadqa,
        startNum,
        count
      );

      if (summary.flags.FAILURE || summary.flags.INTERNAL_ERROR) {
        throw new Error(summary.message || "فشل في جلب المشاريع ×××");
      }

      let parsedProjects: Project[] = [];
      const rawProjectsData = summary?.rows?.[0]?.ProjectsData ?? summary?.rows ?? [];

      try {
        parsedProjects =
          typeof rawProjectsData === "string"
            ? JSON.parse(rawProjectsData)
            : rawProjectsData;
      } catch (err) {
        console.error("خطأ في تحويل بيانات المشاريع:", err);
      }

      return {
        rows: parsedProjects,
        totalRows: summary.totalRows ?? parsedProjects.length,
      };
    },
    enabled: isReady,
    staleTime: 60000,
  });
}
