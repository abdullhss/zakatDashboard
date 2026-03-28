import React, { useCallback, useEffect, useState } from 'react'
import { flushSync } from 'react-dom'
import { executeProcedure } from '../../../api/apiClient'
import DataTable from '../../../Components/Table/DataTable'
import { ChunkedPrintDataTables } from '../../../Components/ChunkedPrintDataTables'
import { PrintableTableWithLogo } from '../../../Components/PrintableTableWithLogo'

const PROC_KEY = "U8E1V7W+Qqt+L882gSQO1rGC7uVNvyqb4BsQHLg8oNU="

const EvaluationAttendanceData = () => {
    const [page, setPage] = useState(1)
    const [limit] = useState(5)
    const [tableData, setTableData] = useState([])
    const [totalRows, setTotalRows] = useState(0)
    const [rowsForPrint, setRowsForPrint] = useState(null)

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
            const response = await executeProcedure(PROC_KEY , `${(page - 1) * limit + 1}#${limit}#$????`)
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
  const docTitle = 'بيانات الحضور'

  const preparePrint = useCallback(async () => {
    if (totalRows <= 0) return
    const response = await executeProcedure(PROC_KEY, `1#${totalRows}#$????`)
    const attendanceData = response.decrypted.data?.Result[0].EvaluationAttendanceData
    const data = normalizeRows(attendanceData)
    flushSync(() => setRowsForPrint(data))
  }, [totalRows])

  const onAfterPrint = useCallback(() => setRowsForPrint(null), [])

  return (
    <>
    <PrintableTableWithLogo
      hasData={totalRows > 0}
      documentTitle={docTitle}
      preparePrint={preparePrint}
      printContent={
        rowsForPrint != null ? (
          <ChunkedPrintDataTables
            title={docTitle}
            data={rowsForPrint}
            columns={columns}
            chunkSize={limit}
          />
        ) : null
      }
      onAfterPrint={onAfterPrint}
    >
    <DataTable
        title={docTitle}
        data={tableData}
        columns={columns}
        totalRows={totalRows}  
        page={page}
        pageSize={limit}
        onPageChange={setPage}
        startIndex={(page - 1) * limit + 1}
    />
    </PrintableTableWithLogo>
    {totalRows === 0 && (
        <div style={{ textAlign: 'center', marginTop: '8px' }}>لا يوجد بيانات حالياً</div>
    )}
    </>
  )
}

export default EvaluationAttendanceData
