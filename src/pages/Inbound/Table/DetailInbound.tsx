import React, { useState, useMemo } from "react";
import PageBreadcrumb from "../../../components/common/PageBreadCrumb";
import TabsSection from "../../../components/wms-components/inbound-component/tabs/TabsSection";
import { ColumnDef } from "@tanstack/react-table";
import Badge from "../../../components/ui/badge/Badge";
import { FaPlus, FaTrash } from "react-icons/fa";
import { useForm } from "react-hook-form";
import DynamicForm, {
  FieldConfig,
} from "../../../components/wms-components/inbound-component/form/DynamicForm";
import DatePicker from "../../../components/form/date-picker";
import Button from "../../../components/ui/button/Button";
import { showErrorToast, showSuccessToast } from "../../../components/toast";
import { useStoreInboundPlanning } from "../../../DynamicAPI/stores/Store/MasterStore";
import {
  InboundPlanning,
  InboundPlanningItem,
} from "../../../DynamicAPI/types/InboundPlanning";
import {
  itemDetailsData,
  itemDetailsColumns,
  transportLoadingData,
  transportLoadingColumns,
  scanHistoryData,
  scanHistoryColumns,
} from "../../../helper/dummyDataInbound";
import TableComponent from "../../../components/tables/MasterDataTable/TableComponent";
import { useLocation } from "react-router-dom";
import { ModalAssign } from "../../../components/modal/type";

