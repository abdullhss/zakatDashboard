import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Box, HStack, Text, Input, useToast } from "@chakra-ui/react"
import DataTable from "../../../Components/Table/DataTable"
import SharedButton from "../../../Components/SharedButton/Button"
import { executeProcedure, doMultiTransaction, doTransaction } from '../../../api/apiClient'

const PAGE_SIZE = 100

const OutDetails = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const toast = useToast()

  const [outDetails, setOutDetails] = useState([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [isEditing, setIsEditing] = useState(false)

  const offset = (page - 1) * PAGE_SIZE

  // ========================
  // Fetch Details
  // ========================
  const fetchDetails = async () => {
    try {
      setLoading(true)

      const response = await executeProcedure(
        "6Ww2MAzg8cD417291n9vSnZWtay7XtO1HOAHHpJT7MxQaVbvNGxdfGRswAQQ82FT",
        `${id}`
      )

      const parsed = JSON.parse(
        response.decrypted.data.Result[0].ZakatFitrOfficeOutputItemsDetailData
      )

      // Add QtyTemp for editing
      const withTemp = parsed.map(item => ({ ...item, QtyTemp: item.OutQty }))

      setOutDetails(withTemp)
      setLoading(false)
    } catch (err) {
      toast({
        title: "خطأ",
        description: "فشل تحميل التفاصيل",
        status: "error",
        duration: 3000,
        isClosable: true,
      })
      setLoading(false)
    }
  }
  console.log(outDetails);
  
  useEffect(() => {
    fetchDetails()
  }, [id])

  // ========================
  // Handlers
  // ========================
  const handleQtyChange = (index, value) => {
    const updated = [...outDetails]
    updated[index].QtyTemp = value
    setOutDetails(updated)
  }

  const handleEditSave = async () => {
    if (!isEditing) {
      // Switch to editing mode
      setIsEditing(true)
      return
    }

    // Save changes
    const response = await doMultiTransaction({
      MultiTableName: Array(outDetails.length)
        .fill("nOTxzOKZ8iTT2k3Z7VFMPqhJLFXRsxYXWvyY+0owHec=")
        .join("^"),
      MultiColumnsValues: outDetails
        .map(item => `${item.Id}#${id}#${item.ZakatFitrMainItem_Id}#${item.QtyTemp}`)
        .join("^"),
      WantedAction: 1, // 1 = Edit
      PointId: 0,
    })

    if (response.code === 200) {
      toast({
        title: "تم تعديل الكميات بنجاح",
        status: "success",
        duration: 2000,
        isClosable: true,
      })
      setIsEditing(false)
      fetchDetails() // Refresh after save
    } else {
      toast({
        title: "فشل تعديل الكميات",
        status: "error",
        duration: 2000,
        isClosable: true,
      })
    }
  }

  const handleDelete = async () => {
    const response = await doMultiTransaction({
      MultiTableName: Array(outDetails.length).fill("nOTxzOKZ8iTT2k3Z7VFMPqhJLFXRsxYXWvyY+0owHec=").join("^"),
      MultiColumnsValues: outDetails.map(item => `${item.Id}`).join("^"),
      WantedAction: 2,
      PointId: 0,
    })
    if (response.code === 200) {
        const response2 = await doTransaction({
            TableName: "nOTxzOKZ8iTT2k3Z7VFMPgqAOWdF+pY4zrgyT/0Oqks",
            ColumnsNames: "Id",
            ColumnsValues: id,
            WantedAction: 2,
            PointId: 0,
        })
        if (response2.code === 200) {
            toast({
                title: "تم حذف العملية",
                status: "success",
                duration: 2000,
                isClosable: true,
            })
        }
        navigate(-1)
    }
  }

  // ========================
  // Columns
  // ========================
  const columns = [
    {
      key: "ItemName",
      header: "الصنف",
      render: r => r.ItemName,
    },
    {
      key: "OutQty",
      header: "الكمية المصروفة",
      render: (r, index) => {
        if (isEditing) {
          return (
            <Input
              type="number"
              value={r.QtyTemp}
              onChange={(e) => handleQtyChange(index, e.target.value)}
              size="sm"
              width="100px"
            />
          )
        }
        return r.OutQty
      },
      width: "150px",
    },
  ]

  // ========================
  // UI
  // ========================
  return (
    <Box>
      <DataTable
        title={`تفاصيل عملية الصرف رقم ${id}`}
        data={outDetails}
        columns={columns}
        totalRows={outDetails.length}
        loading={loading}
        page={page}
        startIndex={offset + 1}
        pageSize={PAGE_SIZE}
        onPageChange={setPage}
      />

      {!loading && outDetails.length === 0 && (
        <Text mt={3} color="gray.500" textAlign="center">
          لا توجد أصناف في هذه العملية
        </Text>
      )}

      <HStack spacing={3} mt={6} justify="flex-end">
        <SharedButton variant="brandGradient" onClick={handleEditSave}>
          {isEditing ? "حفظ التعديلات" : "تعديل"}
        </SharedButton>
        <SharedButton variant="brandOutline" onClick={handleDelete}>
          حذف
        </SharedButton>
      </HStack>
    </Box>
  )
}

export default OutDetails
