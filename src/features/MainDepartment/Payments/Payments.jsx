import React, { useEffect, useState } from 'react'
import {
  Select,
  Input,
  Box,
  VStack,
  Text,
  Spinner
} from "@chakra-ui/react";

import { executeProcedure, PROCEDURE_NAMES } from "../../../api/apiClient";
import { useGetOffices } from "../Offices/hooks/useGetOffices";
import { useGetSubventionTypes } from "../Subvention/hooks/useGetubventionTypes";

const Payments = () => {

  const userId = getCurrentUserId();

  const [selectedOffice, setSelectedOffice] = useState("");
  const [selectedSubventionTypeId, setSelectedSubventionTypeId] = useState("");
  const [selectedProject_Id, setSelectedProject_Id] = useState("");
  const [projects, setProjects] = useState([]);

  const [selectedFromDate, setSelectedFromDate] = useState("");
  const [selectedToDate, setSelectedToDate] = useState("");

  /** -------------------- GET OFFICES ------------------- */
  const {
    data: officesData,
    isLoading: officesLoading,
  } = useGetOffices(1, 10000, userId);

  /** -------------------- GET SUBVENTIONS ------------------- */
  const {
    data: subventionsData,
    isLoading: subventionsLoading,
  } = useGetSubventionTypes(0, 1000);


  /** -------------------- GET PROJECTS BY OFFICE ------------------- */
  useEffect(() => {
    if (!selectedOffice) return;

    const getProjects = async () => {
      const params = `${selectedOffice}#N#1#10000`;

      const res = await executeProcedure(
        PROCEDURE_NAMES.GetDashBoardOfficeProjectsData,
        params
      );
      setProjects(res.rows || []);
      
    };

    getProjects();
  }, [selectedOffice]);


  /** -------------------- FETCH PAYMENTS ------------------- */
  const fetchPayments = async () => {
    const params = `${selectedOffice}#${selectedSubventionTypeId}#${selectedProject_Id}#${selectedFromDate}#${selectedToDate}#1#10`;

    const response = await executeProcedure(
      "xc9G5ryZFuDsY7gwgFzb2ZgnmqV0e50nsl0VezdVEuU=",
      params
    );

    console.log("Payments Data:", response);
  };

  return (
    <Box p={5}>
      <VStack spacing={4} align="stretch">

        {/* مكتب */}
        <Box>
          <Text mb={1}>اختر المكتب</Text>
          {officesLoading ? (
            <Spinner />
          ) : (
            <Select
              placeholder="اختر المكتب"
              value={selectedOffice}
              onChange={(e) => {
                setSelectedOffice(e.target.value);
                setSelectedProject_Id("");
              }}
            >
              {officesData?.rows?.map((o) => (
                <option key={o.Id} value={o.Id}>
                  {o.OfficeName}
                </option>
              ))}
            </Select>
          )}
        </Box>

        {/* الإعانة */}
        <Box>
          <Text mb={1}>اختر الإعانة</Text>
          {subventionsLoading ? (
            <Spinner />
          ) : (
            <Select
              placeholder="اختر الإعانة"
              value={selectedSubventionTypeId}
              onChange={(e) => setSelectedSubventionTypeId(e.target.value)}
            >
              {subventionsData?.rows?.map((s) => (
                <option key={s.Id} value={s.Id}>
                  {s.SubventionTypeName}
                </option>
              ))}
            </Select>
          )}
        </Box>

        {/* المشروع */}
        <Box>
          <Text mb={1}>اختر المشروع</Text>
          <Select
            placeholder="اختر المشروع"
            value={selectedProject_Id}
            onChange={(e) => setSelectedProject_Id(e.target.value)}
          >
            {projects?.map((p) => (
              <option key={p.Id} value={p.Id}>
                {p.Name}
              </option>
            ))}
          </Select>
        </Box>

        {/* التاريخ من */}
        <Box>
          <Text mb={1}>من تاريخ</Text>
          <Input
            type="date"
            value={selectedFromDate}
            onChange={(e) => setSelectedFromDate(e.target.value)}
          />
        </Box>

        {/* التاريخ إلى */}
        <Box>
          <Text mb={1}>إلى تاريخ</Text>
          <Input
            type="date"
            value={selectedToDate}
            onChange={(e) => setSelectedToDate(e.target.value)}
          />
        </Box>

        <button
          onClick={fetchPayments}
          style={{
            background: "#3182CE",
            color: "white",
            padding: "8px 20px",
            borderRadius: "8px",
            marginTop: "20px",
          }}
        >
          بحث
        </button>

      </VStack>
    </Box>
  );
};

export default Payments;

function getCurrentUserId() {
  try {
    const keys = ["mainUser", "MainUser", "user", "auth", "login"];
    for (const k of keys) {
      const raw = localStorage.getItem(k);
      if (!raw) continue;
      const obj = JSON.parse(raw);
      const id = obj?.UserId ?? obj?.userId ?? obj?.Id ?? obj?.id;
      if (Number.isFinite(Number(id))) return Number(id);
    }
  } catch { }
  return 1;
}
