import React, { useEffect, useState } from 'react'
import { doTransaction, executeProcedure } from '../../../api/apiClient'
import DataTable from '../../../Components/Table/DataTable'
import SharedButton from '../../../Components/SharedButton/Button'
import { Text, Toast, useToast } from '@chakra-ui/react'
import FormModal from '../../../Components/ModalAction/FormModel'

const EbraaZemmaAccounts = () => {
  const [accounts, setAccounts] = useState<any[]>([])
  const [addAccountModal, setAddAccountModal] = useState(false); 
  const [banks, setBanks] = useState<any[]>([])
  const toast = useToast() ;
  const [editingRow, setEditingRow] = useState<any>(null)
  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    const response = await executeProcedure(
      "NJ4Pn13/Fmu75bylIUDbD5FLwUl6QiMGGZ0Okh5MPas=",
      "3"
    );
    console.log(response.rows);
    setAccounts(response.rows || [])
  } 

  useEffect(() => {
    const fetchbanks = async () => {
      const response = await executeProcedure(
        "D9Ivfj9RKABRqAjFR2qD5w==",
        "1#10000"
      );
      console.log(response);
      
      const banks = JSON.parse(response.decrypted?.data?.Result[0]?.BanksData)
      setBanks(banks)
    } 
    fetchbanks()
  }, [])

  const saveAccount = async (values: any) => {
    const response = await doTransaction({
      TableName: "jztSDVXoUzHMl4ay0Obuxw==",
      WantedAction: editingRow ? 1 : 0, // o insert , 1 update
      ColumnsValues: `${editingRow?.Id ?? 0}#${values.Bank_Id}#${values.AccountNum}#0#${values.AccountType_Id}#${values.IsActive ? "True" : "False"}`,
      PointId: 0,
      ColumnsNames: "Id#Bank_Id#AccountNum#OpeningBalance#AccountType_Id#IsActive",
    });
    console.log(response);
    
    if(response.code == 200){
      toast({
        title: editingRow ? "تم التعديل بنجاح" : "تم الإضافة بنجاح",
        status: "success",
      });
      setAddAccountModal(false)
      setEditingRow(null)
      fetchData()
    }
  }

  const columns = [
    {
      header: "رقم الحساب",
      accessorKey: "AccountNum",
      render: (row: any) => {
        return <Text>{row.AccountNum}</Text>
      }
    },
    {
      header: "رصيد افتتاحي",
      accessorKey: "OpeningBalance",
      render: (row: any) => {
        return <Text>{row.OpeningBalance}</Text>
      }
    },
    {
      header: "نوع الحساب",
      accessorKey: "AccountType_Id",
      render: (row: any) => {
        return <Text>{row.AccountType_Id == 1 ? "قبض" : "صرف"}</Text>
      }
    },
    {
      header: "تفعيل الحساب",
      accessorKey: "IsActive",
      render: (row: any) => {
        return <Text>{row.IsActive ? "مفعل" : "غير مفعل"}</Text>
      }
    }
  ]
  return (
    <div>
      <DataTable 
        title="حسابات إبراء الذمة" 
        data={accounts} 
        columns={columns as any[]}
        page={1}
        onPageChange={() => {}}
        totalRows={accounts.length}
        pageSize={10}
        onEditRow={(row) => {
          setAddAccountModal(true)
          setEditingRow(row)
        }}
        headerAction={<SharedButton variant="brandGradient" onClick={() => {
          setAddAccountModal(true)
        }}>إضافة حساب</SharedButton>}
      />
      <FormModal
        isOpen={addAccountModal}
        onClose={() => {setAddAccountModal(false)}}
        initialValues={{
          Bank_Id: editingRow?.Bank_Id ?? "",
          AccountNum: editingRow?.AccountNum ?? "",
          AccountType_Id: editingRow?.AccountType_Id ?? "",
          IsActive: editingRow?.IsActive ?? false,
        }}
        title={editingRow ? "تعديل حساب" : "إضافة حساب"}
        fields={[
          {
            name: "Bank_Id",
            label: "البنك",
            type: "select",
            placeholder: "اختر البنك",
            required: true,
            options: banks.map((bank: any) => ({ label: bank.BankName, value: bank.Id })),
          },
          { name: "AccountNum", label: "رقم الحساب", placeholder: "برجاء كتابة رقم الحساب", type: "input", required: true },
          { name: "AccountType_Id", label: "نوع الحساب", type: "select", placeholder: "اختر نوع الحساب", required: true, options: [ { label: "الكل", value: 3 } , { label: "قبض", value: 1 }, { label: "صرف", value: 2 }] },
          { name: "IsActive", label: "تفعيل الحساب", placeholder: "اختر تفعيل الحساب", type: "switch", required: true },
        ]}
        onSubmit={saveAccount}
        submitLabel={editingRow ? "تعديل" : "إضافة"}
        cancelLabel="إلغاء"
      />
    </div>
  )
}

export default EbraaZemmaAccounts