import React, { useEffect, useState } from 'react'
import { executeProcedure } from '../../../api/apiClient'
import DataTable from '../../../Components/Table/DataTable'

const EvaluationReachToWebData = () => {
    const [page, setPage] = useState(1)
    const [limit] = useState(5)
    const [tableData, setTableData] = useState([])
    const [totalRows, setTotalRows] = useState(0)
    useEffect(()=>{
        const fetchEvaluationReachToWebData = async () => {
            const response = await executeProcedure("+3sn5Cd5LJka1Z9jFbGnuJDJLipQlPz9c5wOjcKvigU=" , `${(page - 1) * limit + 1}#${limit}`)
            console.log(response);
            setTotalRows(Number(response.decrypted.data?.Result[0].EvaluationReachToWebCount))
            
            response.decrypted.data?.Result[0].EvaluationReachToWebData ? setTableData(JSON.parse(response.decrypted.data?.Result[0].EvaluationReachToWebData)) : setTableData([]) ;
        }
        fetchEvaluationReachToWebData()
    },  [page, limit])
    
    console.log(totalRows);
    const columns = [
        { key: 'Id', header: 'المقترحات ', render: (row) => row.ReachToWeb },
    ]
  return (
    <>
    <DataTable
        title="تعزيز الوصول: كيف يمكننا تحسين وصول المنصة للمناطق البعيدة أو الفئات التي لا تجيد استخدام التقنية؟"
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

export default EvaluationReachToWebData