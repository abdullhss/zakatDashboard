import React, { useEffect, useState } from 'react'
import { executeProcedure } from '../../../api/apiClient'
import DataTable from '../../../Components/Table/DataTable'

const EvaluationCountData = () => {
    const [tableData, setTableData] = useState([])

    const questionsByIndex = [
        'ما تقييمك لسهولة استخدام واجهة المنصة (التصميم وتجربة المستخدم)؟',
        'ما تقييمك لسرعة تنفيذ العمليات المالية عبر المنصة؟',
        'ما تقييمك لدرجة الوضوح في خطوات تقديم طلبات الإعانة؟'
    ]

    const optionColumns = [
      { key: 'Option1', header: 'سيء' },
      { key: 'Option2', header: 'ضعيف' },
      { key: 'Option3', header: 'جيد' },
      { key: 'Option4', header: 'جيد جداً' },
      { key: 'Option5', header: 'ممتاز' }
    ]

    useEffect(()=>{
        const fetchEvaluationCountData = async () => {
            const response = await executeProcedure("INLQWCLwrvxQ+cMAIe6IphdOz+WApSVFh9w4eg/8bI0=" , "")
            response.decrypted.data?.Result[0].EvaluationCountData ? setTableData(JSON.parse(response.decrypted.data?.Result[0].EvaluationCountData)) : setTableData([]) ;
        }
        fetchEvaluationCountData()
    },  [])

    const rows = tableData.map((row, index) => ({
      ...row,
      question: questionsByIndex[index] || row.Name || '-'
    }))

    const columns = [
      { key: 'question', header: 'السؤال', width: '40%' },
      ...optionColumns
    ]

  return (
    <>
      <DataTable
        title="التقييم الفني للمنصة"
        data={rows}
        columns={columns}
        totalRows={rows.length}
      />
      {rows.length === 0 && (
        <div style={{ textAlign: 'center', marginTop: '8px' }}>لا يوجد بيانات حالياً</div>
      )}
    </>
  )
}

export default EvaluationCountData