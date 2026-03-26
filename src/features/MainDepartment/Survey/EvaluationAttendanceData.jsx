import React, { useEffect, useState } from 'react'
import { executeProcedure } from '../../../api/apiClient'
import DataTable from '../../../Components/Table/DataTable'

const EvaluationAttendanceData = () => {
    const [page, setPage] = useState(1)
    const [limit] = useState(5)
    const [tableData, setTableData] = useState([])
    const [totalRows, setTotalRows] = useState(0)

    const normalizeRows = (rawData) => {
        if (!rawData) return []

        if (Array.isArray(rawData)) return rawData

        if (typeof rawData === 'string') {
            try {
                const parsed = JSON.parse(rawData)
                return Array.isArray(parsed) ? parsed : [parsed]
            } catch {
                return []
            }
        }

        if (typeof rawData === 'object') return [rawData]

        return []
    }

    useEffect(()=>{
        const fetchEvaluationAttendanceData = async () => {
            const response = await executeProcedure("U8E1V7W+Qqt+L882gSQO1rGC7uVNvyqb4BsQHLg8oNU=" , `${(page - 1) * limit + 1}#${limit}#$????`)
            console.log(response);
            setTotalRows(Number(response.decrypted.data?.Result[0].EvaluationAttendanceCount))

            const attendanceData = response.decrypted.data?.Result[0].EvaluationAttendanceData
            setTableData(normalizeRows(attendanceData))
        }
        fetchEvaluationAttendanceData()
    },  [page, limit])
    
    console.log(totalRows);
    const columns = [
        { key: 'name', header: 'الاسم', render: (row) => row.Name || '-' },
        { key: 'jobDesc', header: 'الوظيفة', render: (row) => row.JobDesc || '-' },
        { key: 'cityName', header: 'المدينة', render: (row) => row.CityName || '-' },
        { key: 'mobile', header: 'الهاتف', render: (row) => row.Mobile || '-' },
        { key: 'email', header: 'البريد الإلكتروني', render: (row) => row.Email || '-' },
    ]
  return (
    <>
    <DataTable
        title="بيانات الحضور"
        data={tableData}
        columns={columns}
        totalRows={totalRows}  
        page={page}
        pageSize={limit}
        onPageChange={setPage}
        startIndex={(page - 1) * limit + 1}
    />
    {totalRows === 0 && (
        <div style={{ textAlign: 'center', marginTop: '8px' }}>لا يوجد بيانات حالياً</div>
    )}
    </>
  )
}

export default EvaluationAttendanceData