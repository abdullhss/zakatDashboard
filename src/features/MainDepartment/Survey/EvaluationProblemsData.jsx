import React, { useEffect, useState } from 'react'
import { executeProcedure } from '../../../api/apiClient'
import DataTable from '../../../Components/Table/DataTable'

const EvaluationProblemsData = () => {
    const [page, setPage] = useState(1)
    const [limit] = useState(5)
    const [tableData, setTableData] = useState([])
    const [totalRows, setTotalRows] = useState(0)
    useEffect(()=>{
        const fetchEvaluationProblemsData = async () => {
            const response = await executeProcedure("5pLFKAwXz50Rp0OIil63Za1+Dg1wqSG2UZsitIEahic=" , `${(page - 1) * limit + 1}#${limit}`)
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
  return (
    <>
    <DataTable
        title="المشكلات"
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

export default EvaluationProblemsData