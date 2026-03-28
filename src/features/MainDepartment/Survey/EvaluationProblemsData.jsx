import React, { useCallback, useEffect, useState } from 'react'
import { flushSync } from 'react-dom'
import { executeProcedure } from '../../../api/apiClient'
import DataTable from '../../../Components/Table/DataTable'
import { ChunkedPrintDataTables } from '../../../Components/ChunkedPrintDataTables'
import { PrintableTableWithLogo } from '../../../Components/PrintableTableWithLogo'

const PROC_KEY = "5pLFKAwXz50Rp0OIil63Za1+Dg1wqSG2UZsitIEahic="

const EvaluationProblemsData = () => {
    const [page, setPage] = useState(1)
    const [limit] = useState(5)
    const [tableData, setTableData] = useState([])
    const [totalRows, setTotalRows] = useState(0)
    const [rowsForPrint, setRowsForPrint] = useState(null)

    useEffect(()=>{
        const fetchEvaluationProblemsData = async () => {
            const response = await executeProcedure(PROC_KEY , `${(page - 1) * limit + 1}#${limit}`)
            console.log(response);
            setTotalRows(Number(response.decrypted.data?.Result[0].EvaluationProblemsCount))
            
            response.decrypted.data?.Result[0].EvaluationProblemsData ? setTableData(JSON.parse(response.decrypted.data?.Result[0].EvaluationProblemsData)) : setTableData([]) ;
        }
        fetchEvaluationProblemsData()
    },  [page, limit])
    
    console.log(totalRows);
    const columns = [
        { key: 'Id', header: 'المشكلة', render: (row) => row.Problems },
    ]
  const docTitle = 'المشكلات'

  const preparePrint = useCallback(async () => {
    if (totalRows <= 0) return
    const response = await executeProcedure(PROC_KEY, `1#${totalRows}`)
    const raw = response.decrypted.data?.Result[0].EvaluationProblemsData
    const data = raw ? JSON.parse(raw) : []
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

export default EvaluationProblemsData
