import React, { useEffect, useState } from 'react'
import { executeProcedure } from '../../../api/apiClient'
import DataTable from '../../../Components/Table/DataTable'

const EvaluationSuggestionsData = () => {
    const [page, setPage] = useState(1)
    const [limit] = useState(5)
    const [tableData, setTableData] = useState([])
    const [totalRows, setTotalRows] = useState(0)
    useEffect(()=>{
        const fetchEvaluationSuggestionsData = async () => {
            const response = await executeProcedure("nOQOEKwVuC+VoeOE0r0jJM+n1fIUuStxfdmfFHTXxBo=" , `${(page - 1) * limit + 1}#${limit}`)
            console.log(response);
            setTotalRows(Number(response.decrypted.data?.Result[0].EvaluationSuggestionsCount))
            
            response.decrypted.data?.Result[0].EvaluationSuggestionsData ? setTableData(JSON.parse(response.decrypted.data?.Result[0].EvaluationSuggestionsData)) : setTableData([]) ;
        }
        fetchEvaluationSuggestionsData()
    },  [page, limit])
    
    console.log(totalRows);
    const columns = [
        { key: 'Id', header: 'المقترحات ', render: (row) => row.Suggestions },
    ]
  return (
    <>
    <DataTable
        title="الخدمات المضافة: (الخدمات المضافة: ما هي الميزات أو الخدمات التي تقترح إدراجها في المنصة مستقبلاً؟)"
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

export default EvaluationSuggestionsData