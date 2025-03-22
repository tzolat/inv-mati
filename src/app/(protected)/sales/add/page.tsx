import { AddSaleForm } from "@/components/add-sale-form"

export default function AddSalePage() {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-3xl font-bold">Record New Sale</h1>
      <AddSaleForm />
    </div>
  )
}