const DetailInbound = () => {
  const location = useLocation();

  const { id } = location.state || {};
  const { createData } = useStoreInboundPlanning();
  const [openMdlTab, setOpenMdlTab] = useState(false);
  const [inboundPlanId, setInboundPlanId] = useState<string | null>(null);

  const methods = useForm();
  const { setValue } = methods;

  const [poList, setPoList] = useState<any[]>([]);
  const [poNoInput, setPoNoInput] = useState("");
  const [activeTab, setActiveTab] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [editableItems, setEditableItems] = useState<any[]>([]);

  const selectedPO = poList[0] || {};

  const fetchPoDetail = async (poNo: string) => {
    setPoList([]);
    setEditableItems([]);
    setValue("inbound_no", "");
    setValue("supplier_name", "");
    setValue("supplier_address", "");

    setIsLoading(true);
    try {
      const res = await fetch(
        `/api/po_detail?po_no=${encodeURIComponent(poNo)}`
      );
      const json = await res.json();

      if (!res.ok || !json || json.length === 0) {
        showErrorToast("PO tidak ditemukan atau terjadi kesalahan.");
        return;
      }
      showSuccessToast("Data PO Ditemukan.");
      setPoList(json);

      const firstPO = json[0];
      if (firstPO) {
        setValue("inbound_no", "Auto-generated-inbound-no");
        setValue("supplier_name", firstPO.NAMA_VENDOR || "");
        setValue("supplier_address", firstPO.ALAMAT_VENDOR || "");

        setEditableItems(
          firstPO.ITEM.map((item: any) => ({
            ...item,
            expired_date: null,
            classification: "",
            PO_LINE_QUANTITY: Number(item.PO_LINE_QUANTITY || 0),
          }))
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmit = (formData: any) => {
    const payload: InboundPlanning = {
      inbound_planning_no: "", // or generate if needed
      organization_id: 1,
      delivery_no: formData.receipt_no || "",
      po_no: poNoInput,
      client_name: formData.supplier_name || "",
      order_type: formData.order_type.value || "",
      task_type: formData.receive_type.value || "",
      notes: formData.notes || "",
      supplier_id: String(selectedPO.ID_VENDOR) || "",
      warehouse_id: formData.warehouse_id.value || "",
      plan_delivery_date: formData.plan_date
        ? new Date(formData.plan_date).toISOString()
        : "",
      plan_status: "",
      plan_type: "",
      items: editableItems.map(
        (item): InboundPlanningItem => ({
          inbound_plan_id: "",
          item_id: String(item.SKU),
          expired_date: item.expired_date
            ? new Date(item.expired_date).toISOString()
            : "",
          qty_plan: Number(item.PO_LINE_QUANTITY) || 0,
          uom: item.UOM || "",
          classification_item_id: item.classification || "",
        })
      ),
    };

    console.log("Full Payload:", payload);
    createData(payload);
  };

  const updateItemField = (index: number, field: string, value: any) => {
    const newItems = [...editableItems];
    newItems[index] = {
      ...newItems[index],
      [field]: value,
    };
    setEditableItems(newItems);
  };

  const columns: ColumnDef<any>[] = useMemo(
    () => [
      { accessorKey: "SKU", header: "SKU No" },
      { accessorKey: "DESKRIPSI_ITEM_LINE_PO", header: "Item Name" },
      { accessorKey: "UOM", header: "UOM" },
      {
        accessorKey: "expired_date",
        header: "Expired Date",
        cell: ({ row }) => (
          <DatePicker
            id={`expired-${row.index}`}
            label=""
            defaultDate={editableItems[row.index]?.expired_date}
            readOnly={false}
            onChange={([date]: Date[]) =>
              updateItemField(row.index, "expired_date", date)
            }
          />
        ),
      },
      {
        accessorKey: "PO_LINE_QUANTITY",
        header: "QTY Plan",
        cell: ({ row }) => (
          <input
            type="number"
            value={editableItems[row.index]?.PO_LINE_QUANTITY || 0}
            onChange={(e) =>
              updateItemField(
                row.index,
                "PO_LINE_QUANTITY",
                Number(e.target.value)
              )
            }
            className="border px-2 py-1 rounded w-20"
          />
        ),
      },
      {
        accessorKey: "classification",
        header: "Classification",
        cell: ({ row }) => (
          <select
            value={editableItems[row.index]?.classification ?? ""}
            onChange={(e) =>
              updateItemField(row.index, "classification", e.target.value)
            }
            className="border px-2 py-1 rounded"
          >
            <option value="">-- Select --</option>
            <option value="selling">Selling Item</option>
            <option value="raw">Raw Material</option>
          </select>
        ),
      },
      {
        id: "actions",
        header: "Action",
        cell: ({ row }) => (
          <button onClick={() => handleDeleteRow(row.index)}>
            <Badge variant="solid" size="sm" color="error">
              <FaTrash /> Delete
            </Badge>
          </button>
        ),
      },
    ],
    [editableItems]
  );

  const handleDeleteRow = (index: number) => {
    const newItems = [...editableItems];
    newItems.splice(index, 1);
    setEditableItems(newItems);
  };

  const fields: FieldConfig[] = [
    {
      name: "inbound_no",
      label: "Inbound Planning No",
      type: "text",
      disabled: true,
    },
    {
      name: "supplier_name",
      label: "Supplier Name",
      type: "text",
      disabled: true,
    },
    {
      name: "supplier_address",
      label: "Supplier Address",
      type: "text",
      disabled: true,
    },
    {
      name: "po_no",
      label: "PO No*",
      type: "custom",
      element: (
        <>
          <input
            value={poNoInput}
            onChange={(e) => setPoNoInput(e.target.value)}
            className="w-full px-3 py-[6px] border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          />
          <button
            type="button"
            onClick={() => fetchPoDetail(poNoInput)}
            className={`px-2 py-1 rounded-lg text-white ${
              isLoading ? "bg-orange-300 cursor-not-allowed" : "bg-orange-600"
            }`}
            disabled={isLoading}
          >
            {isLoading ? "..." : "🔍"}
          </button>
        </>
      ),
    },
    { name: "receipt_no", label: "Receipt No*", type: "text" },
    {
      name: "order_type",
      label: "Order Type*",
      type: "select",
      options: [
        { label: "-- Order Type --", value: "" },
        { label: "Regular", value: "regular" },
        { label: "Transfer Warehouse", value: "transfer_warehouse" },
      ],
    },
    {
      name: "warehouse_id",
      label: "Warehouse Name*",
      type: "select",
      options: [
        { label: "-- Select Warehouse --", value: "" },
        { label: "Gudang A", value: "gudang_a" },
        { label: "Gudang B", value: "gudang_b" },
        { label: "Gudang C", value: "gudang_c" },
      ],
    },
    {
      name: "receive_type",
      label: "Receive Type*",
      type: "select",
      options: [
        { label: "-- Select Type --", value: "" },
        { value: "single_receive", label: "Single Receive" },
        { value: "partial_receive", label: "Partial Receive" },
      ],
    },
    { name: "plan_date", label: "Plan Delivery Date*", type: "date" },
  ];

  const onClose = () => {
    setOpenMdlTab(false);
  };

  const handleSubmit = (data: any) => {
    console.log("Submitted Data:", data);
  };

  const formFields = [
    {
      name: "inbound_plan_id",
      label: "Inbound Plan ID",
      type: "text",
      validation: { required: "Required" },
    },
    {
      name: "checker_leader_id",
      label: "Checker Leader ID",
      type: "text",
      validation: { required: "Required" },
    },
    {
      name: "checkers",
      label: "Checkers",
      type: "array",
      fields: [
        {
          name: "id",
          label: "Checker ID",
          type: "text",
          validation: { required: "Required" },
        },
        {
          name: "name",
          label: "Checker Name",
          type: "text",
          validation: { required: "Required" },
        },
      ],
      validation: { required: "At least one checker is required" },
    },
    {
      name: "assign_date_start",
      label: "Assign Date Start",
      type: "datetime-local",
      validation: { required: "Required" },
    },
    {
      name: "assign_date_finish",
      label: "Assign Date Finish",
      type: "datetime-local",
      validation: { required: "Required" },
    },
    {
      name: "status",
      label: "",
      type: "checkbox",
    },
  ];

  return (
    <div>
      <PageBreadcrumb
        breadcrumbs={[
          { title: "Inbound Planning", path: "/inbound_planning" },
          { title: "Detail Inbound Planning" },
        ]}
      />

      {/* <DynamicForm
        fields={fields}
        onSubmit={methods.handleSubmit(onSubmit)}
        defaultValues={{}}
        control={methods.control}
        register={methods.register}
        setValue={methods.setValue}
        handleSubmit={methods.handleSubmit}
      /> */}

      <ModalAssign
        isOpen={openMdlTab}
        onClose={onClose}
        onSubmit={(data) => handleSubmit(data)}
        formFields={formFields}
        title={"Assign Checker"}
      />

      <div className="flex justify-end mt-6">
        {/* <h1>Inbound No : IN-12345ABC</h1> */}
        <Button
          type="button"
          variant="primary"
          size="md"
          onClick={() => setOpenMdlTab(true)}
          startIcon={<FaPlus />}
        >
          Assign Checker
        </Button>
      </div>

      <div className="mt-6 mb-4">
        <TabsSection
          tabs={[
            {
              label: "Item Details",
              content: (
                <TableComponent
                  data={itemDetailsData}
                  columns={itemDetailsColumns}
                  pageSize={5}
                />
              ),
            },
            {
              label: "Transport & Loading",
              content: (
                <TableComponent
                  data={transportLoadingData}
                  columns={transportLoadingColumns}
                />
              ),
            },
            {
              label: "Scan History",
              content: (
                <TableComponent
                  data={scanHistoryData}
                  columns={scanHistoryColumns}
                />
              ),
            },
            {
              label: "Attachments",
              content: (
                <>
                  <h1>Display Attachment from mobile app here</h1>
                </>
              ),
            },
          ]}
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />
      </div>

      {/* <div className="flex justify-end mt-6">
        <Button
          type="submit"
          variant="primary"
          size="md"
          onClick={methods.handleSubmit(onSubmit)}
        >
          SAVE
        </Button>
      </div> */}
    </div>
  );
};

export default DetailInbound;
